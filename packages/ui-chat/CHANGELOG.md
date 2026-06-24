# @sharelyai/ui-chat

## 0.0.35

### Patch Changes

- Add an optional version indicator to the chat note in `ChatPanel` / `SuggestedQuestions`. Pass `version` to render a `(vX.Y.Z)` control after the "powered by AI" note that looks like plain text but is a real button; use `onVersionClick` to open an "About" modal from the host app. Mirrors the `version` support already in `AgentChatPanel`.
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

- Updated dependencies
  - @sharelyai/services@0.0.24
  - @sharelyai/ui-shared@0.0.24

## 0.0.23

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.23
  - @sharelyai/ui-shared@0.0.23

## 0.0.22

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.22
  - @sharelyai/ui-shared@0.0.22

## 0.0.18

### Patch Changes

- update versions
- Updated dependencies
  - @sharelyai/ui-shared@0.0.18
  - @sharelyai/services@0.0.21

## 0.0.17

### Patch Changes

- Bump all packages to sync versions
- Updated dependencies
  - @sharelyai/services@0.0.20
  - @sharelyai/ui-shared@0.0.17

## 0.0.16

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.19
  - @sharelyai/ui-shared@0.0.16

## 0.0.15

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.18
  - @sharelyai/ui-shared@0.0.15

## 0.0.14

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

- Updated dependencies
  - @sharelyai/services@0.0.4
  - @sharelyai/ui-shared@0.0.4

## 0.0.2

### Patch Changes

- general services
- Updated dependencies
  - @sharelyai/ui-shared@0.0.2
  - @sharelyai/services@0.0.2
