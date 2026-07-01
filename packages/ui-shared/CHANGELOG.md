# @sharelyai/ui-shared

## 0.0.36

### Patch Changes

- 902b8cb: Add a shared "Web Control Info" modal to `AgentChatPanel`. The version control now opens a built-in `AboutModal` (also exported), populated via the new `versionInfo` prop (`{ chatType, agentId, uiLanguage, knowledgeLanguage }`). Hosts can still override behavior with `onVersionClick`.
- Updated dependencies [902b8cb]
  - @sharelyai/services@0.0.36

## 0.0.35

### Patch Changes

- Keep the linked `@sharelyai` packages on the same version so consumers don't hit a version mismatch between packages published in this release.
- Updated dependencies
  - @sharelyai/services@0.0.35

## 0.0.34

### Patch Changes

- Fix PDF icons and preview in the browse and search resource lists, and share the list-item logic across both views.

  - Resolve a resource's type from its file extension when `blobType` metadata is missing, so PDFs (and other files) show the correct icon/styling and open the PDF preview in both the browse and search views.
  - Extract the shared list-item logic into the `useResourceListItem` hook and the `ResourceIcon` component; `SearchResultCard` and the search list item now keep only their own styles/layout.
  - Remove the unused browse `listSearchItem` component.

- Updated dependencies
  - @sharelyai/services@0.0.34

## 0.0.32

### Patch Changes

- fix: preview mode
- Updated dependencies
  - @sharelyai/services@0.0.32

## 0.0.30

### Patch Changes

- updated resources process
- Updated dependencies
  - @sharelyai/services@0.0.30

## 0.0.29

### Patch Changes

- updated resources
- Updated dependencies
  - @sharelyai/services@0.0.29

## 0.0.28

### Patch Changes

- update chat references
- Updated dependencies
  - @sharelyai/services@0.0.28

## 0.0.27

### Patch Changes

- implement chat role id
- Updated dependencies
  - @sharelyai/services@0.0.27

## 0.0.26

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.26

## 0.0.25

### Patch Changes

- update rename chat functions
- Updated dependencies
  - @sharelyai/services@0.0.25

## 0.0.24

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.24

## 0.0.23

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.23

## 0.0.22

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.22

## 0.0.18

### Patch Changes

- update versions
- Updated dependencies
  - @sharelyai/services@0.0.21

## 0.0.17

### Patch Changes

- Bump all packages to sync versions
- Updated dependencies
  - @sharelyai/services@0.0.20

## 0.0.16

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.19

## 0.0.15

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.18

## 0.0.14

### Patch Changes

- update sources
- Updated dependencies
  - @sharelyai/services@0.0.17

## 0.0.13

### Patch Changes

- update validations
- Updated dependencies
  - @sharelyai/services@0.0.15

## 0.0.12

### Patch Changes

- update versions
- Updated dependencies
  - @sharelyai/services@0.0.14

## 0.0.10

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.12

## 0.0.9

### Patch Changes

- - ui-shared: Fix ReactMarkdown component merging so consumer `components` prop merges with built-in Anchor/Li instead of overriding them
  - ui-shared: Add metadata title and pageNumber fallbacks to Anchor component
  - ui-agent-chat: Use ReactMarkdown from ui-shared instead of raw react-markdown (adds emoji, GFM, rehypeRaw support)
  - ui-agent-chat: Fix citation rendering - [N] patterns now render as CitationBadge components with hover popovers
  - ui-agent-chat: Enrich ThinkingIndicator to show tool calls (search queries, result counts) instead of generic "Continuing reasoning" steps

## 0.0.8

### Patch Changes

- Fix source badge rendering: strip HTML from content preview, hide empty popups, remove P0 suffix, replace \_\_\_\_ with spaces in display text, and add markdown element spacing
- Updated dependencies
  - @sharelyai/services@0.0.11

## 0.0.7

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.9

## 0.0.6

### Patch Changes

- Update peer dependency ranges for react, react-dom, and styled-components to accept any compatible version (^18 || ^19).

## 0.0.5

### Patch Changes

- Fix missing languageId in agent chat flow and update internal dependency versions to use latest tag.

## 0.0.4

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.4

## 0.0.2

### Patch Changes

- general services
- Updated dependencies
  - @sharelyai/services@0.0.2
