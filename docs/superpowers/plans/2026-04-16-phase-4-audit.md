# Phase 4 — Component Audit Matrix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Produce `docs/audit/component-parity.md` — a single document with a table per component comparing WeiUI's current features to its pinned best-in-class reference. Rows flagged P0/P1/P2.

**Architecture:** One markdown file. Three sections: (1) Reference table pinning best-in-class per component, (2) Priority definitions, (3) Per-component audit tables grouped by family matching the Phase 5 wave structure. Each row lists feature, WeiUI has / ref has, gap, priority, notes.

**Why P0 matters:** Waves 5a-5e only ship when every P0 row has moved from "missing" to "WeiUI has." P0 items block wave completion.

**Spec reference:** `docs/superpowers/specs/2026-04-16-polish-overhaul-design.md` §8.

---

## File Structure

**New file:**
- `docs/audit/component-parity.md`

That's it. Pure documentation task.

---

## Task 1: Inventory WeiUI's current component API surface

**Files:** none modified — produces findings for Task 2.

- [ ] **Step 1: Read every React component's props**

For each folder in `packages/react/src/components/`:
- Read the `.tsx` file and note: exported component name, props interface, variant options, sub-components (compound pattern).

Record findings in the subagent's working notes — will be folded into Task 2.

Components to inventory (65 total; grouped by Phase 5 wave):

**Input family (9):** Input, Textarea, InputNumber, InputOTP, AutoComplete, MultiSelect, FileUpload, (Password variant TBD), (Search variant TBD)

**Overlay family (9):** Dialog, Drawer, Popover, Tooltip, Menu, Toast, CommandPalette, (Sheet TBD), (AlertDialog TBD)

**Data/Nav family (12):** DataTable, TreeView, Pagination, Tabs, Breadcrumb, Sidebar, AppBar, BottomNav, Accordion, Stepper, Timeline, Transfer

**Advanced family (9):** DatePicker, Calendar, Chart, Editor, ColorPicker, Slider, Rating, SpeedDial, Splitter

**Form primitives (17):** Button, ButtonGroup, Checkbox, RadioGroup, Switch, ToggleGroup, Field, Label, Badge, Chip, Avatar, Alert, EmptyState, Skeleton, Spinner, ProgressBar, Card

**Layout primitives (9, Phase 0 only):** Container, Grid, Stack, Spacer, AspectRatio, Divider, Portal, VisuallyHidden, Heading

**Typography (4, Phase 0 only):** Text, Code, Kbd, Link

---

## Task 2: Write the audit matrix

**File:** `docs/audit/component-parity.md`

Create the file with EXACTLY this structure:

````markdown
# Component Parity Audit

**Last updated:** 2026-04-16
**Spec:** `docs/superpowers/specs/2026-04-16-polish-overhaul-design.md` §8
**Purpose:** Track WeiUI's feature coverage vs best-in-class reference per component. Waves 5a-5e ship only when all P0 gaps close.

---

## Priority

- **P0** — Must-add for parity. Blocks wave completion.
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

# Wave 5a — Input family
````

After this preamble, produce one H2 section per component. For EACH component in waves 5a, 5b, 5c, 5d, 5e, produce:

```markdown
## ComponentName

**Reference:** <library name> (see pins table above)
**Status:** ✅ WeiUI ships / ⚠️ Partial / ❌ Stub only

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| ... | ... | ... | ... | P0/P1/P2 |

**Notes:** any implementation hazards, dependencies, or deferral rationale.
```

### Content generation rules for each component

1. **Read the component source** at `packages/react/src/components/<Name>/<Name>.tsx`.
2. **List what WeiUI has** — every prop, sub-component, state, keyboard interaction documented in the source.
3. **For "Reference has"** — list the features the reference library commonly provides. Use training knowledge for well-known APIs:
   - **Radix UI**: focus trap, portal escape hatch, controlled + uncontrolled, `onOpenChange`, modal vs non-modal, collision detection, scroll-lock, cancel vs dismiss, nested handling
   - **react-aria** (Downshift similar): async options, loading state, selection modes (single/multiple/none), menuPlacement, virtualization, keyboard selection, clear/dismiss, i18n locale
   - **TanStack Table**: server-side pagination/sort/filter, row selection (single/range), column resize/reorder/pin, grouping, expanding, virtualization, cell editing, sticky header
   - **cmdk/Raycast**: recent items, grouped results, loading state, async filtering, keyboard shortcuts shown, actions per item
   - **Tiptap**: slash-command menu, collaborative editing, extensions API, bubble menu, floating menu, code highlighting, markdown/HTML export
   - **Uppy**: drag-drop, multiple providers (S3, Dropbox, Google Drive), progress UI, chunked upload, resume-on-fail, validation (size/type)
   - **Sonner**: promise-based toast, stacking, swipe-to-dismiss, rich content, action button, undo pattern, timeouts
   - **Mantine** (broad): controlled/uncontrolled for every stateful component, size scale, color prop, radius prop, loading slot, disabled slot
   - **Ant Design** (broad): locale, status (error/warning), size (small/middle/large), placeholder slots, ref forwarding for imperative APIs
4. **Identify gaps** — compare column by column. Mark as P0 only if the reference's implementation is the industry-standard expectation (e.g., Radix Dialog without focus trap would be broken; TanStack Table without row selection would be toy-grade).
5. **Conservatism on P0** — if unsure whether a feature is baseline-expected or enterprise-only, err toward P1.

### Worked example for Dialog

```markdown
## Dialog

**Reference:** Radix UI
**Status:** ⚠️ Partial — ships modal trigger/content/title/description/close but missing focus scope controls.

| Feature | WeiUI has | Reference has | Gap | Priority |
|---------|-----------|---------------|-----|----------|
| Trigger + Portal + Overlay + Content parts | ✅ | ✅ | — | — |
| Open state controlled + uncontrolled | ✅ via `open/defaultOpen` | ✅ | — | — |
| Focus trap within content | ⚠️ partial (native only) | ✅ explicit | Add `useFocusTrap` hook from headless | **P0** |
| `onOpenChange` callback | ✅ | ✅ | — | — |
| Scroll lock on body | ❌ | ✅ | Add to headless `useDialog` | **P0** |
| Escape-to-close + overlay click to close | ✅ | ✅ customizable via `onInteractOutside` | expose callbacks | **P1** |
| `modal={false}` non-modal variant | ❌ | ✅ | Add variant | **P1** |
| Nested dialog stacking | ❌ | ✅ | Context stack | **P1** |
| `forceMount` for animation | ❌ | ✅ | Pass to Portal | **P2** |
| Collision detection (N/A, modal) | N/A | N/A | — | — |

**Notes:** Focus trap is the highest-value P0 — current implementation relies on content being the first focusable element, which breaks for dialogs with no focusable first child. Scroll-lock is separate and straightforward; add to `useDialog` hook alongside focus trap.
```

Produce sections in this format for EVERY component in waves 5a-5e. Each audit should be 6-15 rows — pragmatic, not exhaustive.

### Components with light audits (Phase 0 only)

Layout and typography primitives from the spec get a single-line entry each under a `## Layout primitives (Phase 0 only)` H2 section:

```markdown
## Layout primitives (Phase 0 only)

- **Container / Grid / Stack / Spacer / AspectRatio / Divider / Portal / VisuallyHidden** — Phase 0 polish complete; no feature-parity audit required. These are structural primitives with stable APIs.

## Typography primitives (Phase 0 only)

- **Heading / Text / Code / Kbd / Link** — Phase 0 polish complete; no feature-parity audit required.
```

---

## Task 3: Generate a summary at the top

After all component sections are written, prepend a summary right after the Priority section and before the first wave:

```markdown
## Executive summary

| Wave | Components | P0 gaps | P1 gaps | P2 gaps |
|------|------------|---------|---------|---------|
| 5a Input family | N | X | Y | Z |
| 5b Overlay | N | X | Y | Z |
| 5c Data/Nav | N | X | Y | Z |
| 5d Advanced | N | X | Y | Z |
| 5e Form + display | N | X | Y | Z |
| **Total** | **N** | **X** | **Y** | **Z** |

**Recommended wave order:** 5a → 5b → 5c → 5d → 5e. Each wave closes when its P0 column reaches 0.
```

Fill in real counts from your own audit.

---

## Task 4: Commit the audit

```bash
mkdir -p docs/audit
git add docs/audit/component-parity.md
git commit -m "docs(audit): component parity matrix for waves 5a-5e"
```

---

## Self-review before commit

- File exists at `docs/audit/component-parity.md` with header, reference pins table, priority definitions, executive summary, per-wave H1 sections, per-component H2 sections, and Phase-0-only primitive sections.
- Every component in waves 5a-5e has its own audit table with 6-15 rows.
- Every P0 has a concrete gap description and is actually a baseline expectation, not a nice-to-have.
- Executive summary counts match actual P0/P1/P2 tallies.
- No placeholders, TBDs, or "to be filled in" rows.

---

## Task 5: Verification

- [ ] `wc -l docs/audit/component-parity.md` — should be > 1000 lines given the scope.
- [ ] `grep -c "^## " docs/audit/component-parity.md` — should show 50-55 component sections.
- [ ] `grep -c "\*\*P0\*\*" docs/audit/component-parity.md` — non-zero (tracking actual work).
- [ ] Report completion with summary table copied into the commit message body.
