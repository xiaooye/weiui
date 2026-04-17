# Runtime Audit Report — 2026-04-17

> **Status — RESOLVED (2026-04-16).** All 22 concrete issues in this
> report (5 critical, 10 major, 3 structural, 4 polish, plus the 10
> missing live-demo pages) have been addressed across the subsequent
> polish rounds. See commits between `abe5cc0` and `45b279b` for the
> per-page fixes. This document remains for historical context — it is
> no longer an open TODO list.

Runtime diagnostic of the WeiUI docs site (`apps/docs`) and the exported `@weiui/react` components that the docs try to document. Build succeeds (`pnpm --filter @weiui/docs build` passes, 43 pages generated), so issues are structural / behavioural rather than compile-time.

A single telltale: the Next.js build report shows 585 B First-Load JS for pages that *should* have heavy interactive components (`color-picker`, `command-palette`, `date-time` DatePicker portion, `editor`, `overlays`, `portal`, `kbd`, `data`, `toast-chip-progress`). Pages with real client components show 1.83 kB. Those 585 B pages ship no client JS = there is no live demo on them.

---

## Critical issues (blocking)

### 1. Toaster is never mounted — `toast(...)` silently does nothing

- **File:** `apps/docs/src/app/layout.tsx` (body — no `<Toaster />` anywhere).
- **Also:** `apps/docs/src/app/docs/layout.tsx` (same — no `<Toaster />`).
- **Root cause:** `Toaster` is a `"use client"` component that subscribes to the toast store and is the only thing that renders toasts. Without it in the tree, `toast()`, `toast.success()`, `toast.error()`, `toast.warning()` all update `toast-store.ts` but nothing ever renders. The docs page for Toast (`toast-chip-progress/page.mdx`) also has no live demo — it only shows code.
- **Evidence:** `Toast/Toaster.tsx:14` uses `useSyncExternalStore(subscribe, getToasts, getToasts)`. Store pushes via `emit()` (`toast-store.ts:23`), but with no `<Toaster />` subscriber there is no listener triggered to render DOM.
- **Fix:** Add `<Toaster />` to `apps/docs/src/app/layout.tsx` body (after `{children}` and before `<Analytics />`). Docs package has no `@weiui/react` dependency yet — must also be added.

### 2. `apps/docs/package.json` does not depend on `@weiui/react`

- **File:** `apps/docs/package.json` — deps are only `@weiui/css`, `@weiui/tokens`, `cmdk`, `next`, `react`, `react-dom`, `@vercel/analytics`, `rehype-pretty-code`, `shiki`.
- **Root cause:** MDX pages show `import { ... } from "@weiui/react"` — but *every one of those imports is inside a fenced ```tsx code block*, not an actual MDX import at the top of the file. There is no mechanism to render a real WeiUI React component in docs because the package isn't a dependency.
- **Impact:** Every complaint in this round flows from this — Toast, DatePicker, ColorPicker, CommandPalette, Editor, AutoComplete, MultiSelect, FileUpload, Dialog, Popover, Menu, Kbd, Chart, DataTable, TreeView, Portal — all pages rely on either raw HTML mockups (`className="wui-*"`) or on code-fence prose. None instantiate live components.
- **Fix:** Add `"@weiui/react": "workspace:*"` to `apps/docs/package.json` dependencies and run `pnpm install`.

### 3. No live demos on 10+ component pages (user complaints 1–3, 5–9, 11, 12)

All these pages are 585 B First-Load (= static) and their `@weiui/react` "imports" are inside triple-backtick code fences only:

| Page | Path | What user sees |
|------|------|----------------|
| Toast | `apps/docs/src/app/docs/components/toast-chip-progress/page.mdx` | Code prose only. Chip + ProgressBar have CSS-only mockups. Toast has nothing interactive. |
| Overlays (Dialog, Tooltip, Popover, Menu) | `apps/docs/src/app/docs/components/overlays/page.mdx` | Code prose only. Zero live examples. |
| Portal | `apps/docs/src/app/docs/components/portal/page.mdx` | Code prose only. |
| Kbd | `apps/docs/src/app/docs/components/kbd/page.mdx` | Code prose only. No `<Kbd>` rendered. |
| Editor | `apps/docs/src/app/docs/components/editor/page.mdx` | Code prose only. No TipTap editor on-screen. |
| Data (DataTable, Charts, TreeView) | `apps/docs/src/app/docs/components/data/page.mdx` | Code prose only. No charts rendered. |
| Command Palette | `apps/docs/src/app/docs/components/command-palette/page.mdx` | Code prose only. No Cmd+K demo. |
| Color Picker | `apps/docs/src/app/docs/components/color-picker/page.mdx` | Code prose only. No SV pad. |
| DatePicker | `apps/docs/src/app/docs/components/date-time/page.mdx` | Calendar is a *static HTML mock* (buttons are inert, "15" is hardcoded as selected). DatePicker section below is code prose only — no popover, no trigger, no demo. |
| Advanced Inputs (AutoComplete, MultiSelect, FileUpload) | `apps/docs/src/app/docs/components/advanced-inputs/page.mdx` | Slider / Rating / InputNumber / InputOTP are inert HTML (no state, no keyboard, no drag). AutoComplete, MultiSelect, FileUpload are code-prose only — no dropdowns rendered. |
- **Root cause (shared):** pages use raw HTML `wui-*` classes to fake the visual; state-driven components like DatePicker, CommandPalette, Editor, ColorPicker, DataTable etc. cannot be faked by HTML — they *must* be the real React components.
- **Fix:** On a per-page basis, import the actual React component and render it inside `<Preview>` (or a light wrapper). Requires issue #2 (add `@weiui/react` dep) first.

### 4. "On this page" TOC links are unstable / broken across navigations

- **File:** `apps/docs/src/components/chrome/TableOfContents.tsx`.
- **Root cause:** The TOC component runs on-mount and assigns IDs to `<h2>`/`<h3>` via `node.textContent?.toLowerCase().replace(...)`. MDX's `next/mdx` pipeline does *not* run `rehype-slug` (check `apps/docs/next.config.ts:8` — rehype plugins list is `[[rehypePrettyCode, {...}]]` only). Problems:
  1. **Server-rendered HTML has no heading IDs** — so any deep link to `/docs/components/button#variants` fails on first paint (the anchor target doesn't exist until the client effect runs).
  2. **TOC links are `<a href="#id">`** — clicking one works after hydration, but the initial document load does not scroll (because the target doesn't exist yet).
  3. **MDX-customised headings (e.g. headings with inline code) get garbled IDs** — backticks become nothing, causing collisions. Example: `### Link` and `### <Link>` both slugify to `link`.
  4. **No collision handling:** the slugify function does not dedupe duplicate ids, so two `## Props` sections on the same page (present on `overlays`, `advanced-inputs`, `form`, `data`) both receive `id="props"`, and `IntersectionObserver` only highlights one.
- **Fix:** Add `rehype-slug` to `next.config.ts` rehype plugins (runs before `rehype-pretty-code` so pretty-code doesn't eat headings). Also consider `rehype-autolink-headings` for "link anchor" icons. Strip the client-side ID-assignment loop from TableOfContents and rely on server IDs.

### 5. `useUseContainer` in PreviewFrame is buggy — isolated previews may stay blank

- **File:** `apps/docs/src/components/preview/PreviewFrame.tsx:74-80`.
- **Root cause:** `useUseContainer()` uses a `useRef` with a plain setter that mutates the ref but never triggers a re-render. On first pass, `ref.current` is `null`, so `{container && createPortal(children, container)}` renders nothing. When `useEffect` calls `setContainer(root)` the ref mutates, but React never re-renders, so `container` stays `null` on screen until something else triggers a re-render. Should be `useState`, not a hand-rolled ref/callback pair.
- **Impact:** Any `<Preview>` whose user toggles Theme / Direction / Viewport away from default (= isolated mode) can render a blank iframe.
- **Fix:** Replace `useUseContainer` with `useState<HTMLElement | null>(null)`.

---

## Major issues (feature broken)

### 6. Breadcrumb separator is unstyled

- **Files:** `apps/docs/src/components/chrome/Breadcrumbs.tsx:21` and `apps/docs/src/styles/chrome.css:266-281`.
- **Root cause:** The template renders `<span aria-hidden="true">/</span>` between segments but no CSS selector targets that span. The separator therefore inherits full `color` and body-size `font-size`, while siblings are muted. Result: the "/" looks heavier than surrounding text and the spacing is uniform (no emphasis around the separator). Hover-state underline on breadcrumb links also underlines the whole line because there is no explicit display/line-height set.
- **Fix:** Add a style on `.wui-docs-breadcrumbs li > span[aria-hidden]` (or give the separator a class like `wui-docs-breadcrumbs__sep`) with muted color, reduced font-size, and tighter margin. Consider replacing `/` with `›` or a chevron SVG.

### 7. Date-time / Calendar "Preview" is static HTML pretending to be a calendar

- **File:** `apps/docs/src/app/docs/components/date-time/page.mdx:13-63`.
- **Root cause:** The preview is raw `<table>` with hard-coded "April 2026" and "15" as `data-selected`. Navigation arrows (`&lsaquo;`, `&rsaquo;`) are `<button>` elements with no `onClick`; clicking them does nothing. Keyboard navigation from the MDX Calendar page description doesn't work because there is no `Calendar` component on the page.
- **Fix:** Replace with `<Calendar defaultValue={new Date()} />` inside the Preview (requires `@weiui/react` dep). Same pattern goes for the DatePicker section below.

### 8. Command Palette doc page has zero demo

- **File:** `apps/docs/src/app/docs/components/command-palette/page.mdx`.
- **Root cause:** Entire page is prose + tables. The actual `@weiui/react` `CommandPalette` component (`packages/react/src/components/CommandPalette/CommandPalette.tsx`) has global Cmd+K hotkey and would be the perfect demo but is never mounted.
- **Note:** The docs chrome *does* ship its own Cmd+K (`apps/docs/src/components/chrome/CommandPalette.tsx`) using `cmdk` library, but that's a docs search — not the WeiUI component. This probably adds to the user's confusion.
- **Fix:** Render `<CommandPalette items={demoItems} />` on the page with a preview block explaining it's triggered by Cmd+K / a demo button.

### 9. Editor page has no TipTap editor mounted

- **File:** `apps/docs/src/app/docs/components/editor/page.mdx`.
- **Root cause:** Just code blocks. `Editor` is `"use client"` (`packages/react/src/components/Editor/Editor.tsx:1`) and works, but never rendered. Users see no live editor.
- **Fix:** `<Editor defaultValue="<p>Try editing this.</p>" />` in a Preview block.

### 10. ColorPicker page has no color picker

- **File:** `apps/docs/src/app/docs/components/color-picker/page.mdx`.
- **Root cause:** Prose + tables only. `ColorPicker` component exists and is client-marked.
- **Fix:** Render `<ColorPicker defaultValue="#2563eb" swatches={[...]} />`.

### 11. AutoComplete / MultiSelect / FileUpload have no live demos

- **File:** `apps/docs/src/app/docs/components/advanced-inputs/page.mdx`, sections starting at lines 258, 298, 335.
- **Root cause:** Code blocks only. Additionally, the *visible* examples higher up the page for Slider, Rating, InputNumber, InputOTP are static HTML — the Slider thumb doesn't drag, Rating stars don't toggle on click, InputNumber buttons don't increment, InputOTP doesn't auto-advance.
- **Fix:** Replace each Preview with real component imports. Same pattern throughout.

### 12. Portal page has no demonstration of "escape overflow" behaviour

- **File:** `apps/docs/src/app/docs/components/portal/page.mdx`.
- **Root cause:** Prose only. The whole point of Portal (escaping `overflow: hidden`) is a runtime behaviour that needs a visual demo: a scrolling container with a Portal'd popover that clearly escapes. Nothing on the page shows this.
- **Fix:** Add a Preview with a constrained `overflow: hidden` box and a button that opens a portal'd `<div>` visible outside the box.

### 13. Overlays page has no Dialog / Tooltip / Popover / Menu demos

- **File:** `apps/docs/src/app/docs/components/overlays/page.mdx`.
- **Root cause:** Code only. All four components are client-capable and exported.
- **Fix:** One Preview per component with a minimal trigger + content pair.

### 14. Data page (DataTable, Charts, TreeView) — no live tables or charts

- **File:** `apps/docs/src/app/docs/components/data/page.mdx`.
- **Root cause:** Code prose only. These are the components *most* reliant on visual demo (a DataTable's utility is 100% interactive; a chart is 100% visual). Currently the page is just a reference manual with no figure.
- **Fix:** Add DataTable demo with mock data, one of each chart type, and a minimal TreeView demo.

### 15. Kbd page doesn't render any `<Kbd>` elements

- **File:** `apps/docs/src/app/docs/components/kbd/page.mdx`.
- **Root cause:** The entire "demo" is a triple-backticked code block. Users see the source, not the result. Kbd is a server-safe component (just a styled `<kbd>`) so it could trivially render inline as MDX.
- **Fix:** Add `<Kbd>⌘K</Kbd>` inline in the MDX prose. Or a Preview showing several keyboard chords.

---

## Structural / docs-chrome issues

### 16. Docs search's CommandPalette references `.wui-cmdk-title` class that has no CSS rule

- **File:** `apps/docs/src/components/chrome/CommandPalette.tsx:53`.
- **Root cause:** Template renders `<span className="wui-cmdk-title">{item.title}</span>` but `chrome.css` defines no `.wui-cmdk-title` selector. The title therefore inherits default font-size / weight and does not line up visually with `.wui-cmdk-href` which *is* styled. Spacing looks wrong.
- **Fix:** Add `.wui-cmdk-title` rule (font-size: sm, weight: medium, color: foreground) in `chrome.css`.

### 17. `<span />` in DocsPager produces empty grid cell without visual balance

- **File:** `apps/docs/src/components/chrome/DocsPager.tsx:24,30`.
- **Not strictly broken**, but when only one side is present, an empty `<span />` is still a grid child and leaves a hollow area. Worth changing to `null` or wrapping appropriately.
- **Fix:** Return only the present link, or collapse grid columns when one side is missing.

### 18. Preview's `.wui-preview__stage` flex layout collapses wide demos

- **File:** `apps/docs/src/styles/preview.css:62-68`.
- **Root cause:** `display: flex; flex-wrap: wrap; gap: ...; align-items: center;` is fine for rows of buttons, but wide demos (e.g. a ToggleGroup or AppBar) would want `align-items: stretch` / `flex-direction: column` in some cases. Also, fixed `min-block-size: 96px` can squish vertical demos. Not blocking, a polish item.

---

## Visual / polish issues

### 19. Breadcrumb "Home / Docs / Components" visually heavy (see issue #6)

As per user complaint. Muted-tone, chevron-style separator, and removing default text-decoration on hover for nested items would help.

### 20. Sidebar sticky positioning may clip during mobile resize

- **File:** `apps/docs/src/styles/chrome.css:181-189`. Uses `block-size: calc(100vh - (var(--wui-spacing-3) * 2 + 36px + 1px))`. Hard-coded 36px + spacing-3 + 1px pretends to know the header's computed height. If the header gains a second row (e.g. announcement bar), sidebar overflows. Not a current bug, but brittle.

### 21. TOC "On this page" is hidden below 1024px — users on small laptops lose it

- **File:** `apps/docs/src/styles/chrome.css:169`. Breakpoint hides TOC. On 1280–1400 px displays the three-column layout is fine, but a 13" MacBook at 1440x900 with sidebar open often falls under the 1024 threshold after scaling. Consider raising breakpoint to 1280 or adding a collapsed TOC button.

### 22. `@weiui/docs` has no dark-mode hand-off for MDX code blocks on RTL

- **Files:** MDX pages rely on `rehype-pretty-code` generating two themes. In RTL preview isolation (PreviewFrame iframe), the iframe rewrites the body but copies the host's stylesheets — the shiki CSS should apply. However the Preview iframe mutates `doc.open() / doc.write() / doc.close()` which is a *sync* write; downstream `createPortal` for children runs on next render. Combined with the `useUseContainer` bug (#5), RTL preview in Code tab may show untransformed code. Minor.

---

## Missing demos summary

All need a live React demo (requires `@weiui/react` dependency in docs package):

| Page | Component(s) to import | Minimal demo |
|------|------------------------|--------------|
| `toast-chip-progress/page.mdx` | `Toaster`, `toast`, `Chip`, `ProgressBar` | Toaster mounted in docs layout + button that calls `toast.success(...)`. Chip with onRemove. ProgressBar with animated value. |
| `overlays/page.mdx` | `Dialog*`, `Tooltip*`, `Popover*`, `Menu*` | One trigger+content pair per section. |
| `portal/page.mdx` | `Portal` + a scrollable box | Button that portals a div visibly outside the scrolling parent. |
| `kbd/page.mdx` | `Kbd` | Inline `<Kbd>⌘K</Kbd>` + keyboard chord. |
| `editor/page.mdx` | `Editor` | `<Editor defaultValue="<p>Hello</p>" />`. |
| `data/page.mdx` | `DataTable`, `BarChart`, `PieChart`, `TreeView` | Mock dataset with 10 rows; one chart of each type; minimal file tree. |
| `command-palette/page.mdx` | `CommandPalette` | A button that opens a demo palette with 5 items. |
| `color-picker/page.mdx` | `ColorPicker` | `<ColorPicker defaultValue="#2563eb" swatches={[...]} />`. |
| `date-time/page.mdx` | `Calendar`, `DatePicker` | Replace static HTML calendar mock with real `<Calendar />`. Add `<DatePicker />` below. |
| `advanced-inputs/page.mdx` | `Slider`, `Rating`, `InputNumber`, `InputOTP`, `AutoComplete`, `MultiSelect`, `FileUpload` | Swap all the static HTML previews for the real components. |

---

## Fix plan (priority order)

### P0 — must do before any polish work
1. Add `"@weiui/react": "workspace:*"` to `apps/docs/package.json`. Run `pnpm install`. Verify build still passes.
2. Add `<Toaster />` to `apps/docs/src/app/layout.tsx` body, after `{children}`.
3. Add `rehype-slug` (and optionally `rehype-autolink-headings`) to `apps/docs/next.config.ts` rehype plugin list, before `rehype-pretty-code` (order: slug first so pretty-code runs on marked-up HTML).
4. Remove the client-side `if (!node.id)` slug-fill block in `apps/docs/src/components/chrome/TableOfContents.tsx` (rely on server-rendered IDs).

### P1 — fix broken demos (depends on P0 #1)
5. Rewrite these page.mdx files to use `<Preview>` with real component imports:
   - `toast-chip-progress/page.mdx` (Toast demo button, Chip interactive, ProgressBar live)
   - `overlays/page.mdx` (Dialog / Tooltip / Popover / Menu)
   - `portal/page.mdx`
   - `kbd/page.mdx` (just inline `<Kbd>`)
   - `editor/page.mdx`
   - `data/page.mdx` (DataTable + at least two charts + TreeView)
   - `command-palette/page.mdx`
   - `color-picker/page.mdx`
   - `date-time/page.mdx` (replace static calendar + add DatePicker demo)
   - `advanced-inputs/page.mdx` (all seven components)
6. Fix `useUseContainer` → `useState` in `PreviewFrame.tsx`.

### P2 — polish
7. Style breadcrumb separator (`wui-docs-breadcrumbs__sep` class + muted color + `›` glyph).
8. Add `.wui-cmdk-title` rule in `chrome.css`.
9. Consider raising TOC breakpoint from 1024 → 1280 px.
10. DocsPager — return `null` instead of empty `<span />`.

### P3 — tests (future)
11. Add Playwright E2E that opens each doc page and asserts the *expected number of live components* are rendered (e.g. color-picker page should have `role="slider"[aria-valuetext]`; command-palette page should render a button that opens `role="dialog"[aria-label="Search docs"]`).
12. Unit test: `toast()` + mounted `<Toaster />` renders `role="alert"` on the page.

---

## Counts

- Critical issues: **5**
- Major issues: **10**
- Structural / chrome issues: **3**
- Visual / polish: **4**
- Pages needing new live demos: **10**

**Total concrete issues: 22.**

Everything traces back to one root cause: `@weiui/docs` does not depend on `@weiui/react` and no toast/portal/etc. is ever mounted. Fix that, mount `<Toaster />`, then work through the page-by-page demo rewrites.
