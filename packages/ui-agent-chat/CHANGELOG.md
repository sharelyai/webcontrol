# @sharelyai/ui-agent-chat

## 0.0.37

### Patch Changes

- Fix blank UI/Knowledge language in the "Web Control Info" modal. `AboutModal`
  now reads the languages from the shared `@sharelyai/services` config store
  (`versionInfo` remains an optional override), so they display even when the host
  doesn't thread them through `versionInfo`. Also removes the "BSF" mention from
  the chat disclaimer text across all locales, and consolidates i18n to a single
  source (`locales/*.json` via `translations.ts`, dropping the duplicated
  `translations.json`).
- Updated dependencies
  - @sharelyai/services@0.0.37
  - @sharelyai/ui-shared@0.0.37

## 0.0.36

### Patch Changes

- 902b8cb: Add a shared "Web Control Info" modal to `AgentChatPanel`. The version control now opens a built-in `AboutModal` (also exported), populated via the new `versionInfo` prop (`{ chatType, agentId, uiLanguage, knowledgeLanguage }`). Hosts can still override behavior with `onVersionClick`.
- Updated dependencies [902b8cb]
  - @sharelyai/services@0.0.36
  - @sharelyai/ui-shared@0.0.36

## 0.0.35

### Patch Changes

- Add an optional version indicator to `AgentChatPanel`. Pass `version` to render a `(vX.Y.Z)` control next to the disclaimer (in both the empty state and the active chat) that looks like plain text but is a real button; use `onVersionClick` to open an "About" modal from the host app.
- Fix broken `exports` map for external consumers. The packages declared a `"development"` condition pointing at `./src/index.ts` (used for in-repo HMR), but only ship `dist`, so installers like Vite hit the `development` condition in serve mode and failed with "Failed to resolve entry". The `development` condition is now stripped from the published package via `publishConfig.exports` (the source package.json keeps it so workspace HMR still works), so external apps resolve to `dist` with no `resolve.alias` workaround.
- Updated dependencies
  - @sharelyai/services@0.0.35
  - @sharelyai/ui-shared@0.0.35

## 0.0.34

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.34
  - @sharelyai/ui-shared@0.0.34

## 0.0.32

### Patch Changes

- fix: preview mode
- Updated dependencies
  - @sharelyai/services@0.0.32
  - @sharelyai/ui-shared@0.0.32

## 0.0.31

### Patch Changes

- updated chat styles

## 0.0.30

### Patch Changes

- updated resources process
- Updated dependencies
  - @sharelyai/services@0.0.30
  - @sharelyai/ui-shared@0.0.30

## 0.0.29

### Patch Changes

- Updated dependencies
  - @sharelyai/ui-shared@0.0.29
  - @sharelyai/services@0.0.29

## 0.0.28

### Patch Changes

- update chat references
- Updated dependencies
  - @sharelyai/ui-shared@0.0.28
  - @sharelyai/services@0.0.28

## 0.0.27

### Patch Changes

- implement chat role id
- Updated dependencies
  - @sharelyai/ui-shared@0.0.27
  - @sharelyai/services@0.0.27

## 0.0.26

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.26
  - @sharelyai/ui-shared@0.0.26

## 0.0.25

### Patch Changes

- update rename chat functions
- Updated dependencies
  - @sharelyai/ui-shared@0.0.25
  - @sharelyai/services@0.0.25

## 0.0.24

### Patch Changes

- update sources references
- Updated dependencies
  - @sharelyai/services@0.0.24
  - @sharelyai/ui-shared@0.0.24

## 0.0.23

### Patch Changes

- Fix agent response spinner not stopping after done event and add hover cards to source chips

  - Fix ThinkingIndicator spinner continuing to spin after the agent response completes by finalizing all running steps/tool calls in the done handler
  - Add safety fallback in onComplete to handle stream closing without a done event
  - Fix SSE buffer flush to process remaining content when stream ends without trailing delimiter
  - Add hover cards to source chips in SourcesList showing full title, file, page, preview, and similarity score

- Updated dependencies
  - @sharelyai/services@0.0.23
  - @sharelyai/ui-shared@0.0.23

## 0.0.22

### Patch Changes

- Add auto-rename for agent chat threads after 3 user messages
- Updated dependencies
  - @sharelyai/services@0.0.22
  - @sharelyai/ui-shared@0.0.22

## 0.0.19

### Patch Changes

- update versions
- Updated dependencies
  - @sharelyai/ui-shared@0.0.18
  - @sharelyai/services@0.0.21

## 0.0.18

### Patch Changes

- Bump all packages to sync versions
- Updated dependencies
  - @sharelyai/services@0.0.20
  - @sharelyai/ui-shared@0.0.17

## 0.0.17

### Patch Changes

- Fix citation [N] rendering during streaming, collapse processing by default showing last active tool summary, hide File/Page and Open Document for sources without file extensions
- Updated dependencies
  - @sharelyai/services@0.0.19
  - @sharelyai/ui-shared@0.0.16

## 0.0.16

### Patch Changes

- Fix citation [N] references not rendering during SSE streaming and hide File/Page rows for sources without file extensions
- Updated dependencies
  - @sharelyai/services@0.0.18
  - @sharelyai/ui-shared@0.0.15

## 0.0.15

### Patch Changes

- update sources
- Updated dependencies
  - @sharelyai/ui-shared@0.0.14
  - @sharelyai/services@0.0.17

## 0.0.13

### Patch Changes

- update validations
- Updated dependencies
  - @sharelyai/ui-shared@0.0.13
  - @sharelyai/services@0.0.15

## 0.0.12

### Patch Changes

- update versions
- Updated dependencies
  - @sharelyai/ui-shared@0.0.12
  - @sharelyai/services@0.0.14

## 0.0.10

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.12
  - @sharelyai/ui-shared@0.0.10

## 0.0.9

### Patch Changes

- - ui-shared: Fix ReactMarkdown component merging so consumer `components` prop merges with built-in Anchor/Li instead of overriding them
  - ui-shared: Add metadata title and pageNumber fallbacks to Anchor component
  - ui-agent-chat: Use ReactMarkdown from ui-shared instead of raw react-markdown (adds emoji, GFM, rehypeRaw support)
  - ui-agent-chat: Fix citation rendering - [N] patterns now render as CitationBadge components with hover popovers
  - ui-agent-chat: Enrich ThinkingIndicator to show tool calls (search queries, result counts) instead of generic "Continuing reasoning" steps
- Updated dependencies
  - @sharelyai/ui-shared@0.0.9

## 0.0.8

### Patch Changes

- Fix source badge rendering: strip HTML from content preview, hide empty popups, remove P0 suffix, replace \_\_\_\_ with spaces in display text, and add markdown element spacing
- Updated dependencies
  - @sharelyai/services@0.0.11
  - @sharelyai/ui-shared@0.0.8

## 0.0.7

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.9
  - @sharelyai/ui-shared@0.0.7

## 0.0.6

### Patch Changes

- Update peer dependency ranges for react, react-dom, and styled-components to accept any compatible version (^18 || ^19).

## 0.0.5

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

- Updated dependencies
  - @sharelyai/services@0.0.4
  - @sharelyai/ui-shared@0.0.4

## 0.0.2

### Patch Changes

- general services
- Updated dependencies
  - @sharelyai/ui-shared@0.0.2
  - @sharelyai/services@0.0.2
