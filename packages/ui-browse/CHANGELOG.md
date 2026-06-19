# @sharelyai/ui-browse

## 0.0.34

### Patch Changes

- Fix PDF icons and preview in the browse and search resource lists, and share the list-item logic across both views.

  - Resolve a resource's type from its file extension when `blobType` metadata is missing, so PDFs (and other files) show the correct icon/styling and open the PDF preview in both the browse and search views.
  - Extract the shared list-item logic into the `useResourceListItem` hook and the `ResourceIcon` component; `SearchResultCard` and the search list item now keep only their own styles/layout.
  - Remove the unused browse `listSearchItem` component.

- Updated dependencies
  - @sharelyai/services@0.0.34
  - @sharelyai/ui-shared@0.0.34
  - @sharelyai/ui-search@0.0.34

## 0.0.33

### Patch Changes

- Fix PDF preview and breadcrumb styling in browse and search views

  - Detect PDFs reliably via filename/URL extension (not just `blobType` metadata), so browse/search result clicks open the in-app preview modal instead of downloading the file.
  - Strip the `download` query param from signed storage URLs using the URL API so files are served inline (previewable) while preserving the signed token.
  - Propagate the top-level `blobType` into the browse result card metadata so the correct file icon and preview behavior apply.
  - Fix breadcrumb styles in the browse view by using descendant selectors so the current (nested) breadcrumb item is styled correctly instead of falling back to the default button look.

- Updated dependencies
  - @sharelyai/ui-search@0.0.33

## 0.0.32

### Patch Changes

- fix: preview mode
- Updated dependencies
  - @sharelyai/services@0.0.32
  - @sharelyai/ui-search@0.0.32
  - @sharelyai/ui-shared@0.0.32

## 0.0.30

### Patch Changes

- updated resources process
- Updated dependencies
  - @sharelyai/services@0.0.30
  - @sharelyai/ui-search@0.0.30
  - @sharelyai/ui-shared@0.0.30

## 0.0.29

### Patch Changes

- Updated dependencies
  - @sharelyai/ui-shared@0.0.29
  - @sharelyai/services@0.0.29
  - @sharelyai/ui-search@0.0.29

## 0.0.28

### Patch Changes

- update chat references
- Updated dependencies
  - @sharelyai/ui-search@0.0.28
  - @sharelyai/ui-shared@0.0.28
  - @sharelyai/services@0.0.28

## 0.0.27

### Patch Changes

- implement chat role id
- Updated dependencies
  - @sharelyai/ui-search@0.0.27
  - @sharelyai/ui-shared@0.0.27
  - @sharelyai/services@0.0.27

## 0.0.26

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.26
  - @sharelyai/ui-search@0.0.26
  - @sharelyai/ui-shared@0.0.26

## 0.0.25

### Patch Changes

- update rename chat functions
- Updated dependencies
  - @sharelyai/ui-search@0.0.25
  - @sharelyai/ui-shared@0.0.25
  - @sharelyai/services@0.0.25

## 0.0.24

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.24
  - @sharelyai/ui-search@0.0.24
  - @sharelyai/ui-shared@0.0.24

## 0.0.23

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.23
  - @sharelyai/ui-search@0.0.23
  - @sharelyai/ui-shared@0.0.23

## 0.0.22

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.22
  - @sharelyai/ui-search@0.0.22
  - @sharelyai/ui-shared@0.0.22

## 0.0.18

### Patch Changes

- update versions
- Updated dependencies
  - @sharelyai/ui-search@0.0.18
  - @sharelyai/ui-shared@0.0.18
  - @sharelyai/services@0.0.21

## 0.0.17

### Patch Changes

- Bump all packages to sync versions
- Updated dependencies
  - @sharelyai/services@0.0.20
  - @sharelyai/ui-shared@0.0.17
  - @sharelyai/ui-search@0.0.17

## 0.0.16

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.19
  - @sharelyai/ui-search@0.0.16
  - @sharelyai/ui-shared@0.0.16

## 0.0.15

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.18
  - @sharelyai/ui-search@0.0.15
  - @sharelyai/ui-shared@0.0.15

## 0.0.14

### Patch Changes

- update sources
- Updated dependencies
  - @sharelyai/ui-search@0.0.14
  - @sharelyai/ui-shared@0.0.14
  - @sharelyai/services@0.0.17

## 0.0.13

### Patch Changes

- update validations
- Updated dependencies
  - @sharelyai/ui-search@0.0.13
  - @sharelyai/ui-shared@0.0.13
  - @sharelyai/services@0.0.15

## 0.0.12

### Patch Changes

- update versions
- Updated dependencies
  - @sharelyai/ui-search@0.0.12
  - @sharelyai/ui-shared@0.0.12
  - @sharelyai/services@0.0.14

## 0.0.10

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.12
  - @sharelyai/ui-search@0.0.10
  - @sharelyai/ui-shared@0.0.10

## 0.0.9

### Patch Changes

- Updated dependencies
  - @sharelyai/ui-shared@0.0.9
  - @sharelyai/ui-search@0.0.9

## 0.0.8

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.11
  - @sharelyai/ui-shared@0.0.8
  - @sharelyai/ui-search@0.0.8

## 0.0.7

### Patch Changes

- Updated dependencies
  - @sharelyai/services@0.0.9
  - @sharelyai/ui-search@0.0.7
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
  - @sharelyai/ui-search@0.0.4
  - @sharelyai/ui-shared@0.0.4

## 0.0.2

### Patch Changes

- general services
- Updated dependencies
  - @sharelyai/ui-search@0.0.2
  - @sharelyai/ui-shared@0.0.2
  - @sharelyai/services@0.0.2
