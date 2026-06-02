# `@sharelyai/ui-browse`

The **browse feature** — `BrowsePanel`, category tree, content view.

> **Note the layering:** `ui-browse` depends on `ui-search`, so installing it pulls
> `@sharelyai/ui-search` in as well. It's the one feature package with a sibling
> dependency.

**Runnable:** [`/browse-only`](../apps/demo/src/pages/BrowseOnly.tsx) in the demo app.

## Minimal implementation

Same two wraps as the other feature packages. `BrowsePanel` takes no props:

```tsx
import { SharelyProvider } from '@sharelyai/services';
import { ThemeProvider, GlobalStyle } from '@sharelyai/ui-shared';
import { BrowsePanel } from '@sharelyai/ui-browse';

export default function App() {
  return (
    <SharelyProvider config={{ workspaceId: 'YOUR_WORKSPACE_ID' }}>
      <ThemeProvider>
        <GlobalStyle />
        <div style={{ minHeight: 520 }}>
          <BrowsePanel />
        </div>
      </ThemeProvider>
    </SharelyProvider>
  );
}
```

## Key APIs

| Import | From | Purpose |
|--------|------|---------|
| `SharelyProvider` | `@sharelyai/services` | API client + config |
| `ThemeProvider`, `GlobalStyle` | `@sharelyai/ui-shared` | theme |
| `BrowsePanel` | `@sharelyai/ui-browse` | the browse feature UI (pulls in ui-search) |
