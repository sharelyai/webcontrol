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
pnpm --filter @sharelyai/services build
pnpm --filter @sharelyai/demo dev
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/your-repo)

Forks build entirely from local sources — no `@sharelyai/*` packages are fetched from npm. The default `vercel.json` deploys the widget bundle (`apps/webcontrol`), which produces a single embeddable `<script>`-ready JS file at `apps/webcontrol/dist/assets/sharelyai.js`. Host it on your own Vercel URL and embed it on any page.

See `CONTRIBUTING.md` for environment setup, the local demo app for integration examples, and customization options.

## Architecture

Packages are organized in a strict dependency layer:

```
@sharelyai/services            Foundation: API client, hooks, Zustand store, types, auth, i18n
    |
@sharelyai/ui-shared           Shared UI: base components, theme system, icons
    |
@sharelyai/ui-chat             Chat feature: ChatPanel, MessageBubble, Goals, WorkflowProgress
@sharelyai/ui-search           Search feature: SearchPanel, SearchResults, TagFilter
@sharelyai/ui-browse           Browse feature: BrowsePanel, CategoryTree, ContentView
@sharelyai/ui-agent-chat       Agent chat feature: SSE-streamed AI chat with thinking steps,
    |                          tool calls, and source citations
    |
@sharelyai/webcontrol          Shell: composes all features into WebControl component
    |
@sharelyai/demo (apps/demo)    Vite demo app with multiple integration examples
```

### Packages

| Package | Description |
|---------|-------------|
| `@sharelyai/services` | Foundation layer — API client, React hooks, Zustand store, types, auth, i18n |
| `@sharelyai/ui-shared` | Shared UI primitives — theme, base components, icons |
| `@sharelyai/ui-chat` | Standard chat panel with messages, goals, and workflow progress |
| `@sharelyai/ui-search` | Search panel with results and tag filtering |
| `@sharelyai/ui-browse` | Browse panel with category tree and content view |
| `@sharelyai/ui-agent-chat` | Agent chat panel — SSE-streamed AI responses with thinking indicators, tool call cards, and source citations |
| `@sharelyai/webcontrol` | Shell that composes all feature packages into the `WebControl` component |
| `@sharelyai/demo` | Vite demo app with integration examples |

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

`apps/webcontrol` builds a single embeddable JS file under the namespace `sharelyai-webcontroller`, enabling `<script>` tag embedding. To build it locally:

```bash
pnpm --filter @sharelyai/webcontrol build
```

Output lands in `apps/webcontrol/dist/assets/sharelyai.js`. This is the default Vercel target.

## Demo app (local exploration)

`apps/demo` is a Vite SPA that exercises every integration pattern. It's intended for local development and to help you understand the API surface before embedding the widget — not as a deploy target.

```bash
pnpm --filter @sharelyai/demo dev
```

Routes:

- `/full-demo` — All features enabled
- `/chat-only` — Chat panel only
- `/search-only` — Search panel only
- `/browse-only` — Browse panel only
- `/custom-shell` — Custom shell example
- `/headless-demo` — Headless integration

---

## For maintainers

### Versioning & publishing

Uses [Changesets](https://github.com/changesets/changesets). npm packages under the `@sharelyai` scope are **private** (`publishConfig.access: "restricted"`) — only Sharely AI maintainers can publish.

```bash
pnpm changeset            # Create a changeset
pnpm version-packages     # Apply version bumps
pnpm release              # Build and publish
```
