# Unlimited Works 1:1 Replica Implementation Plan

**Goal:** Rebuild the extracted Unlimited Works desktop frontend as a maintainable Next.js application with matching UI, navigation, settings, project persistence, plugin/skill/automation surfaces, and an interactive node canvas.

**Architecture:** Next.js App Router owns the application shell and route-level pages. A client-side workspace provider stores theme, sidebar, settings, projects, conversations, and canvas state in `localStorage`. The canvas uses a native SVG/DOM transform plane instead of the bundled production JavaScript, so node interactions remain readable and maintainable.

**Tech Stack:** Next.js 15, React 19, TypeScript, lucide-react, extracted UI CSS and brand assets, localStorage.

---

## Evidence Baseline

- Source: `reference/compiled-frontend`, React/Vite production build without source maps.
- Verified runtime: `http://localhost:55021/`.
- Primary UI evidence: accessibility tree, DOM classes, computed dimensions, screenshots, settings tab text, canvas layouts, and runtime menu states.
- REA role: JavaScript application inventory, lazy-module discovery, and runtime behavior verification. Native-engine diagnosis is not required for this frontend-only reconstruction.

## Task 1: Design Foundation

**Files:**
- Create: `src/app/original-ui.css`
- Create: `src/app/replica.css`
- Modify: `src/app/layout.tsx`

**Steps:**
1. Copy the extracted production CSS as the visual baseline.
2. Add only replica-specific layout, canvas, animation, and responsive rules.
3. Keep light and dark theme variables scoped to the application shell.
4. Verify no iframe route is used for the primary experience.

## Task 2: Application Shell

**Files:**
- Create: `src/components/workspace/app-shell.tsx`
- Create: `src/components/workspace/sidebar.tsx`
- Create: `src/components/workspace/titlebar.tsx`
- Create: `src/components/workspace/workspace-provider.tsx`

**Steps:**
1. Reproduce the 32px titlebar and 168px expanded / 48px collapsed sidebar.
2. Add six main routes: home, projects, canvas, skills, plugins, and automations.
3. Add theme switching, search, view options, workspace creation, and session grouping.
4. Persist shell preferences and current page state.

## Task 3: Home Composer

**Files:**
- Create: `src/components/home/home-page.tsx`
- Create: `src/components/composer/composer.tsx`
- Create: `src/components/composer/menus.tsx`

**Steps:**
1. Match the 780px centered home column and 780x158px composer shell.
2. Implement workspace, Agent mode, access mode, reasoning, model, attachment, and skill menus.
3. Add rotating creation suggestions and recent project cards.
4. Persist drafts and send mock conversation turns.

## Task 4: Projects and Sessions

**Files:**
- Create: `src/app/projects/page.tsx`
- Create: `src/components/projects/projects-page.tsx`
- Create: `src/components/projects/project-dialogs.tsx`

**Steps:**
1. Reproduce search, sort, grid/list modes, and empty state.
2. Add local project creation and folder-style project opening.
3. Connect recent projects to the home page and sidebar.
4. Add project deletion with confirmation.

## Task 5: Canvas Workspace

**Files:**
- Create: `src/app/canvas/page.tsx`
- Create: `src/components/canvas/canvas-page.tsx`
- Create: `src/components/canvas/canvas-node.tsx`
- Create: `src/components/canvas/canvas-state.ts`

**Steps:**
1. Reproduce floating island, left toolbar, HUD, minimap, and dotted transform plane.
2. Implement double-click node creation for all twelve node types.
3. Add selection, dragging, resize handles, node prompt editing, duplication, deletion, and connections.
4. Add assets, AI copilot, project management, save/export, and shortcut panels.
5. Persist canvas state and provide mock generation results.

## Task 6: Skills, Plugins, and Automations

**Files:**
- Create: `src/app/skills/page.tsx`
- Create: `src/app/plugins/page.tsx`
- Create: `src/app/automations/page.tsx`
- Create: relevant client components and static catalogs.

**Steps:**
1. Implement skill search/filter, install dialog, wizard, enable/disable, restore, and local persistence.
2. Implement installed/built-in/market plugin tabs, filters, reinstall action, and plugin creator.
3. Implement recurring schedule validation, local persistence, and immediate check.
4. Match all verified empty states, counts, labels, and status messages.

## Task 7: Settings and Shared Dialogs

**Files:**
- Create: `src/components/settings/settings-dialog.tsx`
- Create: `src/components/settings/sections/*.tsx`
- Create: `src/components/ui/*.tsx`

**Steps:**
1. Implement all nine settings sections and the six General sub-tabs.
2. Back controls with the persisted provider store.
3. Render model and workflow catalogs from the extracted default config.
4. Add EULA, splash, toast, confirm, and lightbox primitives.

## Task 8: Verification

**Commands:**
- `npx tsc --noEmit`
- `npm run build`
- `npm run dev`

**Browser checks:**
1. Verify all routes at 1512x828.
2. Verify desktop and mobile layouts.
3. Exercise navigation, theme, menus, project creation, node creation, settings tabs, skills, plugins, and automations.
4. Compare key computed dimensions and visible text against the reference page.
5. Confirm no iframe is used for the primary application.

