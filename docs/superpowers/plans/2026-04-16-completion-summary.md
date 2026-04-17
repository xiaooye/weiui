# WeiUI Polish Overhaul — Completion Summary

**Shipped:** 2026-04-16 to 2026-04-17
**Total commits:** 132
**Total tests:** 693 passing across all packages

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

## Known follow-ups (all P1/P2, non-blocking)

- Slider range mode + tooltip (P1)
- Rating half-star (P1)
- Editor slash menu (P1)
- Menu submenus (P2)
- Drawer swipe-to-dismiss (P1)
- Visual regression baseline snapshots (created on first CI run)

## Verification (final)

- `pnpm build`: 8/8 ✓
- `pnpm test`: 693/693 ✓ (react 562 · headless 102 · tokens 23 · a11y 6)
- `pnpm --filter @weiui/tokens validate`: 6/6 contrast (1 AAA + 5 AA) ✓
- `pnpm -r typecheck`: 0 errors in @weiui/react, @weiui/headless, @weiui/a11y, @weiui/icons ✓
- `pnpm --filter @weiui/docs build`: 40 static pages, 0 warnings ✓
