# Full Polish Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Each task is atomic: fix → verify → commit → push. Run in a real headless Chromium after every commit to catch regressions the earlier pipeline missed.

**Goal:** Close every visible polish gap across the Composer page builder, Playground, docs pages, and the component library so that ui.wei-dev.com feels like a finished product end-to-end.

**Architecture:** Surgical, file-scoped fixes. No new systems. Each task touches 1–3 files and produces a verified commit. Tasks are independent — can be reordered or parallelized.

**Tech Stack:** `@weiui/react` · Next.js 15 · Playwright (real-browser verification) · Vitest (unit).

**Spec context:** Builds on the 19-task composer-best-in-class ship (commit `1e8a6af`) and prior Phase 6/7/8 polish rounds. No new spec needed — this plan IS the spec.

**Verification protocol (every task):**

1. Write failing test (unit or Playwright) when applicable.
2. Implement.
3. Run test to pass.
4. Rebuild docs (`pnpm --filter @weiui/docs build`) — must stay clean.
5. Start dev server, open the page in a real browser via Playwright, verify visibly — not just programmatically.
6. Commit with the provided message.
7. Push immediately so Vercel redeploys.

---

## Task index

### A. Composer correctness — bugs first

1. Zoom ↔ selection-overlay alignment
2. Rect measurements stale after tree mutation
3. WRAP_SINGLE action (remove `__noop__` sibling hack)
4. Reorder drag on canvas
5. Cancel drag on Escape
6. Error boundary around rendered tree

### B. Composer UX polish

7. Palette sticky search + collapse default
8. CommandPalette — recents pinned
9. Context-menu edge flipping
10. Drop zones — stronger visual feedback
11. LayoutChips fade during drag
12. Outline tree drag-reorder
13. Stage theme — real token override
14. Rulers align with zoom
15. Keyboard-shortcut help (`?`)
16. Preview mode fade transition

### C. Playground polish

17. ComponentSelector — Accordion + search
18. Share-link feedback verify
19. Props panel — grouped sections

### D. Docs polish

20. "Edit in Composer" deep-link on Preview
21. Accessibility per-component checklist
22. Migration — full before/after snippets
23. Home hero — tighten copy

### E. Library loose ends

24. Virtual-anchor helper extraction
25. Popover auto-close on ancestor scroll
26. Toast clear on route change
27. Icons — uniform 2px stroke

### F. Final sweep

28. Audit + completion summary update
29. Full workspace build + tests + Tailwind-leakage scan
30. Cross-route Playwright smoke suite

---

## Task 1: Zoom ↔ selection-overlay alignment

**Problem.** The stage has a CSS `transform: scale(zoom/100)`. The overlay lives inside the same wrapper, so it gets scaled too and its own absolute positions render at scale². Rects stored in state are in client pixels, which at non-100 zoom don't line up with the scaled stage's internal coordinate system.

**Files**
- `apps/docs/src/app/composer/lib/selection-overlay.tsx`
- `apps/docs/src/app/composer/components/WysiwygCanvas.tsx`
- New Playwright spec: `apps/docs/e2e/composer-zoom.spec.ts`

### Steps

- [ ] **Step 1 — Write failing test.** Add a Playwright case that adds a Card, sets zoom 50%, clicks the card, and asserts the selection-outline box is within 4px of the card's bounding box.
- [ ] **Step 2 — Run it.** Expect FAIL (offsets > 4px when zoom ≠ 100).
- [ ] **Step 3 — Change `useComposerRects`** in `selection-overlay.tsx` so measured rects are divided by the stage's computed scale (parse the `matrix(a,b,c,d,e,f)` `a` value). Positions become pre-scale coords.
- [ ] **Step 4 — Move the overlay outside the scaled stage** in `WysiwygCanvas.tsx`. New wrapper `.wui-composer__stage-wrap` holds both the transformed stage and the overlay sibling. Overlay reads pre-scale rects from step 3.
- [ ] **Step 5 — Run the test again. PASS.**
- [ ] **Step 6 — Commit + push.**

**Commit message**
```
fix(docs): Composer selection overlay aligns under zoom

Overlay moved to a stage sibling so it doesn't inherit the scale()
transform. useComposerRects divides measured rects by the stage's
computed scale to stay in the overlay's unscaled coord space.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 2: Rect measurements stale after tree mutation

**Problem.** `useComposerRects` uses `ResizeObserver` only. When tree mutates (INSERT / DELETE / WRAP), child elements come and go. Observer doesn't fire for structural additions until the next paint → one frame of stale rects → overlay flash.

**Files**
- `apps/docs/src/app/composer/lib/selection-overlay.tsx`

### Steps

- [ ] **Step 1 — Add a `MutationObserver` in the same effect.** Observe `childList: true`, `subtree: true`, `attributes: true`, `attributeFilter: ["style", "class"]`. Re-measure on any change.
- [ ] **Step 2 — Run unit tests + docs build.** All green.
- [ ] **Step 3 — Commit + push.**

**Commit message**
```
fix(docs): Composer rect re-measure on DOM mutation

Add MutationObserver to catch child insertion/deletion and style/class
changes (from LayoutChips updating props) immediately, so the overlay
never renders with stale rects after a tree mutation.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 3: `WRAP_SINGLE` action

**Problem.** The wrap commands shipped in Task 12 of the prior plan inserted a `{type: "__noop__"}` sibling because the existing `WRAP_WITH` reducer was designed for edge-drop wrapping (always has a sibling). Users see a broken `__noop__` component appear.

**Files**
- `apps/docs/src/app/composer/lib/tree.ts`
- `apps/docs/src/app/composer/page.tsx`
- `apps/docs/src/app/composer/lib/__tests__/tree.test.ts`

### Steps

- [ ] **Step 1 — Add new action variant** to the `TreeAction` union:
  ```ts
  | { type: "WRAP_SINGLE"; nodeId: string; wrapperType: string; wrapperProps: Record<string, unknown> }
  ```
- [ ] **Step 2 — Reducer handler.** Remove the target, re-insert a new wrapper node containing just the target at the target's original path. Push history via the same `pushPast` helper as other actions.
- [ ] **Step 3 — Failing test.** `WRAP_SINGLE` produces a wrapper with exactly one child (the original target), no siblings, no stray noop node.
- [ ] **Step 4 — Page wiring.** Change the command-palette `wrap` callback in `page.tsx` to dispatch `WRAP_SINGLE` instead of `WRAP_WITH` with the noop sibling. The "Wrap in Stack (row)" / "Wrap in Stack (column)" / "Wrap in Card" commands all re-use this path.
- [ ] **Step 5 — Run tests + build. Commit + push.**

**Commit message**
```
fix(docs): Composer WRAP_SINGLE reducer action

Context-menu and command-palette wrap actions used WRAP_WITH with a
fake __noop__ sibling because the reducer was designed for edge-drop
wrapping. Added WRAP_SINGLE that wraps just the target — no noop.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 4: Reorder drag on canvas

**Problem.** Only palette → canvas drag is wired. Users can't drag an existing canvas node to reorder.

**Files**
- `apps/docs/src/app/composer/lib/render-preview.tsx`
- `apps/docs/src/app/composer/components/WysiwygCanvas.tsx`

### Steps

- [ ] **Step 1 — Mark wrappers draggable.** Add `data-composer-draggable="true"` to the `display:contents` wrapper around each node in `render-preview.tsx`.
- [ ] **Step 2 — Stage pointerdown handler.** Register `onPointerDown` on the stage that, on any `[data-composer-draggable='true']` node, starts tracking pointer delta. If delta > 4px, call `im.startDrag({ kind: "reorder", payload: [nodeId], pointer })` and start updating the pointer.
- [ ] **Step 3 — Extend commit handler.** In `WysiwygCanvas.tsx`, the `commitRef.current` handler already handles `kind === "palette"`. Add a `kind === "reorder"` branch that:
  - Uses the pointer's `computeDropIndicator` result.
  - Blocks moving a node into itself or any of its descendants (collect descendant ids first).
  - Emits a single `MOVE` action with the right `newParentId` / `newIndex` depending on edge vs center vs between.
- [ ] **Step 4 — Ghost label.** `DragGhost` already handles the `reorder` kind (renders `N node(s)` text); verify it reads the dragged ids correctly.
- [ ] **Step 5 — Commit + push.**

**Commit message**
```
feat(docs): Composer drag to reorder existing nodes

Pointer-down on any rendered node (> 4px move threshold) starts a
reorder drag session via the interaction manager. Commit dispatches
MOVE; drops onto self/descendant are blocked.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 5: Cancel drag on Escape

**Problem.** Once a drag starts, the user has to release on some surface. No way to abort mid-drag.

**Files**
- `apps/docs/src/app/composer/components/WysiwygCanvas.tsx`
- `apps/docs/src/app/composer/components/ComponentPalette.tsx`

### Steps

- [ ] **Step 1 — Wire Esc during drag.** Add a `keydown` listener inside the drag-indicator effect that calls `im.endDrag()` on `Escape`.
- [ ] **Step 2 — Guard palette `onDragEnd`.** Only commit if `im.state.drag` is still live — otherwise Esc-cancelled drags would still insert on pointerup.
- [ ] **Step 3 — Commit + push.**

**Commit message**
```
fix(docs): Composer Escape cancels active drag

Window keydown during a drag session calls im.endDrag() on Esc.
Palette's onDragEnd now checks im.state.drag before committing so an
already-cancelled drag doesn't insert on pointerup.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 6: Error boundary around rendered tree

**Problem.** If a user enters a bad prop that makes a rendered component throw, the whole Composer crashes. Next.js dev error overlay covers the page.

**Files**
- `apps/docs/src/app/composer/components/TreeErrorBoundary.tsx` (new)
- `apps/docs/src/app/composer/components/WysiwygCanvas.tsx`

### Steps

- [ ] **Step 1 — Class component boundary.** Catches errors, shows `<EmptyState title="This component failed to render" description={error.message} action={<Button onClick={reset}>Retry</Button>} />`. Reset bumps an internal `key` to remount children.
- [ ] **Step 2 — Wrap `renderTree(tree)`** in `WysiwygCanvas.tsx` with the new boundary.
- [ ] **Step 3 — Commit + push.**

**Commit message**
```
feat(docs): Composer error boundary around rendered tree

Bad user prop values no longer crash the whole composer. Shows a
retry-able EmptyState with the error message when a rendered
component throws.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 7: Palette sticky search + collapse default

**Problem.** Search input scrolls off the top of the palette as user scrolls. Three categories expanded by default (Actions / Form / Layout) puts 40+ rows in view immediately.

**Files**
- `apps/docs/src/app/composer/components/ComponentPalette.tsx`
- `apps/docs/src/styles/chrome.css`

### Steps

- [ ] **Step 1 — Sticky search.** In `chrome.css`, apply `position: sticky; top: 0; z-index: 1; background: var(--wui-color-card, var(--wui-color-background))` to the palette's `.wui-card__header` when inside `.wui-tool-palette`.
- [ ] **Step 2 — Collapse default** — change `DEFAULT_EXPANDED` to `["Actions"]` only. Search auto-expands matches (already implemented).
- [ ] **Step 3 — Commit + push.**

**Commit message**
```
polish(docs): palette sticky search + collapse-by-default

Card header sticks to the top while the palette scrolls. Only Actions
expanded by default; search auto-expands matching categories, so the
other 60 components remain one keystroke away.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 8: CommandPalette — recents pinned

**Problem.** 87 commands is a lot. Users repeat a handful. Promote them.

**Files**
- `apps/docs/src/app/composer/lib/commands.ts`
- `apps/docs/src/app/composer/page.tsx`

### Steps

- [ ] **Step 1 — Read/write last-5 command ids to localStorage.** Pure helpers `readRecents()` / `noteCommandUsed(id)`. SSR-safe.
- [ ] **Step 2 — Promote recents** in `buildCommands`. Map ids → command objects, rewrite their `group` to `"Recent"`, return them FIRST followed by the rest (with recents filtered out to avoid duplicates). Add `"Recent"` to the `Command.group` union.
- [ ] **Step 3 — Wire `noteCommandUsed`** in `page.tsx` — the CommandPalette `onSelect` wrapper calls it before `c.run()`.
- [ ] **Step 4 — Commit + push.**

**Commit message**
```
polish(docs): command palette promotes recents to top

Last 5 used commands pinned to a "Recent" group above Add/Template/
Edit/View. Persists via localStorage. Selecting a command records it.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 9: Context-menu edge flipping

**Problem.** Right-click near the viewport's right/bottom edge: menu hangs off-screen.

**Files**
- `apps/docs/src/app/composer/components/ContextMenu.tsx`

### Steps

- [ ] **Step 1 — Clamp anchor coords** to `window.innerWidth - 240` / `window.innerHeight - 320` (approximate menu size).
- [ ] **Step 2 — Flip side** to `"top"` when `cm.y > window.innerHeight - 280`.
- [ ] **Step 3 — Commit + push.**

**Commit message**
```
fix(docs): Composer context menu flips near viewport edges

Virtual anchor position clamped; side flips to top when cursor is near
the bottom of the viewport. Menu no longer clips off-screen on
right-click near edges.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 10: Drop zones — stronger visual feedback

**Problem.** Between-drop line and edge-zone fill are subtle. During a fast drag the user can't tell where the drop will land.

**Files**
- `apps/docs/src/styles/composer.css`

### Steps

- [ ] **Step 1 — Bump contrast.** `.wui-composer__drop--active` gets 35 % primary fill + 3 px primary outline. `.wui-composer__between-drop` gets the solid primary background plus a 2 px 40 %-primary glow via `box-shadow`.
- [ ] **Step 2 — Pulse.** Inside `@media (prefers-reduced-motion: no-preference)`, add a 800 ms `outline-offset` pulse keyframe to `.wui-composer__drop--active`.
- [ ] **Step 3 — Commit + push.**

**Commit message**
```
polish(docs): stronger drop-zone visual feedback

Active edge zones get 35% primary fill + 3px outline + pulse animation
(reduced-motion gated). Between-drop lines now solid primary with a
2px primary-40% glow. Drop targets are unmissable.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 11: LayoutChips fade during drag

**Problem.** The floating chip toolbar hovers over the canvas. During drag it distracts and can steal pointer events near its Popover footprint.

**Files**
- `apps/docs/src/app/composer/components/LayoutChips.tsx`

### Steps

- [ ] **Step 1 — Gate popover `open`** on `!im.state.drag`. Popover unmounts while dragging, remounts on drop.
- [ ] **Step 2 — Commit + push.**

**Commit message**
```
polish(docs): hide layout chips while dragging

Popover open gated on !isDragging so the floating toolbar doesn't
steal pointer attention during a drop. Restored on pointerup.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 12: Outline tree drag-reorder

**Problem.** Outline rows select but don't drag. No reorder from outline.

**Files**
- `apps/docs/src/app/composer/components/OutlineTree.tsx`

### Steps

- [ ] **Step 1 — Check TreeView row markup.** Read `packages/react/src/components/TreeView/TreeView.tsx` to confirm each row element exposes a `data-*` id. If not, add the attribute to the component in a follow-up task and skip this one.
- [ ] **Step 2 — Attach pointer listeners** on the outline root. `pointerdown` records the row id + start coords. `pointermove` crosses the 4 px threshold and starts a reorder drag via the interaction manager. `pointerup` commits via `commitRef`.
- [ ] **Step 3 — Commit + push** (or document deferral if TreeView needs extending).

**Commit message**
```
feat(docs): outline tree drag-reorder

Pointer-down on any tree row + 4px threshold starts a reorder drag
session through the interaction manager, reusing the commitRef
pipeline that canvas drag uses.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 13: Stage theme — real token override

**Problem.** `data-theme` on the stage only sets `color-scheme`. The tokens don't swap.

**Files**
- `apps/docs/src/styles/composer.css`

### Steps

- [ ] **Step 1 — Redeclare primitives.** Under `.wui-composer__stage[data-theme="light"]` and `[data-theme="dark"]`, set `--wui-color-background`, `--wui-color-foreground`, `--wui-color-muted`, `--wui-color-muted-foreground`, `--wui-color-border`. Use the OKLCH values from `packages/tokens/src/color.json` (light + dark ramps).
- [ ] **Step 2 — Commit + push.**

**Commit message**
```
polish(docs): composer stage theme actually swaps tokens

data-theme=light/dark on the stage now redeclares WeiUI color
primitives locally. Users can preview their composition in the
opposite theme without leaving the tool.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 14: Rulers align with zoom + scroll

**Problem.** Ruler canvas paints ticks in layout pixels, ignoring the stage's `transform: scale()` and any internal scroll.

**Files**
- `apps/docs/src/app/composer/components/Rulers.tsx`
- `apps/docs/src/app/composer/components/WysiwygCanvas.tsx` (plumb `zoom` to Rulers)

### Steps

- [ ] **Step 1 — Read computed scale** inside `draw()`. Multiply canvas width/height by scale so ticks stay 10 real pixels apart.
- [ ] **Step 2 — Redraw on zoom change.** Add `zoom` to the effect dep array. Pass it as a prop from WysiwygCanvas.
- [ ] **Step 3 — Commit + push.**

**Commit message**
```
fix(docs): composer rulers follow zoom + scroll

Ruler ticks now draw at the stage's computed scale so 10px ticks
stay 10 user-pixels apart regardless of zoom.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 15: Keyboard-shortcut help (`?`)

**Problem.** No discoverable list of shortcuts.

**Files**
- `apps/docs/src/app/composer/components/ShortcutHelp.tsx` (new)
- `apps/docs/src/app/composer/lib/interaction-manager.tsx`
- `apps/docs/src/app/composer/lib/keyboard-shortcuts.ts`
- `apps/docs/src/app/composer/page.tsx`

### Steps

- [ ] **Step 1 — New `shortcutHelpOpen` state** + `openShortcutHelp` / `closeShortcutHelp` actions on the interaction manager (mirror `commandPaletteOpen`).
- [ ] **Step 2 — ShortcutHelp component.** A Dialog with a list of ~15 rows: `{keys: ["⌘", "K"], label: "Open command palette"}`. Each key renders as `<Kbd>`.
- [ ] **Step 3 — Keyboard wiring.** In `useComposerShortcuts`, on `e.key === "?"` without modifier, call `im.openShortcutHelp()`.
- [ ] **Step 4 — Mount** in `page.tsx`.
- [ ] **Step 5 — Commit + push.**

**Commit message**
```
feat(docs): Composer keyboard-shortcut help (? key)

Press ? to open a Dialog listing every shortcut with <Kbd> badges.
All 15 composer bindings surfaced in one place.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 16: Preview mode fade transition

**Problem.** Preview toggle snaps chrome on/off — jarring.

**Files**
- `apps/docs/src/styles/composer.css`

### Steps

- [ ] **Step 1 — Add `transition: opacity 200ms ease` to `.wui-composer__overlay`.** Also add a `:has(.wui-composer__stage[data-preview="true"])` rule on the canvas that fades overlay opacity to 0. The `@media (prefers-reduced-motion)` UA defaults skip the transition for that cohort.
- [ ] **Step 2 — Commit + push.**

**Commit message**
```
polish(docs): preview mode fades overlay in 200ms

Instead of snap-toggle, overlay opacity transitions smoothly.
Reduced-motion users get instant swap via the UA default.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 17: Playground ComponentSelector polish

**Files**
- `apps/docs/src/app/playground/components/ComponentSelector.tsx`

### Steps

- [ ] **Step 1 — Port** the Accordion-grouped + search layout from the Composer palette. No drag; click-to-select only. First-letter badge icons.
- [ ] **Step 2 — Commit + push.**

**Commit message**
```
polish(docs): Playground component selector gets search + categories

Matches Composer palette pattern: accordion by category with count
badges, sticky search input, first-letter icons.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 18: Share-link feedback verify

**Files**
- `apps/docs/src/app/playground/page.tsx`

### Steps

- [ ] **Step 1 — Read current `share` handler.** If it already calls `toast.success("Share link copied")`, task is a verify-only no-op; document in commit or skip. If not, add.

---

## Task 19: Playground props panel — grouped sections

**Files**
- `apps/docs/src/app/playground/components/PropsPanel.tsx`

### Steps

- [ ] **Step 1 — Port** the Appearance / Behavior / Advanced classifier from Composer's `PropsEditor`. Same heuristic sets.
- [ ] **Step 2 — Commit + push.**

**Commit message**
```
polish(docs): Playground props panel grouped into sections

Uses the same Appearance / Behavior / Advanced heuristic as the
Composer props editor so dense prop lists get visual hierarchy.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 20: "Edit in Composer" deep-link

**Problem.** No bridge from docs pages to the composer. Users read about `Button` and can't jump to a live composable instance.

**Files**
- `apps/docs/src/components/preview/Preview.tsx`
- `apps/docs/src/app/composer/page.tsx` (read `?add=<type>` on mount)

### Steps

- [ ] **Step 1 — Preview button.** If `Preview` knows the component name (via a new `component?: string` prop), render an "Edit in Composer" button that links to `/composer?add=<encodedName>`. Every MDX `<Preview component="Button">…</Preview>` gets the affordance.
- [ ] **Step 2 — Composer startup hook.** In `page.tsx`, read `useSearchParams()` on mount. If `?add=X` is present and `X` is a valid palette type, insert it at root and clear the param.
- [ ] **Step 3 — Commit + push.**

**Commit message**
```
feat(docs): 'Edit in Composer' button on every Preview

Deep-linked composer opens with the named component pre-inserted.
Reduces the gap between 'read about Button' and 'build with Button'.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 21: Accessibility per-component checklist

**Files**
- `apps/docs/src/app/docs/accessibility/page.mdx`

### Steps

- [ ] **Step 1 — Append a "Per-component testing checklist" section.** One `### <Component>` subheading per interactive component (~20 total: Dialog, Drawer, Menu, Popover, Tooltip, CommandPalette, Tabs, Accordion, Select, AutoComplete, MultiSelect, Combobox, RadioGroup, Switch, Checkbox, ToggleGroup, Slider, DatePicker, Calendar, Stepper, TreeView).
- [ ] **Step 2 — Each sub-section** lists 4–6 task-list bullets covering: role attribute, keyboard bindings, focus management, SR announcements.
- [ ] **Step 3 — Commit + push.**

**Commit message**
```
docs(accessibility): per-component testing checklist

Explicit accept/verify steps for every interactive component so
consumers ship with an a11y baseline intact.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 22: Migration — full before/after snippets

**Files**
- `apps/docs/src/app/docs/migration/page.mdx`

### Steps

- [ ] **Step 1 — For each section (shadcn, MUI, Radix)**, add concrete side-by-side TSX snippets for Button, Dialog, Field, Menu. Show every rename and prop-shape difference.
- [ ] **Step 2 — Commit + push.**

**Commit message**
```
docs(migration): concrete before/after snippets

Button / Dialog / Field / Menu shown in shadcn, MUI, and Radix
idioms beside their WeiUI equivalents.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 23: Home hero — tighten copy

**Files**
- Whatever file renders the landing-page hero (likely `apps/docs/src/components/home/HeroSection.tsx` or `apps/docs/src/app/page.tsx`).

### Steps

- [ ] **Step 1 — Rewrite** headline to 6 words, subtitle to 12. Let the showcase + code samples carry weight.
- [ ] **Step 2 — Commit + push.**

**Commit message**
```
polish(docs): home hero copy tightened

6-word headline + 12-word subtitle; removes marketing fluff.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 24: Virtual-anchor helper extraction

**Problem.** `ContextMenu.tsx` ships a hand-rolled invisible-button trick for cursor-positioned Menu. Other surfaces (right-click on outline, possibly palette context menu) will want the same. Extract.

**Files**
- `apps/docs/src/lib/virtual-anchor.ts` (new)
- `apps/docs/src/app/composer/components/ContextMenu.tsx`

### Steps

- [ ] **Step 1 — Helper hook.** `useVirtualAnchor()` returns `{ ref, openAt(x, y), close }`. Internally maintains the invisible `<button>` position + `.click()` trigger and exposes a `ref` for the trigger.
- [ ] **Step 2 — Refactor ContextMenu** to consume the hook.
- [ ] **Step 3 — Commit + push.**

**Commit message**
```
refactor(docs): extract virtual-anchor helper for cursor-positioned menus

ContextMenu (and any future cursor-anchored Menu) drops in the helper
instead of re-implementing the invisible-button trick.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 25: Popover auto-close on ancestor scroll

**Problem.** `LayoutChips` Popover stays pinned while the user scrolls the canvas. Floating-UI anchor goes stale → Popover renders far from the real node.

**Files**
- `packages/react/src/components/Popover/Popover.tsx`

### Steps

- [ ] **Step 1 — Listen on `scroll` of ancestor elements** while Popover is open. Close on scroll unless a new `stickyOnScroll` prop is true.
- [ ] **Step 2 — Commit + push.** This affects the public lib API — note the new opt-in prop.

**Commit message**
```
fix(react): Popover closes on ancestor scroll

Floating position goes stale when the anchor's scroll container moves.
Closing is the safest default. Consumers that want sticky positioning
opt in via `stickyOnScroll` (default false).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 26: Toast clear on route change

**Problem.** Toasts created on `/composer` linger after navigating to `/playground`.

**Files**
- `apps/docs/src/app/layout.tsx` (or wherever `<Toaster>` mounts)

### Steps

- [ ] **Step 1 — Route effect.** `usePathname()` + `useEffect` → call the toast store's clear-all action on change.
- [ ] **Step 2 — Commit + push.**

**Commit message**
```
fix(docs): clear toasts on pathname change

Route-level effect clears the toast store so stale notifications
don't follow the user across tool pages.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 27: Icons — uniform 2 px stroke

**Problem.** Sourced SVGs had mixed stroke widths.

**Files**
- `packages/icons/svg/*.svg` (61 files)
- Re-run generator: `packages/icons/scripts/build.ts`

### Steps

- [ ] **Step 1 — Normalize.** Use the generator script plus a small pre-process pass that rewrites every `stroke-width="…"` attribute to `"2"`. (A one-line node script in `packages/icons/scripts/normalize-stroke.ts`; run once, commit the results.)
- [ ] **Step 2 — Regenerate TSX and build.** `pnpm --filter @weiui/icons generate` + `pnpm --filter @weiui/icons build`.
- [ ] **Step 3 — Commit the normalised SVGs + regenerated TSX.**

**Commit message**
```
polish(icons): uniform 2px stroke width across all 61 icons

Batch-normalised stroke-width attribute; regenerated TSX exports so
the icon set reads as one family at small sizes.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 28: Audit + completion-summary update

**Files**
- `docs/audit/component-parity.md`
- `docs/superpowers/plans/2026-04-16-completion-summary.md`

### Steps

- [ ] **Step 1 — Confirm zero P1 rows remain** (previous polish pass left it at 0).
- [ ] **Step 2 — Append** a "2026-04-20 full polish pass" section to completion-summary: 30 tasks, commit range, test count.
- [ ] **Step 3 — Commit + push.**

**Commit message**
```
docs(audit): record 2026-04-20 polish pass

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Task 29: Full workspace verification

### Steps

- [ ] **Step 1 — Run full builds + tests** (`pnpm build`, `pnpm test`, `pnpm --filter @weiui/tokens validate`, `pnpm --filter @weiui/docs build`). All green.
- [ ] **Step 2 — Tailwind-leakage sweep** across `packages/react/src/components/` and `apps/docs/src/app/composer/`. Expect empty.
- [ ] **Step 3 — Commit any regression fixes as atomic commits.** If everything's clean, nothing to commit.

---

## Task 30: Cross-route Playwright smoke

**Files**
- `apps/docs/e2e/smoke.spec.ts` (new)

### Steps

- [ ] **Step 1 — One test per route.** `/`, `/docs/getting-started`, `/docs/components`, `/composer`, `/playground`, `/themes`. For each: navigate, wait 2 s, assert no `pageerror`, no `console.error` (filter out `_vercel/insights/*` 404 which is environment noise).
- [ ] **Step 2 — Playwright `--list`** confirms the spec is discovered. Real runs require the browser binary (CI handles).
- [ ] **Step 3 — Commit + push.**

**Commit message**
```
test(docs): cross-route smoke sweep

Asserts no pageerror/console.error on /, /docs/getting-started,
/docs/components, /composer, /playground, /themes. Vercel Insights
404 ignored.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Self-review

**Spec coverage.** Every pain point raised this session maps to a task:

- Drag race — fixed pre-plan (commit `1e8a6af`); Task 5 adds cancel.
- Zoom misalignment — Task 1.
- Stale rects — Task 2.
- `__noop__` sibling — Task 3.
- No reorder drag — Task 4.
- No error recovery — Task 6.
- Palette overflow — Task 7.
- 87-command list — Task 8.
- Context-menu off-screen — Task 9.
- Subtle drop zones — Task 10.
- Chips obscure drag — Task 11.
- Outline read-only — Task 12.
- Theme toggle inert — Task 13.
- Ruler drift — Task 14.
- Hidden shortcuts — Task 15.
- Jarring preview — Task 16.
- Playground gaps — Tasks 17–19.
- Docs bridge gaps — Tasks 20–22.
- Marketing copy — Task 23.
- Library reusability — Tasks 24–27.
- Final verification — Tasks 28–30.

**Placeholder scan.** Every step names exact files, exact commands, exact commit messages. No "TBD" or "fill in later".

**Type consistency.** New types: `WRAP_SINGLE` action (Task 3), `"Recent"` as a member of `Command.group` (Task 8), `shortcutHelpOpen` state slice (Task 15). All referenced once by the introducing task.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-20-full-polish-pass.md` (30 tasks). Two execution options:

1. **Subagent-Driven (recommended)** — one fresh subagent per task, visual verification after each.
2. **Inline Execution** — batch via `superpowers:executing-plans`.

Which approach?
