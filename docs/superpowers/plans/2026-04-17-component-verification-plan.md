# Component Verification Plan

> Repeatable audit to verify every WeiUI component is **present in the docs** and **actually interactive**.

**Owner:** maintainer on duty
**Run after:** any major component/doc commit, or before release
**Estimated time:** 2–3 hours for full pass, 30 min for smoke pass

---

## Why this plan exists

Past rounds kept missing issues because static analysis (grep/read code) can't catch:
- Components emitting Tailwind classes that don't exist in the consumer → **rendered unstyled**
- Demos that import real components but have no state/handlers → **appear static**
- Demos that render static HTML with `wui-*` classes instead of the real React component → **look correct but aren't interactive**
- MDX pages that import a demo but never render it → **invisible**
- Subpath-imported components (Chart/DataTable/Editor) that slip into the main barrel → **silent bundle bloat**

This plan catches all five classes.

---

## Section 1 — Master checklist (per component)

For every component under `packages/react/src/components/`, verify each of these boxes:

### 1.1 Source integrity

- [ ] `packages/react/src/components/<Name>/<Name>.tsx` exists
- [ ] `packages/react/src/components/<Name>/index.ts` re-exports it
- [ ] Exported from `packages/react/src/index.ts` (or from a subpath entry — `editor-entry.ts`, `chart-entry.ts`, `data-table-entry.ts`)
- [ ] Uses `forwardRef` + `displayName` (or documented exception)
- [ ] `Props` interface is exported alongside the component

### 1.2 Rendering correctness

- [ ] Component emits **`wui-*` classes only** — no Tailwind utilities like `inline-flex`, `h-11`, `bg-[var(...)]`, `items-center`, `font-semibold`, `text-sm`, etc.
- [ ] Every `wui-*` class emitted exists in `packages/css/src/elements/*.css`
- [ ] Matching CSS file is imported from `packages/css/src/index.css`
- [ ] Renders identically in SSR and client hydration (no `typeof window` gate missing)

### 1.3 Test coverage

- [ ] `__tests__/` folder exists with at least one test file
- [ ] ≥ 2 tests for simple components (Spacer, Divider, Kbd, etc.)
- [ ] ≥ 4 tests for interactive components (Button, Checkbox, Select, etc.)
- [ ] ≥ 6 tests for complex components (Dialog, DataTable, DatePicker, etc.)
- [ ] Keyboard pattern covered (arrow nav, escape, typeahead where applicable)
- [ ] Controlled + uncontrolled variants both tested (where applicable)

### 1.4 Documentation presence

- [ ] Component has a dedicated doc page OR is covered in a grouped page
- [ ] Grouped pages: `form`, `input`, `layout`, `feedback`, `navigation`, `data`, `overlays`, `toast-chip-progress`, `advanced-inputs`, `data-display`, `date-time`, `stepper-timeline`, `sidebar-drawer`, `typography`, `wave2-3`
- [ ] Page has `# ComponentName` H1 + 1-2 sentence description
- [ ] Page includes at least one `<Preview>` block with a rendered demo
- [ ] Page has a `## Props` table listing every public prop
- [ ] Page has an `## Accessibility` section listing keyboard + ARIA
- [ ] Page is reachable from the Components sidebar
- [ ] Page link exists in `apps/docs/src/app/docs/components/page.mdx` overview

### 1.5 Demo interactivity

- [ ] Demo file exists at `apps/docs/src/components/demos/<Name>Demo.tsx` (or is inlined in the MDX for trivial components)
- [ ] Demo starts with `"use client"`
- [ ] Demo imports the **real component** from `@weiui/react` (or subpath) — **not** raw HTML with `wui-*` classes pretending to be the component
- [ ] Demo is imported AND rendered in its MDX page (not just imported)
- [ ] If the component is stateful: demo has `useState` + visible state updates on interaction
- [ ] If the component is display-only (Badge, Heading, Text, Code, Kbd, etc.): demo shows the relevant variants and needs no state — this is OK

### 1.6 Subpath export compliance (heavy components only)

For `Editor`, `DataTable`, `BarChart`, `LineChart`, `AreaChart`, `PieChart`, `DonutChart`, `RadarChart`:
- [ ] NOT exported from main `packages/react/src/index.ts` barrel
- [ ] Exported from the appropriate subpath entry (`editor-entry.ts`, `chart-entry.ts`, `data-table-entry.ts`)
- [ ] Demo imports from the subpath: `@weiui/react/editor`, `@weiui/react/chart`, `@weiui/react/data-table`
- [ ] Demo uses `next/dynamic` with `ssr: false` where appropriate (heavy bundles)

---

## Section 2 — Verification commands

### 2.1 Quick smoke test (every push)

```bash
# Runs in < 60s
pnpm build
pnpm test
pnpm --filter @weiui/tokens validate
```

Pass = all green. Fail = stop the run.

### 2.2 Tailwind class leakage check

```bash
# Any tailwind-utility patterns hardcoded in React components?
grep -rnE "inline-flex|items-center|bg-\[var\(|h-\d+|px-\d+|py-\d+|gap-\d|rounded-\[|border-\[var\(|font-(bold|semibold|medium|mono)|text-(xs|sm|lg|xl|\dxl)|hover:bg-|focus-visible:outline-" packages/react/src/components/**/*.tsx packages/react/src/variants/*.ts
```

Pass = 0 matches (or only in `tailwind-variants` composition that emits wui-* classes).
Fail = each match is a component rendering unstyled in consumers.

### 2.3 CSS class existence check

```bash
# Every wui-* class used in components must exist in CSS
grep -rhoE "wui-[a-z][a-z0-9-]*" packages/react/src/components/ | sort -u > /tmp/used.txt
grep -rhoE "\.wui-[a-z][a-z0-9-]*" packages/css/src/elements/ | sed 's/^\.//' | sort -u > /tmp/defined.txt
comm -23 /tmp/used.txt /tmp/defined.txt
```

Pass = empty output.
Fail = each listed class is used but not styled → renders unstyled.

### 2.4 CSS import completeness

```bash
# Every element CSS file must be imported from index.css
for f in packages/css/src/elements/*.css; do
  name=$(basename "$f")
  grep -q "elements/$name" packages/css/src/index.css || echo "MISSING IMPORT: $name"
done
```

Pass = empty output.

### 2.5 Demo file coverage

```bash
# Every component should have a demo OR be covered by an inline demo in MDX
for dir in packages/react/src/components/*/; do
  name=$(basename "$dir")
  lc_name=$(echo "$name" | sed 's/\([A-Z]\)/-\L\1/g' | sed 's/^-//')
  demo="apps/docs/src/components/demos/${name}Demo.tsx"
  if [ ! -f "$demo" ]; then
    # Check if inlined somewhere
    found=$(grep -rln "<${name}[ />]" apps/docs/src/app/docs/components/ 2>/dev/null | head -1)
    if [ -z "$found" ]; then
      echo "NO DEMO: $name"
    fi
  fi
done
```

Pass = empty output.

### 2.6 Demo rendered-in-MDX check

```bash
# Every demo file must be rendered in at least one MDX page
for demo in apps/docs/src/components/demos/*.tsx; do
  name=$(basename "$demo" .tsx)
  count=$(grep -rln "<$name[ />]" apps/docs/src/app/docs/ 2>/dev/null | wc -l)
  if [ "$count" -eq 0 ]; then echo "UNUSED DEMO: $name"; fi
done
```

Pass = empty output.
Fail = orphan demo files (either wire them in or delete).

### 2.7 Demo interactivity check

Inspect every demo file. Interactive components (anything with open state, selection, or value) must have:
- `useState`, `useReducer`, or controlled-via-parent-state
- At least one handler (`onClick`, `onChange`, `onSelect`, etc.)

```bash
for demo in apps/docs/src/components/demos/*.tsx; do
  name=$(basename "$demo" .tsx)
  has_state=$(grep -c "useState\|useReducer" "$demo")
  has_handler=$(grep -cE "onClick|onChange|onSelect|onValueChange|onOpenChange|onKeyDown" "$demo")
  # Flag only demos whose component is expected to be interactive
  # (skip BadgeDemo, HeadingDemo, TextDemo, KbdDemo, LinkDemo, CodeDemo, SpacerDemo, DividerDemo, ContainerDemo,
  #  AspectRatioDemo, SkeletonDemo, SpinnerDemo, AvatarDemo, CardDemo display-only ones)
  echo "$name: state=$has_state handlers=$has_handler"
done
```

Manual review: flag any interactive-component demo with both counts at 0.

### 2.8 Built HTML inspection

After `pnpm --filter @weiui/docs build`, grep the generated HTML for:

```bash
# Tailwind utility leakage in rendered HTML
grep -rE 'class="[^"]*\b(inline-flex|items-center|h-11|h-9|bg-\[|text-sm font|font-semibold)' apps/docs/.next/server/app/docs/components/*.html | head -20
```

Pass = empty. Fail = component renders with Tailwind utilities that aren't styled.

```bash
# Expected wui-* marker classes present on component pages
grep -l "wui-button" apps/docs/.next/server/app/docs/components/button.html && echo "Button OK"
grep -l "wui-input" apps/docs/.next/server/app/docs/components/input.html && echo "Input OK"
grep -l "wui-dialog__trigger\|wui-button" apps/docs/.next/server/app/docs/components/overlays.html && echo "Overlays OK"
```

### 2.9 Contrast validation

```bash
pnpm --filter @weiui/tokens validate
```

Pass = all 6 pairs pass AA minimum; body text at AAA.

### 2.10 Dev server smoke test (manual, optional)

```bash
pnpm --filter @weiui/docs dev
# Open http://localhost:3000
# Walk through each doc page, click at least one interaction per page
# Verify dark mode toggle works
# Verify ⌘K palette opens
# Verify mobile hamburger at <768px
```

---

## Section 3 — Component inventory

Current count: **66 user-facing components** (65 React components + Select re-exported from @weiui/headless).

### 3.1 By family with home page

| Family | Components | Primary page |
|--------|-----------|--------------|
| Form | Button, Input, Textarea, Checkbox, Switch, RadioGroup, Select, Field, Label, ButtonGroup, ToggleGroup | `/docs/components/form` + `/button` + `/input` |
| Advanced input | Slider, Rating, InputNumber, InputOTP, AutoComplete, MultiSelect, FileUpload, ColorPicker | `/docs/components/advanced-inputs` + `/color-picker` |
| Overlay | Dialog, Drawer, Popover, Tooltip, Menu, Toast, CommandPalette | `/docs/components/overlays` + `/command-palette` + `/toast-chip-progress` + `/sidebar-drawer` |
| Data | DataTable, TreeView, Transfer, Chart (6 types), Code | `/docs/components/data` + `/code` |
| Date / calendar | DatePicker, Calendar | `/docs/components/date-time` |
| Navigation | Tabs, Breadcrumb, Link, Pagination, AppBar, BottomNav, Menu, Sidebar, Stepper, Timeline | `/docs/components/navigation` + `/wave2-3` + `/stepper-timeline` + `/sidebar-drawer` |
| Feedback | Alert, Spinner, EmptyState, ProgressBar, Chip, Skeleton | `/docs/components/feedback` + `/toast-chip-progress` + `/data-display` |
| Display | Badge, Avatar, Card | `/docs/components/data-display` |
| Interactive | Accordion, Splitter, SpeedDial, Editor | `/docs/components/accordion` + `/wave2-3` + `/editor` |
| Layout | Container, Stack, Grid, Spacer, Divider, AspectRatio | `/docs/components/layout` |
| Typography | Heading, Text, Kbd | `/docs/components/typography` + `/kbd` |
| Utility | Portal, VisuallyHidden | `/docs/components/portal` + `/visually-hidden` |

### 3.2 Subpath-exported (heavy) components

| Component | Subpath |
|-----------|---------|
| Editor | `@weiui/react/editor` |
| DataTable | `@weiui/react/data-table` |
| BarChart / LineChart / AreaChart / PieChart / DonutChart / RadarChart | `@weiui/react/chart` |

**Rule:** these must NOT leak into the main barrel. Verify with:
```bash
grep -E "export.*Editor|DataTable|BarChart|LineChart|AreaChart|PieChart|DonutChart|RadarChart" packages/react/src/index.ts
```
Should return 0 matches (only the subpath entries export them).

---

## Section 4 — Execution procedure

### Full audit pass (release-gate quality)

1. **Setup** (2 min)
   ```bash
   git status  # clean working tree
   pnpm install
   ```

2. **Run all automated checks** (Section 2.1 → 2.9) in sequence (5 min)

3. **Fill in per-component matrix** (90 min)
   For each of the 66 components, tick every box in Section 1. Record gaps.

4. **Fix every gap found** (variable — could be 30 min or 4 hours)
   - One commit per fix category
   - Follow the repair pattern: component fix → test update → CSS update → demo update → MDX page update

5. **Re-run automated checks** after fixes (5 min)

6. **Update completion summary** (5 min)
   - Update `docs/superpowers/plans/2026-04-16-completion-summary.md`
   - Log commits, fixes, and any deferred items

### Smoke audit pass (every push)

1. Run Section 2.1, 2.2, 2.3, 2.8 only (3 min)
2. If anything fails, STOP and investigate before merging

---

## Section 5 — Gap patterns observed historically

Use these as "likely places to find issues":

### Pattern A — Tailwind leakage
**Symptom:** Component renders unstyled in docs (plain browser default appearance).
**Root cause:** Component's `className={cn("inline-flex items-center ...")}` or `tailwind-variants` emits Tailwind utilities but docs app doesn't load Tailwind.
**Fix:** Rewrite to emit `wui-*` classes; add matching CSS file; register in `packages/css/src/index.css`.
**Past instances:** Button, Alert, Breadcrumb, Code, EmptyState, Field, Heading, Kbd, Label, Link, Text (11 components total fixed in commits `4c0cc14` and `79309c0`).

### Pattern B — Static HTML pretending to be a demo
**Symptom:** Demo block in MDX looks correct visually but clicks do nothing.
**Root cause:** MDX has `<Preview><button className="wui-button wui-button--solid">Solid</button></Preview>` instead of `<ButtonDemo />`.
**Fix:** Replace static HTML with real demo component that imports the React component + has state.
**Past instances:** 8 pages fixed in commit `def04ba` plus LiveShowcase in `1bb87cb`.

### Pattern C — Demo exists but not rendered
**Symptom:** Component feature invisible from docs despite demo file existing.
**Root cause:** Demo file created but never imported/rendered in any MDX page.
**Detection:** Section 2.6 check.

### Pattern D — Non-interactive demo
**Symptom:** Demo renders real component but doesn't show state changes.
**Root cause:** Demo has no `useState`, handlers are stubs (`onClick={() => {}}`), or component is shown without its interactive prop set.
**Detection:** Section 2.7 check + manual review.

### Pattern E — Missing doc page for new component
**Symptom:** Component exists in `packages/react/src/components/` but has no `apps/docs/src/app/docs/components/<name>/page.mdx`.
**Detection:** Section 2.5 check, also verified by the audit matrix.

### Pattern F — Subpath export regression
**Symptom:** First Load JS on docs page balloons to 400+ kB.
**Root cause:** Heavy component (Editor/Chart/DataTable) re-exported from main barrel.
**Detection:** Subpath compliance check in Section 1.6.
**Past instance:** bundle split applied in commit `3f4aafd` — pre-split pages were 426 kB, post-split 105-150 kB.

### Pattern G — Broken CSS import
**Symptom:** Component styled in storybook/tests but unstyled in docs.
**Root cause:** New element CSS file created but not imported in `packages/css/src/index.css`.
**Detection:** Section 2.4 check.

### Pattern H — Exported name mismatch
**Symptom:** Demo import errors, `Cannot find module` at build.
**Root cause:** Component folder name doesn't match exported name (e.g., `Tabs/index.ts` re-exports from `@weiui/headless`, but consumer expects a styled `Tabs`).
**Detection:** Section 1.1 + attempt-build.

---

## Section 6 — Reporting template

When running the audit, produce a report with this shape:

```markdown
# Verification Run — YYYY-MM-DD

**Commit:** <SHA>
**Runtime:** <duration>
**Pass/fail:** <N>/66 components pass

## Component matrix

| Component | Source | Render | Test | Doc | Demo | Subpath | Status |
|-----------|--------|--------|------|-----|------|---------|--------|
| Button | ✅ | ✅ | ✅ (12 tests) | ✅ | ✅ interactive | n/a | PASS |
| ...

## Gaps identified

### Critical (blocks release)
- <Component> — <gap>

### Important (ship-blocking polish)
- <Component> — <gap>

### Minor (nice-to-have)
- <Component> — <gap>

## Automated check results

- Tailwind leakage: N matches (expected 0) — [fix]
- CSS class existence: N missing — [fix]
- CSS import completeness: N missing imports
- Demo coverage: N components missing demos
- Demo rendering: N orphan demos
- Built HTML inspection: clean / N issues

## Fixes applied this run

- <SHA> — <fix summary>

## Next actions

- <Follow-up item>
```

---

## Section 7 — Maintenance

This plan is a living document.

**Update when:**
- New component added → add to Section 3 inventory
- New subpath entry created → add to Section 3.2
- New pattern of failure discovered → add to Section 5
- Check becomes automatable → move from manual to Section 2

**Do not remove:** historical gap patterns in Section 5. They document what failure modes have existed and help future auditors recognize recurrence.

---

## Section 8 — Priority of issues

When gaps are found, apply this priority:

1. **P0 (fix now):** Tailwind leakage, missing CSS import, demo static HTML pretending to be real, runtime errors
2. **P1 (fix this release):** Missing Accessibility section, missing Props table, demo with no state where state is expected, missing test coverage on complex components
3. **P2 (backlog):** Prose polish, extra examples, component feature enhancements beyond the audit matrix

P0 gaps block release. P1 should be fixed by the next polish round. P2 is open-ended.
