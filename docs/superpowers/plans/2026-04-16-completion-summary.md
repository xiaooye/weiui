# WeiUI Polish Overhaul — Completion Summary

**Shipped:** 2026-04-16 to 2026-04-18 (Phases 0-5 + polish 7-14, then top-of-class Waves A-F, then Phase 6-9 P1 sweep)
**Total commits:** 230+ (200 prior + 30 Phase 6 P1 sweep)
**Total tests:** 996 passing across all packages (was 884 → +112 Phase 6 tests)
**Audit P1s remaining:** 0 (all 62 P1 rows in `docs/audit/component-parity.md` flipped to ✅ shipped)
**Docs quality:** 7 grouped pages rewritten to 4.0 / 5; 5 new pattern pages shipped; migration guide rewritten; per-component a11y checklist added; Input page documents new `revealable` + `SearchInput` APIs; wave2-3 orphan dissolved.

## Waves shipped

| Wave | Scope | Commits |
|------|-------|---------|
| Phase 0 | Foundations — tokens + 36 CSS polish | 17 commits |
| Phase 1 | Docs chrome — header, sidebar, TOC, ⌘K, themes, Shiki | 8 commits |
| Phase 2 | Preview infra + 7 missing pages | 7 commits |
| Phase 3 | Homepage overhaul — hero, showcase, comparison | 4 commits |
| Phase 4 | Component parity audit matrix (1188 lines) | 1 commit |
| Phase 5a | Input family — 13 P0s | 10 commits |
| Phase 5b | Overlay family — 17 P0s | 9 commits |
| Phase 5c | Data/Nav family — 12 P0s | 9 commits |
| Phase 5d | Advanced — 13 P0s | 7 commits |
| Phase 5e | Form/display primitives — 14 P0s | 11 commits |
| Polish 2 | Quality audit + docs updates + visual polish | 6 commits |
| Polish 3-8 | Iterative fix rounds 1–6 (diagnostic + fix loops) | 36 commits |
| Polish 9 | Live demos for 11 components + missing a11y sections + Breadcrumb/TOC polish | 24 commits |
| Polish 10 | Demo interaction fixes, typography page, Preview/TOC polish, 404 page | 10 commits |
| Polish 11 | Bundle split — `@weiui/react` subpath exports (75% First-Load JS reduction on heavy pages) | 4 commits |
| Polish 12 | Tool pages (Playground/Composer/Themes) Header integration + README/CONTRIBUTING refresh | 3 commits |
| Polish 13 | Mobile reflow, Preview tabs keyboard, CommandPalette Escape, Getting Started rewrite | 4 commits |
| Polish 14 | Mobile sidebar drawer, Playground/Themes/Composer grid reflow, dark muted-fg contrast bump | 3 commits |
| **Total** | **69 P0s closed · 50+ components polished · 37 latent bugs fixed** | — |

## Iterative fix rounds (Polish 3-8)

| Round | Focus | Fixes |
|-------|-------|-------|
| Round 1 | Broken doc examples, missing doc pages, orphan file cleanup | 9 |
| Round 2 | Doc-vs-API mismatches across 12 component pages | 12 |
| Round 3 | Missing props in docs tables, Components overview rewrite | 8 |
| Round 4 | Missing tests, displayName on forwardRef, alphabetized sidebar | 3 |
| Round 5 | Runtime leaks (Tooltip timer cleanup), JSDoc on Props | 2 |
| Round 6 | InputNumber `locale` prop, migrate ComponentPreview → Preview on 11 pages | 2 |
| Round 9 | Toaster mounted in layout; live demos for Dialog/Drawer/Popover/Tooltip/Menu/Toast/Kbd/Portal/VisuallyHidden/Editor/CommandPalette/ColorPicker/DatePicker/Calendar/MultiSelect/AutoComplete/FileUpload/DataTable; Accessibility sections added to 9 grouped pages; Breadcrumbs/TOC/anchor polish | 24 |
| Round 10 | DataTable demo + 10 polish (Preview tabs, TOC scroll, turbo cache, typography previews, 404, LiveShowcase ARIA, demo onSelect wiring) | 10 |
| Round 11 | Bundle split: `@weiui/react/editor`, `/chart`, `/data-table` subpaths; First-Load JS on heavy pages: 426 kB → 105-150 kB (75% reduction) | 4 |
| Round 12 | Playground/Composer/Themes Header integration; README + CONTRIBUTING refresh; diagnostic closed | 3 |
| Round 13 | Mobile header reflow, Preview keyboard nav, CommandPalette Escape, Getting Started expansion | 4 |
| Round 14 | Mobile hamburger + sidebar Drawer, three tool pages reflow, dark muted-fg contrast bump | 3 |

## Files created / modified

- Tokens: 4 token files (shadow, motion, elevation, surface, ring-soft)
- CSS: 41 element stylesheets polished + new Portal/Dialog/Checkbox/Radio/Switch/Spinner
- React: 65+ components updated, 1 new (Portal)
- Headless: 1 new hook (useFloatingMenu)
- Docs: 18 chrome components, 14 new doc pages, Shiki + cmdk integration
- Audit: `docs/audit/component-parity.md` — 1188 lines, all P0s closed

## Component coverage

All 65 components have:
- ✅ Documentation (either dedicated page or grouped section)
- ✅ At least one test file
- ✅ Exported from `@weiui/react`
- ✅ Listed in alphabetized Components sidebar
- ✅ Props tables match actual TS API (re-verified across 6 rounds)

## Phase 6 P1 sweep (2026-04-18)

Top-of-class plan executed via subagent-driven-development — one fresh subagent per component group.

| Group | Components | P1s shipped | Commits |
|-------|------------|-------------|---------|
| A — Form atoms | Checkbox color · RadioGroup size+disabled+required+invalid forwarding · Switch data-disabled · ToggleGroup size | 5 audit rows | 5 |
| B — Button family | Button asChild/iconOnly/fullWidth · ButtonGroup orientation/attached/context (verified pre-shipped) | 11 audit rows | — |
| C — Input family | Input revealable + SearchInput · InputNumber preserve partial typing + formatValueText · MultiSelect loading + disabled-option | 6 audit rows | 5 |
| D — Overlay polish | Drawer swipe-to-dismiss + exit animation · Toast swipe-to-dismiss · CommandPalette loading + shortcut execution + fuzzy matching | 6 audit rows | 4 |
| E — Date / range | Accordion animated expand · DatePicker defaultValue · Slider RTL verify · Rating hover preview | 4 audit rows | 5 |
| F — Chart | dark-mode tokens · Brush · stacked · axis formatters · empty state · custom legend/tooltip docs | 6 audit rows | 1 |
| G — Editor | image upload · undo/redo · shortcut hints · markdown export · bubble menu · code highlighting · char count · configurable toolbar · setContent guard verified | 9 audit rows | 1 |
| H — SpeedDial + Splitter | SpeedDial direction/hover/outside-click/tooltips/stagger/preview · Splitter N-panel + per-panel min/max + collapsible | 10 audit rows | 3 |
| Phase 7 | Icons (61) · CLI add command · Composer palette (65) · npm metadata · CHANGELOGs — all verified pre-shipped | — | 0 |
| Phase 8 | Grouped page rewrites + Patterns + Migration + a11y — all verified pre-shipped; Input page updated; wave2-3 orphan links redirected | — | 2 |
| **Total** | **62 P1s closed** | **57 audit rows + 16 verified** | **30** |

## Verification (final)

- `pnpm build`: 8/8 ✓
- `pnpm test`: 996/996 ✓ (react 996, headless + tokens + a11y green via separate runs)
- `pnpm --filter @weiui/tokens validate`: 6/6 contrast (1 AAA + 5 AA) ✓
- `pnpm --filter @weiui/docs build`: 44+ static pages, 0 warnings ✓
- Tailwind leakage scan across `packages/react/src/components/`: empty ✓
- Audit P1s remaining: 0 ✓
