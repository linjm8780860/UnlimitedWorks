# Unlimited Works 1:1 Replica Technical Notes

Date: 2026-11-08

## Current Architecture

The primary application is now a Next.js 15 App Router project. The route group
`src/app/(workspace)` shares a client application shell, while each major desktop surface
is implemented as its own route:

- `/`
- `/projects`
- `/canvas`
- `/skills`
- `/plugins`
- `/automations`

The old compiled frontend remains under `reference/compiled-frontend`. It is used as an
evidence and asset source, not as the live application iframe.

## Application Shell

Verified reference dimensions:

- Titlebar: 32 px high.
- Sidebar: 168 px expanded, 48 px collapsed.
- Sidebar resizer range: 160 to 280 px.
- Settings dialog: 800 x 780 px at a 1512 x 828 viewport.
- Home content column: 780 px wide.
- Home heading: 44 px high.
- Home composer shell: 780 x 158 px.
- Recent projects section: 780 x 269 px.

The reconstructed shell matches these dimensions. Sidebar state, width, theme, and
responsive preference are persisted.

The app-wide canvas islands are rendered by the shell on every non-canvas route:
new-tab, assets, Copilot, project management, save/export, map controls, asset management,
and the floating ChatPanel launcher. The canvas route supplies its own document-aware
versions of the same controls.

## Visual Baseline

`src/styles/original-ui.css` is the extracted production stylesheet. The reconstructed
components reuse its typography, color, spacing, scrollbar, font, and interaction rules.

`src/styles/tailwind.css` generates current utility classes for the reconstructed JSX,
including `dark:` and `light:` variants. Tailwind uses class-based dark mode and a custom
`light` variant scoped to `[data-theme="light"]`.

`src/styles/replica.css` contains only new rules:

- canvas grid and minimap patterns
- node color tokens
- settings action styling
- mobile shell behavior
- overrides required to remove stale absolute positioning from the compiled stylesheet

## State and Persistence

The former `WorkspaceProvider` has been removed. State is divided into domain stores:

- `app-shell/shell-store.ts`: theme, sidebar layout, settings visibility, and toasts.
- `workspace/workspace-store.ts`: workspaces and projects.
- `chat/chat-store.ts`: conversations, messages, Agent mode, and model selection.
- `settings/settings-store.ts`: application settings and model overrides.
- `skills`, `plugins`, and `automations`: feature-local collections and commands.

Each persisted store owns a version key and migrates legacy keys explicitly through
`features/shared/legacy-migration.ts`. Components subscribe with domain selectors rather
than consuming a single application-wide state object.

Chat request selection lives in `features/chat/chat-service.ts`. All chat surfaces use the
same `useChatSender()` path and runtime resolution instead of constructing provider
requests independently.

Asset metadata and encoded files move to IndexedDB through
`features/assets/asset-repository.ts`. The asset store exposes hydration and mutation
commands to UI components. Asset mutations are serialized, hydration deduplicates
concurrent callers, and failed IndexedDB writes roll back optimistic state and surface an
error to the shell.

Canvas workspaces use a separate IndexedDB repository. Persistence is debounced during
editing, writes are serialized, page hide flushes pending state, and legacy local canvas
documents are migrated before the first editable render. Canvas writes no longer
synchronously serialize the full workspace on every pointer move.

## Canvas

The canvas is a new DOM/SVG implementation with explicit module boundaries:

- `domain/canvas-document.ts`: node catalog and default documents.
- `geometry.ts`: snapping, alignment, and arrangement pure functions.
- `use-canvas-documents.ts`: documents, tabs, migration, and bounded history.
- `use-canvas-selection-commands.ts`: delete, clipboard, duplication, alignment, and
  selection expansion.
- `use-canvas-viewport-interactions.ts`: pan, zoom, marquee selection, focus, and wheel
  behavior.
- `use-canvas-node-interactions.ts`: node dragging, resizing, connections, and guides.
- `canvas-transient-store.ts`: per-node drag/resize geometry and alignment-guide frames
  outside persisted document state.
- `use-canvas-keyboard.ts`: canvas keyboard command bindings.
- `canvas-repository.ts`: IndexedDB canvas workspace loading, validation, migration, and
  serialized writes.
- `canvas-node-executors.ts`: executor registry for text/image nodes and local simulation.
- `use-canvas-node-runner.ts`: abortable execution queue with stale-result protection.
- `components/canvas-hud.tsx`: isolated FPS, selection, and viewport telemetry.
- `components/canvas-page.tsx`: composition of document state and UI surfaces.
- `components/canvas-node-card.tsx` and `canvas-panels.tsx`: focused visual surfaces.

Implemented behavior:

- 8000 x 8000 world plane
- pan and Ctrl/Meta + wheel zoom
- marquee selection
- node dragging
- transient drag frames with a single document commit on pointer up
- twelve node types
- input/output port connection flow
- selection island with copy and delete
- node action island with model, fixed-text, settings, and Run
- minimap
- FPS, selection, and viewport HUD
- asset, Copilot, project, and save panels
- JSON project export and import
- multiple persisted canvas tabs with project association
- undo/redo with bounded per-document history
- copy, cut, paste, connected/unconnected duplication
- resize handles and node width/height settings
- focus, arrange, selection expansion, align, and equal-size commands
- origin-node snapping with edge/center alignment guides while dragging
- drag surface covers the title and all non-interactive areas of a node card
- interactive controls, ports, and resize handles opt out with `data-node-no-drag`

Verified canvas geometry at 1512 x 828:

- canvas root: `168,32,1344,796`
- top tab island: `180,40,188,42`
- left tool island: asset button at `199,328`
- HUD: `1383,48,113,66`
- minimap control: `191,784`
- ChatPanel launcher: `1444,760,44,44`
- default input node: `420 x 280`, content inset `16px`

The implementation intentionally does not execute bundled production modules. The node
document schema is typed and persisted, and each visual feature has source-level ownership.

## Settings

The reconstructed settings dialog implements all evidence-backed sections:

- 通用
- UW Harness
- 资产库
- API 配置
- 代理设置
- 性能
- 日志
- UW Pro
- 关于

The General section is a small tab container over separately owned modules for 界面, 画布,
快捷键, 提示词, 生成, and 技能. Model and workflow data are read from the extracted
default config.

## Local Research Boundaries

- Chat completions and text nodes support a real OpenAI-compatible provider through
  local Next API routes.
- Image generation supports the standard OpenAI-compatible image endpoint; video, audio,
  and 3D generation still use deterministic local simulation.
- License activation, plugin process execution, native terminal access, and the desktop
  bridge remain local approximations or explicit mock outcomes.
- File System Access API directory pickers are used where the browser supports them.
- Due automation plans are checked every 15 seconds and append their results to conversations.
- Plugin source editing validates JSON metadata and installs local catalog entries; it
  does not compile or execute arbitrary TypeScript in the browser.
- Skill directory loading is adapted to a browser-compatible Markdown import and wizard.
- The original native 3D renderer is represented by a labeled scene surface and remains a
  candidate for a Three.js upgrade.

These boundaries are explicit so the Next project stays maintainable and does not hide
untrusted production bundle execution behind a visual wrapper.

## Verification

- `npx tsc --noEmit`: pass.
- `npm run build`: pass.
- `npm run test:e2e`: pass. Playwright covers canvas creation, dragging, undo, and all
  settings sections.
- Browser checks covered all main routes, project creation, skill restoration, plugin
  installation, automation creation, every settings section and General sub-tab, theme
  switching, sidebar collapse, canvas node creation, and node execution.
- Desktop viewport checks use 1512 x 828.
- Responsive checks use 390 x 844 with no horizontal overflow.
