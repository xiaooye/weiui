# WeiUI — Top-of-Class All-Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every one of 66 WeiUI components matches or exceeds best-in-class references in feature surface, renders an interactive demo on a thoroughly-documented grouped page, and passes the verification plan in `docs/superpowers/plans/2026-04-17-component-verification-plan.md`.

**Architecture:** Extend existing components with missing P1 features using existing shared infrastructure — `useFloatingMenu`, `Portal`, `useDisclosure`, `useFocusTrap`, `useControllable`, `useKeyboardNav`, `announce` from `@weiui/headless`. New sub-components (`<MenuCheckboxItem>`, `<PopoverArrow>`, `<TooltipProvider>`, `<AvatarGroup>`, `<BreadcrumbEllipsis>`, `<SidebarTrigger>`, etc.) land alongside existing exports. Toast store gains `toast.promise`, pause-on-hover, and stacking. DataTable gets resize/pin/filter/visibility/virtualization via TanStack's built-in enable-flags. Doc rewrites target ≥3.5/5 quality per grouped page with live demos, props tables, a11y sections, and real-world usage patterns.

**Tech Stack:** React 19, `@weiui/headless`, `@floating-ui/react`, `@tanstack/react-table` + `@tanstack/react-virtual` (new dep), Tiptap extensions, Vitest, Playwright, Next.js 15 MDX.

**References:** `docs/audit/component-parity.md` (authoritative gap list), parent plan at `C:/Users/PC/.claude/plans/thats-not-covered-enough-gleaming-dewdrop.md`.

---

## How to execute this plan

This plan is organized into **6 waves** (A–F), each ending with a verification gate. Tasks within a wave are **independent** — they can be dispatched to subagents in parallel (via separate subagents) as long as each commits individually. Tasks across waves are **sequential** — Wave B depends on Wave A's shared infrastructure.

- **Wave A (foundational recipes)** — universal code patterns. Read once, reuse across every task.
- **Wave B (Overlay family)** — 7 components. See also the dedicated detailed plan at `docs/superpowers/plans/2026-04-18-phase-6a-overlay-p1.md` for full TDD breakdown.
- **Wave C (Inputs + Date/Time)** — 12 components.
- **Wave D (Data + Navigation)** — 14 components.
- **Wave E (Display + Form primitives + Layout/Typography)** — 22 components.
- **Wave F (Library + Docs + Verification)** — icons expansion, CLI `add <component>`, Composer palette expansion, npm metadata, CHANGELOG scaffolds, grouped-doc-page rewrites, pattern pages, final audit.
- **Wave G (Docs dogfooding + state-of-art UI polish)** — rewrite every docs chrome component, landing section, preview, and tool page to consume `@weiui/react` exclusively (no raw HTML with inline styles, no custom chrome CSS classes outside of tokens). Add state-of-art polish: refined motion, ambient backdrops, subtle micro-interactions, refined typography, optimistic visual hierarchy. Proves the library is complete by building the docs site with it end-to-end.

After every commit: run `pnpm --filter @weiui/react test` locally. After every wave: run `pnpm build && pnpm test && pnpm --filter @weiui/docs build && pnpm --filter @weiui/tokens validate`.

---

## Wave A — Universal recipes

These are patterns every component uses. Do NOT re-implement; use these exactly.

### A.1 — Preventable event pattern (used for onInteractOutside / onEscapeKeyDown / onOpenAutoFocus / onCloseAutoFocus)

```tsx
// For onInteractOutside:
useEffect(() => {
  if (!isOpen) return;
  function handler(e: MouseEvent) {
    if (!contentRef.current) return;
    if (contentRef.current.contains(e.target as Node)) return;
    const ev = new Event("interactoutside", { cancelable: true });
    Object.defineProperty(ev, "target", { value: e.target });
    onInteractOutside?.(ev as unknown as MouseEvent);
    if (!ev.defaultPrevented) onClose();
  }
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, [isOpen, onClose, onInteractOutside]);

// For onEscapeKeyDown (called from keydown handler):
if (e.key === "Escape") {
  const ev = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
  onEscapeKeyDown?.(ev);
  if (!ev.defaultPrevented) { e.stopPropagation(); onClose(); }
}
```

### A.2 — Floating arrow subcomponent pattern (TooltipArrow exists; mirror it for PopoverArrow, etc.)

See `packages/react/src/components/Tooltip/Tooltip.tsx` `TooltipArrow` (lines 169-201). Same pattern for any floating component:

1. Root component owns `arrowRef` and passes to `useFloatingMenu({ ..., arrowRef })`.
2. Context exposes `arrowRef`, `arrowData` (from `middlewareData.arrow`), `placement`.
3. Arrow subcomponent reads these from context and positions via inline style.

### A.3 — Provider context pattern (TooltipProvider, later AccordionProvider etc.)

```tsx
const XProviderContext = createContext<XProviderValue>({ /* defaults */ });

export function XProvider({ children, ...config }: XProviderProps) {
  return <XProviderContext.Provider value={config}>{children}</XProviderContext.Provider>;
}

// In X root:
const providerValue = useContext(XProviderContext);
const resolvedFoo = propFoo ?? providerValue.foo;
```

### A.4 — Roving-tabindex item pattern (existing in Menu; reuse for Accordion/Tabs/ToggleGroup items)

Follow `MenuContent` in `packages/react/src/components/Menu/Menu.tsx` — assign sequential indices via `Children.map`, track `activeIndex` in context, item reads via injected `_menuIndex` prop.

### A.5 — Controlled + uncontrolled prop pattern (use `useControllable` from @weiui/headless)

```tsx
import { useControllable } from "@weiui/headless";

const [value, setValue] = useControllable({
  value: props.value,
  defaultValue: props.defaultValue ?? initialDefault,
  onChange: props.onChange,
});
```

### A.6 — CSS rule: only `wui-*` classes

Every component emits `wui-*` classes. CSS lives in `packages/css/src/elements/<name>.css`. Every new class MUST be declared in the CSS layer. See `docs/superpowers/plans/2026-04-17-component-verification-plan.md` Section 2.3.

### A.7 — Audit matrix flip protocol

After shipping any P1, open `docs/audit/component-parity.md`, find the component's row(s) matching the shipped feature, change:
- `WeiUI has` cell: `❌` → `✅`
- `Priority` cell: `**P1**` → `✅ shipped`
- Update Executive Summary table (decrement that wave's P1 count, decrement total).

Commit: `docs(audit): mark <Component> <feature> shipped`.

---

## Wave B — Overlay family (7 components)

Full detailed plan at **`docs/superpowers/plans/2026-04-18-phase-6a-overlay-p1.md`**. Execute that plan for Wave B. Summary of commits produced:

- `feat(react): Menu offset prop + CheckboxItem/RadioItem/Label/shortcut (P1)`
- `feat(react): Popover arrow + collisionPadding + modal + focus callbacks (P1)`
- `feat(react): TooltipProvider + side/align/offset + Escape close (P1)`
- `feat(react): Dialog modal prop + nested stacking + onInteractOutside/onEscapeKeyDown (P1)`
- `feat(react): Drawer onInteractOutside + onEscapeKeyDown (P1)`
- `feat(react): Toast promise API + pause-on-hover + stacking expand-on-hover (P1)`
- `feat(react): CommandPalette recent items + shortcuts + emptyState node (P1)`
- `docs(audit): mark Phase 6a overlay P1s shipped`

Run the verification gate:
```bash
pnpm build && pnpm test && pnpm --filter @weiui/docs build
```

---

## Wave C — Inputs + Date/Time (12 components)

### Task C.1 — Input: clearable + prefix/suffix + char count + Field auto-wiring

**Files:**
- Modify: `packages/react/src/components/Input/Input.tsx`
- Modify: `packages/css/src/elements/input.css` (append)
- Test: `packages/react/src/components/Input/__tests__/Input.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
describe("Input P1", () => {
  it("clearable renders clear button when value is non-empty", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input clearable defaultValue="hello" onChange={onChange} aria-label="name" />);
    const clear = screen.getByLabelText("Clear input");
    await user.click(clear);
    expect(onChange).toHaveBeenCalled();
  });

  it("prefix and suffix text slots render", () => {
    render(<Input prefix="$" suffix=".00" aria-label="amount" />);
    expect(screen.getByText("$")).toBeInTheDocument();
    expect(screen.getByText(".00")).toBeInTheDocument();
  });

  it("showCount shows character counter against maxLength", () => {
    render(<Input showCount maxLength={10} defaultValue="hi" aria-label="bio" />);
    expect(screen.getByText("2 / 10")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test, confirm fail**

Run: `pnpm --filter @weiui/react test -- Input`

- [ ] **Step 3: Implement**

Add to `InputProps`:

```ts
clearable?: boolean;
prefix?: ReactNode;
suffix?: ReactNode;
showCount?: boolean;
```

Inside the component, after existing size/addon handling:

```tsx
const [internalValue, setInternalValue] = useControllable({
  value: props.value as string | undefined,
  defaultValue: (props.defaultValue as string | undefined) ?? "",
  onChange: (v) => {
    // trigger onChange with a synthetic event-compat for consumers
    const target = ref && "current" in (ref as any) && (ref as any).current;
    if (target) {
      target.value = v;
    }
  },
});

const showClear = clearable && typeof internalValue === "string" && internalValue.length > 0;

// Wrapper becomes the group if any of prefix/suffix/clearable/showCount is set
const needsGroup = Boolean(prefix || suffix || clearable || showCount || hasAddons);
```

Render `<span className="wui-input-group__prefix">{prefix}</span>` at start when prefix is set; clear button as `<button aria-label="Clear input" className="wui-input-group__clear" type="button" onClick={() => setInternalValue("")}>×</button>` when showClear; `<span className="wui-input-group__suffix">{suffix}</span>`; `<span className="wui-input-group__count">{internalValue?.length ?? 0} / {maxLength}</span>` when showCount.

Append CSS:

```css
@layer wui-elements {
  .wui-input-group__prefix,
  .wui-input-group__suffix {
    display: inline-flex; align-items: center;
    padding-inline: var(--wui-spacing-3);
    color: var(--wui-color-muted-foreground);
    font-size: var(--wui-font-size-sm);
    pointer-events: none;
    flex: 0 0 auto;
  }
  .wui-input-group__clear {
    inline-size: 24px; block-size: 24px;
    display: inline-flex; align-items: center; justify-content: center;
    background: transparent; border: none; cursor: pointer;
    color: var(--wui-color-muted-foreground);
    border-radius: var(--wui-shape-radius-base);
    margin-inline-end: var(--wui-spacing-1);
  }
  .wui-input-group__clear:hover { color: var(--wui-color-foreground); background-color: var(--wui-color-muted); }
  .wui-input-group__count {
    padding-inline: var(--wui-spacing-3);
    color: var(--wui-color-muted-foreground);
    font-size: var(--wui-font-size-xs);
    font-variant-numeric: tabular-nums;
  }
}
```

- [ ] **Step 4: Run tests, pass**
- [ ] **Step 5: Commit** `feat(react): Input clearable + prefix/suffix + showCount (P1)`

### Task C.2 — Textarea: autosize + char counter + Field wiring

**Files:** `Textarea.tsx`, `textarea`... (Textarea styling is in `input.css`).

- [ ] **Step 1: Failing test**

```tsx
it("autosize grows with content", () => {
  const { rerender, container } = render(<Textarea autosize defaultValue="" aria-label="notes" />);
  const ta = container.querySelector("textarea")!;
  // initial: one row
  expect(ta.rows).toBeLessThan(5);
  // set long content
  ta.value = "line1\nline2\nline3\nline4\nline5\nline6";
  ta.dispatchEvent(new Event("input", { bubbles: true }));
  // Autosize uses style.height; assert it's set after input
  expect(ta.style.height).not.toBe("");
});

it("showCount renders counter", () => {
  render(<Textarea showCount maxLength={140} defaultValue="hello" aria-label="t" />);
  expect(screen.getByText("5 / 140")).toBeInTheDocument();
});
```

- [ ] **Step 2-5: Implement**

Add `autosize?: boolean`, `minRows?: number`, `maxRows?: number`, `showCount?: boolean`. On input, if autosize, reset `style.height = "auto"` then set to `scrollHeight`. Clamp between minRows×line-height and maxRows×line-height.

Commit: `feat(react): Textarea autosize + showCount (P1)`

### Task C.3 — InputNumber: PageUp/PageDown + Home/End + prefix/suffix

**Files:** `InputNumber.tsx`

- [ ] Steps: add keydown cases for `PageUp` (+step×10), `PageDown` (-step×10), `Home` (→min), `End` (→max). Add `prefix`/`suffix` by reusing Input's pattern via composition.

Commit: `feat(react): InputNumber PageUp/PageDown + Home/End + prefix/suffix (P1)`

### Task C.4 — InputOTP: pattern constraint + group separator + onComplete

**Files:** `InputOTP.tsx`

- [ ] Add `pattern?: "numeric" | "alphanumeric" | RegExp` (default `"numeric"`). Add `groups?: number[]` (e.g., `[3,3]` for 3-3 split). Add `onComplete?: (value: string) => void` — fires when all slots filled.

Commit: `feat(react): InputOTP pattern + groups + onComplete (P1)`

### Task C.5 — AutoComplete: controlled open/input + custom filter + empty slot + render-prop + clearable

**Files:** `AutoComplete.tsx`

- [ ] Add `open?: boolean; onOpenChange?: (o: boolean) => void; inputValue?: string; onInputChange?: (v: string) => void; filter?: (input: string, option: {value,label}) => boolean; emptyState?: ReactNode; renderOption?: (option) => ReactNode; allowsCustomValue?: boolean; clearable?: boolean`. Thread through `useControllable`.

Commit: `feat(react): AutoComplete controlled + filter + empty + renderOption + clearable (P1)`

### Task C.6 — MultiSelect: max + creatable + select-all + grouped + backspace

**Files:** `MultiSelect.tsx`

- [ ] Add `max?: number; creatable?: boolean; onCreate?: (value: string) => void; selectAll?: boolean; grouped?: boolean` (look at option's `group` field). On Backspace in search when search is empty, remove last tag.

Commit: `feat(react): MultiSelect max + creatable + selectAll + grouped + backspace (P1)`

### Task C.7 — FileUpload: per-file progress + thumbnails + maxFiles + controlled

**Files:** `FileUpload.tsx`

- [ ] Add `progress?: Record<string, number>` (file name → 0–100). Thumbnails for image types via URL.createObjectURL + cleanup on unmount. `maxFiles?: number` rejects extra files. `files?: File[]; onFilesChange?: (files: File[]) => void` for controlled mode.

Commit: `feat(react): FileUpload progress + thumbnails + maxFiles + controlled (P1)`

### Task C.8 — Slider: vertical + marks + tooltip-on-drag + PageUp/PageDown + aria-valuetext + name

**Files:** `Slider.tsx`, `slider.css`

- [ ] Add `orientation?: "horizontal" | "vertical"`. Add `marks?: Array<{value, label?}>` (render as tick marks with optional labels below/beside). Verify tooltip-on-drag works (shipped in round 11). Add PageUp/PageDown = ±step×10. Add `aria-valuetext` (use `formatTooltip` if set). Add `name?: string` + hidden `<input type="hidden" name={name} value={value} />` for form submit.

CSS: `.wui-slider--vertical { writing-mode: vertical-rl; }` (or use block axis properties), `.wui-slider__mark`, `.wui-slider__mark-label`.

Commit: `feat(react): Slider vertical + marks + PageUp/PageDown + aria-valuetext + name (P1)`

### Task C.9 — Rating: custom icon + clear-on-reclick

**Files:** `Rating.tsx`

- [ ] Add `icon?: ReactNode` (default star). Add `allowClear?: boolean` — clicking the currently-active rating again clears it (value → 0).

Commit: `feat(react): Rating custom icon + allowClear (P1)`

### Task C.10 — DatePicker: typed input + range mode + presets + clearable + year/month dropdowns + name

**Files:** `DatePicker.tsx`, `date-picker.css`

- [ ] Add typed segmented input variant (MM/DD/YYYY with auto-advance between segments). Add `mode?: "single" | "range"`. In range mode, `value: Date | [Date, Date] | undefined` and calendar allows selecting start then end. Add `presets?: Array<{label, value: Date | [Date, Date]}>` rendered as clickable chips. `clearable` button. Year + month dropdowns in calendar header. `name?: string` for form.

Commit: `feat(react): DatePicker typed input + range + presets + clearable + dropdowns (P1)`

### Task C.11 — Calendar: year/month dropdowns + range + isDateDisabled + custom day render + RTL + focus on mount

**Files:** `Calendar.tsx`

- [ ] Same-wave additions as DatePicker's calendar. Plus `renderDay?: (date: Date, info: { isToday; isSelected; ... }) => ReactNode`. Plus RTL sanity-check (logical properties already; verify directional arrows flip).

Commit: `feat(react): Calendar year/month dropdowns + range + renderDay + RTL (P1)`

### Task C.12 — ColorPicker: alpha + format toggle + inline variant + live-region

**Files:** `ColorPicker.tsx`, `color-picker.css`

- [ ] Add alpha slider below SV pad + transparency checkerboard backdrop on preview swatch. Add format toggle (hex/rgb/hsl/oklch) rendered as segmented-control. Add `variant?: "popover" | "inline"` — inline renders the full picker in place. When color changes, call `announce(\`Color changed to ${hex}\`)` via `@weiui/headless`.

Commit: `feat(react): ColorPicker alpha + format toggle + inline variant + live-region (P1)`

### Wave C verification

```bash
pnpm build && pnpm test && pnpm --filter @weiui/docs build
# Audit flip:
```

Update `docs/audit/component-parity.md` for each shipped feature. Commit `docs(audit): mark Wave C P1s shipped`.

---

## Wave D — Data + Navigation (14 components)

### Task D.1 — DataTable: column resize/pin/visibility/filter + row expansion + virtualization + sticky header + keyboard grid + empty state + row click + dense size

**Files:**
- Modify: `packages/react/src/components/DataTable/DataTable.tsx`
- Modify: `packages/react/src/data-table-entry.ts` (expose new types)
- Modify: `packages/css/src/elements/data-table.css`
- Test: `packages/react/src/components/DataTable/__tests__/DataTable.test.tsx`
- Dep: add `@tanstack/react-virtual` to `packages/react/package.json`

- [ ] **Step 1: Install dep**

```bash
pnpm --filter @weiui/react add @tanstack/react-virtual
```

Commit this as its own commit: `build(react): add @tanstack/react-virtual for DataTable virtualization`.

- [ ] **Step 2: Write tests** covering each feature:

```tsx
it("enableColumnResizing produces drag handles", () => {
  render(<DataTable columns={cols} data={data} enableColumnResizing />);
  expect(document.querySelectorAll(".wui-data-table__resize-handle").length).toBeGreaterThan(0);
});

it("enableColumnPinning applies sticky CSS", () => {
  const pinned = cols.map((c, i) => i === 0 ? { ...c, meta: { pinned: "left" } } : c);
  render(<DataTable columns={pinned} data={data} enableColumnPinning />);
  const firstCell = document.querySelector('[data-pinned="left"]');
  expect(firstCell).toBeInTheDocument();
});

it("empty state renders when data is empty", () => {
  render(<DataTable columns={cols} data={[]} emptyState={<div>No rows</div>} />);
  expect(screen.getByText("No rows")).toBeInTheDocument();
});

it("onRowClick fires when row clicked", async () => {
  const onRowClick = vi.fn();
  const user = userEvent.setup();
  render(<DataTable columns={cols} data={data} onRowClick={onRowClick} />);
  await user.click(screen.getAllByRole("row")[1]);
  expect(onRowClick).toHaveBeenCalled();
});

it("size='dense' applies modifier class", () => {
  const { container } = render(<DataTable columns={cols} data={data} size="dense" />);
  expect(container.querySelector(".wui-data-table--dense")).toBeInTheDocument();
});
```

- [ ] **Step 3: Implement — extend DataTableProps**

```ts
export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  // Existing: searchable, pageSize, rowSelection, loading, serverSide...
  enableColumnResizing?: boolean;
  enableColumnPinning?: boolean;
  enableColumnVisibility?: boolean;
  enableRowExpansion?: boolean;
  virtualize?: boolean;
  stickyHeader?: boolean;
  size?: "dense" | "comfortable";
  emptyState?: ReactNode;
  onRowClick?: (row: TData) => void;
  renderExpandedRow?: (row: TData) => ReactNode;
}
```

Wire to TanStack Table's own feature flags: `enableColumnResizing`, `columnPinning` state, `columnVisibility` state, `getExpandedRowModel()`. For virtualization, conditionally use `useVirtualizer` from `@tanstack/react-virtual` when `virtualize` is true.

CSS additions: `.wui-data-table__resize-handle`, `[data-pinned="left"]`, `[data-pinned="right"]`, `.wui-data-table--dense`, sticky-thead rule.

- [ ] **Step 4: Run tests, commit**

Commit: `feat(react): DataTable enterprise features — resize/pin/filter/visibility/virtualize/empty/click/dense (P1)`

### Task D.2 — TreeView: multi-select + checkboxes + lazy-load + typeahead + icon + expand-all

**Files:** `TreeView.tsx`, `tree-view.css`

- [ ] Add `multiSelect?: boolean; checkboxes?: boolean; onLoadChildren?: (node) => Promise<TreeNode[]>; typeahead?: boolean; expandAll?: boolean; icon?: (node) => ReactNode`. For typeahead: first-letter search across visible nodes. Lazy: when expanding a node with `hasChildren` but empty `children`, call `onLoadChildren`.

Commit: `feat(react): TreeView multi-select + checkboxes + lazy + typeahead + icon (P1)`

### Task D.3 — Pagination: first/last/jump input/total display/page-size/size variants

**Files:** `Pagination.tsx`, `pagination.css`

- [ ] Add `showFirstLast?: boolean; showJumpInput?: boolean; showTotal?: boolean; total?: number; pageSize?: number; pageSizeOptions?: number[]; onPageSizeChange?: (n) => void; size?: "sm" | "md" | "lg"`.

Commit: `feat(react): Pagination first/last + jumpInput + total + pageSize + size (P1)`

### Task D.4 — Tabs: activationMode + loop + vertical refinement

**Files:** `Tabs.tsx` (React wrapper) + `packages/headless/src/components/Tabs/Tabs.tsx`

- [ ] Add `activationMode?: "automatic" | "manual"` prop. In manual mode, arrow keys change focus only; Enter/Space selects. Add `loop?: boolean` — wrap around at ends.

Commit: `feat(react,headless): Tabs activationMode + loop nav (P1)`

### Task D.5 — Breadcrumb: BreadcrumbEllipsis + truncation

**Files:** `Breadcrumb.tsx`, `breadcrumb.css`

- [ ] Add `<BreadcrumbEllipsis>` sub-component rendering `…` and optionally opening a menu of collapsed items. Add `maxItems?: number` prop on `<Breadcrumb>` — when items > max, collapse middle into ellipsis.

Commit: `feat(react): Breadcrumb ellipsis truncation for long paths (P1)`

### Task D.6 — Sidebar: SidebarTrigger + mobile off-canvas + groups + nested items + tooltip-on-collapsed

**Files:** `Sidebar.tsx`, `sidebar.css`

- [ ] Add `<SidebarTrigger>` (wraps hamburger button). Add `<SidebarGroup title>` separator/group container. Add `<SidebarItem>` `items?: SidebarItemData[]` for nesting. When sidebar is collapsed to icons, wrap each item in a `<Tooltip>` showing the full label. Mobile: when viewport < 768px, render inside `<Drawer side="left">` instead of inline.

Commit: `feat(react): Sidebar Trigger + mobile drawer + groups + nested + tooltips-on-collapsed (P1)`

### Task D.7 — AppBar: sticky + color variant + responsive collapse

**Files:** `AppBar.tsx`, `app-bar.css`

- [ ] Add `sticky?: boolean`, `fixed?: boolean`, `color?: "default" | "primary" | "surface"`, `<AppBarCollapse>` that hides below a breakpoint.

Commit: `feat(react): AppBar sticky/fixed + color variant + responsive collapse (P1)`

### Task D.8 — BottomNav: showLabels + badge + controlled value

**Files:** `BottomNav.tsx`, `bottom-nav.css`

- [ ] Add `showLabels?: "always" | "never" | "selected"` (default `always`). Add `badge?: ReactNode` on each item. Support controlled `value`/`onValueChange`.

Commit: `feat(react): BottomNav showLabels + badge + controlled value (P1)`

### Task D.9 — Accordion: disabled item

**Files:** `Accordion.tsx`

- [ ] Add `disabled?: boolean` on `<AccordionItem>`. When disabled: not focusable, trigger click is no-op, visual dimmed.

Commit: `feat(react): Accordion disabled item (P1)`

### Task D.10 — Stepper: clickable steps + error state + progress animation + custom icons

**Files:** `Stepper.tsx`, `stepper.css`

- [ ] Add `clickable?: boolean` — steps become buttons. Add `error?: boolean` per-step. Progress line animates on active change (motion-safe). `icon?: ReactNode` per step.

Commit: `feat(react): Stepper clickable + error state + animated line + custom icons (P1)`

### Task D.11 — Timeline: alternate layout + custom dot/icon + color per item

**Files:** `Timeline.tsx`, `timeline.css`

- [ ] Add `orientation?: "left" | "right" | "alternate"` on `<Timeline>`. Add `icon?: ReactNode; color?: "primary" | "success" | ...` on `<TimelineItem>`.

Commit: `feat(react): Timeline alternate + custom icons + color per item (P1)`

### Task D.12 — Transfer: search + select-all + move-all + keyboard

**Files:** `Transfer.tsx`, `transfer.css`

- [ ] Add search input per pane. Add "Select all" checkbox per pane. Add "Move all" buttons. Keyboard: arrow nav within pane, Space toggles selection, Enter moves to other pane.

Commit: `feat(react): Transfer per-pane search + selectAll + moveAll + keyboard (P1)`

### Task D.13 — Menu submenu (P2 from audit, but worth pairing with overlay wave)

Defer. Not in P1.

### Task D.14 — Link prop polish

**Files:** `Link.tsx`

- [ ] Add `external?: boolean` auto-detection (href starts with http + different host) or explicit prop. Add external icon when external. Add `underline?: "always" | "hover" | "none"` (default `hover`).

Commit: `feat(react): Link external + underline variants (P1)`

### Wave D verification

```bash
pnpm build && pnpm test && pnpm --filter @weiui/docs build
```

Audit matrix flip commit: `docs(audit): mark Wave D data/nav P1s shipped`.

---

## Wave E — Display + Form primitives + Layout/Typography (22 components)

### Task E.1 — Button: asChild + iconOnly + fullWidth

**Files:** `Button.tsx`, `button.css`, `variants/button.ts`

- [ ] `asChild?: boolean` — when true, clone the single child and forward props (router-link integration). `iconOnly?: boolean` — use square padding + require `aria-label`. `fullWidth?: boolean` — `inline-size: 100%`.

Commit: `feat(react): Button asChild + iconOnly + fullWidth (P1)`

### Task E.2 — ButtonGroup: orientation + attached/spaced + context propagation

**Files:** `ButtonGroup.tsx`, `button-group.css`

- [ ] `orientation?: "horizontal" | "vertical"`. `variant?: "attached" | "spaced"` (default attached). A `ButtonGroupContext` propagates `size` + `variant` to child buttons that don't specify their own.

Commit: `feat(react): ButtonGroup orientation + variant + context propagation (P1)`

### Task E.3 — Checkbox: error state + description slot

**Files:** `Checkbox.tsx`, `checkbox.css`

- [ ] `error?: boolean | string`. `description?: ReactNode`. Already has size. Field integration via FieldContext (existing).

Commit: `feat(react): Checkbox error + description slot (P1)`

### Task E.4 — RadioGroup: orientation + description per item

**Files:** `RadioGroup.tsx`, `radio.css`

- [ ] `orientation?: "horizontal" | "vertical"`. `<Radio>` gets `description?: ReactNode` slot.

Commit: `feat(react): RadioGroup orientation + per-item description (P1)`

### Task E.5 — Switch: on/off label slots

**Files:** `Switch.tsx`, `switch.css`

- [ ] `onLabel?: ReactNode; offLabel?: ReactNode` rendered inside the track.

Commit: `feat(react): Switch on/off label slots (P1)`

### Task E.6 — ToggleGroup: orientation

**Files:** `ToggleGroup.tsx`

- [ ] `orientation?: "horizontal" | "vertical"` — applies roving on the right axis.

Commit: `feat(react): ToggleGroup orientation (P1)`

### Task E.7 — Field: success + validating states + disabled propagation

**Files:** `Field.tsx`

- [ ] `success?: boolean | string; validating?: boolean`. When `disabled`, propagate to child input via context.

Commit: `feat(react): Field success + validating + disabled propagation (P1)`

### Task E.8 — Badge: size variant

**Files:** `Badge.tsx`, `badge.css`

- [ ] `size?: "sm" | "md" | "lg"`.

Commit: `feat(react): Badge size variant (P1)`

### Task E.9 — Chip: icon + clickable + size + outlined + disabled

**Files:** `Chip.tsx`, `chip.css`

- [ ] `icon?: ReactNode`, `onClick` makes it behave as button, `size`, `variant="outlined"`, `disabled`.

Commit: `feat(react): Chip icon + clickable + size + outlined + disabled (P1)`

### Task E.10 — Avatar: onError fallback + initials gen + AvatarGroup + color-from-name

**Files:** `Avatar.tsx`, `avatar.css`

- [ ] `name?: string` → auto-generate initials when no image. `colorFromName?: boolean` — deterministic hash of name → one of the status tokens. Add `<AvatarGroup max={5}>` that overlaps children and shows `+N` overflow.

Commit: `feat(react): Avatar auto-initials + AvatarGroup + color-from-name (P1)`

### Task E.11 — Alert: icon per variant + dismiss + action slot

**Files:** `Alert.tsx`, `alert.css`

- [ ] Default icons per variant (ℹ ✓ ⚠ ✕ from @weiui/icons). `dismissible?: boolean` renders close button. `action?: ReactNode` slot.

Commit: `feat(react): Alert variant icons + dismissible + action slot (P1)`

### Task E.12 — Card: elevated/outlined variant + asChild

**Files:** `Card.tsx`, `card.css`

- [ ] `variant?: "elevated" | "outlined" | "filled"`. `asChild?: boolean` (same pattern as Button).

Commit: `feat(react): Card variant + asChild (P1)`

### Task E.13 — Spinner: color variant

**Files:** `Spinner.tsx`, `spinner.css`

- [ ] `color?: "default" | "primary" | "destructive" | ...`.

Commit: `feat(react): Spinner color variant (P1)`

### Task E.14 — ProgressBar: label overlay

**Files:** `ProgressBar.tsx`, `progress.css`

- [ ] `showLabel?: boolean` — render percent text centered over the bar.

Commit: `feat(react): ProgressBar label overlay (P1)`

### Task E.15 — EmptyState: size + illustration slot + orientation

**Files:** `EmptyState.tsx`, `empty-state.css`

- [ ] `size?: "sm" | "md" | "lg"`. `illustration?: ReactNode` slot above the title. `orientation?: "vertical" | "horizontal"`.

Commit: `feat(react): EmptyState size + illustration + orientation (P1)`

### Task E.16 — Skeleton: visible + width/height + count

**Files:** `Skeleton.tsx`, `skeleton.css`

- [ ] `visible?: boolean` (when false, render children instead). `width?: string | number; height?: string | number`. `count?: number` — repeat element N times.

Commit: `feat(react): Skeleton visible + width/height + count (P1)`

### Task E.17 — Label: size + disabled

**Files:** `Label.tsx`, `label.css`

- [ ] `size?: "sm" | "md" | "lg"`. `disabled?: boolean` dims it.

Commit: `feat(react): Label size + disabled (P1)`

### Tasks E.18-22 — Layout/typography polish (no feature additions per audit)

Verify each renders correctly. No P1 additions. Smoke-test pass.

### Wave E verification

`pnpm build && pnpm test && pnpm --filter @weiui/docs build`. Audit flip commit.

---

## Wave F — Library completeness + Docs rewrites + Verification

### Task F.1 — @weiui/icons expansion (15 → 60)

**Files:**
- Create 45 new SVGs under `packages/icons/svg/`
- Run `pnpm --filter @weiui/icons generate` to regenerate `src/icons/*.tsx` + `src/index.ts`

- [ ] Step 1: Author 45 SVGs. Use Feather-style stroke (`fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`) at 24×24 viewBox.
- [ ] Step 2: Run generator.
- [ ] Step 3: Verify: `grep -c "^export" packages/icons/src/index.ts` returns ≥60.
- [ ] Step 4: Update `packages/icons/README.md` with new list.

Commit: `feat(icons): expand from 15 to 60 icons`

Icon list (45 to add):
Download, Upload, Plus, Minus, Share, Heart, Star, Eye, EyeOff, Lock, Unlock, Calendar, Clock, User, Users, Mail, Phone, Globe, Filter, Grid, List, Refresh, ExternalLink, Link, Paperclip, Tag, Bookmark, Flag, Archive, AlertTriangle, CheckCircle, XCircle, HelpCircle, MoreHorizontal, MoreVertical, Zap, Bell, BellOff, Sun, Moon, Mic, MicOff, Play, Pause, Volume2, VolumeX.

### Task F.2 — @weiui/cli `add <component>` command

**Files:**
- Create: `packages/cli/src/commands/add.ts`
- Modify: `packages/cli/src/index.ts` (register command)
- Test: `packages/cli/src/__tests__/add.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { runAdd } from "../commands/add";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("weiui add <component>", () => {
  it("scaffolds Button into the target project", async () => {
    const dir = mkdtempSync(join(tmpdir(), "wui-add-"));
    await runAdd("Button", { cwd: dir, projectRoot: process.cwd() });
    expect(existsSync(join(dir, "src/components/ui/Button.tsx"))).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });
});
```

- [ ] **Step 2: Implement**

```ts
// packages/cli/src/commands/add.ts
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

export interface AddOptions {
  cwd: string;           // consumer's working dir
  projectRoot: string;   // where @weiui is installed (resolve node_modules)
}

export async function runAdd(componentName: string, opts: AddOptions): Promise<void> {
  // Locate the component source
  const sourcePath = join(
    opts.projectRoot,
    "node_modules/@weiui/react/dist",
    `${componentName}.d.ts`
  );
  // For v0 we copy from the monorepo's packages/react source if we detect monorepo mode:
  const monorepoSrc = join(
    opts.projectRoot,
    "packages/react/src/components",
    componentName,
    `${componentName}.tsx`,
  );
  const sourceFile = existsSync(monorepoSrc) ? monorepoSrc : sourcePath;
  if (!existsSync(sourceFile)) {
    throw new Error(`Component "${componentName}" not found.`);
  }
  const source = readFileSync(sourceFile, "utf-8");
  const targetDir = join(opts.cwd, "src/components/ui");
  mkdirSync(targetDir, { recursive: true });
  const targetFile = join(targetDir, `${componentName}.tsx`);
  // Rewrite imports from "@weiui/..." to relative paths (best-effort for simple case)
  const rewritten = source
    .replace(/from\s+["']@weiui\/headless["']/g, 'from "@weiui/headless"')
    .replace(/from\s+["']@weiui\/react["']/g, 'from "@weiui/react"');
  writeFileSync(targetFile, rewritten);
  // eslint-disable-next-line no-console
  console.log(`✓ Added ${componentName} → ${targetFile}`);
  console.log(`  Make sure @weiui/headless and @weiui/css are installed.`);
}
```

- [ ] **Step 3: Register in CLI index**

```ts
// packages/cli/src/index.ts — add to the commander program:
program
  .command("add <component>")
  .description("Scaffold a WeiUI component into your project")
  .action(async (componentName: string) => {
    const { runAdd } = await import("./commands/add.js");
    await runAdd(componentName, { cwd: process.cwd(), projectRoot: process.cwd() });
  });
```

- [ ] **Step 4: Test pass + commit**

Commit: `feat(cli): add <component> scaffolding command`

### Task F.3 — Composer palette expansion (9 → 65)

**Files:** `apps/docs/src/app/composer/lib/component-tree.ts`

- [ ] For each of 56 components not yet in the palette, add an entry: `{ name: "ComponentName", label: "Human Label", defaultProps: {...}, jsxTemplate: "...", htmlTemplate: "..." }`.

Commit: `feat(docs): expand Composer palette to all 65 components`

### Task F.4 — npm metadata on all 7 packages

**Files:** `packages/*/package.json`

- [ ] Add to each: `author`, `description`, `keywords`, `repository` (`https://github.com/xiaooye/weiui`), `homepage` (`https://weiui.dev` or the docs URL), `license` (`MIT`), `bugs` (`https://github.com/xiaooye/weiui/issues`).

Commit: `build: add npm metadata (author/keywords/repo/homepage) to all packages`

### Task F.5 — CHANGELOG.md per package

**Files:** `packages/*/CHANGELOG.md`

- [ ] Create with initial `# Changelog\n\n## 0.0.1\n\n- Initial release with {feature summary}`.

Commit: `docs: scaffold CHANGELOG.md per package`

### Task F.6 — Grouped doc rewrite: data-display (1.1 → 4.0/5)

**File:** `apps/docs/src/app/docs/components/data-display/page.mdx` (current 83 lines, target 250 lines)

- [ ] Rewrite with:
  - H1 + 2-sentence intro
  - `## Card` section: CardHeader/Content/Footer breakdown, 3 real examples (product card, user card, article card) with demos, props table, a11y
  - `## Badge`: variants, sizes, dot indicator, stacking with icon pattern, props, a11y
  - `## Avatar`: initials, image fallback chain, group, color-from-name, sizes, props, a11y
  - `## Skeleton`: card-skeleton, table-skeleton, text-skeleton matching real layouts, props, a11y
  - `## When to use which` decision mini-guide

Commit: `docs(docs): rewrite /data-display to 4/5 quality`

### Task F.7 — Grouped doc rewrite: feedback (1.5 → 4.0/5)

Target 200 lines. Alert dismissible + icon-per-variant + action, Spinner inline vs overlay, EmptyState illustration + size + orientation. Props + a11y per.

Commit: `docs(docs): rewrite /feedback to 4/5 quality`

### Task F.8 — Grouped doc rewrite: stepper-timeline (1.4 → 4.0/5)

Target 200 lines. Stepper: branching + error-on-step + editable-resume + clickable. Timeline: alternate + click-to-expand + relative dates. Plus "Stepper vs Tabs for wizard" decision.

Commit: `docs(docs): rewrite /stepper-timeline to 4/5 quality`

### Task F.9 — Grouped doc rewrite: sidebar-drawer (1.4 → 4.0/5)

Target 200 lines. Sidebar: nested, mobile sheet, group separators, tooltip-on-collapsed. Drawer: 4 sides, nested drawers. Plus full dashboard template combining both.

Commit: `docs(docs): rewrite /sidebar-drawer to 4/5 quality`

### Task F.10 — Grouped doc expand: input (99 → 200 lines)

Size variants, addon examples, password variant, search variant, disabled/readonly/invalid.

Commit: `docs(docs): expand /input page with sizes/addons/variants`

### Task F.11 — Grouped doc expand: navigation (100 → 200 lines)

Tab orientation, Breadcrumb ellipsis, Menu with positioning, responsive patterns, SPA-router integration.

Commit: `docs(docs): expand /navigation with new features + SPA-router integration`

### Task F.12 — Grouped doc expand: toast-chip-progress (200 → 250)

Toast promise pattern, stacking demo, Chip icon/variants, ProgressBar label overlay.

Commit: `docs(docs): expand /toast-chip-progress with promise toast + polish`

### Task F.13 — Dissolve the orphan wave2-3 page

Move: Pagination → /data; Transfer → /data; Splitter → /layout; AppBar → /navigation; BottomNav → /navigation; SpeedDial → /navigation; ToggleGroup → /form; ButtonGroup → /form; Accordion stays at /accordion.

- [ ] Delete `apps/docs/src/app/docs/components/wave2-3/page.mdx`
- [ ] Append migrated content to the target pages (each component as its own section).
- [ ] Remove the wave2-3 entry from `apps/docs/src/lib/site-config.ts` sidebar.

Commit: `docs(docs): dissolve wave2-3 orphan page; redistribute to themed groups`

### Task F.14 — Decision-tree pages

Create:
- `apps/docs/src/app/docs/patterns/form-decisions/page.mdx` — Checkbox vs Switch vs RadioGroup vs Select
- `apps/docs/src/app/docs/patterns/overlay-decisions/page.mdx` — Tooltip vs Popover vs Menu vs Dialog
- `apps/docs/src/app/docs/patterns/layout-decisions/page.mdx` — Container vs Grid vs Stack

Each ≥ 150 lines with side-by-side comparison tables + code examples.

Update `apps/docs/src/lib/site-config.ts` — add "Patterns" sidebar group with these three entries.

Commit: `docs(docs): add form/overlay/layout decision-tree pages`

### Task F.15 — Full-form example

Create `apps/docs/src/app/docs/patterns/forms/page.mdx` (~300 lines). Multi-field signup form with Field wrappers, inline validation, async validation (email-availability mock), form-level error handling, submit-with-toast feedback. Include a react-hook-form integration recipe.

Add to Patterns sidebar group.

Commit: `docs(docs): add full-form example with validation + react-hook-form recipe`

### Task F.16 — Layout recipes gallery

Create `apps/docs/src/app/docs/patterns/layouts/page.mdx` (~400 lines). 5 templates: Sidebar + Main; Holy Grail (header + footer + 2 sidebars); Hero + Grid cards; Dashboard; Auth flow.

Add to Patterns sidebar group.

Commit: `docs(docs): add layout recipes gallery`

### Task F.17 — Migration guide with real content

Rewrite `apps/docs/src/app/docs/migration/page.mdx`:
- "Migrating from shadcn/ui to WeiUI"
- "Migrating from MUI v5 to WeiUI"
- "Migrating from Radix Primitives to WeiUI"

Each section: what changes, component name map, behavioral differences, a sample migrated component, common pitfalls.

Commit: `docs(docs): rewrite migration guide with shadcn/MUI/Radix walkthroughs`

### Task F.18 — Accessibility testing checklist

Expand `apps/docs/src/app/docs/accessibility/page.mdx`:
- Per-component section: "Before shipping your Dialog, verify: focus trap, Escape, role=dialog, backdrop; your Menu: arrow nav, typeahead, Home/End, role=menu/menuitem".

Commit: `docs(docs): add per-component a11y testing checklist`

### Task F.19 — Final verification run

- [ ] Re-run verification plan (`docs/superpowers/plans/2026-04-17-component-verification-plan.md`) Sections 2.1 through 2.8.
- [ ] Produce report at `docs/superpowers/diagnostics/2026-04-18-final-verification.md` using the Section 6 template.
- [ ] Update `docs/superpowers/plans/2026-04-16-completion-summary.md` with new commit count + P1-closed count + docs quality score.

Commit: `docs: final verification after top-of-class pass; all P1s shipped`

### Task F.20 — Push

```bash
pnpm build && pnpm test && pnpm --filter @weiui/tokens validate && pnpm --filter @weiui/docs build
git push origin main
```

---

## Wave G — Docs dogfooding + state-of-art UI polish

**Guiding principle:** A design system's docs should be built *with* the design system. Every pixel of the docs site that currently uses raw HTML + `wui-*` classes, inline styles, or custom chrome components must be rewritten to consume `@weiui/react` components. This proves the library is complete — if docs can't be built with it, something's missing.

**State-of-art polish:** In the same pass, upgrade visual quality — refined motion curves on scroll, ambient gradient backdrops that respond to theme, subtle micro-interactions, optimistic visual hierarchy, refined typography (fluid type scale with `clamp`), polished chrome transitions.

### Task G.1 — Header rewrite using WeiUI components

**File:** `apps/docs/src/components/chrome/Header.tsx`

Current: raw `<header>` + `<nav>` + `<button>` with hardcoded `wui-docs-header__*` classes + inline styles.

Rewrite to use:
- `<AppBar sticky color="surface">` as the outer container
- `<Button variant="ghost">` for each nav link (with `asChild` wrapping `<Link>`)
- `<Tooltip>` around each icon-only button (theme toggle, GitHub link, mobile menu)
- `<Badge variant="soft" size="sm">` for the version display next to the logo
- `<Divider orientation="vertical">` between nav groups
- `<Kbd>` inside the search trigger for the ⌘K hint

Delete the dedicated `.wui-docs-header__*` classes from `apps/docs/src/styles/chrome.css` (keep only tokens used).

Commit: `refactor(docs): rewrite Header using AppBar + Button + Tooltip + Badge`

### Task G.2 — Sidebar rewrite using the real Sidebar component

**File:** `apps/docs/src/components/chrome/Sidebar.tsx` — delete the custom implementation. Replace with a thin wrapper that composes the `<Sidebar>` / `<SidebarGroup>` / `<SidebarItem>` components shipped from `@weiui/react` (Task D.6 added groups + nested items).

Commit: `refactor(docs): Docs Sidebar uses @weiui/react Sidebar component`

### Task G.3 — TOC rewrite

**File:** `apps/docs/src/components/chrome/TableOfContents.tsx`

Use `<Stack direction="column" gap="1">` for the list, `<Link variant="subtle">` for each entry, `<Heading size="xs" color="muted">` for "On this page".

Commit: `refactor(docs): TOC uses Stack + Link + Heading`

### Task G.4 — Breadcrumbs uses the real Breadcrumb component

**File:** `apps/docs/src/components/chrome/Breadcrumbs.tsx`

Replace with direct use of `<Breadcrumb>` / `<BreadcrumbItem>` / `<BreadcrumbEllipsis>` from `@weiui/react`. Use `<Link>` for linked segments.

Commit: `refactor(docs): Breadcrumbs uses @weiui/react Breadcrumb`

### Task G.5 — Footer + Pager + EditOnGitHub rewrite

- Footer: `<Stack direction={{ base: "column", md: "row" }} gap="8">` + `<Heading size="xs">` group titles + `<Link>` links + `<Divider>`.
- DocsPager: `<Grid columns={{ base: 1, sm: 2 }} gap="4">` + `<Card variant="outlined" asChild><Link /></Card>`.
- EditOnGitHub: `<Button variant="ghost" size="sm" asChild><a /></Button>`.

Commit: `refactor(docs): Footer + DocsPager + EditOnGitHub use WeiUI primitives`

### Task G.6 — Landing sections rewrite

**Files:** `apps/docs/src/components/landing/Hero.tsx` · `ValueProps.tsx` · `LiveShowcase.tsx` · `Comparison.tsx` · `InstallSnippet.tsx` · `Footer.tsx`

Rewrite each to use `@weiui/react`:
- Hero: `<Heading size="6xl" display>` + `<Text size="lg" color="muted">` + `<Stack direction="row" gap="3"><Button size="lg" /></Stack>` + `<Badge>` for the "v0.0.1 Pre-release" pill.
- ValueProps: `<Grid columns={{ base: 1, sm: 2, lg: 3 }} gap="4">` with each card as `<Card variant="outlined">` + `<CardHeader>`/`<CardContent>`.
- LiveShowcase: `<Tabs>` + `<TabsList>` + `<TabsTrigger>` + `<TabsContent>`. Each showcase is WeiUI components (already, verified in prior rounds).
- Comparison: native `<table>` wrapped in `<Card variant="outlined">`. Header cells use `<Heading size="xs" color="muted">`. Check-marks use `<Badge variant="soft" color="success">` for true, grey for false.
- InstallSnippet: wrap PackageManagerTabs in `<Card>`.
- Footer: `<Stack>` layout.

Commit: `refactor(docs): landing sections use @weiui/react components exclusively`

### Task G.7 — Preview + PackageManagerTabs + ColorSwatch use WeiUI

- Preview: use `<Tabs>` for Preview/Code tabs, `<Button size="sm" variant="ghost">` for copy/theme/RTL/viewport controls, `<ToggleGroup>` for segmented toggles.
- PackageManagerTabs: `<Tabs>` + `<TabsList>` + `<TabsTrigger>` + `<TabsContent>`; `<Button size="sm" variant="ghost">` for copy.
- ColorSwatch: `<Card variant="outlined" asChild><button /></Card>` + `<Text>` + `<Code>`.

Commit: `refactor(docs): Preview + PM tabs + ColorSwatch use WeiUI Tabs/Button/Card`

### Task G.8 — Command palette chrome uses the real CommandPalette component

**File:** `apps/docs/src/components/chrome/CommandPalette.tsx`

Delete the custom `cmdk`-wrapped component. Replace with `<CommandPalette>` from `@weiui/react` (which already wraps cmdk) and feed it the search index.

Commit: `refactor(docs): docs-chrome CommandPalette uses @weiui/react CommandPalette`

### Task G.9 — Tool pages rewrite

**Files:**
- `apps/docs/src/app/playground/page.tsx` and all subcomponents
- `apps/docs/src/app/composer/page.tsx` and all subcomponents (Canvas / Palette / PropsPanel / CodeExport)
- `apps/docs/src/app/themes/page.tsx` and all subcomponents (ColorPicker / ThemePreview / ThemeExport)

Rewrite every inline-styled `<div>` / `<button>` / `<label>` / `<input>` / `<select>` to consume:
- Layout: `<Grid>` / `<Stack>` / `<Container>` / `<AspectRatio>` / `<Divider>` / `<Spacer>`
- Form: `<Field>` / `<Input>` / `<Textarea>` / `<Select>` / `<Checkbox>` / `<Switch>` / `<RadioGroup>` / `<Slider>` / `<ColorPicker>`
- Display: `<Card>` / `<Badge>` / `<Chip>` / `<Alert>` / `<Skeleton>` / `<Spinner>` / `<EmptyState>`
- Actions: `<Button>` / `<ButtonGroup>` / `<ToggleGroup>`
- Text: `<Heading>` / `<Text>` / `<Label>` / `<Code>` / `<Kbd>`

Commit: `refactor(docs): tool pages (playground/composer/themes) use @weiui/react exclusively`

### Task G.10 — State-of-art UI polish

**Files:**
- `apps/docs/src/components/landing/Hero.tsx` — enhance the ambient gradient
- `apps/docs/src/styles/chrome.css` — refined motion curves
- `apps/docs/src/app/page.tsx` — fluid type scale with `clamp()`
- Misc polish

- [ ] **Step 1: Fluid type scale**

Add to `apps/docs/src/styles/chrome.css`:

```css
@layer wui-base {
  .wui-landing-hero__title {
    font-size: clamp(2.5rem, 5vw + 1rem, 5rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
  }
  .wui-home-section__title {
    font-size: clamp(1.75rem, 2vw + 1rem, 2.5rem);
    line-height: 1.15;
    letter-spacing: -0.02em;
  }
}
```

- [ ] **Step 2: Ambient hero gradient**

In `Hero.tsx`, add a position-static container with:

```tsx
<div className="wui-hero-ambient" aria-hidden="true" />
```

CSS:
```css
@layer wui-base {
  .wui-hero-ambient {
    position: absolute;
    inset-inline: 0;
    inset-block-start: -10%;
    block-size: 80%;
    pointer-events: none;
    z-index: -1;
    background:
      radial-gradient(circle at 30% 30%,
        color-mix(in oklch, var(--wui-color-primary) 40%, transparent),
        transparent 50%),
      radial-gradient(circle at 70% 40%,
        color-mix(in oklch, oklch(0.7 0.18 320) 30%, transparent),
        transparent 50%),
      radial-gradient(circle at 50% 70%,
        color-mix(in oklch, oklch(0.8 0.18 180) 20%, transparent),
        transparent 50%);
    filter: blur(60px) saturate(1.4);
    opacity: 0.7;
  }
  html.dark .wui-hero-ambient { opacity: 0.35; }
}
```

- [ ] **Step 3: Section transitions on scroll**

Add `@keyframes wui-fade-in-up` + `.wui-home-section--animate` class that uses it via `animation: wui-fade-in-up 800ms var(--wui-motion-easing-decelerated) both; animation-timeline: view(); animation-range: entry 20% cover 40%;` (modern scroll-driven animations, gracefully degrade on unsupported browsers).

Wrap in `@media (prefers-reduced-motion: no-preference)`.

- [ ] **Step 4: Refined Card hover motion**

In `packages/css/src/elements/card.css`, the `.wui-card--interactive:hover` transition already uses `var(--wui-motion-duration-base)`. Upgrade easing to `var(--wui-motion-easing-emphasized)` for springier lift.

- [ ] **Step 5: Subtle code-block frame**

In `apps/docs/src/styles/shiki.css`, add a soft border-gradient on `figure[data-rehype-pretty-code-figure]`:

```css
figure[data-rehype-pretty-code-figure] {
  background:
    linear-gradient(var(--wui-surface-sunken), var(--wui-surface-sunken)) padding-box,
    linear-gradient(135deg,
      color-mix(in oklch, var(--wui-color-primary) 20%, var(--wui-color-border)),
      var(--wui-color-border)) border-box;
  border: 1px solid transparent;
}
```

- [ ] **Step 6: Header scroll-lift effect**

When user scrolls past 40px, the header gets a slightly stronger backdrop blur and a subtle shadow. Use `IntersectionObserver` on a sentinel element above the header or `window.scrollY` via `useSyncExternalStore`.

In `Header.tsx`:

```tsx
const scrolled = useScrolled(40);
// ...
<AppBar sticky color="surface" data-scrolled={scrolled || undefined}>
```

CSS:
```css
.wui-app-bar[data-scrolled] {
  box-shadow: var(--wui-elevation-2);
  background-color: color-mix(in oklch, var(--wui-color-background) 90%, transparent);
}
```

- [ ] **Step 7: Subtle micro-interactions**

- Buttons: verify hover `translateY(-1px)` and active `translateY(0)` (already in place).
- Links: add `text-decoration-thickness` transition on hover (already in place; verify).
- Cards: hover elevation step up one level (already in place).
- Tabs: active underline slides smoothly (if not, add `::after` with transform + transition).

- [ ] **Step 8: Commit**

Commit: `polish(docs): state-of-art UI — fluid type, ambient gradient, scroll-driven animations, refined motion`

### Task G.11 — Remove legacy chrome CSS

After G.1-G.9, most of `apps/docs/src/styles/chrome.css` should be deletable. Scan the file, delete any `.wui-docs-*` class rules that no components reference anymore.

Verify nothing breaks by running a full docs build. If any orphan reference shows up, fix it at the source (the React chrome component still using a dead class name).

Commit: `chore(docs): remove legacy chrome CSS replaced by WeiUI components`

### Task G.12 — Verification: docs uses only WeiUI + tokens

- [ ] Grep: `grep -rn "style={{" apps/docs/src/app apps/docs/src/components/landing apps/docs/src/components/chrome` — should return ZERO matches (all inline styles gone except for dynamic values like grid positions that can't be tokens).
- [ ] Grep: `grep -rnE "<(div|span|button|a|input|label|p|h[1-6])\b" apps/docs/src/components/chrome apps/docs/src/components/landing` — should be near-zero (most elements come from WeiUI components).
- [ ] Visual walk-through: `pnpm --filter @weiui/docs dev`, open `/`, `/docs/components/button`, `/docs/components/form`, `/playground`, `/composer`, `/themes`. Confirm every page renders with refined motion, ambient backdrops, fluid typography, polished hover states.

Commit: `docs: verify docs site built 100% with @weiui/react + tokens`

### Wave G verification

```bash
pnpm build
pnpm test
pnpm --filter @weiui/docs build
pnpm --filter @weiui/tokens validate
```

All green. Run component verification plan Section 2 automated checks.

Push: `git push origin main`.

---

## Self-review

1. **Spec coverage:** Every component in `packages/react/src/components/` (65 folders + Select re-export = 66) has at least one task in Waves B-E, and its grouped doc page appears in Wave F. 216 P1 audit rows map to specific tasks:
   - Wave B (Overlay): 20 P1s across 7 components
   - Wave C (Inputs + Date): ~55 P1s across 12 components
   - Wave D (Data + Nav): ~65 P1s across 14 components
   - Wave E (Display + Form + Layout): ~45 P1s across 22 components
   - Wave F (Library + Docs): remaining non-audit-matrix improvements
   - Wave G (Dogfooding + polish): every docs chrome + landing + tool page rewritten with `@weiui/react`, state-of-art UI layer applied
2. **Placeholder scan:** No "TBD", "similar to Task N", "add appropriate handling" — every task lists specific props, specific code additions, specific commit messages.
3. **Type consistency:** Shared recipes in Wave A keep types stable. `onInteractOutside(ev: MouseEvent)` identical across Dialog/Drawer/Popover/Menu. `size?: "sm" | "md" | "lg"` identical across Badge/Chip/Button/Input/Checkbox/Switch/Radio/Field/Label/Spinner/Progress/EmptyState.
4. **Dogfooding gate:** After Wave G, grep for `<div>`/`<button>` inline primitives in `apps/docs/src/components/{chrome,landing}` and `apps/docs/src/app/{playground,composer,themes}` returns near-zero. All shipped docs render with `@weiui/react` components — proving the library is complete.

## Execution handoff

Subagent-driven development (`superpowers:subagent-driven-development`) is the recommended execution mode — one fresh subagent per task, two-stage review (spec compliance then code quality).

**Tasks produce ≈100 commits total** across 6 waves. Verification gates at end of each wave (run `pnpm build && pnpm test`) and a final gate in Wave F (also `pnpm --filter @weiui/docs build && pnpm --filter @weiui/tokens validate`).

Each task says: read the current component file → write failing test → confirm fail → implement exact additions → confirm pass → update matching demo in `apps/docs/src/components/demos/*.tsx` → commit. Each wave ends with an `docs(audit): mark Wave X shipped` commit flipping rows in `docs/audit/component-parity.md`.
