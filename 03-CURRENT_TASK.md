# Current task

- [in_progress] Add native Lexical table support to Koenig with a minimal insert + floating action UI and semantic HTML round-trip.
  - working folder: `packages/koenig-lexical`
  - scope: keep the existing Ghost/Koenig save pipeline, but add table nodes, editor insertion affordances, and a contextual floating table menu so general users can insert and edit tables without Markdown
  - component targets: `packages/koenig-lexical/src/nodes/DefaultNodes.js`, `packages/koenig-lexical/src/index.js`, `packages/koenig-lexical/src/plugins/AllDefaultPlugins.jsx`, `packages/koenig-lexical/src/components/ui/FloatingToolbar.jsx`, `packages/koenig-lexical/src/components/ui/FormatToolbar.jsx`, and a new table plugin/menu module plus regression tests
  - expected support: the editor can insert a default table, edit cells, add/remove rows and columns from a contextual menu, and save/render as normal HTML tables for Ghost
- [done] Reorder Koenig slash and plus card menus so image, video, markdown, gallery, and file appear first
  - [done] Update card priorities in Koenig node definitions to make slash and plus menus consistent
  - [done] Add a regression test for the new menu ordering in `buildCardMenu`
  - [done] Draft and revise a concise consensus plan with explicit removal scope and legacy support only
- [done] Revise plan to explicitly close all insertion surfaces, including card-menu and bundle/public exports
