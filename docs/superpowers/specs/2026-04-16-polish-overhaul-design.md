# WeiUI Polish Overhaul — Design Spec

**Date:** 2026-04-16
**Owner:** Wei
**Status:** Approved (pending user review of this document)

---

## 1. Goal

Elevate WeiUI to feel like a premium, enterprise-grade, modern UI library. Close feature gaps against best-in-class references for every component. The bar is **best-in-class**, not "matches references."

**Visual direction:** shadcn/ui-clean chrome (serious, restrained, monochrome-leaning) combined with Volt UI / Mantine-level component polish (refined shadows, rich variants, tasteful depth). One confident "modern art touch" — an ambient OKLCH gradient in the landing hero plus Instrument Serif display type — nowhere else, to avoid drifting into flashy.

**Not flashy. Not minimal. Premium enterprise with one art moment.**

---

## 2. Scope

**In scope:**
- Polish CSS primitives and add missing token categories (shadow, motion, elevation, surface).
- Full docs site overhaul (chrome, search, theme toggle, typography, code blocks, preview infrastructure).
- All missing pages (typography, colors, icons, installation, CLI, migration, changelog).
- Homepage redesign.
- Per-component feature audit vs best-in-class references.
- Component polish and feature-parity additions in four family-grouped waves.

**Out of scope:**
- New component types (only polish and feature additions to the existing 70+).
- Token color palette redesign (OKLCH base stays; new token categories added alongside).
- Framework migration (stays Next.js App Router + React).
- Docs-site CMS migration (stays file-based MDX).
- `@weiui/tokens` schema change (tokens remain W3C DTCG).

---

## 3. Phases

Sequential. Each phase builds on the previous; no cross-phase concurrency.

| # | Phase | Output |
|---|-------|--------|
| 0 | Foundations | New tokens + CSS primitives polish — all components inherit it |
| 1 | Docs chrome | Header, sidebar, TOC, theme toggle, ⌘K search, typography, Shiki |
| 2 | Preview infra + missing pages | Tabbed Preview, copy, theme/RTL/viewport toggles + 7 new doc pages |
| 3 | Homepage | Hero, value props, live showcase, comparison, install snippet |
| 4 | Audit matrix | One doc: WeiUI vs best-in-class per component, P0/P1/P2 flags |
| 5 | Component waves | 5a Inputs · 5b Overlays · 5c Data/Nav · 5d Advanced · 5e Form/Display primitives |

---

## 4. Phase 0 — Foundations

### 4.1 New tokens (`@weiui/tokens`)

**Shadow scale** (8 levels, layered: ambient + key light, OKLCH for dark-mode-correct translucency):
- `shadow-xs` · `sm` · `base` · `md` · `lg` · `xl` · `2xl` · `inset`

**Motion scale:**
- Duration: `duration-instant` (50ms) · `fast` (120ms) · `base` (180ms) · `slow` (260ms) · `slower` (400ms)
- Easing: `ease-standard` · `emphasized` · `decelerated` · `accelerated` (Material 3 curves)

**Elevation tokens:** `elevation-0` through `elevation-5` — composite of shadow + subtle border.

**Surface tokens:** `surface-raised` · `surface-overlay` · `surface-sunken` — layered background treatments for cards, popovers, wells.

**Focus-ring soft:** second-tier focus ring for nested elements (e.g., inputs inside a focused dialog).

### 4.2 CSS primitive polish

Every existing component CSS file gets a polish pass using the new tokens:

- **Buttons** — solid variants gain `inset 0 1px 0` inner highlight for Volt-style depth; hover adds `translateY(-1px)` + shadow bump (motion-safe); active removes both.
- **Inputs** — soft `inset 0 1px 2px` at rest; sharper focus ring with `color-mix` transitions; invalid state softer pink background fill.
- **Cards** — 2-layer shadow (ambient + key) + 1px hairline border.
- **Menus / Dialogs / Popovers** — `backdrop-filter: blur(8px)` with opaque fallback; `elevation-3` shadow.
- **Chips / Badges** — subtle inset highlight on solid variants; tonal backgrounds use `color-mix(in oklch, var(--wui-color-primary) 12%, var(--wui-color-background))`.
- **Transitions** — everywhere, replace ad-hoc durations with the new motion scale; wrap in `@media (prefers-reduced-motion: no-preference)`.

**Constraint:** Specificity budget stays 0-2-0. No `!important`. Logical properties only. Cascade layer is always `@layer wui-elements`.

---

## 5. Phase 1 — Docs chrome

### 5.1 Layout

```
┌──────────────────────────────────────────────────────────────┐
│ [Logo] Docs Components Playground Composer Themes [⌘K][🌙][★] │ ← sticky header
├───────────────┬──────────────────────────────────┬───────────┤
│ Getting       │ # Button                         │ On this   │
│ Started       │                                  │ page      │
│ Components    │ Triggers an action or event...   │ • Variants│
│ ▸ Button      │                                  │ • Sizes   │
│   Input       │ [Preview component]              │ • States  │
│ ...           │                                  │ • a11y    │
│               │ Breadcrumb · Edit on GitHub      │           │
│               │ [Prev/Next pager]                │           │
└───────────────┴──────────────────────────────────┴───────────┘
```

### 5.2 Components

- **Top header** (sticky, backdrop-blur): logo + wordmark · primary nav · ⌘K trigger · theme toggle · GitHub star count · version dropdown (pulled from `package.json`).
- **Left sidebar**: grouped & collapsible, active-state pill, scroll-locked so current section is always visible after navigation.
- **Right TOC**: sticky, auto-highlights current H2/H3 via `IntersectionObserver`.
- **Prose**: Inter 15/24 body, Instrument Serif for H1, JetBrains Mono 13 for code. Heading anchors with hover-reveal `#` icon.
- **Breadcrumbs** · **Edit on GitHub** link · **Prev/Next pager** at page bottom.

### 5.3 Theme toggle

- System default (`prefers-color-scheme`) on first visit.
- `<ThemeToggle>` in header offers Light / Dark / System, persists to `localStorage`.
- Inline `<script>` in `<head>` sets `data-theme` on `<html>` before hydration to prevent FOUC (pattern from shadcn).

### 5.4 Search

- `cmdk`-based ⌘K palette.
- Indexed at build time: all component names, prop names, token names, doc headings, page URLs.
- Grouped results (Components / Tokens / Pages / Guides).
- Keyboard-nav, recent searches stored in localStorage.
- Bundle: `cmdk` dynamic-imported only when palette opens.

### 5.5 Code blocks

- **Shiki** syntax highlighting at build time, dual-theme (light: Vitesse Light, dark: Vitesse Dark) via `shiki.codeToHtml` with `themes: { light, dark }`.
- Copy-to-clipboard button (top-right on hover).
- Optional filename tab via `\`\`\`tsx title="Button.tsx"`.
- Optional line highlighting via `\`\`\`tsx {2,5-7}`.

---

## 6. Phase 2 — Preview infrastructure + missing pages

### 6.1 `<Preview>` component (replaces `<ComponentPreview>`)

```tsx
<Preview
  code={`<Button>Click me</Button>`}
  controls={{ variant: ['solid', 'outline', 'ghost'] }}
>
  <Button>Click me</Button>
</Preview>
```

**Features:**
- **Tabs:** Preview (default) · Code (source) · CSS (optional, for CSS-layer examples).
- **Controls row** (top-right): copy · theme toggle (light/dark/system) · RTL toggle · viewport resizer (desktop 100% / tablet 768px / mobile 375px) · "Open in Playground" external link.
- **Optional `controls` prop** surfaces live prop sliders/selects where component has simple variants.
- **Preview iframe** when theme/RTL/viewport toggles are active (isolation from surrounding page styles).

### 6.2 New doc pages

| Path | Content |
|------|---------|
| `/docs/typography` | Type scale showcase (xs → 6xl) · font pairings · leading & tracking examples |
| `/docs/colors` | OKLCH swatches grouped by semantic role · contrast ratio matrix · click-to-copy CSS var / JSON value |
| `/docs/icons` | Searchable grid · click-to-copy React / SVG / name forms · size/weight previews |
| `/docs/installation` | Tabbed per package manager (npm · pnpm · bun · yarn), per package (`@weiui/react`, `@weiui/headless`, `@weiui/css`, `@weiui/tokens`) |
| `/docs/cli` | Auto-generated from `@weiui/cli --help` · `init`, `add`, `audit` command docs |
| `/docs/migration` | Empty page with structure in place (v1 → v2 migrations documented as they land) |
| `/docs/changelog` | Pulled from Changesets `CHANGELOG.md` files |

---

## 7. Phase 3 — Homepage

### 7.1 Sections (top to bottom)

1. **Hero** — full-bleed. Ambient OKLCH gradient mesh backdrop (static, no animation). Instrument Serif display H1 "A design system that earns its place." Sub-headline (Inter). Three CTAs: Get Started (solid) · Components (outline) · GitHub (ghost with star count). Version badge with last-publish timestamp.
2. **Value props** — 6-card grid: Three Layers · WCAG AAA · OKLCH Tokens · Zero-JS CSS tier · Designer-friendly · CLI ownership.
3. **Live showcase** — tabbed live demos (fully interactive, not screenshots): Button variants · DataTable with sort/filter · Command palette · Dialog open/close. Each uses the polished Phase 0 primitives.
4. **Comparison table** — WeiUI vs shadcn/ui vs HeroUI vs Headless UI vs Radix. Rows: AAA enforced · CSS-only tier · Headless tier · Tokens · Designer path · RTL support · Framework-agnostic CSS · Copy-paste ownership.
5. **Install snippet** — one-liner with package-manager switcher.
6. **Footer** — sitemap columns · social links · license · "Made with WeiUI" badge.

### 7.2 Constraints

- Ambient gradient mesh: **only place in the product** with that visual treatment. No gradient on buttons, cards, or any component.
- Instrument Serif: **only** in the hero H1 + missing-page H1 headings (Typography/Colors/Icons pages). Nowhere else.
- All homepage content is above-the-fold-respecting: LCP target ≤ 1.2s on a 4G Moto G4.

---

## 8. Phase 4 — Audit matrix

**Deliverable:** `docs/audit/component-parity.md`

**Per-component table format:**

| Feature | WeiUI has | Best-in-class reference | Missing from WeiUI | Priority | Notes |
|---------|-----------|-------------------------|--------------------|----------|-------|
| Variants | ... | ... | ... | P0/P1/P2 | ... |
| Keyboard nav | ... | ... | ... | P0/P1/P2 | ... |
| ... | | | | | |

**Best-in-class references, pinned per component:**

| Component(s) | Reference |
|--------------|-----------|
| Dialog / Drawer / Popover / Tooltip | Radix UI |
| Menu / Dropdown | Radix + Ark UI |
| Select / Combobox / AutoComplete / MultiSelect | Downshift + react-aria |
| DataTable | TanStack Table + Ant Design |
| DatePicker / Calendar | react-aria + Mantine |
| Slider / Rating | Radix + Ant |
| Command palette | cmdk + Raycast |
| Form / Field | react-hook-form + Mantine |
| Toast | Sonner |
| Editor | Tiptap |
| FileUpload | Uppy |
| ColorPicker | Mantine + react-colorful |
| TreeView | react-arborist + Ant |
| Stepper | Mantine + Ant |
| AppBar / BottomNav / SpeedDial | MUI |
| Pagination / Transfer / Splitter | Ant |
| Tabs / Breadcrumb / Sidebar | shadcn + Radix |
| Accordion | Radix |
| Timeline | Ant |
| Chip / Badge / Avatar / Card / Skeleton | Mantine |

**Priority definitions:**
- **P0** — Must-add for parity. Blocks wave completion.
- **P1** — Nice-to-have for v1 release. Added if time permits in wave.
- **P2** — Defer. Logged as roadmap item.

---

## 9. Phase 5 — Component waves

Each wave delivers: CSS polish pass · React-layer updates adding all P0 features · updated headless hook if needed · Vitest unit tests · Playwright interaction tests · axe AAA tests · visual regression snapshots (light/dark/LTR/RTL) · refreshed doc page using new `<Preview>` · audit matrix updated (P0 rows move to "WeiUI has").

### 9.1 Wave 5a — Input family (9 components)

Input · Textarea · InputNumber · InputOTP · AutoComplete · MultiSelect · Password (new variant of Input) · Search (new variant of Input) · FileUpload

**Expected P0 additions:**
- Async options loader (AutoComplete, MultiSelect)
- Virtualization for >200 options (AutoComplete, MultiSelect) — uses `@tanstack/react-virtual`
- Clearable (all)
- Prefix / suffix slots (Input, Textarea)
- Character / max-length indicator
- Password visibility toggle
- Inline validation messaging API

### 9.2 Wave 5b — Overlay family (9 components)

Dialog · Drawer · Popover · Tooltip · Menu · Toast · CommandPalette · Sheet (new variant of Drawer) · AlertDialog (new variant of Dialog)

**Expected P0 additions:**
- Scroll lock + focus scope (all modals)
- Portal container customization
- Explicit stacking order for nested overlays
- Non-modal Popover variant
- Drag-to-dismiss Drawer on touch
- Anchored placement collision detection (`@floating-ui/react` already in scope)

### 9.3 Wave 5c — Data / navigation family (12 components)

DataTable · TreeView · Pagination · Tabs · Breadcrumb · Sidebar · AppBar · BottomNav · Accordion · Stepper · Timeline · Transfer

**Expected P0 additions:**
- DataTable: server-side pagination / sort / filter, row selection (single + range), column resize + reorder, virtualized rows
- TreeView: async loader, drag-and-drop reordering
- Tabs: orientation prop (horizontal / vertical), activationMode (automatic / manual)
- Sidebar: collapsible sections, nested items with scroll-lock

### 9.4 Wave 5d — Advanced (9 components)

DatePicker · Calendar · Chart · Editor · ColorPicker · Slider · Rating · SpeedDial · Splitter

**Expected P0 additions:**
- DatePicker: range mode + presets (Today / Yesterday / Last 7 / Last 30 / This month), locale prop, disabled-dates callback
- Slider: multi-thumb, value tooltip, step marks, range mode
- Rating: half-star, keyboard arrow support
- Splitter: keyboard handle (Arrow keys), min/max/default sizes
- ColorPicker: OKLCH input mode, eyedropper (where supported)
- Editor: slash command menu

### 9.5 Wave 5e — Form and display primitives (16 components)

Button · ButtonGroup · Checkbox · RadioGroup · Switch · ToggleGroup · Field · Label · Badge · Chip · Avatar · Alert · EmptyState · Skeleton · Spinner · ProgressBar · Card

**Expected P0 additions:**
- Button: `asChild` slot pattern, loading state with spinner placement, icon-only accessible label
- Checkbox / Switch: indeterminate state, controlled/uncontrolled, labelled form field integration via `Field`
- RadioGroup: orientation prop, keyboard roving tabindex
- ToggleGroup: single + multiple modes, aria-pressed wiring
- Field: unified label / hint / error / required wrapper (Mantine-style)
- Avatar: image fallback chain (src → initials → icon), presence indicator slot
- Badge / Chip: removable (Chip), tonal / solid / outline, dot variant (Badge)
- Alert: title + description slots, dismissible, leading icon, severity-driven color
- EmptyState: icon / title / description / action slots
- Skeleton: shimmer animation (motion-safe), shape variants (line / circle / rect)
- ProgressBar: indeterminate, segmented, label slot

**Note on omitted components:**
Layout and typography primitives — `Container`, `Grid`, `Stack`, `Spacer`, `AspectRatio`, `Divider`, `Portal`, `VisuallyHidden`, `Heading`, `Text`, `Code`, `Kbd`, `Link` — receive **Phase 0 polish only** (no feature parity additions). They are included in the Phase 4 audit matrix for completeness but are not expected to grow new APIs.

---

## 10. Success criteria

The overall effort is complete when all of the following are true:

1. **Visual polish** — Docs site is indistinguishable in polish from shadcn.com / mantine.dev / linear.app. Side-by-side screenshot review with these sites shows no obvious "WeiUI looks rougher."
2. **Preview infrastructure** — Every doc page uses `<Preview>` with Code tab, copy, theme/RTL/viewport toggles.
3. **Accessibility** — All 70+ components pass axe-core at AAA level with 0 violations, in both light and dark themes.
4. **Keyboard patterns** — Every component's Playwright interaction suite asserts the full WAI-ARIA APG pattern.
5. **Feature parity** — Audit matrix has zero P0 gaps against the pinned best-in-class reference.
6. **Builds** — `pnpm build && pnpm test && pnpm typecheck` passes on every phase commit.
7. **Lighthouse** — `/` and representative doc pages score ≥95 Performance / 100 Accessibility / 100 Best Practices on desktop and mobile emulation.

---

## 11. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Phase 0 token changes silently break existing components | Phase 0 is one PR: tokens + primitive polish together; visual regression snapshot refresh in the same PR |
| Shiki build time or bundle cost explodes | Pre-render code blocks at build time via MDX plugin, cache keyed by content hash, dual-theme from a single AST pass |
| `cmdk` adds bundle weight | Dynamic import gated on first `⌘K` or `Ctrl+K` press; no code ships until user opens the palette |
| Audit surfaces more P0 gaps than a wave can fit | Move overflow to P1 in the matrix with explicit rationale; do not silently drop them |
| "Modern art touch" drifts into flashy | Hard rule: one ambient gradient (hero only) + one display-serif (H1 in hero and missing-page H1s only). Everywhere else: Inter + no gradients on components. |
| Dark-mode FOUC on first load | Inline `<script>` in `<head>` reads `localStorage` + `prefers-color-scheme` and sets `data-theme` on `<html>` before hydration |
| Shiki light/dark CSS doubles file size | Use Shiki's dual-theme output with CSS variables; one markup, two themes via CSS vars |
| Preview iframe isolation adds complexity | Only use iframe when theme/RTL/viewport toggles are active; static previews render inline |

---

## 12. Testing strategy

- **Unit** (Vitest) — every new hook, variant function, token-derivation utility; per package.
- **Interaction** (Playwright) — every component's full keyboard pattern, focus trap, ARIA state transitions.
- **Accessibility** (axe-core in Playwright) — every component story + every doc page, in both themes.
- **Visual regression** (Playwright snapshots) — every component × light/dark × LTR/RTL = 4 snapshots per component.
- **Lighthouse CI** — runs on `/`, `/docs/components/button`, `/docs/components/data-table`, and `/docs/components/dialog` as representative pages; fails the build below thresholds.

---

## 13. Implementation order

Strict sequential. No phase starts until the previous is merged and its success criteria (scoped to that phase) are met.

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5a → 5b → 5c → 5d → 5e
```

Phase 5 sub-waves may overlap in review but not in implementation, to keep the review surface manageable.
