# Component Parity Audit

**Last updated:** 2026-04-18 (Wave D shipped — data + navigation P1 sweep)
**Spec:** `docs/superpowers/specs/2026-04-16-polish-overhaul-design.md` §8
**Purpose:** Track WeiUI's feature coverage vs best-in-class reference per component. Waves 5a–5e ship only when all P0 gaps close.

---

## Priority

- **P0** — Must-add for parity. Blocks wave completion. A feature is P0 only if its absence would make a reasonable user say the library is incomplete, and if the reference treats it as a baseline expectation.
- **P1** — Nice-to-have for v1 release. Added if time permits in wave.
- **P2** — Defer. Logged as roadmap item.

## Reference pins

| Component(s) | Best-in-class reference |
|--------------|-------------------------|
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

---

## Executive summary

| Wave | Components | P0 gaps | P1 gaps | P2 gaps |
|------|------------|---------|---------|---------|
| 5a Input family | 7 | 0 ✅ shipped | 6 (29 shipped in Wave C) | 11 |
| 5b Overlay | 7 | 0 ✅ shipped | 12 (19 shipped in Phase 6a) | 9 |
| 5c Data/Nav | 12 | 0 ✅ shipped | 9 (49 shipped in Wave D) | 24 |
| 5d Advanced | 9 | 0 ✅ shipped | 29 (25 shipped in Wave C) | 16 |
| 5e Form + display | 16 | 0 ✅ shipped | 38 | 30 |
| **Total** | **51** | **0** | **94** | **90** |

**Recommended wave order:** 5a → 5b → 5c → 5d → 5e. Each wave closes when its P0 column reaches 0.

**Highest P0 load per component:** Overlay family (Wave 5b) shipped 17 P0s. Wave 5c shipped 12 P0s — DataTable (4), Accordion (2), TreeView/Tabs/Sidebar/BottomNav/Stepper/Transfer (1 each). Wave 5d shipped 13 P0s — Calendar (3), DatePicker/Chart/Editor/SpeedDial (2 each), ColorPicker/Splitter (1 each). Wave 5e shipped 14 P0s — Checkbox (2), RadioGroup (2), ToggleGroup (2), Field (2), Button (2), Switch (1), Skeleton (1), Spinner (1), ProgressBar (1). **All waves P0 closed.** **Wave D (2026-04-18): Wave 5c P1 sweep — 49 P1 features shipped across DataTable (13), TreeView (6), Pagination (5), Tabs (3), Breadcrumb (1), Sidebar (5), AppBar (3), BottomNav (3), Accordion (1), Stepper (4), Timeline (3), Transfer (4) + Link (2). Sidebar off-canvas deferred to P2 (consumer wraps in Drawer using SidebarTrigger).**

---

# Wave 5a — Input family

## Input

**Reference:** react-aria / Mantine (generic text input)
**Status:** ⚠️ Partial — minimal native-input wrapper with `invalid` flag only.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Forwarded ref, native input attrs | ✅ | ✅ | — | — |
| `invalid` → `aria-invalid` + `data-invalid` | ✅ | ✅ | — | — |
| Size scale (sm/md/lg) | ✅ | ✅ | Add `size` variant | ✅ shipped |
| Start/end icon or addon slots | ✅ | ✅ | Add `startAddon` / `endAddon` slots | ✅ shipped |
| Clearable (clear button) | ✅ | ✅ | Add `clearable` + clear button | ✅ shipped |
| Password variant (show/hide toggle) | ✅ | ✅ | Add type=password with reveal | ✅ shipped |
| Search variant (search icon + clear) | ✅ | ✅ | Preset variant on Input | ✅ shipped |
| Character count / maxLength helper | ✅ | ✅ | Add `showCount` prop | ✅ shipped |
| Prefix/suffix text (e.g. "https://") | ✅ | ✅ | Covered by addon slots | ✅ shipped |
| Readonly styling hook | ⚠️ via native | ✅ explicit | Add `data-readonly` styling | **P2** |
| Composition inside Field with label/desc/error wiring | ✅ | ✅ integrated | Auto-wire aria-describedby when inside Field | ✅ shipped |

**Notes:** The current Input is a bare input wrapper. Size variants and icon/addon composition are baseline expectations for a design system and block form polish across the library. Password/Search are "variants of Input" per the plan — ship as composition primitives on top of a fleshed-out Input rather than separate components.

## Textarea

**Reference:** react-aria / Mantine
**Status:** ⚠️ Partial — native textarea wrapper only.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Forwarded ref, native textarea attrs | ✅ | ✅ | — | — |
| `invalid` → `aria-invalid` | ✅ | ✅ | — | — |
| Size variant | ✅ | ✅ | Add size prop | ✅ shipped |
| Autosize / auto-grow to content | ✅ | ✅ | Add `autosize` with optional min/max rows | ✅ shipped |
| Character counter | ✅ | ✅ | Add `showCount` + max length | ✅ shipped |
| Readonly styling hook | ⚠️ via native | ✅ explicit | Add `data-readonly` | **P2** |
| Resize control (resize: both/vertical/none) | ⚠️ via style | ✅ prop | Add `resize` prop | **P2** |
| Field integration (aria-describedby wire) | ✅ | ✅ | Wire from FieldContext | ✅ shipped |

**Notes:** Autosize is the headline P1 — without it, any form requiring comments or descriptions feels clumsy. Not P0 because consumers can fall back to the native behaviour.

## InputNumber

**Reference:** react-aria NumberField / Ant InputNumber
**Status:** ⚠️ Partial — stepper buttons + arrow keys + clamping, no format/locale.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Min / max / step + clamp | ✅ | ✅ | — | — |
| Controlled + uncontrolled | ✅ | ✅ | — | — |
| Arrow-up/down increment/decrement | ✅ | ✅ | — | — |
| Stepper buttons | ✅ | ✅ | — | — |
| PageUp/PageDown larger step | ✅ | ✅ | Add larger step on PageUp/Down | ✅ shipped |
| Home/End → min/max | ✅ | ✅ | Add Home/End | ✅ shipped |
| Mouse-wheel increment | ❌ | ✅ | Add wheel handler | **P2** |
| Locale-aware formatting (thousands, decimals) | ✅ | ✅ Intl.NumberFormat | Add `formatOptions` via Intl | ✅ shipped |
| Prefix / suffix (currency, %) | ✅ | ✅ | Add `formatOptions.style` support | ✅ shipped |
| Parse partial/invalid input without clobbering | ✅ | ✅ | Preserve intermediate typing state | ✅ shipped |
| `aria-valuetext` for humanised value | ✅ | ✅ | Expose aria-valuetext | ✅ shipped |
| Proper role + labeling (spinbutton on input) | ✅ | ✅ explicit `role="spinbutton"` | Wire spinbutton + aria-valuenow | ✅ shipped |

**Notes:** Locale-aware formatting is P0 because internationalised number input is a baseline expectation of a "business-level" design system and without it, currency and percentage fields have to be reinvented downstream. Parse-preserving input is the other headline hazard — current impl drops any non-numeric intermediate character, which breaks "1,2" → "1,200" entry flows.

## InputOTP

**Reference:** react-aria / shadcn OTPInput (input-otp)
**Status:** ⚠️ Partial — slots, paste, backspace navigation.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Configurable length | ✅ | ✅ | — | — |
| Controlled + uncontrolled | ✅ | ✅ | — | — |
| Paste-to-fill all slots | ✅ | ✅ | — | — |
| Backspace traversal | ✅ | ✅ | — | — |
| ArrowLeft / ArrowRight between slots | ✅ | ✅ | Add arrow navigation | ✅ shipped |
| Pattern constraint (numeric / alphanumeric) | ✅ | ✅ configurable | Add `pattern` prop | ✅ shipped |
| Group separator (e.g. 3-3 split) | ✅ | ✅ | Add `groups` prop | ✅ shipped |
| Auto-submit on complete | ✅ | ✅ | Add `onComplete` callback | ✅ shipped |
| Autocomplete="one-time-code" | ✅ | ✅ | Add autoComplete attr | ✅ shipped |
| Mask mode (password-style) | ❌ | ✅ | Add `mask` prop | **P2** |
| Disabled all slots | ✅ | ✅ | — | — |

**Notes:** Missing `autocomplete="one-time-code"` blocks iOS/Android SMS autofill — that's a real user-facing failure, hence P0. Arrow-key traversal is expected baseline — users who mis-type want to move back without deleting.

## AutoComplete

**Reference:** Downshift / react-aria ComboBox
**Status:** ⚠️ Partial — filtered list, keyboard nav, selection.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Filter options by input | ✅ | ✅ | — | — |
| ArrowUp/ArrowDown + Enter select | ✅ | ✅ | — | — |
| Escape to close | ✅ | ✅ | — | — |
| Highlighted index state + `aria-activedescendant` | ✅ | ✅ | — | — |
| Controlled open/close | ✅ | ✅ | Add `open`/`onOpenChange` | ✅ shipped |
| Controlled input value | ✅ | ✅ | Expose `inputValue` control | ✅ shipped |
| Async options / loading state | ✅ | ✅ | Add `loading` prop + pending slot | ✅ shipped |
| Custom filter function | ✅ | ✅ | Add `filter` prop | ✅ shipped |
| Empty state slot | ✅ | ✅ node | Accept ReactNode for emptyText | ✅ shipped |
| Render-prop for option | ✅ | ✅ | Add `renderOption` | ✅ shipped |
| Freeform value allowed | ✅ | ✅ explicit `allowsCustomValue` | Add prop | ✅ shipped |
| Floating placement / collision handling | ✅ | ✅ via Floating UI | Use `@floating-ui/react` | ✅ shipped |
| Virtualised list for large option sets | ❌ | ✅ | Optional virtualisation slot | **P2** |
| `clearable` | ✅ | ✅ | Add clear button | ✅ shipped |

**Notes:** Async loading is P0 — most real-world autocompletes hit an API and the user needs to see a pending indicator. Floating placement is also P0 because the raw absolute-positioned dropdown breaks inside scroll containers and modals. Consider sharing floating logic with MultiSelect and DatePicker to keep the hazard contained.

## MultiSelect

**Reference:** Downshift / react-aria / Mantine MultiSelect
**Status:** ⚠️ Partial — tags, keyboard nav, add/remove.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Tag pills with remove buttons | ✅ | ✅ | — | — |
| Controlled + uncontrolled values | ✅ | ✅ | — | — |
| ArrowUp/ArrowDown + Enter/Space toggle | ✅ | ✅ | — | — |
| `aria-multiselectable` | ✅ | ✅ | — | — |
| Search / type-ahead filter | ✅ | ✅ | Add filter input inside trigger | ✅ shipped |
| Max selectable limit | ✅ | ✅ | Add `max` prop | ✅ shipped |
| Creatable (add new values) | ✅ | ✅ | Add `creatable` + `onCreate` | ✅ shipped |
| Async loading | ✅ | ✅ | Add `loading` prop | ✅ shipped |
| Select all / clear all | ✅ | ✅ | Add controls | ✅ shipped |
| Floating placement | ✅ | ✅ | Use Floating UI | ✅ shipped |
| Disabled-option respect | ✅ | ✅ | Extend option type | ✅ shipped |
| Grouped options | ✅ | ✅ | Add `group` field to option type | ✅ shipped |
| Backspace removes last tag | ✅ | ✅ | Handle Backspace on trigger | ✅ shipped |
| Render custom tag / option | ❌ | ✅ | Add render props | **P2** |

**Notes:** Typeahead filter is P0 — selecting from 50+ options without a search field is a usability failure. Floating placement same as AutoComplete. The current "click to open a static list" flow scales poorly.

## FileUpload

**Reference:** Uppy / react-dropzone
**Status:** ⚠️ Partial — drag-drop, multi, max size filter.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Click-to-open picker | ✅ | ✅ | — | — |
| Drag-and-drop zone | ✅ | ✅ | — | — |
| `accept` mime-type filter | ✅ | ✅ | — | — |
| `multiple` | ✅ | ✅ | — | — |
| `maxSize` filter | ✅ | ✅ with error callback | Expose `onError` / validation errors | ✅ shipped |
| File list w/ remove button | ✅ | ✅ | — | — |
| Upload progress per file | ✅ | ✅ | Add progress slot / prop | ✅ shipped |
| Resume / retry on failure | ❌ | ✅ | Out of scope for v1 | **P2** |
| Chunked / resumable upload | ❌ | ✅ | Out of scope for v1 | **P2** |
| Cloud providers (S3, Dropbox) | ❌ | ✅ | Out of scope for v1 | **P2** |
| Preview thumbnails for images | ✅ | ✅ | Add thumbnail slot | ✅ shipped |
| File-count limit | ✅ | ✅ | Add `maxFiles` | ✅ shipped |
| File-type validation error UI | ✅ | ✅ | Expose `onError` + messaging | ✅ shipped |
| Controlled files list | ✅ | ✅ | Add `value`/`onChange` pattern | ✅ shipped |
| Paste files from clipboard | ❌ | ✅ | Add paste listener | **P2** |

**Notes:** Silent rejection of oversized / wrong-type files is the biggest hazard — users drag a 30 MB PDF and nothing happens. Surface a `onError(reason, file)` callback. Upload progress is P1 because many consumers use their own upload pipeline; WeiUI should make rendering progress easy, not own the transport. Don't try to ship chunked uploads — that's an Uppy-level concern.

---

# Wave 5b — Overlay family

## Dialog

**Reference:** Radix UI Dialog
**Status:** ⚠️ Partial — focus trap, scroll lock, labeled, modal-only.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Trigger + Content + Title + Description + Close parts | ✅ | ✅ | — | — |
| Controlled + uncontrolled via `open`/`defaultOpen` | ✅ via `useDisclosure` | ✅ | — | — |
| Focus trap within content | ✅ | ✅ | — | — |
| Focus first focusable on open, restore on close | ✅ | ✅ | — | — |
| Scroll lock on body | ✅ | ✅ | — | — |
| Escape to close | ✅ | ✅ | — | — |
| Outside click to close | ✅ | ✅ | — | — |
| `aria-labelledby` / `aria-describedby` wired | ✅ | ✅ | — | — |
| Portal rendering (render outside DOM tree) | ✅ | ✅ | Add Portal component, mount outside tree | ✅ shipped |
| Overlay/backdrop component | ✅ DialogOverlay | ✅ DialogOverlay | Add Overlay part | ✅ shipped |
| `modal={false}` non-modal variant | ✅ | ✅ | Add variant | ✅ shipped |
| Nested dialog stacking | ✅ | ✅ | Stack context | ✅ shipped |
| `onInteractOutside` / `onEscapeKeyDown` callbacks with preventable default | ✅ | ✅ | Add callbacks | ✅ shipped |
| `forceMount` for animation exit | ❌ | ✅ | Pass-through | **P2** |

**Notes:** Portal is the dealbreaker — without it, a Dialog opened inside an overflow-hidden or transformed ancestor clips or positions wrong. This is the highest-priority overlay fix and Dialog, Drawer, Popover, Menu, Toast, CommandPalette, DatePicker all need it. Build a single `<Portal>` primitive and compose. The Overlay element is P0 in the same breath — current Dialog has no backdrop rendered (Drawer does), so clicking outside the content works but there's no scrim.

## Drawer

**Reference:** Radix Dialog (variant) / Vaul
**Status:** ✅ Ships — focus trap, scroll lock, 4 sides, overlay.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Sides: left / right / top / bottom | ✅ | ✅ | — | — |
| Trigger + Content + Header + Footer + Close parts | ✅ | ✅ | — | — |
| Focus trap | ✅ | ✅ | — | — |
| Scroll lock | ✅ | ✅ | — | — |
| Overlay/backdrop | ✅ | ✅ | — | — |
| Escape + outside click | ✅ | ✅ | — | — |
| Portal rendering | ✅ | ✅ | Same Portal primitive | ✅ shipped |
| Swipe-to-dismiss (mobile) | ✅ pointer drag + flick | ✅ Vaul | Add gesture support | ✅ shipped |
| Snap points (partial open) | ❌ | ✅ Vaul | Out of scope for v1 | **P2** |
| Non-modal (dismiss by interacting elsewhere without close) | ❌ | ✅ | Add variant | **P2** |
| `onInteractOutside` preventable | ✅ | ✅ | Add callback | ✅ shipped |
| `onEscapeKeyDown` preventable | ✅ | ✅ | Add callback | ✅ shipped |
| Animations (slide-in/out) | ✅ in + exit via data-state | ✅ configurable | Slide-in + slide-out keyframes tied to `data-state` | ✅ shipped |

**Notes:** Portal is shared with Dialog. Swipe-to-dismiss is the expected mobile polish from Vaul — P1 because it's visible polish, not baseline correctness.

## Popover

**Reference:** Radix Popover
**Status:** ⚠️ Partial — Floating UI placed, focus trap, outside click.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Trigger + Content + Close parts | ✅ | ✅ | — | — |
| Floating UI placement with offset / flip / shift | ✅ | ✅ | — | — |
| Escape + outside click | ✅ | ✅ | — | — |
| Focus first focusable on open, restore on close | ✅ | ✅ | — | — |
| Focus trap | ✅ | ✅ | — | — |
| Controlled + uncontrolled open | ✅ via `open`/`onOpenChange` | ✅ | Expose `open`/`onOpenChange` via props | ✅ shipped |
| Portal rendering | ✅ | ✅ | Same Portal primitive | ✅ shipped |
| Configurable placement (side / align) | ✅ `side` + `align` props | ✅ 12 placements | Add `side` + `align` props | ✅ shipped |
| Anchor arrow element | ✅ `PopoverArrow` | ✅ `PopoverArrow` | Add Arrow part + Floating UI arrow middleware | ✅ shipped |
| Collision padding config | ✅ | ✅ | Add `collisionPadding` prop | ✅ shipped |
| Modal vs non-modal | ✅ `modal` prop (default false) | ✅ toggle | Add `modal` prop (default false for popover) | ✅ shipped |
| `onOpenAutoFocus` / `onCloseAutoFocus` preventable | ✅ | ✅ | Add callbacks | ✅ shipped |
| `onInteractOutside` / `onEscapeKeyDown` preventable | ✅ | ✅ | Add callbacks | ✅ shipped |

**Notes:** Popover has three P0s: (1) controlled open — the component can't be opened externally today; (2) Portal — see Dialog; (3) placement is hard-coded to `bottom-start` with no way for a consumer to override, so no "open above when near bottom of viewport" customisation. These are baseline for a Radix-quality popover.

## Tooltip

**Reference:** Radix Tooltip
**Status:** ⚠️ Partial — Floating UI, open delay.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Trigger + Content parts | ✅ | ✅ | — | — |
| Floating placement (default `top`) | ✅ | ✅ | — | — |
| Open delay | ✅ | ✅ | — | — |
| Pointer / hover open | ✅ | ✅ | Wire `useHover` from floating-ui | ✅ shipped |
| Keyboard focus open | ✅ | ✅ | Open on focusin, close on focusout | ✅ shipped |
| Close delay / hover-out grace | ✅ via `closeDelay` prop | ✅ | Add close delay | ✅ shipped |
| Provider for global delay config | ✅ TooltipProvider | ✅ TooltipProvider | Add provider | ✅ shipped |
| `role="tooltip"` + aria-describedby on trigger | ✅ auto-wired | ✅ auto-wired | Set `aria-describedby={tooltipId}` on trigger when open | ✅ shipped |
| Side / align / offset config | ✅ | ✅ | Add props | ✅ shipped |
| Portal rendering | ✅ | ✅ | Portal primitive | ✅ shipped |
| Escape to close | ✅ | ✅ | Close on Escape | ✅ shipped |
| Disabled-trigger tooltip passthrough | ❌ | ✅ | Expose `asChild` pattern | **P2** |

**Notes:** Tooltip's P0s are about basic correctness: hover + focus should open it, keyboard users need it, and `aria-describedby` has to be wired for screen readers to announce the content. Without these three the component is broken. The delay plumbing exists already — piggyback on it.

## Menu

**Reference:** Radix DropdownMenu / Ark UI Menu
**Status:** ⚠️ Partial — roving tab index, arrow keys, Home/End, focus restore.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Trigger + Content + Item + Separator parts | ✅ | ✅ | — | — |
| ArrowUp / ArrowDown / Home / End | ✅ | ✅ | — | — |
| Escape + outside click to close | ✅ | ✅ | — | — |
| Focus first item on open | ✅ | ✅ | — | — |
| Focus trigger on close | ✅ | ✅ | — | — |
| Type-ahead (first-letter search) | ✅ | ✅ | Add typeahead buffer | ✅ shipped |
| Disabled items skip over | ✅ `disabled` prop + skip logic | ✅ | Add `disabled` prop + skip logic | ✅ shipped |
| Submenu / nested menu | ❌ | ✅ | Out of scope for v1 | **P2** |
| CheckboxItem / RadioItem variants | ✅ `MenuCheckboxItem` / `MenuRadioItem` | ✅ | Add variants | ✅ shipped |
| Shortcut display | ✅ `shortcut` prop on items | ✅ | Add `shortcut` slot | ✅ shipped |
| Floating placement | ✅ Floating UI via `side`/`align` | ✅ | Add Floating UI | ✅ shipped |
| Portal rendering | ✅ | ✅ | Portal primitive | ✅ shipped |
| Label slot (group header) | ✅ `MenuLabel` | ✅ MenuLabel | Add MenuLabel | ✅ shipped |
| Group (role=group) | ❌ | ✅ MenuGroup | Add MenuGroup | **P2** |
| Side / align / offset | ✅ | ✅ | Add props | ✅ shipped |

**Notes:** Menu is arguably the overlay most behind Radix. Floating placement is P0 — the dropdown has no positioning logic and renders in place, which is wrong. Type-ahead is baseline for keyboard users. Submenus deferred to Wave 6.

## Toast

**Reference:** Sonner
**Status:** ⚠️ Partial — store, variants, auto-dismiss.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Imperative API (`toast()`, `toast.success`, `.error`, `.warning`) | ✅ | ✅ | — | — |
| Variants (default/success/destructive/warning) | ✅ | ✅ | — | — |
| Auto-dismiss timeout | ✅ | ✅ | — | — |
| Manual close button | ✅ | ✅ | — | — |
| Role=region live region | ✅ | ✅ | — | — |
| Per-toast `role="alert"` | ✅ | ✅ | — | — |
| Action button (`undo`-style) | ✅ | ✅ | Add `action` option | ✅ shipped |
| Promise-based toast (loading → success/error) | ✅ `toast.promise` | ✅ `toast.promise` | Add `toast.promise` | ✅ shipped |
| Stacking / expand on hover | ✅ | ✅ | Add stack behaviour | ✅ shipped |
| Swipe to dismiss (mobile) | ✅ pointer drag + flick | ✅ | Add gesture support | ✅ shipped |
| Position config (top/bottom × left/center/right) | ✅ `position` on Toaster | ✅ | Add `position` on Toaster | ✅ shipped |
| Pause on hover / focus | ✅ | ✅ | Pause timer on hover | ✅ shipped |
| Rich content (JSX description) | ✅ ReactNode title & description | ✅ ReactNode | Accept ReactNode | ✅ shipped |
| Dismiss programmatically by id | ✅ (`removeToast(id)`) | ✅ | — | — |
| Max visible + queueing | ❌ | ✅ | Add `max` prop | **P2** |
| Custom render | ❌ | ✅ | Add `render` option | **P2** |

**Notes:** Position config is P0 — a fixed single-region Toaster that can only live in one spot is a hard blocker for teams that already have one. Action button is P0 because "undo" is the defining Sonner feature and the undo-pattern is explicitly called out in the spec. Promise-based toast is the other high-value add and pairs nicely with action buttons.

## CommandPalette

**Reference:** cmdk / Raycast
**Status:** ⚠️ Partial — input, list, groups, shortcuts, global hotkey.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Input + filtered list | ✅ | ✅ | — | — |
| Keyboard navigation (Arrow / Enter / Escape) | ✅ | ✅ | — | — |
| Grouping via `group` field | ✅ | ✅ | — | — |
| Per-item shortcut display | ✅ | ✅ | — | — |
| Disabled item skip | ✅ | ✅ | — | — |
| Global hotkey (Cmd/Ctrl+K) | ✅ | ⚠️ manual in cmdk | — (bonus) | — |
| Recent / frecency items | ✅ (via `id` + `localStorage`) | ✅ | Add `recent` tracking + slot | ✅ shipped |
| Async filtering / loading state | ✅ `loading` prop | ✅ | Add `loading` prop | ✅ shipped |
| Per-item icon | ✅ | ✅ | Add `icon` field | ✅ shipped |
| Per-item keyboard-shortcut display | ✅ `shortcut` field rendered | ✅ | Add shortcut slot | ✅ shipped |
| Per-item keyboard-shortcut execution | ✅ Cmd/Ctrl/Shift/Alt + key | ✅ | Register each shortcut | ✅ shipped |
| Subpages / nested commands | ❌ | ✅ Raycast | Add `subItems` / nav stack | **P2** |
| Fuzzy matching scoring | ✅ match-sorter over label+group | ✅ weighted fuzzy | Add fuzzy matcher (e.g. match-sorter) | ✅ shipped |
| Focus trap + return focus to trigger | ✅ focus trap + return focus | ✅ | Add focus trap, restore on close | ✅ shipped |
| Portal rendering | ✅ | ✅ | Portal primitive | ✅ shipped |
| Animation on open/close | ✅ CSS animation (prefers-reduced-motion guarded) | ✅ | CSS animation with prefers-reduced-motion | ✅ shipped |
| Reset query on close | ✅ | ✅ | — | — |
| Custom empty state | ✅ `emptyState` ReactNode | ✅ ReactNode | Accept ReactNode | ✅ shipped |

**Notes:** Per-item icon is P0 because command palettes without icons look unfinished next to Raycast/Arc/VSCode. Focus trap is P0 — Tab currently exits the palette into the page below. Portal is the usual overlay P0.

---

# Wave 5c — Data/Navigation family

## DataTable

**Reference:** TanStack Table + Ant Design
**Status:** ⚠️ Partial — sort, global filter, pagination, row selection flag; lacks most data-grid features.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Column sorting (click header) | ✅ | ✅ | — | — |
| Global text filter | ✅ | ✅ | — | — |
| Client-side pagination | ✅ | ✅ | — | — |
| `selectable` flag for row selection state | ✅ | ✅ with checkbox column | Select column + select-all header | ✅ shipped |
| Page size selector | ✅ | ✅ | — | ✅ shipped |
| First / last page buttons | ✅ | ✅ | Add jump buttons | ✅ shipped |
| Jump to page (input) | ❌ | ✅ | Add page input | **P1** (Pagination ships; DataTable parity via Pagination) |
| Server-side pagination / sort / filter (onPaginationChange etc.) | ✅ | ✅ | `manualPagination` / `manualSorting` / `manualFiltering` + callbacks | ✅ shipped |
| Column resize | ✅ | ✅ | `enableColumnResizing` + drag handle | ✅ shipped |
| Column reorder | ❌ | ✅ | Add column reorder | **P2** |
| Column pinning (left/right sticky) | ✅ | ✅ | `enableColumnPinning` | ✅ shipped |
| Column visibility toggle | ✅ | ✅ | `enableColumnVisibility` menu | ✅ shipped |
| Per-column filters | ✅ | ✅ | `enableColumnFilters` row | ✅ shipped |
| Row expansion / nested rows | ✅ | ✅ | `enableExpanding` + `renderSubRow` | ✅ shipped |
| Grouping / aggregation | ❌ | ✅ | Add grouping | **P2** |
| Row virtualisation | ✅ | ✅ | `virtualize` via @tanstack/react-virtual | ✅ shipped |
| Sticky header | ✅ | ✅ | `stickyHeader` prop | ✅ shipped |
| Keyboard navigation (grid a11y) | ✅ | ✅ | Arrow/Home/End between cells | ✅ shipped |
| Loading state | ✅ | ✅ | `loading` + `loadingText` props | ✅ shipped |
| Empty state customisation | ✅ | ✅ ReactNode | `emptyText: ReactNode` | ✅ shipped |
| Row click / hover handlers | ✅ | ✅ | `onRowClick` prop | ✅ shipped |
| Dense/comfortable size variant | ✅ | ✅ | `size` prop (comfortable/dense) | ✅ shipped |
| Export to CSV / JSON | ❌ | ✅ Ant | Add export util | **P2** |
| Sticky selection state across pages | ✅ | ✅ | `getRowId` prop | ✅ shipped |

**Notes:** Three P0s, all about "this table is usable for a real backend":
(1) render a selection column + header select-all when `selectable` (currently only state);
(2) page size selector — 10 rows fixed is unusable for admin consoles;
(3) server-side mode — every real data table hits an API, and the current pure-client model can't support that. Everything else is P1 polish layered on TanStack's model. Be cautious not to reinvent TanStack — expose its primitives where possible.

## TreeView

**Reference:** react-arborist / Ant Tree
**Status:** ⚠️ Partial — expand/collapse, roving tab index, full WAI-ARIA tree keyboard.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Nested nodes with toggle | ✅ | ✅ | — | — |
| ArrowUp/Down/Left/Right/Home/End | ✅ | ✅ | — | — |
| Enter / Space to select | ✅ | ✅ | — | — |
| Single selection | ✅ | ✅ | — | — |
| Controlled expanded state | ✅ | ✅ | `expanded` + `onExpandedChange` props | ✅ shipped |
| Multi-selection | ✅ | ✅ | `selectionMode="multiple"` + `selectedIds`/`onSelectedIdsChange` | ✅ shipped |
| Drag-and-drop to reorder | ❌ | ✅ react-arborist | Add drag handlers; out of scope for v1 | **P2** |
| Node checkboxes (tri-state parent) | ✅ | ✅ Ant | `checkboxes` prop with tri-state propagation | ✅ shipped |
| Virtualisation for large trees | ❌ | ✅ | Add optional virtualiser | **P2** |
| Lazy loading of children | ✅ | ✅ | `loadChildren` callback | ✅ shipped |
| Type-ahead first-letter search | ✅ | ✅ | Typeahead buffer with 500ms reset | ✅ shipped |
| Icon / indicator per node | ✅ | ✅ | `icon` on TreeNode | ✅ shipped |
| Controlled selected state | ✅ | ✅ | Multi-select controlled via `selectedIds` | ✅ shipped |
| Expand/collapse all | ❌ | ✅ | Add util methods | **P2** |
| Depth-aware indentation | ✅ | ✅ | `data-depth` + CSS var | ✅ shipped |

**Notes:** Controlled expanded is the only P0 — everything else here is advanced use. The current API limits trees to small static sets; okay for v1 but lazy loading and virtualisation are on the roadmap.

## Pagination

**Reference:** Ant Pagination
**Status:** ⚠️ Partial — page range with ellipsis, prev/next, current-page.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Page buttons + ellipsis range | ✅ | ✅ | — | — |
| Previous / next | ✅ | ✅ | — | — |
| Sibling count config | ✅ | ✅ | — | — |
| Current page `aria-current` | ✅ | ✅ | — | — |
| Disabled state on prev/next at ends | ✅ | ✅ | — | — |
| First / last jump buttons | ✅ | ✅ | `showFirstLast` prop | ✅ shipped |
| Page-size selector | ✅ | ✅ | `pageSizeOptions` + `onPageSizeChange` | ✅ shipped |
| Jump to page (input) | ✅ | ✅ | `jumpInput` prop | ✅ shipped |
| Total items display | ✅ | ✅ | `showTotal` (bool or render fn) | ✅ shipped |
| Size variants | ✅ | ✅ | `size: sm/md/lg` | ✅ shipped |
| Simple / mini variant | ❌ | ✅ | Add variant | **P2** |
| Controlled only (no uncontrolled) | ✅ controlled | ✅ both | Optional defaultPage | **P2** |

**Notes:** No P0s here — current Pagination matches baseline expectations. Most gaps are Ant's richer feature set.

## Tabs

**Reference:** Radix Tabs / shadcn
**Status:** ⚠️ Partial — trigger/content/list, controlled value; no keyboard nav in the list.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Tabs + TabsList + TabsTrigger + TabsContent parts | ✅ | ✅ | — | — |
| Controlled + uncontrolled via `value`/`defaultValue` | ✅ | ✅ | — | — |
| `role=tablist/tab/tabpanel` + aria linkage | ✅ | ✅ | — | — |
| Tab roving tab index (active = 0, rest = -1) | ✅ | ✅ | — | — |
| ArrowLeft / ArrowRight to switch tab | ✅ | ✅ | TabsList handles arrow nav | ✅ shipped |
| Home / End | ✅ | ✅ | Same TabsList handler | ✅ shipped |
| Automatic vs manual activation mode | ✅ | ✅ `activationMode` | `activationMode: automatic/manual` prop | ✅ shipped |
| Horizontal / vertical orientation | ✅ | ✅ | `orientation` prop on TabsList | ✅ shipped |
| Disabled tab skip | ✅ | ✅ | Arrow nav skips `[disabled]` triggers | ✅ shipped |
| Loop navigation at ends | ✅ | ✅ | `loop` prop on TabsList | ✅ shipped |

**Notes:** Arrow-key nav in the tab list is P0 — it's the one thing tabs MUST do per WAI-ARIA and the current impl punts it to the parent. Everything else is P1 polish.

## Breadcrumb

**Reference:** shadcn / Radix-style primitives
**Status:** ✅ Ships — nav, items, separators, active state.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| `nav aria-label="Breadcrumb"` + `ol` structure | ✅ | ✅ | — | — |
| Breadcrumb + BreadcrumbItem + BreadcrumbSeparator | ✅ | ✅ | — | — |
| `aria-current="page"` on active item | ✅ | ✅ | — | — |
| Custom separator | ✅ (children of Separator) | ✅ | — | — |
| Collapse middle items (with `...` + popover to reveal) | ✅ | ✅ | `BreadcrumbEllipsis` + `maxItems` auto-truncate | ✅ shipped |
| Link primitive integration (Next Link, router link) | ⚠️ consumer composes | ✅ | Document pattern; no code change | **P2** |
| Icon-only variant | ❌ | ✅ | Add size / variant | **P2** |
| Responsive truncation | ❌ | ✅ | CSS-only via logical props | **P2** |

**Notes:** No P0s — this is the cleanest component in the nav family. Ellipsis-collapse is the top roadmap item.

## Sidebar

**Reference:** shadcn sidebar
**Status:** ⚠️ Partial — collapse flag + header/content/footer/item parts.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Sidebar + Header + Content + Footer + Item parts | ✅ | ✅ | — | — |
| Collapsed / expanded state (controlled + uncontrolled) | ✅ via `useDisclosure` | ✅ | — | — |
| Active item (`aria-current="page"`) | ✅ | ✅ | — | — |
| Icon-only collapsed mode | ✅ | ✅ | SidebarItem wraps label; CSS hides on `[data-collapsed]` | ✅ shipped |
| Toggle button / trigger | ✅ | ✅ SidebarTrigger | `SidebarTrigger` with aria-expanded | ✅ shipped |
| Off-canvas / sheet mode on mobile | ❌ (deferred) | ✅ | Consumer wraps in Drawer via SidebarTrigger | **P2** (deferred) |
| Keyboard shortcut to toggle | ❌ | ✅ | Document pattern via context | **P2** |
| Group / section separators | ✅ | ✅ | `SidebarGroup` + `SidebarGroupLabel` | ✅ shipped |
| Nested items / submenu | ✅ | ✅ | `SidebarSubMenu` with collapsible trigger | ✅ shipped |
| Tooltip on collapsed items | ✅ | ✅ | `title` attr shown only when collapsed | ✅ shipped |
| Persist state to localStorage | ❌ | ✅ | Optional persistence | **P2** |

**Notes:** Collapsed mode works in state but without the icon-only CSS it's half a feature — hence P0. Off-canvas responsive mode is what makes a sidebar production-ready; bump to Wave 6 if time-bound.

## AppBar

**Reference:** MUI AppBar
**Status:** ✅ Ships — structural parts (Brand, Nav, Link, Actions).

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| AppBar + Brand + Nav + Link + Actions parts | ✅ | ✅ | — | — |
| Active link indicator (`aria-current="page"`) | ✅ | ✅ | — | — |
| Sticky / fixed positioning | ✅ | ✅ | `position: sticky/fixed/static` | ✅ shipped |
| Color / surface variant | ✅ | ✅ | `color: surface/primary/transparent` | ✅ shipped |
| Elevation / scroll-shadow | ❌ | ✅ | Add scroll-aware shadow | **P2** |
| Responsive: collapse nav into drawer at breakpoint | ✅ | ✅ | nav hidden below 48rem via CSS | ✅ shipped |
| Search / command slot | ❌ | ✅ | Composable via Actions | **P2** |

**Notes:** Structural component, no P0s. Sticky positioning is the most-requested add.

## BottomNav

**Reference:** MUI BottomNavigation
**Status:** ✅ Ships — items with icon + label + active.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Items with icon + label | ✅ | ✅ | — | — |
| Active highlight (`aria-current="page"`) | ✅ | ✅ | — | — |
| `showLabels` mode (labels only when active) | ✅ | ✅ | `showLabels: always/active/never` | ✅ shipped |
| Badge slot on item | ✅ | ✅ | `badge` prop on BottomNavItem | ✅ shipped |
| Controlled value (which item active) | ✅ | ✅ onChange pattern | `value` + `onValueChange` via context | ✅ shipped |
| Safe-area padding for iOS | ✅ | ✅ | `padding-block-end: env(safe-area-inset-bottom, 0)` | ✅ shipped |

**Notes:** Safe-area-inset is P0 for mobile production use — without it the nav is partially covered by the home indicator on iPhones. One-line CSS fix.

## Accordion

**Reference:** Radix Accordion
**Status:** ⚠️ Partial — single/multiple, aria wiring; lacks keyboard nav.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Accordion + Item + Trigger + Content parts | ✅ | ✅ | — | — |
| `type` single / multiple | ✅ | ✅ | — | — |
| Default expanded | ✅ | ✅ | — | — |
| `aria-expanded` + `aria-controls` | ✅ | ✅ | — | — |
| Controlled `value` / `onValueChange` | ✅ | ✅ | Added to Accordion | ✅ shipped |
| ArrowDown / ArrowUp between triggers | ✅ | ✅ | Root handler at Accordion | ✅ shipped |
| Home / End | ✅ | ✅ | Same root handler | ✅ shipped |
| Collapsible (single mode can all be closed) | ⚠️ clear via re-click | ✅ `collapsible` prop | Add explicit `collapsible` | **P2** |
| Disabled item | ✅ | ✅ | `disabled` on AccordionItem | ✅ shipped |
| Orientation vertical/horizontal | ❌ | ✅ | Add prop | **P2** |
| Animated expand (keep content in DOM) | ❌ (unmounts when closed) | ✅ via forceMount or data-state | Keep DOM, animate height | **P1** |

**Notes:** Two P0s. Controlled mode is expected on every WAI-ARIA composite. Keyboard nav between triggers is baseline. Animated expand is a known hazard — switching from "unmount" to "always render with data-state" is the idiomatic path and needs CSS coordination.

## Stepper

**Reference:** Mantine Stepper / Ant Steps
**Status:** ⚠️ Partial — horizontal/vertical, active + completed state.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Stepper + Step + StepSeparator parts | ✅ | ✅ | — | — |
| Active / completed state | ✅ | ✅ | — | — |
| Orientation horizontal / vertical | ✅ | ✅ | — | — |
| `aria-current="step"` | ✅ | ✅ | — | — |
| Clickable steps (navigate to prior step) | ✅ | ✅ `onStepClick` | `onStepClick` on Stepper | ✅ shipped |
| Error state on step | ✅ | ✅ | `error` prop on Step | ✅ shipped |
| Progress line connector | ✅ | ✅ | Animated separator pseudo-element | ✅ shipped |
| Custom icons per step | ✅ | ✅ | `icon`, `completedIcon`, `errorIcon` props | ✅ shipped |
| Description slot | ✅ | ✅ | — | — |
| Responsive / collapsed on small screens | ❌ | ✅ | Add responsive mode | **P2** |
| Controlled active step | ✅ (required) | ✅ | — | — |
| Step index auto (parent counts children) | ✅ | ✅ | Stepper clones children + injects index | ✅ shipped |
| Optional "optional" label | ❌ | ✅ | Add `optional` flag | **P2** |

**Notes:** Auto step index is P0 — forcing consumers to hand-number every Step is error-prone and breaks when steps are conditionally rendered. Fix by having Stepper clone children with an injected index.

## Timeline

**Reference:** Ant Timeline
**Status:** ✅ Ships — item with title/description/time + line.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Timeline + TimelineItem parts | ✅ | ✅ | — | — |
| Title / description / time slots | ✅ | ✅ | — | — |
| Alternate left/right layout | ✅ | ✅ | `mode: default/alternate/left/right` | ✅ shipped |
| Custom dot / icon per item | ✅ | ✅ | `dot` prop on TimelineItem | ✅ shipped |
| Color per item (success/warning/error) | ✅ | ✅ | `color` prop on TimelineItem | ✅ shipped |
| Pending last-item animation | ❌ | ✅ | Add `pending` prop | **P2** |
| Reverse order | ❌ | ✅ | Add prop | **P2** |

**Notes:** No P0s — it's a display primitive. Custom dot is the first Ant feature to add.

## Transfer

**Reference:** Ant Transfer
**Status:** ⚠️ Partial — two lists with move buttons, checkboxes, disabled-item respect.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Two-list layout with move buttons | ✅ | ✅ | — | — |
| Per-item checkbox + selection state | ✅ | ✅ | — | — |
| Disabled items | ✅ | ✅ | — | — |
| Move selected to opposite side | ✅ | ✅ | — | — |
| Controlled value (target items) | ✅ | ✅ | `targetValues` + `onTargetValuesChange` | ✅ shipped |
| Search within each pane | ✅ | ✅ | `searchable` prop | ✅ shipped |
| Select-all per pane | ✅ | ✅ | Header checkbox with indeterminate | ✅ shipped |
| Move-all button | ✅ | ✅ | `>>` / `<<` buttons | ✅ shipped |
| Keyboard navigation within pane | ✅ | ✅ | Arrow / Home / End / Space / Enter | ✅ shipped |
| Custom item render | ❌ | ✅ | Add `renderItem` | **P2** |
| Drag to reorder within target | ❌ | ✅ | Out of scope for v1 | **P2** |
| Async data source | ❌ | ✅ | Add `loading` + load callback | **P2** |

**Notes:** Controlled value is P0 — real forms need to lift Transfer state for validation/submit. Current implementation keeps state internal and the `onChange` callback fires but consumers can't force a reset.

---

# Wave 5d — Advanced

## DatePicker

**Reference:** react-aria DatePicker / Mantine DateInput
**Status:** ✅ Ships — trigger + Floating UI popover, Calendar, locale, min/max, disabled-date predicate.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Trigger button + popover + Calendar | ✅ | ✅ | — | — |
| Min / max date | ✅ | ✅ | — | — |
| Locale-aware display | ✅ | ✅ Intl | Pass locale prop, use Intl | ✅ shipped |
| Controlled + uncontrolled | ⚠️ controlled-only (`value`/`onChange`) | ✅ | Add `defaultValue` pattern | **P1** |
| Typed input (DateInput-style segmented input) | ✅ | ✅ | Add segmented input variant | ✅ shipped |
| Range mode (start + end) | ✅ | ✅ | Add DateRangePicker | ✅ shipped |
| Time picker integration | ❌ | ✅ | Add time fields | **P2** |
| Preset shortcuts (Today, Last 7 days) | ✅ | ✅ | Add `presets` slot | ✅ shipped |
| Disable specific dates (`isDateDisabled`) | ✅ | ✅ | Add predicate prop | ✅ shipped |
| Clearable | ✅ | ✅ | Add clear button | ✅ shipped |
| Floating placement for popover | ✅ | ✅ | Use Floating UI | ✅ shipped |
| Form name + submit value | ✅ | ✅ | Add hidden input with ISO value | ✅ shipped |
| `aria-label` on trigger | ✅ | ✅ | — | — |
| Week numbers | ❌ | ✅ | Add `showWeekNumbers` | **P2** |
| Year / month dropdown nav | ✅ | ✅ | Add month+year select | ✅ shipped |

**Notes:** Locale-aware display is P0 — "Apr 16, 2026" is fine for US users and broken for everyone else. Floating placement is P0 for the same reason as other popovers. Range mode and typed input are the biggest roadmap items.

## Calendar

**Reference:** react-aria Calendar / Mantine Calendar
**Status:** ✅ Ships — month grid, locale + firstDayOfWeek, full WAI-ARIA grid keyboard nav (arrows, Home/End, PgUp/PgDn), disabled-date predicate.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Month grid with outside-day handling | ✅ | ✅ | — | — |
| Prev / next month buttons | ✅ | ✅ | — | — |
| Selected / today / disabled data attrs | ✅ | ✅ | — | — |
| Controlled + uncontrolled selection | ✅ | ✅ | — | — |
| Grid keyboard nav (ArrowKeys + Home/End + PgUp/PgDn) | ✅ | ✅ | Add grid a11y | ✅ shipped |
| Locale-aware weekday names | ✅ | ✅ | Use Intl.DateTimeFormat | ✅ shipped |
| First day of week config | ✅ | ✅ | Add `firstDayOfWeek` | ✅ shipped |
| Year / month dropdowns | ✅ | ✅ | Add nav dropdowns | ✅ shipped |
| Multi-month view | ❌ | ✅ | Add `numberOfMonths` | **P2** |
| Date range mode | ✅ | ✅ | Add range selection | ✅ shipped |
| Disable dates predicate | ✅ | ✅ | Add `isDateDisabled` | ✅ shipped |
| Custom day render | ✅ | ✅ | Add `renderDay` | ✅ shipped |
| RTL support | ✅ | ✅ | Verify with RTL tests | ✅ shipped |
| Focus visible day on mount | ✅ | ✅ | Focus today if no selection | ✅ shipped |

**Notes:** Three P0s, all about internationalisation and a11y baseline. Grid keyboard nav (up/down jumps a week, left/right jumps a day) is WAI-ARIA baseline. Locale and first-day-of-week are baseline for anyone outside the US. These tend to land together.

## Chart

**Reference:** Recharts (currently used) / Nivo / Visx
**Status:** ✅ Ships — wraps Recharts with BarChart/LineChart/AreaChart/PieChart/DonutChart/RadarChart.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Bar / Line / Area / Pie / Donut / Radar | ✅ | ✅ | — | — |
| Responsive container | ✅ | ✅ | — | — |
| Tooltip / legend defaults | ✅ | ✅ | — | — |
| Token-driven default palette | ✅ | N/A | — | — |
| `aria-label` + `role="img"` on chart | ✅ | ⚠️ not default | — | — |
| Screen-reader data table fallback | ✅ | ✅ Highcharts / Visx | Add visually-hidden table | ✅ shipped |
| Reduced-motion animation respect | ✅ | ✅ | Set `isAnimationActive=false` under prefers-reduced-motion | ✅ shipped |
| Dark-mode theming via tokens | ⚠️ colors via CSS vars but axis ticks etc. not themed | ✅ | Thread token into tick fill / stroke | **P1** |
| Custom legend / tooltip | ⚠️ pass-through via Recharts | ✅ | Document pattern | **P1** |
| Brush / zoom | ❌ | ✅ Recharts | Expose Brush component | **P1** |
| Stacked variants | ⚠️ bar/area partially support stacking but not surfaced | ✅ | Add `stacked` prop | **P1** |
| Sparkline mini-chart | ❌ | ✅ Nivo | Add variant | **P2** |
| Scatter / bubble | ❌ | ✅ | Add variants | **P2** |
| Axis formatting (currency, %, dates) | ❌ | ✅ | Add formatter props | **P1** |
| Empty / no-data state | ❌ | ✅ | Add empty slot | **P1** |

**Notes:** A11y SR fallback is P0 for "business-level" use — a chart without a data table is inaccessible to screen-reader users. Reduced-motion is P0 per the spec (all animations must be inside the prefers-reduced-motion: no-preference block). Both are small fixes on top of Recharts.

## Editor

**Reference:** Tiptap + ProseMirror
**Status:** ✅ Ships — StarterKit, bold/italic/strike/headings/lists/blockquote/code, link insertion, extensions merge.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Rich-text editing powered by Tiptap | ✅ | ✅ | — | — |
| Basic toolbar (B/I/S, H1-3, lists, blockquote, code) | ✅ | ✅ | — | — |
| Controlled + uncontrolled value (HTML) | ✅ | ✅ | — | — |
| Placeholder via extension | ✅ | ✅ | — | — |
| `aria-label` on toolbar | ✅ | ✅ | — | — |
| Disabled state | ✅ | ✅ | — | — |
| Link insertion / editing | ✅ | ✅ | Add Link extension + toolbar button | ✅ shipped |
| Image insertion / upload hook | ❌ | ✅ | Add image extension + upload callback | **P1** |
| Undo / redo buttons | ❌ (Cmd+Z works via ProseMirror) | ✅ | Add toolbar buttons | **P1** |
| Keyboard shortcut hints in toolbar | ❌ | ✅ | Add title attr with shortcut | **P1** |
| Markdown / HTML export | ⚠️ HTML via `getHTML` | ✅ Tiptap markdown ext | Add `onChangeMarkdown` variant | **P1** |
| Bubble menu / floating toolbar | ❌ | ✅ | Add BubbleMenu component | **P1** |
| Slash command menu | ❌ | ✅ | Add SlashCommand extension | **P2** |
| Table extension | ❌ | ✅ | Add Table ext | **P2** |
| Code highlighting (prismjs / lowlight) | ❌ | ✅ | Add CodeBlockLowlight ext | **P1** |
| Collaborative editing (Y.js) | ❌ | ✅ | Out of scope for v1 | **P2** |
| Character / word count | ❌ | ✅ | Add CharacterCount ext | **P1** |
| Configurable toolbar (pick actions) | ❌ | ✅ | Add `toolbar` prop | **P1** |
| Extensions prop for custom nodes | ✅ | ✅ | Expose `extensions` prop | ✅ shipped |
| Controlled HTML via setContent loop guard | ⚠️ has guard but runs on every value change | ✅ | Keep guard; audit for infinite loop | **P1** |

**Notes:** Two P0s. Link insertion is the most-requested missing feature in any rich-text editor (Tiptap StarterKit does not include Link). Exposing `extensions` is P0 because the spec calls for "extensions API" and without it, consumers can't customise anything. Image upload bridges into FileUpload — share infrastructure.

## ColorPicker

**Reference:** react-colorful / Mantine ColorPicker
**Status:** ✅ Ships — hue slider + hex input + swatches + saturation/value area; accepts `oklch(...)` strings.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Hex input | ✅ | ✅ | — | — |
| Hue slider | ✅ | ✅ | — | — |
| Optional swatches row | ✅ | ✅ | — | — |
| Controlled + uncontrolled | ✅ | ✅ | — | — |
| Saturation / value area (2D canvas) | ✅ | ✅ | Add SV area | ✅ shipped |
| Alpha channel | ✅ | ✅ | Add alpha slider | ✅ shipped |
| Color format toggle (hex/rgb/hsl/oklch) | ✅ | ✅ | Add format prop | ✅ shipped |
| Eyedropper (EyeDropper API) | ❌ | ✅ Mantine | Add eyedropper button | **P2** |
| Preset palette integration | ✅ swatches | ✅ | — | — |
| Inline vs popover presentation | ✅ | ✅ | Add popover variant | ✅ shipped |
| Copy hex to clipboard | ❌ | ✅ | Add copy button | **P2** |
| Label-announced color changes | ✅ | ✅ | Announce via live region | ✅ shipped |

**Notes:** Saturation/value area is P0 — a color picker that only lets you adjust hue isn't a usable color picker, it's a hue picker. Consider delegating to react-colorful for the SV area and layering our token-themed chrome on top.

## Slider

**Reference:** Radix Slider / Ant Slider
**Status:** ⚠️ Partial — single thumb, keyboard, pointer, clamp.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Single value controlled + uncontrolled | ✅ | ✅ | — | — |
| ArrowKeys + Home/End | ✅ | ✅ | — | — |
| Pointer drag | ✅ | ✅ | — | — |
| Clamp to min/max + step | ✅ | ✅ | — | — |
| `aria-valuenow/valuemin/valuemax` on thumb | ✅ | ✅ | — | — |
| Range mode (two thumbs) | ✅ | ✅ | Add range variant | ✅ shipped |
| Vertical orientation | ✅ | ✅ | Add `orientation` | ✅ shipped |
| Step marks / ticks | ✅ | ✅ | Add `marks` prop | ✅ shipped |
| Inverted direction (RTL) | ⚠️ CSS logical props used | ✅ | Verify RTL end-to-end | **P1** |
| Tooltip on drag | ✅ | ✅ | Add tooltip slot | ✅ shipped |
| PageUp/PageDown large step | ✅ | ✅ | Add | ✅ shipped |
| `aria-valuetext` for humanised | ✅ | ✅ | Add | ✅ shipped |
| Custom formatter for value display | ✅ | ✅ | Add `formatValue` | ✅ shipped (P2) |
| Form name / submit value | ✅ | ✅ | Add hidden input | ✅ shipped |

**Notes:** No P0s — the single-thumb slider is correct and a11y-clean. Range + vertical + marks are the top feature adds.

## Rating

**Reference:** Ant Rate / Radix-style
**Status:** ⚠️ Partial — stars, keyboard, read-only, disabled.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| N-star render with fill state | ✅ | ✅ | — | — |
| Controlled + uncontrolled | ✅ | ✅ | — | — |
| ArrowKeys / Home / End | ✅ | ✅ | — | — |
| Read-only + disabled | ✅ | ✅ | — | — |
| `role=radiogroup/radio` with aria-checked | ✅ | ✅ | — | — |
| Half-star support | ✅ | ✅ | Add `allowHalf` | ✅ shipped |
| Custom icon | ✅ | ✅ | Add `icon` prop | ✅ shipped |
| Hover preview | ❌ | ✅ | Add hover state | **P1** |
| Clear on click-again | ✅ | ✅ | Add `allowClear` | ✅ shipped |
| Character variant (emoji / text) | ❌ | ✅ | Via `icon` | **P2** |
| Tooltip per star | ❌ | ✅ | Add `tooltips` prop | **P2** |

**Notes:** No P0s. Half-star shipped — the headline feature Ant users expect.

## SpeedDial

**Reference:** MUI SpeedDial
**Status:** ✅ Ships — trigger + menu with keyboard open + arrow nav + Escape to close.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Trigger + action buttons | ✅ | ✅ | — | — |
| Open on click | ✅ | ✅ | — | — |
| Close after action fires | ✅ | ✅ | — | — |
| Open on hover | ❌ | ✅ | Add `trigger="hover"` | **P1** |
| Keyboard open + arrow nav | ✅ | ✅ | Add keyboard open + arrow nav | ✅ shipped |
| Escape to close | ✅ | ✅ | Add | ✅ shipped |
| Direction (up/down/left/right) | ❌ (CSS implied only) | ✅ | Add `direction` prop | **P1** |
| Outside click close | ❌ | ✅ | Add useOutsideClick | **P1** |
| Per-action tooltip | ⚠️ aria-label only | ✅ | Integrate Tooltip | **P1** |
| Backdrop / scrim | ❌ | ✅ | Add optional backdrop | **P2** |
| Animation stagger | ❌ | ✅ | Add stagger CSS | **P1** |

**Notes:** Two P0s. Keyboard open + arrow nav is baseline — SpeedDial is a menu-variant and inherits menu a11y. Escape to close is a one-liner. Outside-click close is P1 but practically must ship with these.

## Splitter

**Reference:** Ant Splitter / react-resizable-panels
**Status:** ✅ Ships — two-panel, horizontal/vertical, keyboard + pointer drag, controlled sizes.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Two-panel horizontal / vertical | ✅ | ✅ | — | — |
| Pointer drag to resize | ✅ | ✅ | — | — |
| Arrow keys to resize | ✅ | ✅ | — | — |
| Min size per side | ✅ (single `minSize`) | ✅ per-panel | Accept per-panel min/max | **P1** |
| `role="separator"` + aria-valuenow | ✅ | ✅ | — | — |
| N-panel (not just 2) | ❌ | ✅ | Add n-panel support | **P1** |
| Collapsible panel (double-click collapse) | ❌ | ✅ | Add `collapsible` | **P1** |
| Controlled sizes | ✅ | ✅ | Add `sizes`/`onSizesChange` | ✅ shipped |
| Persist sizes to localStorage | ❌ | ✅ | Optional `id` + persistence | **P2** |
| Max size per panel | ❌ | ✅ | Add maxSize | **P1** |
| Nested splitters | ⚠️ technically possible | ✅ | Document pattern | **P2** |

**Notes:** Controlled sizes is P0 — layouts that reset on remount (e.g. routing) can't restore panel sizes without external control.

---

# Wave 5e — Form + display primitives

## Button

**Reference:** Radix-style primitive + tailwind-variants (shadcn)
**Status:** ✅ Ships — variant/size/color + loading + icons.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Variant (solid/outline/ghost/etc.) via tailwind-variants | ✅ | ✅ | — | — |
| Size scale (sm/md/lg) | ✅ | ✅ | — | — |
| Color (primary/destructive/...) | ✅ | ✅ | — | — |
| Loading state with `aria-busy` | ✅ | ✅ | — | — |
| Start / end icon slots | ✅ | ✅ | — | — |
| Disabled | ✅ | ✅ | — | — |
| Spinner inside loading state | ✅ | ✅ | Show Spinner when loading | ✅ shipped |
| `asChild` (render-as) pattern for Link / router integration | ✅ | ✅ Radix Slot | `asChild` clones single child and forwards props + ref | ✅ shipped |
| Icon-only variant (square) | ✅ | ✅ | `iconOnly` renders square padding + aspect-ratio 1/1 | ✅ shipped |
| Full-width variant | ✅ | ✅ | `fullWidth` stretches to container via `wui-button--full-width` | ✅ shipped |
| Type button default | ✅ | ✅ explicit `type="button"` default | Default to `type="button"` to avoid form-submit surprises | ✅ shipped |
| `aria-label` required when icon-only | ⚠️ consumer-responsibility | ✅ dev-warning | Document pattern | **P2** |

**Notes:** Two P0s. Loading without a spinner leaves the button blank during requests — cosmetic but breaks user feedback. `type="button"` default is a well-known footgun (in Radix/shadcn it's baseline). `asChild` is the idiomatic pattern for router-link integration.

## ButtonGroup

**Reference:** Mantine ButtonGroup / Chakra
**Status:** ⚠️ Partial — role="group" wrapper only.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| `role="group"` wrapper | ✅ | ✅ | — | — |
| Horizontal / vertical orientation | ✅ | ✅ | `orientation` prop + `wui-button-group--vertical` | ✅ shipped |
| Attached (no gap, merged borders) vs spaced | ✅ | ✅ | `variant="attached" \| "spaced"` via CSS modifier | ✅ shipped |
| Size inheritance to children | ✅ | ✅ | `ButtonGroupContext` propagates `size` to child Buttons | ✅ shipped |
| Shared variant on children | ✅ | ✅ | `ButtonGroupContext` carries `variant` for children | ✅ shipped |
| Aria-label / label slot | ⚠️ consumer adds | ✅ | Expose `label` prop | **P2** |

**Notes:** No P0s — it's structural. Size/variant propagation is the headline Mantine feature worth copying.

## Checkbox

**Reference:** Radix Checkbox / Mantine
**Status:** ❌ Stub only — unstyled native checkbox with inline label.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Native checkbox input + label | ✅ | ✅ | — | — |
| `forwardRef` to input | ✅ | ✅ | — | — |
| Custom visual (CSS-styled box + check icon) | ✅ | ✅ | Replace with CSS-styled check using ::before / mask | ✅ shipped |
| Indeterminate state | ✅ | ✅ | Support `indeterminate` prop | ✅ shipped |
| Controlled + uncontrolled | ⚠️ via native `checked`/`defaultChecked` | ✅ | — | — |
| Size variant | ✅ | ✅ | `size="sm" \| "md" \| "lg"` scales box + label | ✅ shipped |
| Color variant | ✅ | ✅ | `color="primary" \| "success" \| "warning" \| "destructive"` via token-driven CSS modifier | ✅ shipped |
| Error / invalid state | ✅ | ✅ | `invalid` + `error` wire `aria-invalid` and destructive border | ✅ shipped |
| Description slot | ✅ | ✅ | `description` renders beneath label and wires `aria-describedby` | ✅ shipped |
| Disabled styling | ✅ | ✅ | Native `:disabled` plus label styling via sibling selector | ✅ shipped |

**Notes:** Checkbox is a stub — the visual is the browser default, which is a regression from the tokens/design system goal. Custom visual is P0 because the whole design-system promise assumes consistent styling. Indeterminate is P0 for data-table select-all.

## RadioGroup

**Reference:** Radix RadioGroup / Mantine
**Status:** ⚠️ Partial — controlled group + item, native radio, inline label; no arrow-key nav, no custom visual.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| RadioGroup + Item parts | ✅ | ✅ | — | — |
| Controlled + uncontrolled | ✅ via `useControllable` | ✅ | — | — |
| `role="radiogroup"` | ✅ | ✅ | — | — |
| Auto-generated name | ✅ | ✅ | — | — |
| Custom visual (styled radio) | ✅ | ✅ | CSS-styled radio | ✅ shipped |
| Arrow-key navigation within group | ✅ | ✅ | Add keyboard nav | ✅ shipped |
| Size variant | ✅ | ✅ | `size` on group propagates to items via `wui-radio-group--sm \| --lg` | ✅ shipped |
| Disabled on group (applies to all items) | ✅ | ✅ | `disabled` on group forwarded via context; per-item disabled still honored | ✅ shipped |
| Required / invalid forwarding | ✅ | ✅ | `required` / `invalid` on group forward `aria-required` / `aria-invalid` to every item | ✅ shipped |
| Orientation (horizontal/vertical) | ✅ | ✅ | `orientation` prop toggles row vs column layout | ✅ shipped |
| Item description slot | ✅ | ✅ | `description` on `RadioGroupItem` renders beneath and wires `aria-describedby` | ✅ shipped |

**Notes:** Same as Checkbox — the native radio is unstyled and arrow-keys don't cycle (browsers do it per-name within form, but the roving tabindex is not correct). P0s align with Checkbox.

## Switch

**Reference:** Radix Switch / Mantine
**Status:** ❌ Stub only — native checkbox with `role="switch"`, no custom visual.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Native input with `role="switch"` | ✅ | ✅ | — | — |
| Forwarded ref | ✅ | ✅ | — | — |
| Custom visual (track + thumb) | ✅ | ✅ | Replace with styled track/thumb | ✅ shipped |
| Controlled + uncontrolled | ⚠️ native attrs | ✅ | — | — |
| Size variant | ✅ | ✅ | `size="sm" \| "md" \| "lg"` scales track + thumb + label | ✅ shipped |
| On/off label slots | ✅ | ✅ | `onLabel` / `offLabel` render inside the track | ✅ shipped |
| Disabled styling | ✅ | ✅ | Explicit `data-disabled` on wrapper plus native `:disabled` — styles both input + label | ✅ shipped |
| Thumb icon on state | ❌ | ✅ | Add optional icon slot | **P2** |

**Notes:** Same stub story as Checkbox — the custom track/thumb visual is the entire value of the component.

## ToggleGroup

**Reference:** Radix ToggleGroup
**Status:** ⚠️ Partial — single/multiple, aria-pressed, controlled + uncontrolled.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Single / multiple type | ✅ | ✅ | — | — |
| Controlled + uncontrolled | ✅ | ✅ | — | — |
| `aria-pressed` on items | ✅ | ✅ | — | — |
| Disabled per item + group | ✅ | ✅ | — | — |
| Arrow-key nav within group | ✅ | ✅ | Add keyboard nav | ✅ shipped |
| Roving tab index | ✅ | ✅ | Add roving tabindex | ✅ shipped |
| Orientation horizontal/vertical | ✅ | ✅ | `orientation` prop toggles arrow-key axis + layout | ✅ shipped |
| `loop` nav at ends | ❌ | ✅ | Add | **P2** |
| Size variant | ✅ | ✅ | `size="sm" \| "md" \| "lg"` scales item height + padding + font | ✅ shipped |

**Notes:** Arrow-key nav + roving tabindex is the WAI-ARIA composite requirement. Both P0.

## Field

**Reference:** Mantine Field / Ark Field / react-hook-form pattern
**Status:** ⚠️ Partial — context with IDs + error rendering; Control/Label/Description parts exist but don't auto-wire `aria-describedby`/`aria-labelledby` on the input.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Field + Label + Description + Control parts | ✅ | ✅ | — | — |
| Auto-generated IDs | ✅ | ✅ | — | — |
| Error prop → `role="alert"` message | ✅ | ✅ | — | — |
| Required asterisk | ✅ via `required` | ✅ | — | — |
| Child input auto-wired `aria-describedby` to Description + Error | ✅ | ✅ | Auto-wire via Control slot | ✅ shipped |
| Child input auto-wired `id` = fieldId | ✅ | ✅ | Wire id from context | ✅ shipped |
| Hint / helper text slot | ✅ Description doubles | ✅ | — | — |
| Success / validating states | ✅ | ✅ | `success` + `validating` props | ✅ shipped |
| Counter slot | ❌ | ✅ | Accept char counter node | **P2** |
| Integration with react-hook-form | ⚠️ consumer wires | ✅ pattern documented | Document HOF integration | **P2** |
| Field disabled propagation | ✅ | ✅ | Propagated via FieldContext | ✅ shipped |
| Inline vs stacked layout | ❌ (stacked only) | ✅ | Add `orientation` | **P2** |

**Notes:** Two P0s combined into one: the Field doesn't wire itself to the child input. Today `<Field><FieldLabel>Name</FieldLabel><Input /></Field>` does not associate the label with the input, defeating the purpose. Fix by having FieldControl clone its single child with `id`, `aria-describedby`, `aria-invalid`. This is the most important fix in Wave 5e.

## Label

**Reference:** Radix Label / native `<label>`
**Status:** ✅ Ships — native label with required asterisk.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Native `<label>` with props forwarded | ✅ | ✅ | — | — |
| Required asterisk | ✅ | ✅ | — | — |
| Click-label-focus-input (via htmlFor) | ⚠️ consumer passes htmlFor | ✅ | — | — |
| Size variant | ✅ | ✅ | `size: sm/md/lg` | ✅ shipped |
| Disabled styling | ✅ | ✅ | `disabled` prop + `[data-disabled]` | ✅ shipped |

**Notes:** No P0s — it's a thin label wrapper. The Field auto-wiring story (see Field) is the real integration point.

## Badge

**Reference:** Mantine Badge
**Status:** ✅ Ships — variant + color.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Variant (solid/soft/outline) | ✅ | ✅ | — | — |
| Color (primary/destructive/success/warning) | ✅ | ✅ | — | — |
| Size variant | ✅ | ✅ | `size: sm/md/lg` | ✅ shipped |
| Dot indicator variant | ❌ | ✅ | Add `dot` variant | **P2** |
| Pill vs square radius | ❌ (one radius) | ✅ | Add `radius` prop | **P2** |
| Icon slot | ❌ | ✅ | Add left/right icon | **P2** |
| Clickable / removable | ❌ (use Chip instead) | N/A | — | — |

**Notes:** No P0s — Badge is a tiny primitive.

## Chip

**Reference:** Mantine Chip / MUI Chip
**Status:** ✅ Ships — color + optional remove button.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Color variant | ✅ | ✅ | — | — |
| Remove button with `aria-label` | ✅ | ✅ | — | — |
| Icon slot (left) | ✅ | ✅ | `icon` prop | ✅ shipped |
| Avatar slot (left circle image) | ❌ | ✅ MUI | Add | **P2** |
| Clickable vs static | ✅ | ✅ `clickable` | `onClick` → renders as `<button>` | ✅ shipped |
| Size variant | ✅ | ✅ | `size: sm/md/lg` | ✅ shipped |
| Outlined variant | ✅ | ✅ | `variant="outlined"` | ✅ shipped |
| Disabled state | ✅ | ✅ | `disabled` prop | ✅ shipped |
| Selected / toggled state | ❌ | ✅ Mantine | Add | **P2** |

**Notes:** No P0s.

## Avatar

**Reference:** Mantine Avatar / Radix Avatar
**Status:** ✅ Ships — size + compound Image/Fallback.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Size (sm/md/lg/xl) | ✅ | ✅ | — | — |
| AvatarImage + AvatarFallback parts | ✅ | ✅ | — | — |
| Image onError → fallback swap | ✅ | ✅ Radix | Built-in `src` prop swaps to initials on error | ✅ shipped |
| Initials generation from name | ✅ | ✅ Mantine | `name` prop auto-generates initials | ✅ shipped |
| Status indicator (presence dot) | ❌ | ✅ | Add `status` dot slot | **P2** |
| Avatar group (stacked) | ✅ | ✅ | `<AvatarGroup max>` with `+N` overflow | ✅ shipped |
| Square variant | ❌ (circle only) | ✅ | Add `radius` or `variant` | **P2** |
| Color-from-name background | ✅ | ✅ | Deterministic token hash | ✅ shipped |

**Notes:** No P0s — it's a display primitive. AvatarImage-error-fallback is the only subtle hazard.

## Alert

**Reference:** Radix-style / Mantine Alert
**Status:** ✅ Ships — 4 variants + Title + Description.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Variant (info/success/warning/destructive) | ✅ | ✅ | — | — |
| Title + Description | ✅ | ✅ | — | — |
| `role="alert"` | ✅ | ✅ | — | — |
| Icon per variant | ✅ | ✅ | Default unicode glyph per variant; override via `icon` | ✅ shipped |
| Dismiss / close button | ✅ | ✅ | `dismissible` + `onDismiss` | ✅ shipped |
| Action slot (buttons) | ✅ | ✅ | `action` slot | ✅ shipped |
| Outlined vs filled variants | ⚠️ single style | ✅ | Add appearance variant | **P2** |
| Animation on enter | ❌ | ✅ | CSS animation + prefers-reduced-motion | **P2** |

**Notes:** No P0s.

## EmptyState

**Reference:** Chakra / Mantine / custom
**Status:** ✅ Ships — icon + title + description + action.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Icon + title + description + action slots | ✅ | ✅ | — | — |
| Size variant (md/lg) | ✅ | ✅ | `size: sm/md/lg` | ✅ shipped |
| Illustration slot (larger image) | ✅ | ✅ | `illustration` slot | ✅ shipped |
| Orientation horizontal / vertical | ✅ | ✅ | `orientation` prop | ✅ shipped |

**Notes:** No P0s — it's intentionally minimal.

## Skeleton

**Reference:** Mantine Skeleton
**Status:** ✅ Ships — text/circle/rect variants.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Variants (text/circle/rect) | ✅ | ✅ | — | — |
| Shimmer animation | ✅ PRM-gated | ✅ | Verify animation respects reduced-motion | ✅ shipped |
| `aria-hidden` | ✅ | ✅ | — | — |
| Visible / invisible toggle (`visible` prop for conditional render) | ✅ | ✅ Mantine | `visible` prop renders children when false | ✅ shipped |
| Height / width via props vs className | ✅ | ✅ dedicated props | `width` + `height` props (number → px, string → CSS length) | ✅ shipped |
| Count (render N repeated) | ✅ | ✅ | `count` prop | ✅ shipped |

**Notes:** One P0: verify the shimmer is inside a `@media (prefers-reduced-motion: no-preference)` gate per the CSS spec rule. Quick audit, one-line fix if missing.

## Spinner

**Reference:** Mantine Loader / any loader
**Status:** ✅ Ships — size + accessible label.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Size (sm/md/lg) | ✅ | ✅ | — | — |
| `role="status"` + SR label | ✅ | ✅ | — | — |
| Tailwind `animate-spin` | ✅ | ✅ | — | — |
| Respects `prefers-reduced-motion` | ✅ wui-spinner class PRM-gated | ✅ | Wrap animation in PRM media query | ✅ shipped |
| Color variant | ✅ | ✅ | `color` prop (default/primary/success/warning/destructive) | ✅ shipped |
| Type variants (dots / bars / oval) | ❌ | ✅ Mantine | Add types | **P2** |
| Centered wrapper helper | ❌ | ✅ | Document pattern | **P2** |

**Notes:** P0 is the motion-reduction audit — Tailwind's `animate-spin` does not respect `prefers-reduced-motion` by default, which contradicts the project's CSS rules. Likely needs a custom CSS class (`wui-spinner--animating`) wrapped in the PRM media query.

## ProgressBar

**Reference:** Mantine Progress / Radix Progress
**Status:** ✅ Ships — value/max, size, color, indeterminate.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Value / max / percent calculation | ✅ | ✅ | — | — |
| `role="progressbar"` + aria-value* | ✅ | ✅ | — | — |
| Size (sm/md/lg) | ✅ | ✅ | — | — |
| Color (primary/success/warning/destructive) | ✅ | ✅ | — | — |
| Indeterminate | ✅ | ✅ | — | — |
| Indeterminate animation respects PRM | ✅ PRM-gated in progress.css | ✅ | Audit | ✅ shipped |
| Striped / animated striped variant | ❌ | ✅ | Add | **P2** |
| Segmented (multi-value) | ❌ | ✅ Mantine | Add | **P2** |
| Label overlay (percent text) | ✅ | ✅ | `showLabel` prop | ✅ shipped |
| Buffer / secondary value | ❌ | ✅ | Add | **P2** |

**Notes:** Same P0 motion-reduction audit as Spinner — indeterminate CSS needs to be PRM-gated.

---

## Layout primitives (Phase 0 only)

- **Container / Grid / Stack / Spacer / AspectRatio / Divider / Portal / VisuallyHidden** — Phase 0 polish complete; no feature-parity audit required. These are structural primitives with stable APIs. (Portal is flagged as a new P0 dependency for Wave 5b — but its implementation is a straightforward `createPortal` wrapper, not a Wave 5 audit surface.)

## Typography primitives (Phase 0 only)

- **Heading / Text / Code / Kbd / Link** — Phase 0 polish complete; no feature-parity audit required.

## Card (Phase 0 only)

**Reference:** Mantine Card
**Status:** ✅ Ships — structural Card + Header + Content + Footer.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Card + Header + Content + Footer parts | ✅ | ✅ | — | — |
| Variant (elevated/outlined) | ✅ | ✅ | `variant: elevated/outlined/filled` | ✅ shipped |
| `as` / `asChild` for links | ✅ | ✅ | `asChild` clones single child | ✅ shipped |
| Radius / padding props | ⚠️ via CSS token defaults | ✅ | Add props | **P2** |
| Clickable / interactive state | ❌ | ✅ | Document pattern (wrap in Link) | **P2** |
| Divider between sections | ❌ | ✅ | Add CardDivider or rely on Divider | **P2** |

**Notes:** Card is structural and has no P0s. Included here as a short entry per Phase 0 guidance rather than in Wave 5e.

---

_End of audit._

