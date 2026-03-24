# @sharelyai/services

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
