# Functional Parity Pass

**Goal:** Close the largest behavioral gaps between the current Next replica and the extracted Unlimited Works frontend.

**Scope:** Real API-backed chat, editable provider configuration, persisted imports/exports, canvas document tabs, command history, clipboard operations, node resizing, asset ingestion, and due automation execution.

## Tasks

1. Bind global API URL/key/model configuration to settings and add a server-side OpenAI-compatible chat proxy.
2. Route home and Copilot messages through the configured API, with local simulation only when no key exists.
3. Add canvas document tabs, active-tab restoration, save-all, undo/redo, copy/cut/paste, duplicate variants, and resizable nodes.
4. Add asset ingestion with previews and connect uploaded assets to image/video/audio input nodes.
5. Execute due automation plans and append generated requests to conversations.
6. Add settings JSON import/export and per-model edit persistence.
7. Verify TypeScript, production build, desktop browser flows, and mobile overflow.

