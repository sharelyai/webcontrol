# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm install              # Install all workspace dependencies
pnpm dev                  # Start dev mode for all packages (turbo, persistent)
pnpm build                # Build all packages in dependency order
pnpm lint                 # Lint all packages
pnpm test                 # Run tests (vitest) across packages
pnpm clean                # Remove all dist/ and node_modules/

# Filter to a specific package
pnpm --filter @sharely/services build
pnpm --filter @sharely/demo dev
```

Turbo handles the build graph: packages build in dependency order (`^build`). The `dev` task is persistent and uncached.

## Environment Setup

Copy `.env.example` to `.env`. Required variables: `VITE_API_DEFAULT_URL`, `VITE_PUBLIC_SUPABASE_URL`, `VITE_PUBLIC_SUPABASE_ANON_KEY`, `VITE_REDIRECT_URL`.

## Architecture

This is a **pnpm + Turborepo monorepo** building an embeddable web control widget (Sharely). Packages are organized in a strict dependency layer:

```
@sharely/services          ← Foundation: API client, hooks, Zustand store, types, auth, i18n
    ↓
@sharely/ui-shared         ← Shared UI: base components, theme system, icons
    ↓
@sharely/ui-chat           ← Chat feature: ChatPanel, MessageBubble, Goals, WorkflowProgress
@sharely/ui-search         ← Search feature: SearchPanel, SearchResults, TagFilter
@sharely/ui-browse         ← Browse feature: BrowsePanel, CategoryTree, ContentView (depends on ui-search too)
    ↓
@sharely/webcontrol        ← Shell: composes all features into WebControl component
    ↓
@sharely/demo (apps/demo)  ← Vite demo app with multiple integration examples
```

**Do not introduce upward or circular dependencies between layers.**

### Key Patterns

- **API client**: Factory pattern via `createApiClient` in `packages/services/src/api/client.ts`. Endpoints are composed functions (spaces, goals, knowledge, workspaces).
- **State management**: Zustand (`packages/services/src/stores/globalStore.ts`) for global app state (token, current space, view state, config). React Query (`@tanstack/react-query`) for all server state/data fetching.
- **Provider**: `SharelyProvider` in `packages/services/src/provider.tsx` supplies apiClient and config via React context.
- **Styling**: styled-components v6 with CSS variables for theming. Each feature package has its own styled components.
- **Build**: Library packages use **tsup** (CJS + ESM dual output). The demo app and root distribution use **Vite** with `vite-plugin-css-injected-by-js` for single-file embeddable output.

### WebControl Entry Point

`packages/webcontrol/src/WebControl.tsx` is the main exported component. It accepts `apiKey`, `workspaceId`, `baseUrl`, `externalUserId`, `lang`, `defaultView`, `theme`, `onError`, and `onReady` props. Renders as a floating launcher (bottom-right, z-index 9999) with a toggleable drawer containing three views: CHAT_VIEW, SEARCH_VIEW, BROWSE_VIEW.

### Distribution

Root `vite.config.ts` builds a single embeddable JS file under the namespace `sharelyai-webcontroller` with assets prefixed `sharelyai.*`. This enables `<script>` tag embedding.

### Demo App Routes

The demo app (`apps/demo`) provides integration examples at: `/full-demo`, `/chat-only`, `/search-only`, `/browse-only`, `/custom-shell`, `/headless-demo`.

## Versioning

Uses Changesets: `pnpm changeset` → `pnpm version-packages` → `pnpm release`.
