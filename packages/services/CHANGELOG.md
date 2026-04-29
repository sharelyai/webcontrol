# @sharelyai/services

## 0.0.25

### Patch Changes

- update rename chat functions

## 0.0.24

### Patch Changes

- update sources references

## 0.0.23

### Patch Changes

- Fix agent response spinner not stopping after done event and add hover cards to source chips

  - Fix ThinkingIndicator spinner continuing to spin after the agent response completes by finalizing all running steps/tool calls in the done handler
  - Add safety fallback in onComplete to handle stream closing without a done event
  - Fix SSE buffer flush to process remaining content when stream ends without trailing delimiter
  - Add hover cards to source chips in SourcesList showing full title, file, page, preview, and similarity score

## 0.0.22

### Patch Changes

- Add auto-rename for agent chat threads after 3 user messages

## 0.0.21

### Patch Changes

- update versions

## 0.0.20

### Patch Changes

- Bump all packages to sync versions

## 0.0.19

### Patch Changes

- Fix citation [N] rendering during streaming, collapse processing by default showing last active tool summary, hide File/Page and Open Document for sources without file extensions

## 0.0.18

### Patch Changes

- Fix citation [N] references not rendering during SSE streaming and hide File/Page rows for sources without file extensions

## 0.0.17

### Patch Changes

- update sources

## 0.0.15

### Patch Changes

- update validations

## 0.0.14

### Patch Changes

- update versions

## 0.0.12

### Patch Changes

- - Add suggested followups support to useAgentChat hook
  - Handle suggested_followups SSE event
  - Clear followups on new message send and chat reset

## 0.0.11

### Patch Changes

- Fix source badge rendering: strip HTML from content preview, hide empty popups, remove P0 suffix, replace \_\_\_\_ with spaces in display text, and add markdown element spacing

## 0.0.10

### Patch Changes

- update markdown links

## 0.0.9

### Patch Changes

- updated resources map values

## 0.0.8

### Patch Changes

- update render message

## 0.0.7

### Patch Changes

- Update peer dependency ranges for react, react-dom, and styled-components to accept any compatible version (^18 || ^19).

## 0.0.6

### Patch Changes

- Fix missing languageId in agent chat flow and update internal dependency versions to use latest tag.

## 0.0.4

### Patch Changes

- fix: resolve missing citation sources in agent chat messages

  - Extract sources from `semantic_search` tool output's `sourcesMetadata` and `search_knowledge` tool output's `results` so that all `[N]` citation references in AI responses map correctly to source badges
  - Support range citation patterns like `[1-6]` in addition to single `[N]` citations, rendering the first source in the range as the badge
  - Updated `sourceParser.ts` with `extractSourcesFromSemanticSearch()` and `extractSourcesFromSearchKnowledge()` helpers
  - Updated streaming handlers in `useAgentChat.ts` and `sharelyStreamAdapter.ts` to extract sources from tool outputs during streaming
  - Updated `CitationRenderer` and `messageAdapters.ts` regex from `/\[(\d+)\]/g` to `/\[(\d+)(?:-(\d+))?\]/g`

## 0.0.2

### Patch Changes

- general services
