# Examples

Implementation examples — **one markdown doc per package** — showing the minimal
code to use each piece of the monorepo on its own.

**Examples teach the parts; the demo app shows the whole.** Each doc has a
copy-paste snippet and links to the live route in [`apps/demo`](../apps/demo) that
runs the exact same code. To try any of them:

```bash
pnpm --filter @sharelyai/demo dev   # http://localhost:3000
```

## The docs

| Doc | Package | Runnable route |
|-----|---------|----------------|
| [services.md](./services.md) | `@sharelyai/services` | `/headless-demo` |
| [ui-shared.md](./ui-shared.md) | `@sharelyai/ui-shared` | `/ui-shared` |
| [ui-chat.md](./ui-chat.md) | `@sharelyai/ui-chat` | `/chat-only` |
| [ui-search.md](./ui-search.md) | `@sharelyai/ui-search` | `/search-only` |
| [ui-browse.md](./ui-browse.md) | `@sharelyai/ui-browse` | `/browse-only` |
| [ui-agent-chat.md](./ui-agent-chat.md) | `@sharelyai/ui-agent-chat` | `/agent-chat-only` |

## The pattern

The packages are layered, and the examples mirror that. Every **feature** package
(`ui-chat`, `ui-search`, `ui-browse`, `ui-agent-chat`) needs the same two wraps:

```
SharelyProvider   (from @sharelyai/services)   → API client + config
  └─ ThemeProvider (from @sharelyai/ui-shared)  → styled-components theme
       └─ <FeaturePanel … />
```

- `services` is the **bottom** of that stack alone (data, no UI).
- `ui-shared` is the **theme + components** alone (UI, no data).
- The four `ui-*` feature packages each add **one panel** on top.

For all packages composed into the shipped widget, see
[`apps/webcontrol`](../apps/webcontrol) and the project [README](../README.md).
