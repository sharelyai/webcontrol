# Web Control: Vercel AI SDK Implementation Spec

## Status

Draft v1 — Implementation-ready

## Summary

This spec details how to integrate Vercel AI SDK UI (`useChat`, AI Elements) into the existing Web Control monorepo (`/webcontrol/`), replacing the custom `useAgentChat` + `useAgentSSE` hooks with the standard `useChat` hook while preserving all existing capabilities (thinking steps, tool calls, sources, thread management).

## Table of Contents

- [1. Current Architecture (What We Have)](#1-current-architecture-what-we-have)
- [2. Target Architecture (What We Want)](#2-target-architecture-what-we-want)
- [3. Implementation Strategy: Stream Adapter on Frontend](#3-implementation-strategy-stream-adapter-on-frontend)
- [4. New Packages & Dependencies](#4-new-packages--dependencies)
- [5. Stream Adapter Implementation](#5-stream-adapter-implementation)
  - [5.1 SharelyStreamAdapter](#51-sharelystreamadapter)
  - [5.2 Event Mapping Table](#52-event-mapping-table)
  - [5.3 Custom Fetch for useChat](#53-custom-fetch-for-usechat)
- [6. Chat Integration with useChat](#6-chat-integration-with-usechat)
  - [6.1 New Hook: useSharelyChat](#61-new-hook-usesharelychat)
  - [6.2 Thread Management](#62-thread-management)
  - [6.3 Accessing Sharely-Specific Data](#63-accessing-sharely-specific-data)
- [7. UI Component Architecture](#7-ui-component-architecture)
  - [7.1 New Component Tree](#71-new-component-tree)
  - [7.2 Message Rendering with Parts](#72-message-rendering-with-parts)
  - [7.3 Tool Renderer (Milestone 2)](#73-tool-renderer-milestone-2)
  - [7.4 Submitting Tool Outputs (Milestone 2)](#74-submitting-tool-outputs-milestone-2)
- [8. AI Elements Integration Strategy](#8-ai-elements-integration-strategy)
  - [8.1 What AI Elements Provides](#81-what-ai-elements-provides)
  - [8.2 Compatibility Analysis](#82-compatibility-analysis)
  - [8.3 Decision: Fork (Copy-and-Own)](#83-decision-fork-copy-and-own)
  - [8.4 Fork Strategy: Selective Copy + Restyle](#84-fork-strategy-selective-copy--restyle)
  - [8.5 Upstream Tracking](#85-upstream-tracking)
  - [8.6 AI SDK Version Alignment](#86-ai-sdk-version-alignment)
- [9. Package Structure: @sharely/webcontrol-ui](#9-package-structure-sharelywebcontrol-ui)
  - [9.1 Full Package Layout](#91-full-package-layout)
  - [9.2 Dependency Layer](#92-dependency-layer)
  - [9.3 Override System](#93-override-system)
  - [9.4 Theme Bridge (CSS Variables)](#94-theme-bridge-css-variables)
- [10. Migration Path](#10-migration-path)
- [11. Handling Edge Cases](#11-handling-edge-cases)
  - [11.1 Thread Creation Before First Message](#111-thread-creation-before-first-message)
  - [11.2 Message History Loading](#112-message-history-loading)
  - [11.3 Stop/Cancel Streaming](#113-stopcancel-streaming)
  - [11.4 Error Recovery](#114-error-recovery)
- [12. File Changes Summary](#12-file-changes-summary)
- [13. Testing Strategy](#13-testing-strategy)
- [14. Milestone Mapping](#14-milestone-mapping-from-original-spec)

---

## 1. Current Architecture (What We Have)

### Packages Involved

| Package                  | Role                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| `@sharely/services`      | `useAgentChat`, `useAgentSSE`, `agentApi`, types                                                         |
| `@sharely/ui-agent-chat` | `AgentChatPanel`, `AgentMessage`, `ThinkingIndicator`, `ToolCallCard`, `SourcesList`, `StreamingContent` |
| `@sharely/webcontrol`    | `AgentView` — composes the above                                                                         |

### Current Streaming Flow

1. `useAgentChat.sendMessage(text)` → creates thread if needed
2. `useAgentSSE.startStream()` → `POST /workspaces/{id}/agent/threads/{id}/chat`
3. Backend sends **named SSE events**: `event: content_delta\ndata: {"delta":"..."}\n\n`
4. Custom parser in `useAgentSSE` splits buffer on `\n\n`, extracts `event:` and `data:` lines
5. `handleEvent` switch statement updates React state per event type
6. On `done` event, finalizes `AgentMessage` and appends to message list

### Current SSE Event Types (Backend)

```
message_start → thinking_start → thinking_delta → thinking_end →
tool_call_start → tool_call_end → content_delta → content_end →
sources → message_end → done
```

These are **not compatible** with the Vercel AI SDK UI Message Stream Protocol.

---

## 2. Target Architecture (What We Want)

### Vercel AI SDK UI Message Stream Protocol

The AI SDK expects **unnamed SSE events** with a `type` field in the JSON payload:

```
data: {"type":"start","messageId":"msg_123"}

data: {"type":"text-delta","delta":"Hello"}

data: {"type":"tool-input-available","toolCallId":"call_1","toolName":"confirm","input":{...}}

data: [DONE]
```

Required response header: `x-vercel-ai-ui-message-stream: v1`

### Key Protocol Parts We Need

| AI SDK Part Type            | Purpose                         | Maps From (Current)                             |
| --------------------------- | ------------------------------- | ----------------------------------------------- |
| `start`                     | Begin message                   | `message_start`                                 |
| `start-step`                | Begin agent loop iteration      | `thinking_start`                                |
| `text-delta`                | Streamed text content           | `content_delta`                                 |
| `text-end`                  | Text block complete             | `content_end`                                   |
| `reasoning-start/delta/end` | Extended thinking               | `thinking_start/delta/end`                      |
| `tool-input-available`      | Tool invocation (complete args) | `tool_call_start` (server tools) or new UI tool |
| `tool-output-available`     | Tool result                     | `tool_call_end` (server tools)                  |
| `finish-step`               | End agent loop iteration        | `thinking_end`                                  |
| `finish`                    | End message                     | `message_end`                                   |
| `source-document`           | Knowledge source                | `sources`                                       |
| Custom `data-*` parts       | Sharely metadata                | N/A (new)                                       |

---

## 3. Implementation Strategy: Stream Adapter on Frontend

### Approach: Custom `fetch` + `TransformStream`

**Zero backend changes for Milestone 1.** We intercept the Sharely SSE response and transform it into the AI SDK format in the browser using a custom `fetch` function passed to `useChat`.

```
[useChat] → fetch() → [Sharely BE] → named SSE events
                                         ↓
                              [SharelyStreamAdapter]
                                         ↓
                              AI SDK unnamed SSE events
                                         ↓
                              [useChat internal parser]
```

### Why This Approach

1. **Zero backend changes** for text streaming + server-side tools
2. **Incremental**: We can migrate progressively (text → tools → UI tools)
3. **Reversible**: If AI SDK changes protocol, we only update the adapter
4. **Testable**: Adapter is a pure function, easy to unit test

---

## 4. New Packages & Dependencies

### New Dependencies (root or `@sharely/services`)

```json
{
  "ai": "^6.0.68",
  "@ai-sdk/react": "^3.0.41"
}
```

> Note: `useChat` comes from `@ai-sdk/react`. Versions aligned with `ai-elements` to ensure type compatibility. The `ai` package provides types and server utilities — on the frontend, only types are used (tree-shaken).

### New Package: `@sharely/ai-adapter` (optional, or inline in `@sharely/services`)

If the adapter grows complex, create a new package. For v1, keep it in `@sharely/services/src/ai/`.

---

## 5. Stream Adapter Implementation

### 5.1 `SharelyStreamAdapter`

**Location:** `packages/services/src/ai/sharelyStreamAdapter.ts`

Converts named Sharely SSE events → AI SDK UI Message Stream format.

```typescript
/**
 * Creates a TransformStream that converts Sharely SSE events
 * into AI SDK UI Message Stream Protocol events.
 */
export function createSharelyStreamAdapter(): TransformStream<
  Uint8Array,
  Uint8Array
> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const messages = buffer.split("\n\n");
      buffer = messages.pop() || "";

      for (const message of messages) {
        if (!message.trim()) continue;
        const { eventType, data } = parseNamedSSE(message);
        const aiSdkEvents = mapToAISdkEvents(eventType, data);
        for (const event of aiSdkEvents) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          );
        }
      }
    },
    flush(controller) {
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
    },
  });
}
```

### 5.2 Event Mapping Table

```typescript
function mapToAISdkEvents(eventType: string, data: any): AISdkPart[] {
  switch (eventType) {
    case "message_start":
      return [
        { type: "start", messageId: data.messageId },
        { type: "start-step" },
      ];

    case "thinking_start":
      return [{ type: "reasoning-start", id: data.thinkingId }];

    case "thinking_delta":
      return [
        { type: "reasoning-delta", id: data.thinkingId, delta: data.delta },
      ];

    case "thinking_end":
      return [{ type: "reasoning-end", id: data.thinkingId }];

    case "tool_call_start":
      // Server-side tool: emit as tool-input-available (args already complete)
      return [
        {
          type: "tool-input-available",
          toolCallId: data.toolCallId,
          toolName: data.name,
          input: data.input,
        },
      ];

    case "tool_call_end":
      // Server-side tool result
      return [
        {
          type: "tool-output-available",
          toolCallId: data.toolCallId,
          output: data.output || { error: data.error },
        },
      ];

    case "content_delta":
      return [{ type: "text-delta", delta: data.delta }];

    case "content_end":
      return []; // No direct mapping needed; finish-step handles this

    case "sources":
      // Emit each source as a source-document part
      return (data.sources || []).map((s: any) => ({
        type: "source-document",
        sourceId: s.id,
        title: s.title,
        // Include Sharely-specific metadata as providerMetadata
        providerMetadata: {
          sharely: {
            sourceType: s.type,
            snippet: s.snippet,
            metadata: s.metadata,
          },
        },
      }));

    case "message_end":
      return [
        { type: "finish-step" },
        {
          type: "finish",
          finishReason:
            data.finishReason === "end_turn" ? "stop" : data.finishReason,
        },
      ];

    case "error":
      return [{ type: "error", errorText: data.error }];

    case "done":
      return []; // Handled by flush() emitting [DONE]

    default:
      return [];
  }
}
```

### 5.3 Custom Fetch for `useChat`

**Location:** `packages/services/src/ai/sharelyFetch.ts`

```typescript
import { createSharelyStreamAdapter } from "./sharelyStreamAdapter";
import { getAuthToken } from "../api/agentApi";

/**
 * Custom fetch that:
 * 1. Adds Sharely auth headers
 * 2. Converts Sharely SSE format → AI SDK UI Message Stream format
 * 3. Adds required x-vercel-ai-ui-message-stream header to response
 */
export function createSharelyFetch(baseUrl: string) {
  return async function sharelyFetch(
    url: string | URL | Request,
    init?: RequestInit,
  ): Promise<Response> {
    const token = getAuthToken();

    const response = await fetch(url, {
      ...init,
      headers: {
        ...Object.fromEntries(new Headers(init?.headers).entries()),
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "text/event-stream",
      },
    });

    if (!response.ok || !response.body) {
      return response;
    }

    // Pipe through the stream adapter
    const adapter = createSharelyStreamAdapter();
    const transformedBody = response.body.pipeThrough(adapter);

    return new Response(transformedBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Content-Type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1",
      },
    });
  };
}
```

---

## 6. Chat Integration with `useChat`

### 6.1 New Hook: `useSharelyChat`

**Location:** `packages/services/src/hooks/useSharelyChat.ts`

Wraps `useChat` with Sharely-specific concerns (thread management, auth, config).

```typescript
import { useChat } from "@ai-sdk/react";
import { createSharelyFetch } from "../ai/sharelyFetch";
import { useGlobalStore } from "../stores/globalStore";

interface UseSharelyChatOptions {
  spaceId: string;
  threadId?: string;
}

export function useSharelyChat(options: UseSharelyChatOptions) {
  const { config, workspace } = useGlobalStore();
  const workspaceId = config?.workspaceId || workspace?.id;
  const baseUrl = config?.agentApi || config?.baseUrl || "";

  const chatEndpoint = `${baseUrl}/workspaces/${workspaceId}/agent/threads/${options.threadId}/chat`;

  const chat = useChat({
    api: chatEndpoint,
    fetch: createSharelyFetch(baseUrl),
    // Map useChat's body to what Sharely BE expects
    body: {
      // Additional body params sent with every request
    },
    // Prepare request body
    experimental_prepareRequestBody({ messages }) {
      const lastMessage = messages[messages.length - 1];
      return {
        message: lastMessage?.content || "",
      };
    },
    // Handle tool invocations client-side (Milestone 2)
    maxSteps: 5,
    onError(error) {
      console.error("[useSharelyChat] Error:", error);
    },
  });

  return {
    ...chat,
    // Expose Sharely-specific extras
    threadId: options.threadId,
  };
}
```

### 6.2 Thread Management

Thread management (create, list, load) stays in a separate hook since `useChat` doesn't handle this concept. Keep the existing `agentFetcher`-based CRUD calls.

```typescript
// packages/services/src/hooks/useSharelyThreads.ts
// Re-use existing thread CRUD from useAgentChat, extracted into its own hook
export function useSharelyThreads(spaceId: string) {
  // createThread, listThreads, loadThread, deleteThread
  // Uses agentFetcher as today
}
```

### 6.3 Accessing Sharely-Specific Data

The AI SDK `useChat` returns `messages` with `parts`. Our custom data (thinking, sources, Sharely metadata) is accessible through:

1. **Reasoning parts**: `message.parts.filter(p => p.type === "reasoning")` — maps from thinking steps
2. **Tool invocation parts**: `message.parts.filter(p => p.type === "tool-invocation")` — maps from server tool calls
3. **Source parts**: `message.parts.filter(p => p.type === "source")` — maps from knowledge sources
4. **Custom data parts**: `message.parts.filter(p => p.type.startsWith("data-"))` — Sharely metadata

---

## 7. UI Component Architecture

### 7.1 New Component Tree

```
WebControlChatRoot (new)
├── SharelyProvider (existing, adds config/auth context)
├── useSharelyChat (new hook wrapping useChat)
├── useSharelyThreads (extracted from existing)
├── ChatHeader
│   ├── Thread selector
│   └── New chat button
├── MessageList
│   └── SharelyMessage (new, replaces AgentMessage)
│       ├── TextPart → chat bubble (AI Elements or custom)
│       ├── ReasoningPart → ThinkingIndicator (existing, adapted)
│       ├── ToolInvocationPart (server) → ToolCallCard (existing, adapted)
│       ├── ToolInvocationPart (UI) → ToolRenderer (new)
│       │   ├── ConfirmCard
│       │   ├── FormCard/FormModal
│       │   ├── SelectListCard
│       │   ├── GoalStepCard
│       │   └── HostHandoffCard
│       └── SourcePart → SourcesList (existing, adapted)
├── ChatInput (AI Elements or custom)
└── ErrorBanner
```

### 7.2 Message Rendering with Parts

The AI SDK `useChat` returns messages where each message has a `parts` array. We render by iterating over parts:

```typescript
// packages/ui-agent-chat/src/components/SharelyMessage/index.tsx
function SharelyMessage({ message }: { message: UIMessage }) {
  return (
    <div className="sharely-message">
      {message.parts.map((part, i) => {
        switch (part.type) {
          case "text":
            return <TextBubble key={i} text={part.text} />;
          case "reasoning":
            return <ThinkingIndicator key={i} content={part.reasoning} />;
          case "tool-invocation":
            return <ToolRenderer key={i} toolInvocation={part} />;
          case "source":
            return <SourceChip key={i} source={part} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
```

### 7.3 Tool Renderer (Milestone 2)

```typescript
// packages/ui-agent-chat/src/components/ToolRenderer/index.tsx
function ToolRenderer({
  toolInvocation,
}: {
  toolInvocation: ToolInvocationPart;
}) {
  const { toolName, args, state, toolCallId } = toolInvocation;

  // Server-side tools (knowledge search, etc.) — display-only
  if (isServerTool(toolName)) {
    return <ToolCallCard name={toolName} input={args} status={state} />;
  }

  // UI-interactive tools — render interactive component
  switch (toolName) {
    case "confirm":
      return <ConfirmCard args={args} toolCallId={toolCallId} state={state} />;
    case "collect_form":
      return <FormCard args={args} toolCallId={toolCallId} state={state} />;
    case "select_list":
      return (
        <SelectListCard args={args} toolCallId={toolCallId} state={state} />
      );
    case "show_goal_step":
      return <GoalStepCard args={args} toolCallId={toolCallId} state={state} />;
    case "handoff_to_host":
      return (
        <HostHandoffCard args={args} toolCallId={toolCallId} state={state} />
      );
    default:
      return <ToolCallCard name={toolName} input={args} status={state} />;
  }
}
```

### 7.4 Submitting Tool Outputs (Milestone 2)

When using `useChat` with `maxSteps`, tool outputs are submitted via `addToolResult`:

```typescript
const { addToolResult } = useSharelyChat({ spaceId, threadId });

// Inside ConfirmCard:
function handleConfirm() {
  addToolResult({
    toolCallId,
    result: { confirmed: true },
  });
}
```

This triggers `useChat` to send a new request to the backend with the tool result, and the backend continues the agent loop.

---

## 8. AI Elements Integration Strategy

### 8.1 What AI Elements Provides

The `ai-elements` repo (`~/src/s/sharely/ai-elements/`) is a monorepo containing two key packages:

| Package           | Contents                                                                     |
| ----------------- | ---------------------------------------------------------------------------- |
| `@repo/shadcn-ui` | Base shadcn/ui primitives (button, card, dialog, tooltip, collapsible, etc.) |
| `@repo/elements`  | 47 AI-specific components built on top of shadcn-ui                          |

**Components most relevant to Web Control:**

| Component             | File                                                  | What It Does  | Priority |
| --------------------- | ----------------------------------------------------- | ------------- | -------- |
| `message.tsx`         | Message display with branching, toolbar, actions      | **Must have** |
| `conversation.tsx`    | Scroll container with stick-to-bottom                 | **Must have** |
| `prompt-input.tsx`    | Chat input with attachments, referenced sources       | **Must have** |
| `reasoning.tsx`       | Collapsible reasoning/thinking display with streaming | **Must have** |
| `tool.tsx`            | Tool invocation display (input, output, error states) | **Must have** |
| `confirmation.tsx`    | Tool approval/confirmation UI                         | **Must have** |
| `sources.tsx`         | Citation sources display                              | **Must have** |
| `inline-citation.tsx` | Inline citations with carousel                        | Nice to have  |
| `suggestion.tsx`      | Suggestion pills/buttons                              | Nice to have  |
| `shimmer.tsx`         | Streaming text shimmer effect                         | Nice to have  |
| `code-block.tsx`      | Syntax-highlighted code with copy                     | Nice to have  |

**Components we do NOT need** (heavyweight, specialized):

- `persona.tsx` (Rive animations — 4MB+ dependency)
- `canvas.tsx`, `node.tsx`, `edge.tsx` (ReactFlow — graph visualization)
- `audio-player.tsx`, `speech-input.tsx` (media-chrome — audio)
- `jsx-preview.tsx`, `web-preview.tsx` (live preview — security surface)
- `terminal.tsx`, `stack-trace.tsx`, `test-results.tsx` (dev tooling)
- `model-selector.tsx`, `environment-variables.tsx` (dev/admin UI)

### 8.2 Compatibility Analysis

| Concern             | AI Elements                           | Web Control                          | Gap                             |
| ------------------- | ------------------------------------- | ------------------------------------ | ------------------------------- |
| **Styling**         | Tailwind v4 + CSS variables           | styled-components v6 + CSS variables | **Major** — different systems   |
| **AI SDK version**  | `ai@^6.0.68`, `@ai-sdk/react@^3.0.41` | None (adding new)                    | Align to same version           |
| **React**           | 19.2.3                                | 18 or 19                             | Verify; likely compatible       |
| **Export format**   | Raw `.tsx` (`"./*": "./src/*.tsx"`)   | Compiled via tsup                    | Consumers must compile          |
| **Icons**           | `lucide-react`                        | Custom SVG icons                     | Need to support both or migrate |
| **Class utility**   | `class-variance-authority` + `cn()`   | styled-components `css`              | Different paradigm              |
| **Base primitives** | Radix UI (via shadcn)                 | Custom styled components             | Overlap but different wrappers  |

### 8.3 Decision: Fork (Copy-and-Own)

**Recommendation: Fork the specific components we need into `@sharely/webcontrol-ui`.**

**Why fork instead of using as a dependency:**

1. **Styling mismatch is fundamental.** AI Elements components use Tailwind utility classes and `cn()` merging. Web Control uses styled-components. Wrapping one system around the other creates fragile, hard-to-maintain code. Forking lets us rewrite styling to match our system.

2. **Raw TSX exports.** `@repo/elements` exports uncompiled `.tsx` files (`"./*": "./src/*.tsx"`). Consuming this as a dependency would require the webcontrol build pipeline to compile it, configure its Tailwind setup, and bundle all its dependencies (including heavy ones like Rive and XYFlow that we don't need).

3. **Heavy dependency tree.** `@repo/elements` depends on `@rive-app/react-webgl2`, `@xyflow/react`, `media-chrome`, `shiki`, `katex`, `streamdown`, `react-jsx-parser`. We only need ~10 of the 47 components but would inherit all dependencies. The webcontrol widget is a small embeddable JS file (~200KB) — pulling in these deps would balloon it.

4. **Deep customization needed.** Per the original spec (section 7.3), we need Sharely-branded components with theme tokens, custom tool components, and an override system. This requires owning the component source.

5. **Shadcn philosophy.** Both shadcn/ui and AI Elements are designed for the copy-and-own model. The CLI (`npx ai-elements@latest`) literally copies files into your project.

**Why NOT a full runtime dependency:**

- Would force Tailwind into the webcontrol build (currently all styled-components)
- Would pull ~15 unused dependencies into the bundle
- Would couple us to AI Elements' release cycle for bug fixes
- Component APIs may not match our data shapes without wrappers

### 8.4 Fork Strategy: Selective Copy + Restyle

#### Step 1: Copy component source files

Copy only the components we need from `ai-elements/packages/elements/src/` into `webcontrol/packages/webcontrol-ui/src/elements/`:

```bash
# Components to fork (10 files)
message.tsx
conversation.tsx
prompt-input.tsx
reasoning.tsx
tool.tsx
confirmation.tsx
sources.tsx
inline-citation.tsx
suggestion.tsx
shimmer.tsx
```

Also copy required shadcn/ui primitives from `ai-elements/packages/shadcn-ui/components/ui/` that these components depend on (if we don't already have equivalents):

```bash
# shadcn primitives to fork (only those not already in ui-shared)
collapsible.tsx    # Used by reasoning, tool
tooltip.tsx        # Used by message toolbar
badge.tsx          # Used by sources, tool
```

#### Step 2: Restyle from Tailwind to styled-components

Two sub-options:

**Option A (Recommended): Introduce Tailwind v4 into `@sharely/webcontrol-ui` only**

Tailwind v4 uses CSS-first configuration and can coexist with styled-components since it operates on utility classes while styled-components operates on generated class names. They don't conflict.

```
packages/webcontrol-ui/
├── src/
│   ├── elements/           # Forked AI Elements (keep Tailwind classes as-is)
│   ├── shadcn/             # Forked shadcn primitives (keep Tailwind classes)
│   ├── sharely/            # Sharely-specific components (styled-components)
│   └── theme/
│       └── tailwind.css    # Tailwind v4 config + Sharely CSS variable overrides
├── tailwind.config.ts      # Scoped to this package only
└── package.json
```

Benefits:

- Minimal changes to forked components (keep original Tailwind classes)
- Easier to pull upstream updates (just diff the source)
- Tailwind v4 is tiny (~5KB runtime) and tree-shakes well
- CSS variables bridge the two systems — both read from the same tokens

Tradeoffs:

- Two styling systems in the monorepo (Tailwind in webcontrol-ui, styled-components elsewhere)
- Build pipeline needs to process Tailwind for this package

**Option B: Rewrite to styled-components**

Convert all Tailwind utility classes to styled-components equivalents. This is a lot of initial work but keeps the styling system uniform.

Not recommended because:

- High effort (every className string → styled component)
- Hard to track upstream changes (source looks completely different)
- Fragile — easy to miss responsive/hover/dark-mode states in translation

#### Step 3: Replace heavy dependencies with lightweight alternatives

| AI Elements Dep                   | Replacement in Fork                                                              |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `shiki` (syntax highlighting)     | `react-markdown` + `rehype-highlight` (already in webcontrol) or lazy-load shiki |
| `streamdown` (markdown streaming) | `react-markdown` (already used) + custom streaming wrapper                       |
| `@rive-app/react-webgl2`          | Not needed (persona component not forked)                                        |
| `@xyflow/react`                   | Not needed (canvas components not forked)                                        |
| `media-chrome`                    | Not needed (audio components not forked)                                         |
| `katex`                           | Not needed unless math rendering required                                        |
| `lucide-react`                    | Keep for forked components; coexists with custom icons                           |

#### Step 4: Adapt component props to Sharely data shapes

The forked components use AI SDK types (`UIMessage`, `ToolUIPart`, etc.). Since we're adopting `useChat` which returns these types, **the prop interfaces stay the same**. No conversion needed at the component boundary.

However, we'll extend some components with Sharely-specific props:

```typescript
// Extended message component
interface SharelyMessageProps extends MessageProps {
  // Sharely additions
  sources?: Source[];
  thinkingSteps?: ThinkingStep[];
  showAvatar?: boolean;
  avatarUrl?: string;
}
```

### 8.5 Upstream Tracking

Maintain a tracking document at `packages/webcontrol-ui/UPSTREAM.md`:

```markdown
# AI Elements Upstream Tracking

## Fork Source

- Repo: ~/src/s/sharely/ai-elements
- Commit: <commit-hash-at-fork-time>
- AI SDK version: ai@6.0.68, @ai-sdk/react@3.0.41

## Forked Components

| Component    | Source File                   | Fork Date  | Last Synced | Notes                                |
| ------------ | ----------------------------- | ---------- | ----------- | ------------------------------------ |
| message      | elements/src/message.tsx      | 2026-03-XX | —           | Added Sharely avatar, source display |
| conversation | elements/src/conversation.tsx | 2026-03-XX | —           | —                                    |
| prompt-input | elements/src/prompt-input.tsx | 2026-03-XX | —           | Removed file upload (v1)             |
| reasoning    | elements/src/reasoning.tsx    | 2026-03-XX | —           | Mapped to ThinkingStep type          |
| tool         | elements/src/tool.tsx         | 2026-03-XX | —           | Extended for UI tools                |
| confirmation | elements/src/confirmation.tsx | 2026-03-XX | —           | Used for confirm tool                |
| sources      | elements/src/sources.tsx      | 2026-03-XX | —           | Added knowledge metadata             |

| ...

## Sync Process

1. Diff upstream commit against our fork: `diff -r ai-elements/packages/elements/src/X.tsx webcontrol-ui/src/elements/X.tsx`
2. Cherry-pick relevant changes
3. Update this table
```

### 8.6 AI SDK Version Alignment

AI Elements uses `ai@^6.0.68` and `@ai-sdk/react@^3.0.41`. The webcontrol project must align:

```json
// packages/services/package.json
{
  "dependencies": {
    "ai": "^6.0.68",
    "@ai-sdk/react": "^3.0.41"
  }
}
```

> **Important:** The original spec (section 4) referenced `ai@^4.x`. Update to v6 to match AI Elements and get the latest UI Message Stream Protocol support. The `useChat` API and streaming protocol differ between v4 and v6 — the `x-vercel-ai-ui-message-stream: v1` header and part-based message format are v5+ features.

---

## 9. Package Structure: `@sharely/webcontrol-ui`

### 9.1 Full Package Layout

```
packages/webcontrol-ui/
├── src/
│   ├── elements/                # Forked from ai-elements (Tailwind, minimal changes)
│   │   ├── message.tsx
│   │   ├── conversation.tsx
│   │   ├── prompt-input.tsx
│   │   ├── reasoning.tsx
│   │   ├── tool.tsx
│   │   ├── confirmation.tsx
│   │   ├── sources.tsx
│   │   ├── inline-citation.tsx
│   │   ├── suggestion.tsx
│   │   └── shimmer.tsx
│   ├── shadcn/                  # Forked shadcn primitives needed by elements
│   │   ├── collapsible.tsx
│   │   ├── tooltip.tsx
│   │   ├── badge.tsx
│   │   └── lib/
│   │       └── utils.ts         # cn() utility
│   ├── sharely/                 # Sharely-specific components (styled-components OK)
│   │   ├── tools/
│   │   │   ├── ConfirmCard.tsx
│   │   │   ├── FormCard.tsx
│   │   │   ├── SelectListCard.tsx
│   │   │   ├── GoalStepCard.tsx
│   │   │   └── HostHandoffCard.tsx
│   │   ├── display/
│   │   │   ├── ThinkingIndicator.tsx   # Wrapper around forked reasoning.tsx
│   │   │   └── SourcesList.tsx         # Wrapper around forked sources.tsx
│   │   └── SharelyMessage.tsx          # Wrapper composing elements + sharely parts
│   ├── overrides/
│   │   └── index.tsx            # Override registry (context provider)
│   ├── theme/
│   │   ├── sharely-tokens.css   # CSS variable overrides for Sharely branding
│   │   └── tailwind.css         # Tailwind v4 base + theme import
│   └── index.ts                 # Public API barrel
├── package.json
├── tsconfig.json
├── UPSTREAM.md                  # Fork tracking document
└── README.md
```

### 9.2 Dependency Layer

```
@sharely/services (hooks, AI SDK, stream adapter)
    ↓
@sharely/webcontrol-ui (forked elements + sharely components)
    ↓
@sharely/webcontrol (shell, composes everything)
```

This fits the existing monorepo dependency graph. `webcontrol-ui` sits at the same layer as `ui-chat`, `ui-search`, etc.

### 9.3 Override System

```typescript
// packages/webcontrol-ui/src/overrides/index.tsx
import { createContext, useContext, ComponentType } from "react";

type ToolName =
  | "confirm"
  | "collect_form"
  | "select_list"
  | "show_goal_step"
  | "handoff_to_host";

interface ComponentOverrides {
  ToolComponents?: Partial<Record<ToolName, ComponentType<any>>>;
  MessageComponent?: ComponentType<any>;
  ChatInputComponent?: ComponentType<any>;
  HeaderComponent?: ComponentType<any>;
}

const OverrideContext = createContext<ComponentOverrides>({});

export function WebControlUIProvider({
  overrides,
  children,
}: {
  overrides?: ComponentOverrides;
  children: React.ReactNode;
}) {
  return (
    <OverrideContext.Provider value={overrides || {}}>
      {children}
    </OverrideContext.Provider>
  );
}

export function useOverride<K extends keyof ComponentOverrides>(
  key: K,
): ComponentOverrides[K] {
  return useContext(OverrideContext)[key];
}
```

### 9.4 Theme Bridge (CSS Variables)

Both styled-components and Tailwind can consume CSS variables. Define Sharely tokens once:

```css
/* packages/webcontrol-ui/src/theme/sharely-tokens.css */
:root,
[data-sharely-theme] {
  /* Map Sharely brand to shadcn/ui semantic tokens */
  --color-primary: #a217d8;
  --color-primary-foreground: #ffffff;
  --color-secondary: #dd85ff;
  --color-secondary-foreground: #1a1a1a;
  --color-muted: #f5f0f7;
  --color-muted-foreground: #6b7280;
  --color-accent: #7b0fa6;
  --color-accent-foreground: #ffffff;
  --color-background: #ffffff;
  --color-foreground: #1a1a1a;
  --color-border: #e5e7eb;
  --color-ring: #a217d8;
  --color-destructive: #ef4444;

  /* Sharely-specific */
  --sharely-avatar-size: 32px;
  --sharely-bubble-max-width: 85%;
  --sharely-panel-radius: 12px;
}
```

This CSS file is imported by the Tailwind config, so forked components automatically use Sharely branding. Styled-components in the `sharely/` folder can also reference these variables via `var(--color-primary)`.

---

## 10. Migration Path

### Phase 1: Add adapter layer + fork AI Elements, keep existing UI (low risk)

1. Add `ai@^6.x` and `@ai-sdk/react@^3.x` to `@sharely/services`
2. Create `@sharely/webcontrol-ui` package — fork 10 AI Elements components + shadcn primitives (see section 8.4)
3. Add Tailwind v4 to `webcontrol-ui` package, configure Sharely CSS variable tokens
4. Implement `SharelyStreamAdapter` and `createSharelyFetch`
5. Implement `useSharelyChat` wrapping `useChat`
6. Create `SharelyMessage` component composing forked elements
7. Wire up in a **new** `AgentViewV2` component alongside existing `AgentView`
8. Feature-flag: `VIEWS.AGENT_V2` in config

### Phase 2: Validate and migrate

1. Test text streaming end-to-end through adapter
2. Verify thinking/reasoning parts render correctly
3. Verify server-side tool calls display correctly
4. Verify source citations display correctly
5. Swap `AgentView` → `AgentViewV2` behind feature flag

### Phase 3: Remove old code

1. Remove `useAgentChat`, `useAgentSSE` hooks
2. Remove old `AgentView`, `AgentChatPanel` components
3. Remove legacy SSE event types from `types/agent.ts`

---

## 11. Handling Edge Cases

### 11.1 Thread Creation Before First Message

`useChat` doesn't know about Sharely threads. Handle this in `experimental_prepareRequestBody`:

```typescript
experimental_prepareRequestBody({ messages }) {
  // Thread creation happens before useChat is initialized
  // The threadId is already in the URL
  const lastMessage = messages[messages.length - 1];
  return { message: lastMessage?.content || "" };
}
```

If no `threadId` yet, `useSharelyChat` should call `createThread()` first, then set the chat endpoint URL. Use a state machine:

```
NO_THREAD → (user sends message) → CREATING_THREAD → (thread created) → READY → (useChat.append)
```

### 11.2 Message History Loading

When loading an existing thread, convert stored `AgentMessage[]` into `UIMessage[]` format and pass as `initialMessages` to `useChat`.

```typescript
function convertToUIMessages(agentMessages: AgentMessage[]): UIMessage[] {
  return agentMessages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content || "",
    parts: [
      // Reconstruct parts from stored data
      ...msg.thinkingSteps.map((ts) => ({
        type: "reasoning" as const,
        reasoning: ts.content,
      })),
      ...msg.toolCalls.map((tc) => ({
        type: "tool-invocation" as const,
        toolCallId: tc.id,
        toolName: tc.name,
        args: tc.input,
        state: tc.status === "completed" ? "result" : "call",
        result: tc.output,
      })),
      { type: "text" as const, text: msg.content || "" },
      ...msg.sources.map((s) => ({
        type: "source" as const,
        sourceId: s.id,
        title: s.title,
        providerMetadata: { sharely: s },
      })),
    ],
    createdAt: new Date(msg.createdAt),
  }));
}
```

### 11.3 Stop/Cancel Streaming

`useChat` exposes `stop()` which aborts the fetch. The backend already handles aborted connections gracefully (the response stream closes).

### 11.4 Error Recovery

`useChat` provides `error` state and `reload()` to retry the last message. Map Sharely SSE `error` events to the `error` AI SDK part type in the adapter.

---

## 12. File Changes Summary

### New Files

| File                             | Package                  | Purpose                                   |
| -------------------------------- | ------------------------ | ----------------------------------------- |
| `src/ai/sharelyStreamAdapter.ts` | `@sharely/services`      | Transform Sharely SSE → AI SDK format     |
| `src/ai/sharelyFetch.ts`         | `@sharely/services`      | Custom fetch for useChat                  |
| `src/ai/convertMessages.ts`      | `@sharely/services`      | AgentMessage ↔ UIMessage converters       |
| `src/hooks/useSharelyChat.ts`    | `@sharely/services`      | useChat wrapper with Sharely concerns     |
| `src/hooks/useSharelyThreads.ts` | `@sharely/services`      | Thread CRUD (extracted from useAgentChat) |
| `src/components/SharelyMessage/` | `@sharely/ui-agent-chat` | Parts-based message renderer              |
| `src/components/ToolRenderer/`   | `@sharely/ui-agent-chat` | Tool invocation → UI component dispatcher |
| `src/components/AgentViewV2/`    | `@sharely/webcontrol`    | New agent view using useSharelyChat       |

### Modified Files

| File                                          | Change                                                |
| --------------------------------------------- | ----------------------------------------------------- |
| `packages/webcontrol-ui/`                     | New package — forked AI Elements + Sharely components |
| `packages/services/package.json`              | Add `ai@^6.x`, `@ai-sdk/react@^3.x` deps              |
| `apps/webcontrol/src/WebControl.tsx`          | Add `AGENT_V2` view option                            |
| `packages/services/src/stores/globalStore.ts` | Add `AGENT_V2` to view config                         |

### Eventually Removed (Phase 3)

| File                                                    | Reason                            |
| ------------------------------------------------------- | --------------------------------- |
| `packages/services/src/hooks/useAgentChat.ts`           | Replaced by `useSharelyChat`      |
| `packages/services/src/hooks/useAgentSSE.ts`            | Replaced by stream adapter        |
| `packages/ui-agent-chat/src/components/AgentChatPanel/` | Replaced by parts-based rendering |
| `apps/webcontrol/src/components/AgentView/`             | Replaced by `AgentViewV2`         |

---

## 13. Testing Strategy

### Unit Tests

- `sharelyStreamAdapter.test.ts`: Feed raw Sharely SSE bytes → verify AI SDK formatted output
- `convertMessages.test.ts`: Round-trip AgentMessage ↔ UIMessage
- `sharelyFetch.test.ts`: Mock fetch, verify header injection and stream piping

### Integration Tests

- Render `AgentViewV2` with mock SSE server → verify messages appear
- Test tool invocation rendering with mock tool-input-available events
- Test error states (stream break, server error, auth failure)

### E2E Tests

- Full flow: send message → stream response → verify text appears
- Thread creation flow: no thread → send message → thread created → stream works
- History loading: load existing thread → messages rendered correctly

---

## 14. Milestone Mapping (from original spec)

| Milestone                  | Web Control Changes                                                                     | Backend Changes                                           |
| -------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **M1: Text streaming**     | Stream adapter + `useSharelyChat` + `SharelyMessage` (text only)                        | None                                                      |
| **M2: Tool invocation UI** | `ToolRenderer` + tool UI components (`ConfirmCard`, `FormCard`, etc.) + `addToolResult` | New UI tool definitions + pause/resume (see backend spec) |
| **M3: Goal UI tools**      | `GoalStepCard`, `SelectListCard`, `HostHandoffCard`                                     | Add goal-specific tools to agent                          |
| **M4: Customization**      | `@sharely/webcontrol-ui` package, override system, theming                              | None                                                      |
| **M5: Hardening**          | Error boundaries, retry logic, accessibility                                            | Schema validation, rate limits                            |
