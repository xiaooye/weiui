# Interactivity Audit

Date: 2026-04-17
Previous commit: `f07f95b`
Branch: `main`

## Method

Audited every component in `packages/react/src/components/` (65 components) against its documentation page in `apps/docs/src/app/docs/components/**` and demo files in `apps/docs/src/components/demos/**`.

A component counts as:
- **Interactive demo** — imports the real component, wires state/handlers, and produces visible changes when clicked/typed.
- **Live but non-interactive** — imports the real component but does not wire state/handlers that change anything on click.
- **Static HTML only** — doc renders raw HTML with `wui-*` classes. Clicking or typing does nothing (no state, no events, no open/close).
- **Missing entirely** — no doc section for the component.

## Inventory

65 React components. All of them appear in at least one doc page (no component is completely missing from docs). However, the vast majority are shown as **static HTML with `wui-*` classes** rather than as real interactive React demos.

---

## Current interactive demos (good — no fix needed)

These already import the real component and produce visible state changes.

| Component | Demo file | Page |
|-----------|-----------|------|
| AutoComplete | `apps/docs/src/components/demos/AutoCompleteDemo.tsx` | `/docs/components/advanced-inputs` |
| Calendar | `apps/docs/src/components/demos/CalendarDemo.tsx` | `/docs/components/date-time` |
| ColorPicker | `apps/docs/src/components/demos/ColorPickerDemo.tsx` | `/docs/components/color-picker` |
| CommandPalette | `apps/docs/src/components/demos/CommandPaletteDemo.tsx` | `/docs/components/command-palette` |
| DataTable | `apps/docs/src/components/demos/DataTableDemo.tsx` + `DataTableDemoInner.tsx` | `/docs/components/data` |
| DatePicker | `apps/docs/src/components/demos/DatePickerDemo.tsx` | `/docs/components/date-time` |
| Dialog | `apps/docs/src/components/demos/DialogDemo.tsx` | `/docs/components/overlays` |
| Drawer | `apps/docs/src/components/demos/DrawerDemo.tsx` | `/docs/components/sidebar-drawer` |
| Editor | `apps/docs/src/components/demos/EditorDemo.tsx` + `EditorDemoInner.tsx` | `/docs/components/editor` |
| FileUpload | `apps/docs/src/components/demos/FileUploadDemo.tsx` | `/docs/components/advanced-inputs` |
| Menu | `apps/docs/src/components/demos/MenuDemo.tsx` | `/docs/components/overlays` |
| MultiSelect | `apps/docs/src/components/demos/MultiSelectDemo.tsx` | `/docs/components/advanced-inputs` |
| Popover | `apps/docs/src/components/demos/PopoverDemo.tsx` | `/docs/components/overlays` |
| Portal | `apps/docs/src/components/demos/PortalDemo.tsx` | `/docs/components/portal` |
| Toast | `apps/docs/src/components/demos/ToastDemo.tsx` | `/docs/components/toast-chip-progress` |
| Tooltip | `apps/docs/src/components/demos/TooltipDemo.tsx` | `/docs/components/overlays` |

Partial / intentionally-static (already OK):
- **Kbd** — static by design (just a visual badge). `KbdDemo.tsx` imports the real component.
- **VisuallyHidden** — static by design (has no visual state). `VisuallyHiddenDemo.tsx` imports the real component.

**Total with real interactive demo: 16 components (+ 2 intentionally-static = 18 live-imported).**

---

## Components WITHOUT a live interactive demo (need fix)

### 1. Accordion
- **Page:** `apps/docs/src/app/docs/components/accordion/page.mdx:7-31`
- **Current:** Raw `<div className="wui-accordion">` markup with static `aria-expanded="true"` on one trigger and `aria-expanded="false"` on two others. Clicking any trigger does nothing — there's no React state or event handler attached.
- **Needed:** Demo importing `<Accordion>`, `<AccordionItem>`, `<AccordionTrigger>`, `<AccordionContent>` that actually expands/collapses sections. Cover both `type="single"` and `type="multiple"`.

### 2. Alert
- **Page:** `apps/docs/src/app/docs/components/feedback/page.mdx:9-36`
- **Current:** Hand-rolled `<div role="alert">` markup with inline styles — does not import `Alert`, `AlertTitle`, or `AlertDescription`.
- **Needed:** Import real `<Alert>` and show the four variants (`info`, `success`, `warning`, `destructive`). Alert is mostly static content, but the demo must use the real component so prop behavior is exercised.

### 3. AppBar
- **Page:** `apps/docs/src/app/docs/components/wave2-3/page.mdx:148-183`
- **Current:** No preview at all — only a code block.
- **Needed:** Live `<AppBar>` with `AppBarBrand`, `AppBarNav`, `AppBarLink` (with `active` state), and `AppBarActions`.

### 4. AspectRatio
- **Page:** `apps/docs/src/app/docs/components/layout/page.mdx:151-180`
- **Current:** Code only, no preview.
- **Needed:** Live demo rendering an image inside `<AspectRatio>` showing the enforced ratio. Static is acceptable but must import the real component.

### 5. Avatar
- **Page:** `apps/docs/src/app/docs/components/data-display/page.mdx:58-71`
- **Current:** Static `<span className="wui-avatar">` markup.
- **Needed:** Import `<Avatar>` + `<AvatarFallback>` with multiple sizes. No interaction required, but must use the real component.

### 6. Badge
- **Page:** `apps/docs/src/app/docs/components/data-display/page.mdx:36-47`
- **Current:** Static `<span className="wui-badge">` markup.
- **Needed:** Import `<Badge>` with variant + color.

### 7. BottomNav
- **Page:** `apps/docs/src/app/docs/components/wave2-3/page.mdx:186-219`
- **Current:** No preview — code only.
- **Needed:** Live `<BottomNav>` + `<BottomNavItem>` with `active` state that toggles via `useState` on click, so you can see the active indicator move between tabs.

### 8. Breadcrumb
- **Page:** `apps/docs/src/app/docs/components/navigation/page.mdx:9-23`
- **Current:** Raw `<nav><ol>…</ol></nav>` markup with inline styles — does not import `Breadcrumb`, `BreadcrumbItem`, or `BreadcrumbSeparator`.
- **Needed:** Import the real components. Static is fine but must be a real React render.

### 9. Button
- **Page:** `apps/docs/src/app/docs/components/button/page.mdx:9-47`
- **Current:** Raw `<button className="wui-button …">` markup, including a `data-loading="true"` example that shows a disabled-looking button with no spinner — the real `<Button loading>` renders an inline `<Spinner>`.
- **Needed:** Import `<Button>` and show all variants/sizes/colors, plus at least one `<Button onClick={…}>` wired to toast (or state) to prove interactivity. Critically, `<Button loading>` must render via the React component so the spinner appears.

### 10. ButtonGroup
- **Page:** `apps/docs/src/app/docs/components/wave2-3/page.mdx:322-328`
- **Current:** Static `<div className="wui-button-group">` with raw `<button>` children. No React import, no handlers.
- **Needed:** Import `<ButtonGroup>` + `<Button>` with `onClick` handlers (e.g. toast on click).

### 11. Card
- **Page:** `apps/docs/src/app/docs/components/data-display/page.mdx:9-22`
- **Current:** Static `<div className="wui-card">` markup, action buttons do nothing.
- **Needed:** Import `<Card>`, `<CardHeader>`, `<CardContent>`, `<CardFooter>` and wire the action button to a toast (or console.log) to prove it's a live component.

### 12. Chart (BarChart / LineChart / AreaChart / PieChart / DonutChart / RadarChart)
- **Page:** `apps/docs/src/app/docs/components/data/page.mdx:133-187`
- **Current:** No preview at all — only code blocks. None of the six chart types have a visible demo.
- **Needed:** A demo that imports at least `<BarChart>` + `<LineChart>` (most common) or tabs through all six. Charts render animations and tooltips; Recharts handles the interactivity but the component must be mounted.

### 13. Checkbox
- **Page:** `apps/docs/src/app/docs/components/form/page.mdx:9-22`
- **Current:** Raw `<input type="checkbox">` with `accentColor` inline styles. Does not import `Checkbox`, misses the `indeterminate` visual (rendered via a checkbox CSS ::before glyph in the real component), and has no label wiring.
- **Needed:** Import `<Checkbox>` with `label`, `defaultChecked`, `disabled`, and — important — an **indeterminate demo** since the tri-state glyph only appears on the real component. Wire at least one checkbox to `useState` so the checked indicator actually updates.

### 14. Chip
- **Page:** `apps/docs/src/app/docs/components/toast-chip-progress/page.mdx:114-138`
- **Current:** Static `<span className="wui-chip">` with raw `<button className="wui-chip__remove">` buttons — clicking "×" does nothing.
- **Needed:** Import `<Chip>` with `onRemove` wired to `useState` so chips actually disappear when the ✕ is clicked.

### 15. Code
- **Page:** `apps/docs/src/app/docs/components/code/page.mdx`
- **Current:** No preview element at all — just code fences describing `<Code>` usage.
- **Needed:** Live `<Code>` inline and `<Code inline={false}>` block examples rendered via the Preview wrapper. Code is inherently static but the doc should at least show it rendering.

### 16. Container
- **Page:** `apps/docs/src/app/docs/components/layout/page.mdx:9-30`
- **Current:** Code only, no preview.
- **Needed:** Live `<Container>` demo, perhaps with two nested max-widths to show the centering + max-width clamp.

### 17. Divider
- **Page:** `apps/docs/src/app/docs/components/layout/page.mdx:105-128`
- **Current:** Code only, no preview.
- **Needed:** Live `<Divider>` horizontal and `<Divider orientation="vertical">` in a `<Stack direction="row">` demo.

### 18. EmptyState
- **Page:** `apps/docs/src/app/docs/components/feedback/page.mdx:114-123`
- **Current:** Hand-rolled `<div>` markup with emoji and inline styles — does not import `<EmptyState>`.
- **Needed:** Import `<EmptyState>` with `title`, `description`, `icon`, and an `action={<Button>Clear filters</Button>}` prop. Wire the action button onClick so it's obviously interactive.

### 19. Field
- **Page:** `apps/docs/src/app/docs/components/form/page.mdx:229-272`
- **Current:** Code only, no preview.
- **Needed:** Live `<Field>` with `<FieldLabel>`, `<Input>`, `<FieldDescription>`, and a second Field with `error="…"` so the aria-invalid/aria-describedby wiring is visible. Must import the real components to show the auto-id wiring.

### 20. Grid
- **Page:** `apps/docs/src/app/docs/components/layout/page.mdx:73-100`
- **Current:** Code only, no preview.
- **Needed:** Live `<Grid columns={3} gap={4}>` and a `<Grid columns="1fr 2fr">` example.

### 21. Heading
- **Page:** `apps/docs/src/app/docs/components/typography/page.mdx:12-24`
- **Current:** Code only, no preview of any kind.
- **Needed:** Live `<Heading level={1..6}>` stack.

### 22. Input
- **Page:** `apps/docs/src/app/docs/components/input/page.mdx:9-62`
- **Current:** Raw `<input className="wui-input">` markup everywhere, including the addon group which uses hand-rolled `<div className="wui-input-group">`. Does not import `<Input>` at all.
- **Needed:** Import `<Input>` and show sizes, addons (`startAddon`/`endAddon`), and states. Wire at least one `<Input>` to `useState` so typing is reflected in a sibling element.

### 23. InputNumber
- **Page:** `apps/docs/src/app/docs/components/advanced-inputs/page.mdx:132-166`
- **Current:** Static `<div className="wui-input-number">` markup. Increment/decrement buttons do nothing; `formatOptions` example shows a pre-formatted string `"$1,234.00"` but is not actually a live `<InputNumber>`.
- **Needed:** Import `<InputNumber>` with `useState` so the +/- and keyboard ArrowUp/Down actually change the number. Include a `formatOptions` live demo (currency + percent) so the runtime `Intl.NumberFormat` behavior is visible.

### 24. InputOTP
- **Page:** `apps/docs/src/app/docs/components/advanced-inputs/page.mdx:210-228`
- **Current:** Static `<input className="wui-input-otp__slot">` grid. Auto-advance on input is a core feature but the demo doesn't mount the real component to show it.
- **Needed:** Import `<InputOTP>` wired to `useState` so typing auto-advances between slots.

### 25. Label
- **Page:** `apps/docs/src/app/docs/components/typography/page.mdx:72-90`
- **Current:** Code only, no preview.
- **Needed:** Live `<Label>` and `<Label required>` examples.

### 26. Link
- **Page:** `apps/docs/src/app/docs/components/navigation/page.mdx:154-182`
- **Current:** Code only, no preview.
- **Needed:** Live `<Link>` internal and `<Link external>` example. Static is OK, but must import the real component so the `external` prop's `rel="noopener noreferrer"` wiring is shown.

### 27. Pagination
- **Page:** `apps/docs/src/app/docs/components/wave2-3/page.mdx:13-25`
- **Current:** Static `<nav className="wui-pagination">` with fixed `data-active="true"` on page 3. Clicking any page button does nothing.
- **Needed:** Import `<Pagination>` with `useState` so clicking a page number actually changes the active page and re-renders the button set.

### 28. ProgressBar
- **Page:** `apps/docs/src/app/docs/components/toast-chip-progress/page.mdx:165-192`
- **Current:** Static `<div role="progressbar">` with hard-coded inline widths. No `<ProgressBar>` import.
- **Needed:** Import `<ProgressBar>` with `value` from `useState` (e.g. a running counter or a "Start upload" button that animates from 0 to 100). Include an `indeterminate` demo.

### 29. RadioGroup
- **Page:** `apps/docs/src/app/docs/components/form/page.mdx:134-149`
- **Current:** Raw `<input type="radio">` markup with manual `name` grouping. Does not import `<RadioGroup>` or `<RadioGroupItem>`, so the arrow-key roving-tabindex behavior isn't demonstrated.
- **Needed:** Import `<RadioGroup>` and `<RadioGroupItem>` wired to `useState` so selection updates visually.

### 30. Rating
- **Page:** `apps/docs/src/app/docs/components/advanced-inputs/page.mdx:71-96`
- **Current:** Static `<button>` stars with hard-coded `data-filled="true"` and `aria-checked="true"` attributes. Clicking stars does nothing.
- **Needed:** Import `<Rating>` wired to `useState` so clicking a star updates the highlighted count.

### 31. Select
- **Page:** `apps/docs/src/app/docs/components/form/page.mdx:187-194`
- **Current:** Native `<select>` with inline styles — **not** the real `<Select>` compound component. The dropdown listbox pattern (`<SelectTrigger>`, `<SelectContent>`, `<SelectItem>`) is completely unshown.
- **Needed:** Import `<Select>`, `<SelectTrigger>`, `<SelectValue>`, `<SelectContent>`, `<SelectItem>` wired to `useState`. This is a high-priority gap because the visible preview is a native select with zero resemblance to the real listbox-styled trigger.

### 32. Sidebar
- **Page:** `apps/docs/src/app/docs/components/sidebar-drawer/page.mdx:14-29`
- **Current:** Static `<aside className="wui-sidebar">` markup with hand-rolled buttons. No React import, no collapsed/icon-only mode demo.
- **Needed:** Import `<Sidebar>`, `<SidebarHeader>`, `<SidebarContent>`, `<SidebarItem>`, `<SidebarFooter>`. Include a "Collapse sidebar" button that toggles the `open` prop so the collapsed (icon-only) mode is demonstrated.

### 33. Skeleton
- **Page:** `apps/docs/src/app/docs/components/data-display/page.mdx:74-88`
- **Current:** Static `<div className="wui-skeleton">` markup.
- **Needed:** Import `<Skeleton>` with sizes and `variant="text"`. Static acceptable, but must import the real component. Consider a "Toggle loading" demo that flips between `<Skeleton>` and real content.

### 34. Slider
- **Page:** `apps/docs/src/app/docs/components/advanced-inputs/page.mdx:16-36`
- **Current:** Static `<div className="wui-slider">` markup with hand-positioned thumb. The thumb does not move.
- **Needed:** Import `<Slider>` wired to `useState` so dragging/arrow-keys visibly move the thumb and update a "Value: X" readout.

### 35. Spacer
- **Page:** `apps/docs/src/app/docs/components/layout/page.mdx:131-148`
- **Current:** Code only, no preview.
- **Needed:** Live `<Stack direction="row">` with `<Spacer>` pushing Logo + Actions to opposite ends.

### 36. SpeedDial
- **Page:** `apps/docs/src/app/docs/components/wave2-3/page.mdx:223-258`
- **Current:** No preview — code only. Because SpeedDial uses `position: fixed` by default, it needs a framed demo.
- **Needed:** Live `<SpeedDial>` in a contained preview (Preview supports viewport scaling, or stage in a `position: relative` wrapper) with actions that call `toast()`.

### 37. Spinner
- **Page:** `apps/docs/src/app/docs/components/feedback/page.mdx:80-85`
- **Current:** Hand-rolled `<div>` with `@keyframes spin` inline `<style>` tag — does not import `<Spinner>`.
- **Needed:** Import `<Spinner>` at sizes sm/md/lg, plus `<Spinner label="Saving">`. The CSS animation and `prefers-reduced-motion` wiring only work on the real component.

### 38. Splitter
- **Page:** `apps/docs/src/app/docs/components/wave2-3/page.mdx:104-128`
- **Current:** No preview — code only.
- **Needed:** Live `<Splitter>` horizontal and vertical. The core value proposition (drag to resize + arrow-key resize) is invisible without a live demo.

### 39. Stack
- **Page:** `apps/docs/src/app/docs/components/layout/page.mdx:34-70`
- **Current:** Code only, no preview.
- **Needed:** Live `<Stack>` vertical, horizontal row, and wrapping row.

### 40. Stepper
- **Page:** `apps/docs/src/app/docs/components/stepper-timeline/page.mdx:13-38`
- **Current:** Hand-rolled `<div className="wui-stepper">` markup — does not import `<Stepper>`, `<Step>`, or `<StepSeparator>`.
- **Needed:** Import real `<Stepper>` with `activeStep` driven by a "Next" / "Back" button pair so users can see the step indicator move. Include both horizontal and vertical orientation.

### 41. Switch
- **Page:** `apps/docs/src/app/docs/components/form/page.mdx:78-91`
- **Current:** Raw `<input type="checkbox" role="switch">` with inline styles hacking together a switch appearance (it looks visually wrong — just a rectangular pill, no sliding thumb). Does not import `<Switch>`.
- **Needed:** Import `<Switch>` wired to `useState` so the thumb actually slides when toggled. The current hand-rolled approximation misrepresents the component.

### 42. Tabs
- **Page:** `apps/docs/src/app/docs/components/navigation/page.mdx:57-112`
- **Current:** Code only, no preview. High-priority gap because Tabs is a core pattern that users expect to see in action.
- **Needed:** Live `<Tabs>` with three `<TabsTrigger>`s and three `<TabsContent>`s, default uncontrolled, so clicking/arrow-keying between tabs visibly changes the content panel.

### 43. Text
- **Page:** `apps/docs/src/app/docs/components/typography/page.mdx:46-68`
- **Current:** Code only, no preview.
- **Needed:** Live `<Text>` examples showing size, color, and weight variants.

### 44. Textarea
- **Page:** `apps/docs/src/app/docs/components/input/page.mdx:65-82`
- **Current:** Raw `<textarea className="wui-input">` markup — does not import `<Textarea>`.
- **Needed:** Import `<Textarea>` with sizes. Wire one to `useState` so character count or value preview updates as the user types.

### 45. Timeline
- **Page:** `apps/docs/src/app/docs/components/stepper-timeline/page.mdx:92-116`
- **Current:** Hand-rolled `<ol className="wui-timeline">` markup with inline-styled dots and lines — does not import `<Timeline>` or `<TimelineItem>`.
- **Needed:** Import the real components. Static is fine for Timeline (no interaction), but must be a live React render.

### 46. ToggleGroup
- **Page:** `apps/docs/src/app/docs/components/wave2-3/page.mdx:266-272`
- **Current:** Static `<div className="wui-toggle-group">` with hand-rolled `aria-checked` attributes. Clicking items does nothing.
- **Needed:** Import `<ToggleGroup>` + `<ToggleGroupItem>` wired to `useState`, demoing both `type="single"` (alignment) and `type="multiple"` (bold/italic/underline).

### 47. Transfer
- **Page:** `apps/docs/src/app/docs/components/wave2-3/page.mdx:50-65`
- **Current:** No preview at all — code only.
- **Needed:** Live `<Transfer>` with source + target lists. Critical to demo because the dual-list interaction is the whole point.

### 48. TreeView
- **Page:** `apps/docs/src/app/docs/components/data/page.mdx:192-214`
- **Current:** No preview at all — code only.
- **Needed:** Live `<TreeView>` with sample nested nodes. Expand/collapse and keyboard navigation are the defining features, invisible without a live demo.

---

## Summary

| Category | Count |
|----------|-------|
| **Total components** | 65 |
| **With real interactive demo** (state + handlers + visible changes) | 16 |
| **Intentionally static demos using real component** (Kbd, VisuallyHidden) | 2 |
| **With static HTML only** (not mounting the real component) | 38 |
| **With code block only** (no preview/demo at all) | 10 |
| **Missing entirely from docs** | 0 |

### Components needing fixes (48 total)

**High priority** (clearly broken or visually misrepresentative):
- Button (loading state doesn't show spinner in static markup)
- Checkbox (indeterminate tri-state glyph requires real component)
- Select (native `<select>` shown instead of listbox-styled `<Select>` — completely wrong)
- Switch (visual approximation looks nothing like the real component)
- Slider (thumb is frozen — core interaction is invisible)
- Pagination (active state is hard-coded, page buttons are dead)
- Rating (stars don't respond to clicks)
- ToggleGroup (toggles don't toggle)
- Accordion (triggers are dead, expand/collapse doesn't happen)
- Chip (× buttons don't remove)
- ProgressBar (no live value, indeterminate animation missing)

**No-preview components** (need any demo at all):
- Chart (all six chart types — entire section is code-only)
- Transfer (dual-list interaction invisible)
- TreeView (expand/collapse + keyboard invisible)
- Splitter (drag-to-resize invisible)
- SpeedDial (expand menu invisible)
- AppBar (sticky header invisible)
- BottomNav (mobile bar invisible)
- Tabs (tab switching invisible)
- Field (auto-wiring behavior invisible)
- Code (no preview)
- Heading / Text / Label (typography — no preview)
- Container / Stack / Grid / Divider / Spacer / AspectRatio (all six layout primitives — no preview)
- Link (no preview)

**Purely-decorative components** (need real-component import but no state):
- Alert, Avatar, Badge, Card, Skeleton, Spinner, EmptyState, Breadcrumb, Stepper, Timeline

### Pattern observation

The docs were clearly authored in two phases:
1. **MDX-inlined static HTML with `wui-*` classes** — works to show CSS styling but misses React behavior entirely. This covers roughly 80% of the component pages.
2. **Real demo components imported from `apps/docs/src/components/demos/*.tsx`** — imports the real component with state and handlers. Only 16 exist.

The gap is uniform: any component that has a demo file in `demos/` is interactive; any component that's only shown via inline MDX markup is static.

The fastest path to fixing this is to add a demo file per component in `apps/docs/src/components/demos/` (following the existing pattern: `"use client"`, import from `@weiui/react`, wire `useState`, wrap in Preview) and replace the static MDX preview with the demo.

### File-level fix list (for next round)

Each of the following MDX files contains one or more static HTML blocks that should be replaced with a real demo import:

- `apps/docs/src/app/docs/components/button/page.mdx:9-47` (Button variants/sizes/states)
- `apps/docs/src/app/docs/components/accordion/page.mdx:7-31` (Accordion)
- `apps/docs/src/app/docs/components/advanced-inputs/page.mdx:16-36` (Slider)
- `apps/docs/src/app/docs/components/advanced-inputs/page.mdx:71-96` (Rating)
- `apps/docs/src/app/docs/components/advanced-inputs/page.mdx:132-166` (InputNumber)
- `apps/docs/src/app/docs/components/advanced-inputs/page.mdx:210-228` (InputOTP)
- `apps/docs/src/app/docs/components/data-display/page.mdx:9-22` (Card)
- `apps/docs/src/app/docs/components/data-display/page.mdx:36-47` (Badge)
- `apps/docs/src/app/docs/components/data-display/page.mdx:58-71` (Avatar)
- `apps/docs/src/app/docs/components/data-display/page.mdx:74-88` (Skeleton)
- `apps/docs/src/app/docs/components/feedback/page.mdx:9-36` (Alert)
- `apps/docs/src/app/docs/components/feedback/page.mdx:80-85` (Spinner)
- `apps/docs/src/app/docs/components/feedback/page.mdx:114-123` (EmptyState)
- `apps/docs/src/app/docs/components/form/page.mdx:9-22` (Checkbox)
- `apps/docs/src/app/docs/components/form/page.mdx:78-91` (Switch)
- `apps/docs/src/app/docs/components/form/page.mdx:134-149` (RadioGroup)
- `apps/docs/src/app/docs/components/form/page.mdx:187-194` (Select)
- `apps/docs/src/app/docs/components/input/page.mdx:9-62` (Input + addons + states)
- `apps/docs/src/app/docs/components/input/page.mdx:65-82` (Textarea)
- `apps/docs/src/app/docs/components/navigation/page.mdx:9-23` (Breadcrumb)
- `apps/docs/src/app/docs/components/sidebar-drawer/page.mdx:14-29` (Sidebar)
- `apps/docs/src/app/docs/components/stepper-timeline/page.mdx:13-38` (Stepper)
- `apps/docs/src/app/docs/components/stepper-timeline/page.mdx:92-116` (Timeline)
- `apps/docs/src/app/docs/components/toast-chip-progress/page.mdx:114-138` (Chip)
- `apps/docs/src/app/docs/components/toast-chip-progress/page.mdx:165-192` (ProgressBar)
- `apps/docs/src/app/docs/components/wave2-3/page.mdx:13-25` (Pagination)
- `apps/docs/src/app/docs/components/wave2-3/page.mdx:266-272` (ToggleGroup)
- `apps/docs/src/app/docs/components/wave2-3/page.mdx:322-328` (ButtonGroup)

No-preview files (only code blocks, no `<Preview>` / `<ComponentPreview>` at all):

- `apps/docs/src/app/docs/components/code/page.mdx` (Code — needs any preview)
- `apps/docs/src/app/docs/components/data/page.mdx:133-187` (Chart — six chart types)
- `apps/docs/src/app/docs/components/data/page.mdx:192-214` (TreeView)
- `apps/docs/src/app/docs/components/form/page.mdx:229-272` (Field)
- `apps/docs/src/app/docs/components/layout/page.mdx` (Container, Stack, Grid, Divider, Spacer, AspectRatio — all six need previews)
- `apps/docs/src/app/docs/components/navigation/page.mdx:57-112` (Tabs)
- `apps/docs/src/app/docs/components/navigation/page.mdx:154-182` (Link)
- `apps/docs/src/app/docs/components/typography/page.mdx:12-24` (Heading)
- `apps/docs/src/app/docs/components/typography/page.mdx:46-68` (Text)
- `apps/docs/src/app/docs/components/typography/page.mdx:72-90` (Label)
- `apps/docs/src/app/docs/components/wave2-3/page.mdx:50-65` (Transfer)
- `apps/docs/src/app/docs/components/wave2-3/page.mdx:104-128` (Splitter)
- `apps/docs/src/app/docs/components/wave2-3/page.mdx:148-183` (AppBar)
- `apps/docs/src/app/docs/components/wave2-3/page.mdx:186-219` (BottomNav)
- `apps/docs/src/app/docs/components/wave2-3/page.mdx:223-258` (SpeedDial)
