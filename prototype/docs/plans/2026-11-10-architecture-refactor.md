# Architecture Refactor

Status: complete

## Goal

Replace the prototype's broad context and oversized components with domain-owned
state stores, shared services, focused interaction hooks, and independently
maintainable Canvas and Settings modules while preserving current behavior.

## Current Structure

```text
src/features/
  app-shell/       # theme, sidebar, overlays, toasts
  workspace/       # workspaces, projects
  chat/            # conversations, model selection, send service
  settings/        # versioned settings store and section UI
  canvas/          # documents, history, geometry, interactions, runner, UI
  assets/          # IndexedDB repository and asset state
  skills/
  plugins/
  automations/
  shared/          # explicit legacy migrations
```

## Phases

1. Add Zustand and create versioned, focused domain stores.
2. Migrate all workspace consumers from the monolithic context to focused hooks.
3. Extract one shared chat-send service and replace duplicated request flows.
4. Move assets to IndexedDB with an in-memory store facade.
5. Extract Canvas geometry, document commands, interaction hooks, node card, and panels.
6. Split Settings into shell plus section modules.
7. Remove obsolete Context and duplicate panel code.
8. Verify TypeScript, production build, and Playwright/browser interactions.

## Completed Results

- Zustand domain stores replaced the broad workspace context.
- Legacy localStorage keys migrate into versioned domain keys.
- Assets use IndexedDB with legacy import.
- Chat submission and runtime resolution are shared.
- Canvas is split into document/history, geometry, selection commands, viewport
  interactions, node transforms, keyboard bindings, node execution, node card, and panels.
- General settings is a 51-line tab container over six independent section modules.
- Canvas page size dropped from about 2603 lines to about 881 lines.
- General settings dropped from about 1684 lines to a navigation module plus focused files.
- Cross-module automation and workspace communication uses store actions instead of
  `window.dispatchEvent`.
- Canvas viewport changes no longer pollute the undo history.
- Canvas workspaces move from synchronous localStorage writes to a debounced, serialized
  IndexedDB repository with legacy document migration.
- Canvas node execution uses an executor registry and abortable execution queue, preventing
  stale writes from superseded runs or unmounted pages.
- Canvas HUD updates are isolated in a child component and no longer re-render the full
  canvas page on a timer.
- Node drag and resize updates use a transient per-node store. Pointer movement no longer
  rewrites the full canvas workspace on every frame.
- Asset IndexedDB mutations are serialized, hydration is deduplicated, and persistence
  failures roll back optimistic state.
- Playwright regression tests cover creation, dragging, undo, execution, IndexedDB reload,
  legacy migration, and settings navigation.

## Verification

- `npx tsc --noEmit`: pass.
- `npm run build`: pass.
- `npm run test:e2e`: pass.

## Guardrails

- No user data-loss migrations.
- Preserve stored keys or migrate them explicitly.
- Keep visual geometry unchanged while moving code.
- Check `tsc` after each extraction.
- Delete old implementations only after consumers move.

