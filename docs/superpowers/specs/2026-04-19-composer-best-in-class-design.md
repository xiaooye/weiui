# Composer — Best-in-Class Page Builder — Design Spec

**Date:** 2026-04-19
**Owner:** Wei
**Status:** Draft
**Supersedes (partially):** `2026-04-18-composer-playground-completion-design.md` — Playground sections still apply; Composer sections are superseded by this spec.
**Related recent commits:** 9eedb98 (ancestor breadcrumb + dbl-click parent), 20b7e38 (polish pass), e1b81db / 0e977ae (null dataTransfer guards).

---

## 1. Goal

Turn the WeiUI Composer at `/composer` into a page builder that can sit next to Framer, Webflow, and Plasmic in quality, while being a **live showcase of `@weiui/react` primitives**. Every piece of editor chrome is built from a WeiUI component — no custom shadcn-lite widgets when a library primitive exists. The tool proves the design system can build itself.

**The test for "best in class":**
- Cmd+K opens a command palette that adds components, loads templates, and runs actions.
- Right-click any rendered node to duplicate / wrap / delete with `<Kbd>`-labeled shortcuts.
- Drag works in every browser (Chrome, Firefox, Safari, mobile Safari, iOS) via a pointer-first implementation — no null-dataTransfer crashes.
- Keyboard: arrow keys traverse siblings/parent/child; Tab walks depth-first; Cmd+D duplicates; Cmd+C/V copy/paste across selections.
- Multi-select via Shift-click / Cmd-click; delete / duplicate / copy operates on the whole selection.
- Between-siblings drop indicators (VSCode file-tree style) show where a drop will land before release.
- Palette / Canvas / Props columns are resizable via `<Splitter>` — user drags the divider to taste.
- Outline is a real `<TreeView>` with expand/collapse, keyboard roving, drag-reorder, and shares selection with the canvas.
- Preview mode hides all editor chrome and shows the real rendered output.
- Mobile: palette + props become `<Drawer>`s triggered from the toolbar.

---

## 2. Scope

### In scope

1. **Interaction manager** — a single `useInteractionManager()` hook owns selection (primary + multi), clipboard, drag session, command-palette-open, context-menu-open. Every view delegates.
2. **Pointer-first drag** — replace HTML5 `dataTransfer` with pointer events + a custom ghost rendered through `<Portal>`. Works on every browser, no null crashes.
3. **Between-elements drop indicators** — 2px primary line between siblings when pointer is near a gap. Drop inserts at that index.
4. **Keyboard navigation** — ArrowUp/Down (prev/next sibling) · Left (parent) · Right (first child) · Tab/Shift+Tab (depth-first) · Esc (clear) · Enter (focus props panel).
5. **Multi-select** — Shift-click adds · Cmd/Ctrl-click toggles · Cmd/Ctrl+A selects all siblings of primary. Delete / duplicate / copy operate on every selected node.
6. **Copy / paste** — Cmd/Ctrl+C serialises selected subtrees to an in-memory clipboard and `navigator.clipboard.writeText(json)`. Cmd/Ctrl+V reads back, assigns fresh UUIDs, inserts as sibling of primary (or at root). Survives undo/redo.
7. **Command palette (Cmd+K)** — `<CommandPalette>` bound to Cmd+K. Commands include: "Add &lt;Component&gt;" (one per palette item) · "Load template: &lt;Name&gt;" · "Delete selection" · "Duplicate selection" · "Wrap in Stack (row/column)" · "Wrap in Card" · "Select parent" · "Toggle preview" · "Toggle outline panel". Fuzzy-matched via `match-sorter` (already in the CP). Arrow keys + Enter select.
8. **Right-click context menu** — `<Menu>` opened via `onContextMenu` on any `[data-composer-id]`. Items: Duplicate (⌘D) · Delete (⌫) · Wrap in Stack row (⌥R) · Wrap in Stack column (⌥C) · Wrap in Card · Copy (⌘C) · Paste (⌘V) · Select parent (⌥↑) · Move up (⌘↑) · Move down (⌘↓). Each item renders `<Kbd>` for its shortcut.
9. **Breadcrumb (WeiUI `<Breadcrumb>`)** — replaces the hand-rolled chain in PropsEditor. Uses `<BreadcrumbItem>` + `<BreadcrumbEllipsis>` when depth > 5.
10. **Popover-anchored layout chips** — replace the absolute-positioned chip div with a `<Popover>` anchored to the selection rect. Floating-UI handles flip/shift/collision.
11. **Splitter-based resizable chrome** — the Palette / Canvas / Props columns live inside a horizontal `<Splitter>` with three `<SplitterPanel>`s (min 200 / 400 / 240, collapsible on the side panels). Palette and Props can be double-clicked to collapse; the canvas panel always stays visible.
12. **TreeView outline** — replace the custom outline `<Canvas>` with a `<TreeView>` driven by the same tree state. Expand/collapse with chevrons, roving tabindex, drag-reorder rows (via the same pointer primitive as the canvas), typeahead by first letter. Selection mirrors the canvas.
13. **Toast feedback** — `toast.success` / `toast.info` / `toast.error` for: copy / paste / load template / delete / duplicate / undo-redo / export copied / sandbox opened / clipboard fail.
14. **Preview mode** — a `<Switch>` in the top toolbar (Cmd+P). On: hides selection/hover outlines, chips, drop zones; canvas becomes the real product.
15. **Dark/light toggle in the stage** — a `ToggleGroup` matching the Playground's, sets `data-theme` on the stage wrapper (not the whole app). Independent of docs-site theme.
16. **Click stage background selects root** — when the click target is the stage itself (not a composer node), select the root if the tree is non-empty, else clear selection.
17. **Zoom toggle group** — `50 | 75 | 100 | 125 | 150` via `transform: scale()` on the stage. Fit-to-viewport button auto-picks a zoom so the stage fits.
18. **Rulers toggle** — optional top + left tick strips (10px minor, 50px major) behind a `<Switch>`, off by default.
19. **Responsive** — on `< 768px` the Splitter collapses to a single canvas column; the palette becomes a `<Drawer side="left">` and the props panel a `<Drawer side="right">`, triggered from the AppBar.

### Out of scope

- **Free x/y absolute positioning.** Still deliberately not a page-builder goal — every layout compiles to WeiUI Stack/Grid/Container.
- **Per-breakpoint prop overrides.** Still a future spec; v1 previews responsive widths but doesn't store breakpoint-specific props.
- **Cross-tab clipboard sync.** Clipboard is per-session.
- **Collaborative editing.** No real-time co-authoring.
- **AI-assisted generation.** "Describe what you want" deferred.
- **Figma plugin / Figma import.** Deferred.
- **Component variants / states** (hover, active, disabled editing). Deferred — would require a design-token-level overlay we don't have.
- **Full versioning beyond undo/redo.** Named snapshots / history timeline deferred.
- **Slash-command inline insertion** (type `/` in the canvas to pick a component). Nice-to-have, deferred.

---

## 3. Architecture

```
                  ┌───────────────────────────────────────────────┐
                  │  apps/docs/src/app/composer/lib/              │
                  │  interaction-manager.ts   ← state + store     │
                  │  pointer-drag.ts          ← drag primitive    │
                  │  compute-drop-indicators  ← gap detection     │
                  │  keyboard-nav.ts          ← kb state machine  │
                  │  commands.ts              ← ⌘K registry       │
                  │  clipboard.ts             ← copy/paste        │
                  └──────────────┬────────────────────────────────┘
                                 │
              ┌──────────────────┼───────────────────────────────┐
              ▼                  ▼                               ▼
  ┌──────────────────┐ ┌───────────────────────┐ ┌─────────────────────┐
  │ ComponentPalette │ │ WysiwygCanvas         │ │ PropsEditor         │
  │ (draggable btns) │ │ (stage + overlay)     │ │ (Breadcrumb+Fields) │
  └──────────────────┘ └───────────────────────┘ └─────────────────────┘
              │                  │                               │
              └────────────── TreeView ────────────────────────┐ │
                       (shared outline, same state) ───────────┘ │
                                                                 │
                                ┌──── CommandPalette (⌘K) ───────┤
                                ├──── Menu (right-click) ────────┤
                                ├──── Toast (feedback) ──────────┤
                                └──── Drawer (mobile palette) ───┘
```

All chrome components come from `@weiui/react`. Custom code is narrow: state store, drag math, command registry, a thin DragGhost portal, the canvas overlay.

### 3.1 Module responsibilities

| File | Purpose | Exports |
|------|---------|---------|
| `lib/interaction-manager.ts` | React context + hook. Single source of truth for selection, clipboard, drag session, palette/menu openness. | `InteractionProvider`, `useInteractionManager()` |
| `lib/pointer-drag.ts` | Pure drag state machine (idle / pressed / dragging / committed). Accepts pointer events, emits `DragSession`. No DOM knowledge. | `usePointerDrag()` |
| `lib/compute-drop-indicators.ts` | Pure function — given stage rects + pointer, returns `{ edge?, betweenIndex?, targetId? }`. Extends today's `drop-logic.ts`. | `computeDropIndicator()`, `computeDropAction()` (moved from existing `drop-logic.ts`) |
| `lib/keyboard-nav.ts` | Pure function: given tree + current selection + key event, returns next selection. Merges today's `keyboard-shortcuts.ts`. | `useComposerKeyboard()` |
| `lib/commands.ts` | Command registry. `buildCommands(tree, selection, palette)` returns the list the `<CommandPalette>` shows. | `useComposerCommands()` |
| `lib/clipboard.ts` | Serialise / deserialise subtrees with fresh-id remapping. | `copyNodes()`, `pasteNodes()` |
| `components/DragGhost.tsx` | Portal-mounted floating preview that follows the pointer during drag. | `DragGhost` |
| `components/OutlineTree.tsx` | Wraps `<TreeView>` from `@weiui/react`; pipes tree state through. Replaces today's `Canvas.tsx` outline implementation. | `OutlineTree` |
| `components/ContextMenu.tsx` | Wraps `<Menu>`; opened at pointer on `contextmenu`. | `ContextMenu` |
| `components/ComposerAppBar.tsx` | Top toolbar: undo/redo, zoom, viewport, theme, preview, command-palette trigger, sandbox. Uses `<AppBar>` from the lib. | `ComposerAppBar` |
| `components/ResizableShell.tsx` | 3-panel `<Splitter>` layout with mobile collapse to `<Drawer>`s. | `ResizableShell` |

Existing files that stay but get simplified:
- `components/WysiwygCanvas.tsx` — drops its local selection/drag state; reads from `useInteractionManager`; renders DropZones + DragGhost portal.
- `components/PropsEditor.tsx` — replaces hand-rolled breadcrumb with `<Breadcrumb>`. Rest stays.
- `components/ComponentPalette.tsx` — swaps HTML5 `onDragStart` for pointer-based drag; still Accordion-grouped.
- `components/LayoutChips.tsx` — chips render inside a `<Popover>` anchored to the selection rect via `floatingRef`.

Existing files removed (their logic moves into the files above):
- `lib/drop-logic.ts` → split between `compute-drop-indicators.ts` (pure math) and `interaction-manager.ts` (dispatch).
- `lib/keyboard-shortcuts.ts` → becomes `lib/keyboard-nav.ts`.
- `components/Canvas.tsx` (outline) → replaced by `OutlineTree.tsx` wrapping `<TreeView>`.

### 3.2 Data contracts

**`InteractionState`** (the store inside `interaction-manager.ts`):

```ts
export interface Selection {
  /** Focused node for single-node operations (arrow keys, props panel, chips). */
  primary: string | null;
  /** Set including `primary`. All selected nodes are edited together. */
  all: Set<string>;
}

export interface DragSession {
  kind: "palette" | "reorder";
  /** For "palette": a fully-formed new node. For "reorder": ids of the nodes being moved. */
  payload: ComponentNode | string[];
  /** Client-coord pointer position, updated every pointermove. */
  pointer: { x: number; y: number };
  /** The floating ghost element for visual feedback (or null if not yet rendered). */
  ghost?: HTMLElement | null;
}

export interface InteractionState {
  selection: Selection;
  clipboard: ComponentNode[];
  drag: DragSession | null;
  commandPaletteOpen: boolean;
  contextMenu: { id: string; x: number; y: number } | null;
  previewMode: boolean;
  zoom: 50 | 75 | 100 | 125 | 150;
  rulers: boolean;
}
```

**`Command`** (for `<CommandPalette>`):

```ts
export interface Command {
  id: string;
  label: string;
  group: "Add" | "Template" | "Edit" | "Navigate" | "View";
  shortcut?: string;         // e.g. "⌘D"
  icon?: ReactNode;          // Palette icon (first letter in a badge, same as today)
  run: () => void;
}
```

### 3.3 Single source of truth for selection

Today, `selectedId` lives in `ComposerPage`; `WysiwygCanvas` reads it, and `PropsEditor` reads it again through props. After the refactor:

- `InteractionProvider` wraps `<ComposerPage>`.
- All components call `useInteractionManager()` — they see the same selection.
- Clicking a row in the `OutlineTree` dispatches `select(id, "replace")`; the canvas re-renders its selection outline automatically.
- Clicking a rendered node on the canvas does the same.
- Cmd/Ctrl-click anywhere toggles; Shift-click extends.

This removes a whole class of bugs from prop-drilling and keeps canvas and outline perfectly in sync.

---

## 4. Drag subsystem (pointer-first)

### 4.1 Why pointer events

HTML5 `dataTransfer` can be `null` (iOS Safari in-app, browser extensions, some a11y tools). Today's guards prevent crashes but the drag still silently fails. Pointer events fire unconditionally and don't rely on `DataTransfer` at all — they work everywhere.

### 4.2 State machine

```
idle ── pointerdown on palette/node ──► pressed
pressed ── pointermove > 4px ────────► dragging   (publish DragSession, mount DragGhost)
pressed ── pointerup ────────────────► click      (passthrough — click-to-add or select)
dragging ── pointermove ─────────────► dragging   (update pointer coords; recompute drop indicator)
dragging ── pointerup ───────────────► committing (compute action from last indicator; dispatch)
committing ─ done ───────────────────► idle
```

### 4.3 Ghost

`<DragGhost>` is a `<Portal>`-mounted `<div>` positioned at `(pointer.x, pointer.y)`. Its children match the dragged payload: for palette items, the palette label inside a `<Chip>`; for reorders, the node's type name.

### 4.4 Drop indicators

For each frame during `dragging`, call `computeDropIndicator(stageRect, tree, rects, pointer)`:

1. Find the hovered `[data-composer-id]` via `document.elementFromPoint`.
2. Compute its 5 drop zones (4 edges + center for containers).
3. **New:** inspect siblings of the hover target. For each gap between siblings (vertical in a column Stack, horizontal in a row Stack), if pointer distance to the gap centerline is < 8px, replace the edge indicator with a **between-drop** indicator (they are mutually exclusive — one or the other, never both).
4. Return `{ targetId, edge: "top"|"right"|"bottom"|"left"|"center"|null, betweenIndex?: number }`.

**Visualisation:**
- Edge drop: the existing 30%-slice highlight (unchanged).
- Between drop: a 2px `var(--wui-color-primary)` horizontal/vertical line at the gap, with 4px rounded caps. Pointer-events none so it doesn't interfere.

### 4.5 Unified dispatch

`onPointerUp` during a commit runs `computeDropAction(ctx, indicator, payload)` — the same pure function as today, just extended with a `betweenIndex` branch that emits a single `INSERT` at the chosen index. For reorders, the dispatch is `DELETE` + `INSERT` (can stay as today; atomic history is a non-goal for v1).

### 4.6 HTML5 drag removal

- Remove `draggable={true}` and `onDragStart` from palette buttons and canvas wrappers.
- Remove `onDragEnter/Over/Leave/Drop` from the stage.
- Keep `data-composer-id` attributes — they're how we find the drop target.

### 4.7 Accessibility

- Palette buttons stay focusable. Pressing Enter or Space calls the existing click-to-add path (no drag required).
- Keyboard reorder for canvas: with a node selected, Cmd+Shift+↑/↓/←/→ moves it within siblings (Up / Down) or in/out of parent (Right / Left).

---

## 5. Selection + keyboard

### 5.1 Click semantics

| Gesture | Action |
|---------|--------|
| Click a node | `select(id, "replace")` |
| Shift-click a node | `select(id, "add")` — adds to `all`, primary stays |
| Cmd/Ctrl-click a node | `select(id, "toggle")` — toggles; if removing primary, new primary is the last other |
| Click stage background | If tree non-empty, select root; else clear |
| Double-click | Select parent of clicked node (escape hatch, preserves today's behaviour) |
| Right-click | Select clicked node (if not already in selection) + open context menu |

### 5.2 Keyboard (when canvas/outline has focus)

| Key | Action |
|-----|--------|
| ArrowUp | Prev sibling of primary (or parent if index 0) |
| ArrowDown | Next sibling of primary (or primary's parent's next sibling if last) |
| ArrowLeft | Select parent |
| ArrowRight | Select first child |
| Tab | Next node in depth-first order |
| Shift+Tab | Prev node in depth-first order |
| Enter | Focus the props editor (first input) |
| Esc | Clear selection; if command palette open, close it first |
| Delete / Backspace | Delete all selected |
| Cmd/Ctrl+D | Duplicate all selected |
| Cmd/Ctrl+C | Copy selected to clipboard |
| Cmd/Ctrl+V | Paste clipboard |
| Cmd/Ctrl+A | Select all siblings of primary |
| Cmd/Ctrl+Z | Undo (existing) |
| Cmd/Ctrl+Shift+Z / Cmd/Ctrl+Y | Redo (existing) |
| Cmd/Ctrl+K | Open command palette |
| Cmd/Ctrl+P | Toggle preview mode |
| Cmd/Ctrl+Shift+↑/↓ | Move selected up / down among siblings |
| Cmd/Ctrl+Shift+←/→ | Move selected into parent / into previous sibling as child |

Typing inside an `<input>`, `<textarea>`, or `contenteditable` suppresses these — already handled by the existing `isTypingInInput` helper, reused.

### 5.3 Focus management

The canvas stage and the outline tree are both keyboard focus targets (`tabIndex={0}`). Focus follows: clicking anywhere in a panel focuses it. `useFocusTrap` is not needed — nothing is modal except the command palette + dialogs (which manage their own trap).

---

## 6. Command palette (Cmd+K)

### 6.1 Commands generated per render

Driven by `useComposerCommands(tree, selection, schemas)`:

- **Add** group: one command per `PALETTE_ITEM`. Running it dispatches INSERT at root (same as click-to-add). Icon = first-letter badge.
- **Template** group: one per `TEMPLATES`. Running replaces the tree via `LOAD` (same as today).
- **Edit** group: Delete selection · Duplicate selection · Wrap in Stack (row) · Wrap in Stack (column) · Wrap in Card · Copy · Paste · Select parent · Move up · Move down. Available only when `selection.primary` exists.
- **Navigate** group: Jump to &lt;Node type&gt; — one per node in the tree, label includes the node's `text` preview.
- **View** group: Toggle preview mode · Toggle outline panel · Toggle rulers · Zoom 50/75/100/125/150 · Viewport 375/768/1024/1280/full · Theme auto/light/dark.

### 6.2 Integration

`<CommandPalette>` exposes a single-shape API — `items: CommandItem[]` (where `CommandItem = { id, label, group?, shortcut?, icon?, onSelect? }`) plus controlled `open` / `onOpenChange`. No sub-components for input/list. The composer page mounts one instance:

```tsx
const commands = useComposerCommands(tree, selection, schemas);
<CommandPalette
  id="composer-commands"
  items={commands.map(c => ({ id: c.id, label: c.label, group: c.group, shortcut: c.shortcut, icon: c.icon, onSelect: c.run }))}
  open={state.commandPaletteOpen}
  onOpenChange={(o) => dispatch({ type: "commandPaletteOpen", value: o })}
  placeholder="Type a command or search for a component"
/>
```

### 6.3 Fuzzy match + shortcut execution

Both are already in the component (shipped in Phase 6a — see commit `6fbe3aa`): `match-sorter`-backed fuzzy ranking over `label` + `group`; per-item `shortcut` parsed and executed by a global keydown listener while the palette is open.

---

## 7. Context menu (right-click)

`onContextMenu` on the stage: find the `[data-composer-id]`, `e.preventDefault()`, dispatch `openContextMenu({ id, x, y })`. The page mounts a `<Menu>` whose `<MenuContent>` is positioned at `(x, y)` via a virtual-anchor trick (a zero-size `<span>` placed absolutely at the coords and passed to Menu's floating-ref — matches the pattern used elsewhere in the codebase for context menus).

Each `<MenuItem>` takes a `shortcut` string prop that renders a `.wui-menu__shortcut` span on the trailing edge — no separate `MenuShortcut` component needed. Items are the "Edit" group commands from §6.1. Esc + outside-click close behaviour is built into `<Menu>`.

---

## 8. Breadcrumb (WeiUI component)

Today's hand-rolled crumb chain in `PropsEditor` is replaced by the WeiUI `<Breadcrumb>` primitive. The public exports from `@weiui/react` are `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbSeparator`, `BreadcrumbEllipsis` — no `BreadcrumbLink` / `BreadcrumbPage`. Each crumb is a bare `<BreadcrumbItem>` whose child is either a text node (for the current / last item) or a `<button>` (for ancestors):

```tsx
<Breadcrumb>
  {displayItems.map((a, i, arr) => (
    <Fragment key={a.id}>
      <BreadcrumbItem>
        {i === arr.length - 1 ? (
          <Text as="span" size="xs" weight="semibold">{a.type}</Text>
        ) : (
          <button type="button" className="wui-composer__crumb-link" onClick={() => select(a.id, "replace")}>
            {a.type}
          </button>
        )}
      </BreadcrumbItem>
      {i < arr.length - 1 ? <BreadcrumbSeparator /> : null}
    </Fragment>
  ))}
</Breadcrumb>
```

`displayItems` collapses the middle with `<BreadcrumbEllipsis>` when `ancestors.length > 5`: first, `<BreadcrumbEllipsis>`, last three.

---

## 9. Popover-anchored layout chips

`LayoutChips` render inside a `<Popover>` with `open={selectedIsContainer}`, `anchorRef` set to the selected DOM element (via `querySelector('[data-composer-id="..."] > *')`). Floating-UI's `flip` and `shift` middleware (already used across the lib) place the chip bar above-with-gutter, flipping below on top-of-viewport collision.

---

## 10. Splitter-based resizable chrome

`ResizableShell` wraps the three panels. Sizes are percentages per the `<SplitterPanel>` contract — `minSize`, `defaultSize`, `maxSize` are all percent-of-total (not pixels).

```tsx
<Splitter orientation="horizontal">
  <SplitterPanel minSize={14} defaultSize={17} maxSize={30} collapsible>
    <ComponentPalette />
  </SplitterPanel>
  <SplitterPanel minSize={40} defaultSize={61}>
    <Stack direction="column" gap={4}>
      <ComposerAppBar />
      <WysiwygCanvas />
      <CodeExport />
    </Stack>
  </SplitterPanel>
  <SplitterPanel minSize={16} defaultSize={22} maxSize={35} collapsible>
    <PropsEditor />
  </SplitterPanel>
</Splitter>
```

Defaults sum to 100. On a 1440-px screen this yields roughly `240 · 880 · 320` which matches the Framer-ish proportions. Double-click the palette / props handles to collapse (uses SplitterPanel's existing `collapsible` semantic). Sizes persist via `useSyncExternalStore` on `localStorage` key `wui-composer-layout-sizes`.

---

## 11. TreeView outline

The `OutlineTree` component wraps `<TreeView>` from the lib (`nodes: TreeNode[]` + `selectedIds` + `onSelectedIdsChange`, `selectionMode="multiple"`). A pure helper `toTreeNodes(componentTree): TreeNode[]` maps:

```
ComponentNode { id, type, props, children, text }
  → TreeNode {
      id,
      label: node.text ? `${type}  ${truncate(node.text, 24)}` : type,
      icon: <FirstLetterBadge>{type[0]}</FirstLetterBadge>,
      children: node.children.map(toTreeNode),
    }
```

Selection syncs through `useInteractionManager`:
- TreeView's `selectedIds` = `selection.all` as array.
- TreeView's `onSelectedIdsChange(ids)` = `select(...ids)` — primary becomes the last added.

Drag-reorder is NOT built into TreeView — it's added by attaching the same `usePointerDrag` hook's listeners to each rendered row via a small wrapper. Drop targets are row-relative: top half (insert before), bottom half (insert after), center (insert as child when the row is a container). Visual feedback reuses the between-drop indicator.

---

## 12. Toast feedback

Mount `<Toaster position="top-center">` (already shipped) at the composer root. Fire:
- `toast.success` on: paste, load template, export copied, sandbox opened, duplicate success.
- `toast.info` on: preview on/off.
- `toast.error` on: clipboard permission denied, sandbox POST failed, invalid paste payload.
- `toast.promise` on: `openInCodeSandbox` promise — shows "Creating sandbox…" while pending.

---

## 13. Preview mode

Boolean in `InteractionState`. When true:
- `<SelectionOutline>`, `<HoverOutline>`, `<DropZones>`, `<LayoutChips>` return null.
- Canvas `onClick` / `onContextMenu` become no-ops.
- Stage gets `data-preview="true"` for any CSS tweaks (e.g., hide the checkerboard background).

Shortcut: Cmd+P. Toolbar toggle: `<Switch>` labelled "Preview".

---

## 14. Stage polish

### 14.1 Theme toggle in stage

Same tri-state `<ToggleGroup>` pattern as Playground. Sets `data-theme={theme}` on the `.wui-composer__stage` wrapper. CSS applies light-mode token overrides when `data-theme="light"` even inside a `.dark` document.

### 14.2 Zoom

`<ToggleGroup>` with values `50 | 75 | 100 | 125 | 150`. Applies `style={{ transform: \`scale(${zoom/100})\`, transformOrigin: "top left" }}` on the stage. Container scales width to maintain layout.

### 14.3 Rulers

Optional. `<Switch>` in the AppBar's view-controls group. When on, render two absolutely-positioned ruler strips (top + left) inside the canvas wrapper. Ticks every 10px (minor) and 50px (major) with labels. Defaults to off.

### 14.4 Click-stage-background

Already specified in §5.1.

---

## 15. Responsive behaviour

Breakpoint: `768px`.

- **≥ 768px:** three-column `<Splitter>` as described.
- **< 768px:** `<Splitter>` collapses — only the canvas panel renders. Two buttons in the AppBar open the palette (`<Drawer side="left">`) and the props panel (`<Drawer side="right">`). Canvas fills the viewport.

Existing `@media (max-width: 768px)` CSS in `chrome.css` is replaced by the conditional Drawer approach — cleaner and matches WeiUI's responsive patterns elsewhere.

---

## 16. Files — add / modify / remove

### New files

- `apps/docs/src/app/composer/lib/interaction-manager.ts`
- `apps/docs/src/app/composer/lib/pointer-drag.ts`
- `apps/docs/src/app/composer/lib/compute-drop-indicators.ts`
- `apps/docs/src/app/composer/lib/keyboard-nav.ts`
- `apps/docs/src/app/composer/lib/commands.ts`
- `apps/docs/src/app/composer/lib/clipboard.ts`
- `apps/docs/src/app/composer/components/DragGhost.tsx`
- `apps/docs/src/app/composer/components/OutlineTree.tsx`
- `apps/docs/src/app/composer/components/ContextMenu.tsx`
- `apps/docs/src/app/composer/components/ComposerAppBar.tsx`
- `apps/docs/src/app/composer/components/ResizableShell.tsx`
- Tests for each of the above in `__tests__/`

### Modified files

- `apps/docs/src/app/composer/components/WysiwygCanvas.tsx` — slim down; read from `useInteractionManager`; swap HTML5 handlers for pointer.
- `apps/docs/src/app/composer/components/ComponentPalette.tsx` — swap `onDragStart` for pointer drag initiation.
- `apps/docs/src/app/composer/components/PropsEditor.tsx` — use `<Breadcrumb>` instead of custom crumb.
- `apps/docs/src/app/composer/components/LayoutChips.tsx` — wrap in `<Popover>`.
- `apps/docs/src/app/composer/page.tsx` — wrap in `<InteractionProvider>`, mount `<CommandPalette>`, `<ContextMenu>`, `<Toaster>`, `<ResizableShell>`.
- `apps/docs/src/styles/composer.css` — drop custom breadcrumb styles, drop edge-drop styles (replaced by overlay child), add between-drop indicator style, ghost style, ruler strips, preview-mode rules.

### Removed files

- `apps/docs/src/app/composer/components/Canvas.tsx` (outline) — replaced by `OutlineTree.tsx`.
- `apps/docs/src/app/composer/lib/drop-logic.ts` — split into `compute-drop-indicators.ts` (math) + `interaction-manager.ts` (dispatch). Re-export shim for one release.
- `apps/docs/src/app/composer/lib/keyboard-shortcuts.ts` — becomes `keyboard-nav.ts`.

---

## 17. Testing

### Unit (Vitest)

- `interaction-manager.test.ts` — every action on the state machine (select replace/add/toggle, drag start/end, clipboard, preview toggle, zoom, rulers).
- `pointer-drag.test.ts` — state transitions on synthetic pointer events.
- `compute-drop-indicators.test.ts` — edge + between-drop math.
- `keyboard-nav.test.ts` — every shortcut in §5.2.
- `commands.test.ts` — commands list shape per selection state.
- `clipboard.test.ts` — round-trip with fresh UUIDs; nested trees.
- `OutlineTree.test.tsx` — selection sync with canvas.

### Integration

- Rendering `<ComposerPage>` with a stub tree: click a row in outline → canvas shows selection outline.
- Right-click on canvas node → menu opens with the expected items.
- Cmd+K opens palette; type "Card"; Enter adds Card.

### Playwright E2E

- `apps/docs/e2e/composer-keyboard.spec.ts` — Tab traversal, Arrow keys, Delete, Cmd+D.
- `apps/docs/e2e/composer-drag.spec.ts` — real mouse drag palette → canvas; assert node appears.
- `apps/docs/e2e/composer-multi-select.spec.ts` — Shift-click two nodes; Delete; assert both gone.
- `apps/docs/e2e/composer-command-palette.spec.ts` — Cmd+K, type "Login form", Enter; assert template loaded.
- `apps/docs/e2e/composer-resize.spec.ts` — drag a Splitter handle; assert width changed.

Baseline: the existing 100 tests must stay green.

---

## 18. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Pointer-drag + existing click handlers conflict (e.g., a press-move-release that drags also fires click on mouseup) | The state machine holds `pressed` until 4px of movement. If `pointerup` fires in `pressed` (< 4px), we emit a click event; if it fires in `dragging`, we suppress the synthetic click. |
| `<Popover>` around layout chips may capture pointer events during drag | Chips disable themselves via `open={false}` whenever a drag session is active. |
| `<TreeView>` drag-reorder clashes with canvas drag (two primitives active at once) | Both use the shared `usePointerDrag` hook; only one session lives at a time in the interaction manager. |
| Splitter state churn on every render of the canvas | Splitter already memoises; panel children are stable React elements thanks to context-based state (no prop changes). |
| Removing HTML5 drag breaks any hidden accessibility expectation | Compensate with keyboard reorder shortcuts (Cmd+Shift+arrows) and explicit focus-ring styles. Palette buttons remain focusable + Enter adds — no regression for kb-only users. |
| Cmd+K clashes with the existing docs-site-wide Cmd+K (CommandPalette for docs search) | The composer's own CommandPalette has higher specificity when the composer route is active. The docs Cmd+K is registered at the root; we opt out on `/composer` via a `data-route-composer` body attribute that the root CommandPalette checks before opening. |
| Clipboard permission denied in Safari iframe | Fall back to in-memory clipboard + `toast.error("Clipboard access denied — paste inside this session will still work")`. |
| Breaking change for consumers of `drop-logic.ts` | Keep a one-release re-export shim that re-exports from the new module. |

---

## 19. Success criteria

The spec is done when:

1. Every item in §2 (scope, 19 entries) is implemented and manually-demonstrably working on both mobile and desktop Chrome + Firefox + Safari.
2. No regressions: full test suite ≥ 100 passing; `pnpm --filter @weiui/docs build` clean; zero Tailwind utility leakage in the changed files.
3. Drag works in every browser we test — no "Cannot read properties of null" error class in the console.
4. Multi-select + Delete removes N nodes in one history frame (undo restores them all at once).
5. Cmd+K opens in ≤ 50ms from keypress; fuzzy search of all 65 components + 5 templates + 10+ actions is sub-frame.
6. Right-click menu appears at the cursor, positioned to stay on screen, in every corner case.
7. Splitter handles can be dragged; collapsed-panel double-click restores previous size.
8. Outline tree and canvas stay perfectly in sync — click one, the other updates.
9. Preview mode toggles visually (Cmd+P) and all editor chrome disappears.
10. Mobile (375px): palette and props each slide in as a Drawer; canvas is the whole screen.
11. Breadcrumb handles 10-deep trees without layout break (ellipsis collapses the middle).

---

## 20. Non-goals recap

Absolute positioning · per-breakpoint overrides · collaborative editing · AI generation · Figma import · component state variants · versioning beyond undo/redo · slash-command insertion.

---

## 21. Implementation plan

The plan lives at `docs/superpowers/plans/2026-04-19-composer-best-in-class.md` (to be written next). Proposed task decomposition:

1. **Interaction manager + context** — new state store + `useInteractionManager` hook + `InteractionProvider`. Migrate existing `selectedId`, `tree` state into it.
2. **Pointer-drag primitive** — `usePointerDrag`, `DragGhost` component, `compute-drop-indicators.ts`. Remove HTML5 drag from palette + canvas.
3. **Between-drop indicator** — extend `computeDropIndicator` + render a 2px line in the overlay.
4. **Keyboard + multi-select** — `keyboard-nav.ts`, `useComposerKeyboard`, Shift/Cmd-click, keyboard reorder shortcuts.
5. **Copy/paste** — `clipboard.ts` + wire Cmd+C/V.
6. **Command palette integration** — `commands.ts` + mount `<CommandPalette>` + wire Cmd+K.
7. **Context menu** — `<Menu>` at pointer position + wire `onContextMenu`.
8. **Breadcrumb + Popover chips** — swap in lib components.
9. **Splitter shell** — `ResizableShell.tsx` + localStorage persist.
10. **OutlineTree + TreeView** — rewrite outline on the lib's `TreeView`; drag-reorder via pointer primitive.
11. **Stage polish** — zoom, rulers, preview mode, theme toggle, click-bg-root.
12. **Responsive Drawers** — mobile palette/props as Drawers; AppBar triggers.
13. **Tests + e2e** — full suite per §17.
14. **Final verification + push** — sweep the audit; push to origin; deploy to ui.wei-dev.com; manually verify on every browser in the matrix.

Each task is TDD: test first, implement, all suites green, atomic commit.
