# Verification Run — 2026-04-17

**Pre-audit commit:** `b5babd6` (docs: add component verification plan)
**Post-audit commit:** `836e130` (fix(css): add missing element classes emitted by components)
**Pass/fail:** **66/66 components PASS** (after fix)

Executed end-to-end against the plan in `docs/superpowers/plans/2026-04-17-component-verification-plan.md`.

---

## Automated check results

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 2.1 | Smoke test (build + test + tokens validate) | PASS | 612 tests pass in 67 files; build succeeds across 8 packages; 6 contrast pairs pass (1 AAA, 5 AA) |
| 2.2 | Tailwind class leakage in React components | PASS | 0 real matches (2 matches were test-description strings in `Text.test.tsx`) |
| 2.3 | CSS class existence | **FAIL → FIXED** | 10 wui-* classes emitted by components were missing CSS rules. Fixed in `836e130`. |
| 2.4 | CSS import completeness | PASS | All 54 element CSS files imported in `packages/css/src/index.css` |
| 2.5 | Demo file coverage | PASS | "Chart" flagged but false positive — covered by `ChartBarDemo`, `ChartLineDemo`, `ChartAreaPieRadarDemo` |
| 2.6 | Orphan demos | PASS | `DataTableDemoInner`/`EditorDemoInner` flagged but false positive — loaded via `next/dynamic` in wrapper demos |
| 2.7 | Demo interactivity | PASS | Stateless demos either use uncontrolled APIs (defaultValue/defaultExpanded) or headless-managed state (Popover/Tooltip/Drawer open state) |
| 2.8 | Built HTML inspection | PASS | 0 Tailwind utility leaks in generated HTML; expected wui-* marker classes present on button/input/overlays pages |
| 2.9 | Contrast validation | PASS | Same as 2.1 (tokens validate passes) |
| Subpath compliance | Heavy components not leaking to main barrel | PASS | Only a code comment mentions subpaths; no actual exports of Editor/DataTable/Chart from `packages/react/src/index.ts` |

---

## Gaps identified (fixed this run)

### P0 — CSS class gaps

The following classes were emitted by React components but had no corresponding CSS rules. Components still rendered (base element styles applied) but variants were dead code.

| Component | Class | Where emitted |
|-----------|-------|---------------|
| Button | `wui-button-icon` | Icon slots (`Button.tsx:46,50,52`) |
| Button | `wui-button-label` | Label slot (`Button.tsx:51`) |
| Checkbox | `wui-checkbox--sm`, `wui-checkbox--lg` | Size variant (`Checkbox.tsx:48`) |
| Switch | `wui-switch--sm`, `wui-switch--lg` | Size variant (`Switch.tsx:19`) |
| Input | `wui-input--disabled` | Disabled flag (`Input.tsx:34`) |
| Input | `wui-input--with-addons` | Addons context (`Input.tsx:35`) |
| Skeleton | `wui-skeleton--text` | Text variant (`Skeleton.tsx:15`) |

**Fix applied** in commit `836e130`:

- `packages/css/src/elements/button.css` — added `.wui-button-icon` and `.wui-button-label` slot layout rules
- `packages/css/src/elements/checkbox.css` — added `--sm` and `--lg` size selectors scaling the box, checkmark, and label
- `packages/css/src/elements/switch.css` — added `--sm` and `--lg` size selectors scaling the track, thumb, and label
- `packages/css/src/elements/input.css` — added `--disabled` and `--with-addons` utility selectors
- `packages/css/src/elements/skeleton.css` — added `--text` variant selector

### P1, P2 — None found

No Section 2.2, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9 failures. All docs pages, demos, and builds are healthy.

---

## Component matrix (66 components)

Legend: `src` = `<Name>.tsx` exists; `idx` = `index.ts` exists; `tests` = count of `it(...)` cases; `demo` = `<Name>Demo.tsx` or family demo exists; `docs` = covered by a page; `status` = PASS after Phase 3 fix.

| # | Component | src | idx | tests | demo | docs page | status |
|---|-----------|-----|-----|-------|------|-----------|--------|
| 1 | Accordion | Y | Y | 17 | Y | accordion | PASS |
| 2 | Alert | Y | Y | 6 | Y | feedback | PASS |
| 3 | AppBar | Y | Y | 5 | Y | wave2-3 | PASS |
| 4 | AspectRatio | Y | Y | 6 | Y | layout | PASS |
| 5 | AutoComplete | Y | Y | 13 | Y | advanced-inputs | PASS |
| 6 | Avatar | Y | Y | 14 | Y | data-display | PASS |
| 7 | Badge | Y | Y | 8 | Y | data-display | PASS |
| 8 | BottomNav | Y | Y | 4 | Y | wave2-3 | PASS |
| 9 | Breadcrumb | Y | Y | 6 | Y | navigation | PASS |
| 10 | Button | Y | Y | 13 | Y (5 family demos) | button + form | FIXED |
| 11 | ButtonGroup | Y | Y | 6 | Y | wave2-3 | PASS |
| 12 | Calendar | Y | Y | 21 | Y | date-time | PASS |
| 13 | Card | Y | Y | 12 | Y | data-display | PASS |
| 14 | Chart | Y | Y | 5 | Y (3 family demos) | data | PASS |
| 15 | Checkbox | Y | Y | 11 | Y | form | FIXED |
| 16 | Chip | Y | Y | 11 | Y | toast-chip-progress | PASS |
| 17 | Code | Y | Y | 7 | Y | code | PASS |
| 18 | ColorPicker | Y | Y | 6 | Y | color-picker | PASS |
| 19 | CommandPalette | Y | Y | 12 | Y | command-palette | PASS |
| 20 | Container | Y | Y | 5 | Y | layout | PASS |
| 21 | DataTable | Y | Y | 17 | Y (via dynamic) | data | PASS |
| 22 | DatePicker | Y | Y | 11 | Y | date-time | PASS |
| 23 | Dialog | Y | Y | 9 | Y | overlays | PASS |
| 24 | Divider | Y | Y | 6 | Y | layout | PASS |
| 25 | Drawer | Y | Y | 4 | Y | sidebar-drawer | PASS |
| 26 | Editor | Y | Y | 7 | Y (via dynamic) | editor | PASS |
| 27 | EmptyState | Y | Y | 6 | Y | feedback | PASS |
| 28 | Field | Y | Y | 15 | Y | form | PASS |
| 29 | FileUpload | Y | Y | 7 | Y | advanced-inputs | PASS |
| 30 | Grid | Y | Y | 6 | Y | layout | PASS |
| 31 | Heading | Y | Y | 6 | Y | typography | PASS |
| 32 | Input | Y | Y | 11 | Y | input + form | FIXED |
| 33 | InputNumber | Y | Y | 16 | Y (3 variants) | advanced-inputs | PASS |
| 34 | InputOTP | Y | Y | 13 | Y (2 variants) | advanced-inputs | PASS |
| 35 | Kbd | Y | Y | 4 | Y | kbd | PASS |
| 36 | Label | Y | Y | 6 | Y | typography | PASS |
| 37 | Link | Y | Y | 5 | Y | navigation | PASS |
| 38 | Menu | Y | Y | 7 | Y | overlays | PASS |
| 39 | MultiSelect | Y | Y | 10 | Y | advanced-inputs | PASS |
| 40 | Pagination | Y | Y | 9 | Y | wave2-3 | PASS |
| 41 | Popover | Y | Y | 5 | Y | overlays | PASS |
| 42 | Portal | Y | Y | 5 | Y | portal | PASS |
| 43 | ProgressBar | Y | Y | 17 | Y | toast-chip-progress | PASS |
| 44 | RadioGroup | Y | Y | 11 | Y | form | PASS |
| 45 | Rating | Y | Y | 15 | Y | advanced-inputs | PASS |
| 46 | Select (re-export) | headless | Y | n/a (headless tests) | Y | form | PASS |
| 47 | Sidebar | Y | Y | 12 | Y | sidebar-drawer | PASS |
| 48 | Skeleton | Y | Y | 9 | Y | data-display | FIXED |
| 49 | Slider | Y | Y | 20 | Y (2 variants) | advanced-inputs | PASS |
| 50 | Spacer | Y | Y | 5 | Y | layout | PASS |
| 51 | SpeedDial | Y | Y | 9 | Y | wave2-3 | PASS |
| 52 | Spinner | Y | Y | 6 | Y | feedback | PASS |
| 53 | Splitter | Y | Y | 8 | Y | wave2-3 | PASS |
| 54 | Stack | Y | Y | 7 | Y | layout | PASS |
| 55 | Stepper | Y | Y | 7 | Y | stepper-timeline | PASS |
| 56 | Switch | Y | Y | 10 | Y | form | FIXED |
| 57 | Tabs | Y | Y | 7 | Y | navigation | PASS |
| 58 | Text | Y | Y | 11 | Y | typography | PASS |
| 59 | Textarea | Y | Y | 8 | Y (2 variants) | input | PASS |
| 60 | Timeline | Y | Y | 7 | Y | stepper-timeline | PASS |
| 61 | Toast | Y (Toaster.tsx) | Y | 15 | Y | toast-chip-progress | PASS |
| 62 | ToggleGroup | Y | Y | 14 | Y | wave2-3 | PASS |
| 63 | Tooltip | Y | Y | 5 | Y | overlays | PASS |
| 64 | Transfer | Y | Y | 11 | Y | wave2-3 | PASS |
| 65 | TreeView | Y | Y | 15 | Y | data | PASS |
| 66 | VisuallyHidden | Y | Y | 4 | Y | visually-hidden | PASS |

**Summary totals:**
- 66 PASS (61 passed as-is, 5 FIXED via CSS commit)
- 0 DEFERRED
- 0 remaining P0/P1/P2 items

---

## Fixes applied this run

| SHA | Scope | Summary |
|-----|-------|---------|
| `836e130` | css | Add missing wui-button-icon/label, wui-checkbox/switch size variants, wui-input--disabled/--with-addons, wui-skeleton--text CSS rules |

One commit per fix category (single category = CSS class gaps).

---

## Remaining deferred items

None. All identified gaps were P0 and fixed in this run.

---

## Notes on investigation

Several grep results were false positives that the plan's patterns over-flag:

1. **Section 2.3 "USED BUT NOT DEFINED"** — the raw grep captures:
   - Template literal prefixes like `wui-alert--`, `wui-progress--` (fragments from `wui-progress--${variant}` interpolations)
   - CSS custom property names inside `var(--wui-...)` calls (e.g., `wui-color-primary` is a variable, not a class)
   - HTML ids (`wui-data-table-page-size`)
   - Negative test assertions (`expect(...).not.toContain("wui-avatar--md")`) testing that default values don't emit a modifier class
   These are all benign. The real gaps were the 10 classes fixed above.

2. **Section 2.5 "NO DEMO: Chart"** — Chart doesn't have a file literally named `ChartDemo.tsx` because it's a multi-component family; the demos are `ChartBarDemo`, `ChartLineDemo`, `ChartAreaPieRadarDemo`. The docs `/data` page imports and renders all three.

3. **Section 2.6 "UNUSED DEMO: *DemoInner"** — `DataTableDemoInner` and `EditorDemoInner` appear orphan by static grep because they're only imported via `next/dynamic(() => import("./...Inner"))` in the wrapper demos. Verified by reading `DataTableDemo.tsx` and `EditorDemo.tsx`.

4. **Section 2.7 "state=0 handlers=0"** on interactive demos — `AccordionDemo`, `TabsDemo`, `DrawerDemo`, `PopoverDemo`, `TooltipDemo`, and `DataTableDemoInner` have no local state because they rely on uncontrolled APIs (`defaultValue`, `defaultExpanded`) or headless-managed internal state (Popover/Tooltip/Drawer open state). Behavior verified by reading each demo.

---

## Final verification

```bash
pnpm build        # all 8 packages PASS in 23.5s
pnpm test         # 612 tests PASS in 67 files (9.2s)
pnpm --filter @weiui/tokens validate  # 6 contrast pairs PASS
```

All green. Audit complete.
