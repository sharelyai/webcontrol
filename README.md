# Sharely WebControl

Embeddable AI-powered web control widget built as a **pnpm + Turborepo** monorepo.

## Prerequisites

- Node.js >= 18
- pnpm >= 8

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Fill in: VITE_API_DEFAULT_URL, VITE_PUBLIC_SUPABASE_URL, VITE_PUBLIC_SUPABASE_ANON_KEY, VITE_REDIRECT_URL

# Start development
pnpm dev

# Build all packages
pnpm build
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all workspace dependencies |
| `pnpm dev` | Start dev mode for all packages |
| `pnpm build` | Build all packages in dependency order |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run tests across packages |
| `pnpm clean` | Remove all dist/ and node_modules/ |

Filter to a specific package:

```bash
pnpm --filter @sharely/services build
pnpm --filter @sharely/demo dev
```

## Architecture

Packages are organized in a strict dependency layer:

```
@sharely/services            Foundation: API client, hooks, Zustand store, types, auth, i18n
    |
@sharely/ui-shared           Shared UI: base components, theme system, icons
    |
@sharely/ui-chat             Chat feature: ChatPanel, MessageBubble, Goals, WorkflowProgress
@sharely/ui-search           Search feature: SearchPanel, SearchResults, TagFilter
@sharely/ui-browse           Browse feature: BrowsePanel, CategoryTree, ContentView
@sharely/ui-agent-chat       Agent chat feature: SSE-streamed AI chat with thinking steps,
    |                        tool calls, and source citations
    |
@sharely/webcontrol          Shell: composes all features into WebControl component
    |
@sharely/demo (apps/demo)    Vite demo app with multiple integration examples
@sharely/widget (apps/widget) Embeddable single-file widget build
```

### Packages

| Package | Description |
|---------|-------------|
| `@sharely/services` | Foundation layer — API client, React hooks, Zustand store, types, auth, i18n |
| `@sharely/ui-shared` | Shared UI primitives — theme, base components, icons |
| `@sharely/ui-chat` | Standard chat panel with messages, goals, and workflow progress |
| `@sharely/ui-search` | Search panel with results and tag filtering |
| `@sharely/ui-browse` | Browse panel with category tree and content view |
| `@sharely/ui-agent-chat` | Agent chat panel — SSE-streamed AI responses with thinking indicators, tool call cards, and source citations |
| `@sharely/webcontrol` | Shell that composes all feature packages into the `WebControl` component |
| `@sharely/demo` | Vite demo app with integration examples |
| `@sharely/widget` | Single-file embeddable build |

### Key Patterns

- **API client** — Factory pattern via `createApiClient`. Endpoints are composed functions (spaces, goals, knowledge, workspaces).
- **State management** — Zustand for global app state (token, space, view state, config). React Query for server state/data fetching.
- **Styling** — styled-components v6 with theme. Each feature package owns its styled components.
- **Build** — Library packages use tsup (CJS + ESM dual output). Apps use Vite.
- **Agent mode** — Set `agentMode: true` in config to swap the standard chat panel for the agent chat panel with SSE streaming.

## WebControl Component

The main `WebControl` component accepts:

| Prop | Type | Description |
|------|------|-------------|
| `workspaceId` | `string` | Workspace identifier |
| `baseUrl` | `string` | API base URL |
| `externalUserId` | `string` | External user identifier |
| `lang` | `string` | Language code |
| `defaultView` | `string` | Initial view (`CHAT_VIEW`, `SEARCH_VIEW`, `BROWSE_VIEW`) |
| `theme` | `object` | Theme overrides |
| `displayMode` | `DisplayModeConfig` | Display configuration |
| `onError` | `(error: Error) => void` | Error callback |
| `onReady` | `() => void` | Ready callback |

## Distribution

The root `vite.config.ts` builds a single embeddable JS file under the namespace `sharelyai-webcontroller`, enabling `<script>` tag embedding.

## Demo App

The demo app (`apps/demo`) provides integration examples at:

- `/full-demo` — All features enabled
- `/chat-only` — Chat panel only
- `/search-only` — Search panel only
- `/browse-only` — Browse panel only
- `/custom-shell` — Custom shell example
- `/headless-demo` — Headless integration

## Versioning

Uses [Changesets](https://github.com/changesets/changesets):

```bash
pnpm changeset            # Create a changeset
pnpm version-packages     # Apply version bumps
pnpm release              # Build and publish
```
