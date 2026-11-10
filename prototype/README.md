# Unlimited Works Next Replica

`prototype/` is a maintainable Next.js reconstruction of the Unlimited Works desktop
frontend extracted from `reference/compiled-frontend`.

The primary experience no longer uses the compiled application through an iframe. The
App Router owns the shell, routes, state, menus, persistence, settings, and canvas
interaction. Extracted production assets and CSS remain available as a visual baseline.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home composer, model and Agent menus, recent projects |
| `/projects` | Local project library with create, search, sort, grid/list, and delete |
| `/canvas` | Interactive node canvas with pan, zoom, selection, dragging, connections, run state, minimap, assets, Copilot, project, and export panels |
| `/skills` | Skill filters, restore built-ins, Markdown import, install wizard, toggle, and delete |
| `/plugins` | Installed/built-in/market tabs, plugin install and toggle, source plugin creator |
| `/automations` | Recurring plan creation, polling toggle, schedule list, and local persistence |
| `/studio` | Earlier standalone React Flow mock retained for comparison |

## Architecture

- `src/app/(workspace)/` contains the route group wrapped by the shared application shell.
- `src/components/workspace/` contains shell composition: titlebar, sidebar, splash, and
  global tool islands.
- `src/features/` is organized by domain. Each feature owns its state, services, and UI:
  `app-shell`, `workspace`, `chat`, `settings`, `canvas`, `assets`, `skills`, `plugins`,
  and `automations`.
- Domain stores use Zustand selectors and versioned persistence. The former monolithic
  workspace context has been removed.
- Chat request construction and runtime selection are centralized in
  `src/features/chat/chat-service.ts`.
- Canvas is split into repository-backed document history, geometry, abortable node
  execution, selection commands, viewport interactions, node transforms, keyboard
  bindings, node card, and panels.
- Drag and resize frames use transient per-node geometry. Pointer movement only updates
  the active node and guides; the document and IndexedDB are committed once on pointer up.
- Canvas HUD telemetry is isolated from the page so timer updates do not re-render the
  entire workspace.
- Settings has a nine-section shell. General settings is a small navigation container over
  six independently owned sub-sections.
- `src/lib/` contains shared domain types, IDs, hooks, API primitives, and the extracted
  model/workflow catalog.
- `src/styles/original-ui.css` is the extracted production visual baseline.
- `src/styles/tailwind.css` generates the utility variants used by the reconstructed components.
- `src/styles/replica.css` contains only new canvas, responsive, theme, and integration rules.

## Data

The current implementation is a local research build:

- Projects, workspaces, conversations, skills, plugins, automations, and settings use
  versioned localStorage persistence with explicit legacy migration.
- Canvas workspaces and binary assets use IndexedDB. Canvas writes are debounced and
  serialized; legacy local canvas documents migrate automatically.
- Asset writes are serialized and propagate IndexedDB failures. Optimistic asset updates
  roll back when persistence fails instead of reporting false success.
- Model and workflow catalogs are imported from the extracted `config/app.default.json`.
- Chat and text nodes call a real OpenAI-compatible endpoint when an API key is configured.
- Image generation uses an OpenAI-compatible `/v1/images/generations` proxy and stores the returned image as a local asset.
- Without an API key, chat, text nodes, and media nodes use explicit local simulation.
- Canvas documents export to JSON and can be loaded back through the project panel.
- The original desktop bridge and native file-system APIs are not required by the reconstructed routes.

API keys stay in local browser storage and are sent only to the local Next route, which
forwards the request to the configured provider. The settings exporter omits API secrets
unless the user explicitly enables sensitive export.

## Run

```sh
npm install
npm run dev
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

```sh
npx tsc --noEmit
npm run build
npm run test:e2e
```

The development server is configured on `127.0.0.1:4173`. Playwright reuses an
already-running development server when available.
