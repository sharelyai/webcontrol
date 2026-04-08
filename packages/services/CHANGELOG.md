# @sharelyai/services

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
