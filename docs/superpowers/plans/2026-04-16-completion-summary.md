# WeiUI Polish Overhaul — Completion Summary

**Shipped:** 2026-04-16 to 2026-04-17
**Total commits:** 94
**Total tests:** 689 passing across all packages

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
| **Total** | **69 P0s closed · 50+ components polished** | — |

## Files created / modified

- Tokens: 4 token files (shadow, motion, elevation, surface, ring-soft)
- CSS: 41 element stylesheets polished + new Portal/Dialog/Checkbox/Radio/Switch/Spinner
- React: 65+ components updated, 1 new (Portal)
- Headless: 1 new hook (useFloatingMenu)
- Docs: 18 chrome components, 10 new doc pages, Shiki + cmdk integration

## Known follow-ups

- Wave 6 (future): Slider range mode + tooltip (P1), Rating half-star (P1), Editor slash menu (P1), Menu submenus (P2), Drawer swipe-to-dismiss (P1)
- UX polish: locale prop on InputNumber (currently hardcoded en-US)
- Testing: Add visual regression baseline snapshots on first CI run

## Verification (final)

- `pnpm build`: 8/8 ✓
- `pnpm test`: 689/689 ✓
- `pnpm --filter @weiui/tokens validate`: 6/6 contrast (1 AAA + 5 AA) ✓
- `pnpm -r typecheck`: 0 errors in @weiui/react, @weiui/headless, @weiui/a11y, @weiui/icons ✓
