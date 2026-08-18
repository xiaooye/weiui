# Phase 0 — Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add new shadow/motion/elevation/surface/ring-soft tokens and polish every existing component CSS and React tailwind-variants file to consume them. All downstream phases inherit the polished look.

**Architecture:** Tokens added at W3C DTCG layer (`packages/tokens/src/primitives/*.json` and `semantic.json`). Token build regenerates `packages/tokens/dist/tokens.css`. Both Layer 1 CSS files (`packages/css/src/elements/*.css`) and Layer 3 React tailwind-variants files (`packages/react/src/variants/*.ts`) are updated to use new tokens and apply the polish recipe: inset highlight on solids, soft inset on inputs, hover elevation lift, motion-safe transitions using the new motion scale.

**Tech Stack:** W3C Design Tokens (JSON), OKLCH color, CSS cascade layers, tailwind-variants, Vitest, Playwright (visual regression), pnpm workspaces.

**Spec reference:** `docs/superpowers/specs/2026-04-16-polish-overhaul-design.md` §4.

---

## File Structure

**Tokens** (modified/created):
- Modify `packages/tokens/src/primitives/shape.json` — add 8-level shadow scale (xs, sm, base, md, lg, xl, 2xl, inset)
- Modify `packages/tokens/src/primitives/motion.json` — add `base`, `slower`, easing aliases `standard`, `emphasized`, `decelerated`, `accelerated`
- Modify `packages/tokens/src/semantic.json` — add `elevation.0`–`5`, `surface.raised`, `surface.overlay`, `surface.sunken`, `color.ring-soft`, `color.focus-ring-soft`

**Reference doc** (created):
- Create `docs/internal/polish-recipe.md` — the canonical polish pattern applied in every CSS and variant file

**Layer 1 CSS** (modified): all 36 files under `packages/css/src/elements/*.css`

**Layer 3 React variants** (modified): all variant files under `packages/react/src/variants/*.ts`

Each variant file that does not yet exist will be created as part of its family task.

---

## Task 1: Extend shadow token scale

**Files:**
- Modify: `packages/tokens/src/primitives/shape.json`
- Test: `packages/tokens/src/__tests__/generate-css.test.ts` (reuse existing suite)

- [ ] **Step 1: Write the failing test**

Append to `packages/tokens/src/__tests__/generate-css.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("shadow scale", () => {
  it("shape.json declares 8 shadow levels", () => {
    const shapeJson = JSON.parse(
      readFileSync(join(import.meta.dirname, "..", "primitives", "shape.json"), "utf-8"),
    );
    const keys = Object.keys(shapeJson.shape.shadow);
    expect(keys).toEqual(["xs", "sm", "base", "md", "lg", "xl", "2xl", "inset"]);
  });

  it("every shadow uses OKLCH color", () => {
    const shapeJson = JSON.parse(
      readFileSync(join(import.meta.dirname, "..", "primitives", "shape.json"), "utf-8"),
    );
    for (const [, token] of Object.entries(shapeJson.shape.shadow)) {
      expect((token as { $value: string }).$value).toMatch(/oklch\(/);
    }
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

Run: `pnpm --filter @civaria/tokens test -- generate-css.test.ts`
Expected: FAIL — current shape.json has only `xs, sm, md, lg, xl` and `xs` uses `oklch` but order/keys differ.

- [ ] **Step 3: Replace the shadow block in shape.json**

Open `packages/tokens/src/primitives/shape.json` and replace the `"shadow"` object with:

```json
"shadow": {
  "xs":    { "$value": "0 1px 2px 0 oklch(0 0 0 / 0.04)", "$type": "shadow" },
  "sm":    { "$value": "0 1px 2px 0 oklch(0 0 0 / 0.05), 0 1px 3px 0 oklch(0 0 0 / 0.04)", "$type": "shadow" },
  "base":  { "$value": "0 1px 3px 0 oklch(0 0 0 / 0.06), 0 1px 2px -1px oklch(0 0 0 / 0.04)", "$type": "shadow" },
  "md":    { "$value": "0 4px 6px -1px oklch(0 0 0 / 0.07), 0 2px 4px -2px oklch(0 0 0 / 0.04)", "$type": "shadow" },
  "lg":    { "$value": "0 10px 15px -3px oklch(0 0 0 / 0.08), 0 4px 6px -4px oklch(0 0 0 / 0.04)", "$type": "shadow" },
  "xl":    { "$value": "0 20px 25px -5px oklch(0 0 0 / 0.10), 0 8px 10px -6px oklch(0 0 0 / 0.05)", "$type": "shadow" },
  "2xl":   { "$value": "0 25px 50px -12px oklch(0 0 0 / 0.18)", "$type": "shadow" },
  "inset": { "$value": "inset 0 2px 4px 0 oklch(0 0 0 / 0.05)", "$type": "shadow" }
}
```

- [ ] **Step 4: Run the test, confirm it passes**

Run: `pnpm --filter @civaria/tokens test -- generate-css.test.ts`
Expected: PASS

- [ ] **Step 5: Rebuild tokens and verify output**

Run: `pnpm --filter @civaria/tokens build`
Open `packages/tokens/dist/tokens.css` and confirm these lines exist:

```
--civ-shadow-xs: 0 1px 2px 0 oklch(0 0 0 / 0.04);
--civ-shadow-2xl: 0 25px 50px -12px oklch(0 0 0 / 0.18);
--civ-shadow-inset: inset 0 2px 4px 0 oklch(0 0 0 / 0.05);
```

- [ ] **Step 6: Commit**

```bash
git add packages/tokens/src/primitives/shape.json packages/tokens/src/__tests__/generate-css.test.ts
git commit -m "feat(tokens): extend shadow scale to 8 levels including xs, 2xl, inset"
```

---

## Task 2: Extend motion scale with new easing and duration aliases

**Files:**
- Modify: `packages/tokens/src/primitives/motion.json`
- Test: `packages/tokens/src/__tests__/generate-css.test.ts`

- [ ] **Step 1: Write the failing test**

Append to the same test file:

```ts
describe("motion scale", () => {
  it("motion.json declares full duration set", () => {
    const motionJson = JSON.parse(
      readFileSync(join(import.meta.dirname, "..", "primitives", "motion.json"), "utf-8"),
    );
    const durations = Object.keys(motionJson.motion.duration);
    for (const key of ["instant", "fast", "base", "normal", "slow", "slower"]) {
      expect(durations).toContain(key);
    }
  });

  it("motion.json declares full easing set", () => {
    const motionJson = JSON.parse(
      readFileSync(join(import.meta.dirname, "..", "primitives", "motion.json"), "utf-8"),
    );
    const easings = Object.keys(motionJson.motion.easing);
    for (const key of ["standard", "emphasized", "decelerated", "accelerated"]) {
      expect(easings).toContain(key);
    }
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

Run: `pnpm --filter @civaria/tokens test -- generate-css.test.ts`
Expected: FAIL — missing `base`, `slower`, and the four new easing keys.

- [ ] **Step 3: Replace the motion block in motion.json**

Replace the entire file content with:

```json
{
  "motion": {
    "duration": {
      "instant":  { "$value": "0ms", "$type": "duration" },
      "fast":     { "$value": "120ms", "$type": "duration" },
      "base":     { "$value": "180ms", "$type": "duration" },
      "normal":   { "$value": "180ms", "$type": "duration" },
      "slow":     { "$value": "260ms", "$type": "duration" },
      "slower":   { "$value": "400ms", "$type": "duration" },
      "entrance": { "$value": "400ms", "$type": "duration" }
    },
    "easing": {
      "default":     { "$value": "cubic-bezier(0.16, 1, 0.3, 1)", "$type": "cubicBezier" },
      "standard":    { "$value": "cubic-bezier(0.2, 0, 0, 1)", "$type": "cubicBezier" },
      "emphasized":  { "$value": "cubic-bezier(0.3, 0, 0, 1)", "$type": "cubicBezier" },
      "decelerated": { "$value": "cubic-bezier(0.05, 0.7, 0.1, 1)", "$type": "cubicBezier" },
      "accelerated": { "$value": "cubic-bezier(0.3, 0, 1, 1)", "$type": "cubicBezier" },
      "in":          { "$value": "cubic-bezier(0.55, 0, 1, 0.45)", "$type": "cubicBezier" },
      "out":         { "$value": "cubic-bezier(0.16, 1, 0.3, 1)", "$type": "cubicBezier" },
      "inOut":       { "$value": "cubic-bezier(0.45, 0, 0.55, 1)", "$type": "cubicBezier" },
      "spring":      { "$value": "cubic-bezier(0.34, 1.56, 0.64, 1)", "$type": "cubicBezier" }
    }
  }
}
```

Old names (`normal`, `default`, `in`, `out`, `inOut`, `spring`, `entrance`) are preserved as aliases so existing CSS keeps working.

- [ ] **Step 4: Run the test, confirm it passes**

Run: `pnpm --filter @civaria/tokens test -- generate-css.test.ts`
Expected: PASS

- [ ] **Step 5: Rebuild and verify**

Run: `pnpm --filter @civaria/tokens build`
Open `packages/tokens/dist/tokens.css` and confirm these lines:

```
--civ-motion-duration-base: 180ms;
--civ-motion-duration-slower: 400ms;
--civ-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
--civ-motion-easing-emphasized: cubic-bezier(0.3, 0, 0, 1);
```

- [ ] **Step 6: Commit**

```bash
git add packages/tokens/src/primitives/motion.json packages/tokens/src/__tests__/generate-css.test.ts
git commit -m "feat(tokens): add base/slower durations and Material 3 easing scale"
```

---

## Task 3: Add elevation, surface, and ring-soft semantic tokens

**Files:**
- Modify: `packages/tokens/src/semantic.json`
- Test: `packages/tokens/src/__tests__/generate-css.test.ts`

- [ ] **Step 1: Write the failing test**

Append to the test file:

```ts
describe("semantic elevation and surface tokens", () => {
  it("semantic.json declares elevation 0-5", () => {
    const semantic = JSON.parse(
      readFileSync(join(import.meta.dirname, "..", "semantic.json"), "utf-8"),
    );
    for (const level of ["0", "1", "2", "3", "4", "5"]) {
      expect(semantic.elevation?.[level]).toBeDefined();
    }
  });

  it("semantic.json declares surface raised/overlay/sunken", () => {
    const semantic = JSON.parse(
      readFileSync(join(import.meta.dirname, "..", "semantic.json"), "utf-8"),
    );
    for (const name of ["raised", "overlay", "sunken"]) {
      expect(semantic.surface?.[name]).toBeDefined();
    }
  });

  it("semantic.json declares color.ring-soft", () => {
    const semantic = JSON.parse(
      readFileSync(join(import.meta.dirname, "..", "semantic.json"), "utf-8"),
    );
    expect(semantic.color["ring-soft"]).toBeDefined();
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

Run: `pnpm --filter @civaria/tokens test -- generate-css.test.ts`
Expected: FAIL — no elevation/surface/ring-soft yet.

- [ ] **Step 3: Replace semantic.json with the extended version**

Replace entire `packages/tokens/src/semantic.json` with:

```json
{
  "color": {
    "primary":            { "$value": "{color.blue.600}" },
    "primary-foreground": { "$value": "{color.neutral.0}" },
    "background":         { "$value": "{color.neutral.0}" },
    "foreground":         { "$value": "{color.neutral.950}" },
    "muted":              { "$value": "{color.neutral.100}" },
    "muted-foreground":   { "$value": "{color.neutral.600}" },
    "card":               { "$value": "{color.neutral.0}" },
    "card-foreground":    { "$value": "{color.neutral.950}" },
    "border":             { "$value": "{color.neutral.200}" },
    "ring":               { "$value": "{color.blue.600}" },
    "ring-soft":          { "$value": "oklch(from var(--civ-color-ring) l c h / 0.35)" },
    "destructive":            { "$value": "oklch(0.577 0.245 27.33)" },
    "destructive-foreground": { "$value": "{color.neutral.0}" },
    "success":                { "$value": "oklch(0.517 0.176 149.57)" },
    "success-foreground":     { "$value": "{color.neutral.0}" },
    "warning":                { "$value": "oklch(0.681 0.162 75.83)" },
    "warning-foreground":     { "$value": "{color.neutral.950}" }
  },
  "surface": {
    "raised":  { "$value": "{color.neutral.0}" },
    "overlay": { "$value": "{color.neutral.0}" },
    "sunken":  { "$value": "{color.neutral.50}" }
  },
  "elevation": {
    "0": { "$value": "none" },
    "1": { "$value": "{shape.shadow.xs}" },
    "2": { "$value": "{shape.shadow.sm}" },
    "3": { "$value": "{shape.shadow.md}" },
    "4": { "$value": "{shape.shadow.lg}" },
    "5": { "$value": "{shape.shadow.xl}" }
  }
}
```

- [ ] **Step 4: Update dark-mode generation to shift surfaces**

Open `packages/tokens/src/dark-mode.ts` and locate the dark-mode overrides table. Add entries:

```ts
// surface
["surface.raised",  "color.neutral.900"],
["surface.overlay", "color.neutral.900"],
["surface.sunken",  "color.neutral.950"],
```

Find the existing `const darkOverrides: Array<[string, string]>` (or equivalent map) and append these lines to it. If the file does not use that exact format, match the existing pattern for `background`/`card` overrides and add the three surface entries alongside.

- [ ] **Step 5: Run the test, confirm it passes**

Run: `pnpm --filter @civaria/tokens test`
Expected: all green.

- [ ] **Step 6: Rebuild and verify**

Run: `pnpm --filter @civaria/tokens build`
Open `packages/tokens/dist/tokens.css` and confirm:

```
--civ-color-ring-soft: oklch(from var(--civ-color-ring) l c h / 0.35);
--civ-surface-raised: oklch(1 0 0);
--civ-elevation-1: 0 1px 2px 0 oklch(0 0 0 / 0.04);
```

- [ ] **Step 7: Commit**

```bash
git add packages/tokens/src/semantic.json packages/tokens/src/dark-mode.ts packages/tokens/src/__tests__/generate-css.test.ts
git commit -m "feat(tokens): add elevation, surface, and ring-soft semantic tokens"
```

---

## Task 4: Verify downstream rebuild

**Files:** none modified — verification only.

- [ ] **Step 1: Clean and rebuild the full repo**

Run: `pnpm build`
Expected: all packages build successfully; no TypeScript errors.

- [ ] **Step 2: Run all tests**

Run: `pnpm test`
Expected: all existing tests pass.

- [ ] **Step 3: Run contrast validation**

Run: `pnpm --filter @civaria/tokens validate`
Expected: PASS with no contrast warnings.

If any step fails, stop and report the failure — do not proceed to polish tasks.

---

## Task 5: Write polish-recipe reference doc

**Files:**
- Create: `docs/internal/polish-recipe.md`

- [ ] **Step 1: Create the directory and file**

Run: `mkdir -p docs/internal`

Create `docs/internal/polish-recipe.md` with exactly this content:

````markdown
# Polish Recipe — Phase 0

The canonical pattern applied to every component CSS file and tailwind-variants file in Phase 0.
Follow it exactly. Deviations need explicit justification in the PR.

## 1. Solid variants (buttons, badges solid, chips solid)

Add an inset 1px highlight for Volt-style depth:

```css
.civ-button--solid {
  background-color: var(--civ-color-primary);
  color: var(--civ-color-primary-foreground);
  box-shadow: inset 0 1px 0 0 oklch(from var(--civ-color-primary-foreground) l c h / 0.12);
}
```

## 2. Hover lift (buttons, cards, interactive surfaces — NOT inputs)

Motion-safe translateY + shadow bump:

```css
@media (prefers-reduced-motion: no-preference) {
  .civ-button:hover {
    transform: translateY(-1px);
    box-shadow: var(--civ-shadow-sm),
                inset 0 1px 0 0 oklch(from var(--civ-color-primary-foreground) l c h / 0.15);
  }
  .civ-button:active {
    transform: translateY(0);
    box-shadow: inset 0 1px 0 0 oklch(from var(--civ-color-primary-foreground) l c h / 0.10);
  }
}
```

## 3. Inputs (input, textarea, autocomplete, multiselect, input-number, input-otp)

Soft inner shadow at rest; sharper focus ring with color-mix transition. No hover lift.

```css
.civ-input {
  box-shadow: inset 0 1px 2px 0 oklch(0 0 0 / 0.04);
}
.civ-input:focus-within {
  border-color: var(--civ-color-ring);
  outline: 3px solid var(--civ-color-ring-soft);
  outline-offset: 0;
  box-shadow: inset 0 1px 2px 0 oklch(0 0 0 / 0.04);
}
```

## 4. Cards

Use `elevation-2` + `surface-raised` + hairline border.

```css
.civ-card {
  background-color: var(--civ-surface-raised);
  border: 1px solid var(--civ-color-border);
  box-shadow: var(--civ-elevation-2);
}
```

## 5. Overlays (dialog, drawer, popover, tooltip, menu, toast, command palette)

`elevation-4` or higher + backdrop-filter with fallback.

```css
.civ-popover {
  background-color: var(--civ-surface-overlay);
  box-shadow: var(--civ-elevation-4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
@supports not (backdrop-filter: blur(8px)) {
  .civ-popover { background-color: var(--civ-color-card); }
}
```

## 6. Transitions — always motion-safe, always new motion tokens

Replace any raw `200ms` or `cubic-bezier(...)` with tokens:

```css
@media (prefers-reduced-motion: no-preference) {
  .civ-button {
    transition-property: transform, box-shadow, background-color, border-color, color;
    transition-duration: var(--civ-motion-duration-fast);
    transition-timing-function: var(--civ-motion-easing-standard);
  }
}
```

## 7. Tonal / soft variants

Use `color-mix` in OKLCH for consistent tints across light/dark:

```css
.civ-button--soft {
  background-color: color-mix(in oklch, var(--civ-color-primary) 10%, transparent);
  color: var(--civ-color-primary);
}
.civ-button--soft:hover {
  background-color: color-mix(in oklch, var(--civ-color-primary) 15%, transparent);
}
```

## 8. Forbidden

- `!important` (use cascade layers)
- Physical properties (`padding-left` → `padding-inline-start`)
- Raw color values (use tokens)
- Gradient fills on any component (reserved for homepage hero only)
- Transitions outside `@media (prefers-reduced-motion: no-preference)`
````

- [ ] **Step 2: Commit**

```bash
git add docs/internal/polish-recipe.md
git commit -m "docs(internal): add phase 0 polish recipe reference"
```

---

## Task 6: Polish button.css (Layer 1)

**Files:**
- Modify: `packages/css/src/elements/button.css`

- [ ] **Step 1: Replace entire file**

Replace the full contents of `packages/css/src/elements/button.css` with:

```css
/* packages/css/src/elements/button.css */
@layer civ-elements {
  .civ-button {
    display: inline-flex; align-items: center; justify-content: center; gap: var(--civ-spacing-2);
    font-family: inherit; font-weight: var(--civ-font-weight-medium);
    border-radius: var(--civ-shape-radius-md); cursor: pointer; user-select: none; white-space: nowrap;
    min-block-size: 44px; min-inline-size: 44px;
    padding-inline: var(--civ-spacing-4); padding-block: var(--civ-spacing-2);
    font-size: var(--civ-font-size-sm); line-height: var(--civ-font-lineHeight-normal);
    border: var(--civ-shape-border-width-medium) solid transparent;
  }

  /* Sizes */
  .civ-button--sm { min-block-size: 36px; padding-inline: var(--civ-spacing-3); font-size: var(--civ-font-size-sm); border-radius: var(--civ-shape-radius-base); }
  .civ-button--lg { min-block-size: 48px; padding-inline: var(--civ-spacing-6); font-size: var(--civ-font-size-base); }
  .civ-button--xl { min-block-size: 56px; padding-inline: var(--civ-spacing-8); font-size: var(--civ-font-size-lg); border-radius: var(--civ-shape-radius-lg); }
  .civ-button--icon { min-block-size: 44px; min-inline-size: 44px; padding: 0; }

  /* Variant: solid — inset highlight for depth */
  .civ-button--solid {
    background-color: var(--civ-color-primary);
    color: var(--civ-color-primary-foreground);
    box-shadow: inset 0 1px 0 0 oklch(from var(--civ-color-primary-foreground) l c h / 0.12);
  }

  /* Variant: outline */
  .civ-button--outline { background-color: transparent; border-color: var(--civ-color-primary); color: var(--civ-color-primary); }

  /* Variant: ghost */
  .civ-button--ghost { background-color: transparent; color: var(--civ-color-primary); }

  /* Variant: soft — OKLCH color-mix */
  .civ-button--soft {
    background-color: color-mix(in oklch, var(--civ-color-primary) 10%, transparent);
    color: var(--civ-color-primary);
  }
  .civ-button--soft:hover {
    background-color: color-mix(in oklch, var(--civ-color-primary) 15%, transparent);
  }

  /* Variant: link */
  .civ-button--link { background-color: transparent; color: var(--civ-color-primary); text-decoration: underline; text-underline-offset: 4px; padding: 0; min-block-size: 0; min-inline-size: 0; box-shadow: none; }

  /* Color: destructive */
  .civ-button--destructive.civ-button--solid {
    background-color: var(--civ-color-destructive);
    color: var(--civ-color-destructive-foreground);
    box-shadow: inset 0 1px 0 0 oklch(from var(--civ-color-destructive-foreground) l c h / 0.12);
  }
  .civ-button--destructive.civ-button--outline { border-color: var(--civ-color-destructive); color: var(--civ-color-destructive); }

  /* States */
  .civ-button[data-disabled] { opacity: 0.5; cursor: not-allowed; pointer-events: none; transform: none !important; }
  .civ-button[data-loading] { position: relative; cursor: wait; }

  /* Motion-safe hover/active lift — NOT on link or icon-only */
  @media (prefers-reduced-motion: no-preference) {
    .civ-button {
      transition-property: transform, box-shadow, background-color, border-color, color;
      transition-duration: var(--civ-motion-duration-fast);
      transition-timing-function: var(--civ-motion-easing-standard);
    }
    .civ-button--solid:hover,
    .civ-button--outline:hover,
    .civ-button--soft:hover {
      transform: translateY(-1px);
    }
    .civ-button--solid:hover {
      box-shadow: var(--civ-shadow-sm),
                  inset 0 1px 0 0 oklch(from var(--civ-color-primary-foreground) l c h / 0.18);
    }
    .civ-button--destructive.civ-button--solid:hover {
      box-shadow: var(--civ-shadow-sm),
                  inset 0 1px 0 0 oklch(from var(--civ-color-destructive-foreground) l c h / 0.18);
    }
    .civ-button:active { transform: translateY(0); }
    .civ-button--solid:active {
      box-shadow: inset 0 1px 0 0 oklch(from var(--civ-color-primary-foreground) l c h / 0.10);
    }
  }
}
```

Change from previous: removed `filter: brightness()` in favor of explicit hover shadow; added inset highlight on solid + destructive; added translateY lift.

- [ ] **Step 2: Build packages/css**

Run: `pnpm --filter @civaria/css build`
Expected: success.

- [ ] **Step 3: Run existing tests that depend on button**

Run: `pnpm --filter civaria test -- Button`
Expected: PASS (Layer 1 change must not break React component behavior).

- [ ] **Step 4: Visual check via docs site**

Run: `pnpm --filter docs dev`

Open http://localhost:3000/docs/components/button and confirm:
- Solid buttons have a subtle inner highlight on the top edge
- Hovering lifts the button up ~1px with a soft shadow
- Pressing (mousedown) drops it back to baseline
- Focus ring is 3px, 2px offset, matches previous behavior

Stop the dev server with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add packages/css/src/elements/button.css
git commit -m "style(css): polish button — inset highlight, hover lift, motion tokens"
```

---

## Task 7: Polish input family CSS (Layer 1)

**Files:**
- Modify: `packages/css/src/elements/input.css`
- Modify: `packages/css/src/elements/input-number.css`
- Modify: `packages/css/src/elements/input-otp.css`
- Modify: `packages/css/src/elements/autocomplete.css`
- Modify: `packages/css/src/elements/multi-select.css`
- Modify: `packages/css/src/elements/file-upload.css`

- [ ] **Step 1: Polish `input.css`**

Replace `packages/css/src/elements/input.css` with:

```css
@layer civ-elements {
  .civ-input {
    display: flex; align-items: center; inline-size: 100%; min-block-size: 44px;
    padding-inline: var(--civ-spacing-3); padding-block: var(--civ-spacing-2);
    font-size: var(--civ-font-size-sm); color: var(--civ-color-foreground);
    background-color: var(--civ-color-background);
    border: var(--civ-shape-border-width-thin) solid var(--civ-color-border);
    border-radius: var(--civ-shape-radius-md);
    box-shadow: inset 0 1px 2px 0 oklch(0 0 0 / 0.04);
  }
  .civ-input::placeholder { color: var(--civ-color-muted-foreground); }
  .civ-input:hover { border-color: color-mix(in oklch, var(--civ-color-border) 60%, var(--civ-color-foreground)); }
  .civ-input:focus-within {
    border-color: var(--civ-color-ring);
    outline: 3px solid var(--civ-color-ring-soft);
    outline-offset: 0;
    box-shadow: inset 0 1px 2px 0 oklch(0 0 0 / 0.04);
  }
  .civ-input[data-invalid], .civ-input:invalid {
    border-color: var(--civ-color-destructive);
    background-color: color-mix(in oklch, var(--civ-color-destructive) 4%, var(--civ-color-background));
  }
  .civ-input[data-invalid]:focus-within {
    outline-color: color-mix(in oklch, var(--civ-color-destructive) 35%, transparent);
  }
  .civ-input[data-disabled], .civ-input:disabled { opacity: 0.5; cursor: not-allowed; background-color: var(--civ-color-muted); box-shadow: none; }
  .civ-input[data-readonly], .civ-input[readonly] { background-color: var(--civ-color-muted); }

  /* Sizes */
  .civ-input--sm { min-block-size: 36px; padding-inline: var(--civ-spacing-2); font-size: var(--civ-font-size-xs); }
  .civ-input--lg { min-block-size: 48px; padding-inline: var(--civ-spacing-4); font-size: var(--civ-font-size-base); }

  /* Textarea */
  textarea.civ-input { min-block-size: 80px; resize: vertical; }

  @media (prefers-reduced-motion: no-preference) {
    .civ-input {
      transition-property: border-color, outline-color, background-color, box-shadow;
      transition-duration: var(--civ-motion-duration-fast);
      transition-timing-function: var(--civ-motion-easing-standard);
    }
  }
}
```

- [ ] **Step 2: Polish each remaining file**

Apply the **same recipe** to `input-number.css`, `input-otp.css`, `autocomplete.css`, `multi-select.css`, `file-upload.css`:
- Add `box-shadow: inset 0 1px 2px 0 oklch(0 0 0 / 0.04);` to the main element selector.
- Change `:focus-within` (or `:focus`) rule to `outline: 3px solid var(--civ-color-ring-soft);` and keep border color.
- Replace any `transition-duration: 100ms` (or similar raw value) with `var(--civ-motion-duration-fast)`.
- Replace easing with `var(--civ-motion-easing-standard)`.
- Wrap transitions in `@media (prefers-reduced-motion: no-preference)`.

Open each file, make these four changes, save.

- [ ] **Step 3: Build and test**

Run: `pnpm --filter @civaria/css build && pnpm --filter civaria test -- -t "Input|Textarea|AutoComplete|MultiSelect|InputNumber|InputOTP|FileUpload"`
Expected: build succeeds; existing tests pass.

- [ ] **Step 4: Visual check**

Run: `pnpm --filter docs dev`
Open http://localhost:3000/docs/components/input and confirm all input variants have the soft inner shadow and new focus ring.

- [ ] **Step 5: Commit**

```bash
git add packages/css/src/elements/input.css \
        packages/css/src/elements/input-number.css \
        packages/css/src/elements/input-otp.css \
        packages/css/src/elements/autocomplete.css \
        packages/css/src/elements/multi-select.css \
        packages/css/src/elements/file-upload.css
git commit -m "style(css): polish input family — inset shadow, soft focus ring, motion tokens"
```

---

## Task 8: Polish display primitives CSS — badge, chip, avatar, skeleton, card

**Files:**
- Modify: `packages/css/src/elements/badge.css`
- Modify: `packages/css/src/elements/chip.css`
- Modify: `packages/css/src/elements/avatar.css`
- Modify: `packages/css/src/elements/skeleton.css`
- Modify: `packages/css/src/elements/card.css`

- [ ] **Step 1: Polish `badge.css`**

Replace with:

```css
@layer civ-elements {
  .civ-badge {
    display: inline-flex; align-items: center; gap: var(--civ-spacing-1);
    padding-inline: var(--civ-spacing-2); padding-block: var(--civ-spacing-0\.5);
    font-size: var(--civ-font-size-xs); font-weight: var(--civ-font-weight-medium);
    line-height: var(--civ-font-lineHeight-normal);
    border-radius: var(--civ-shape-radius-full); white-space: nowrap;
  }
  .civ-badge--solid {
    background-color: var(--civ-color-primary);
    color: var(--civ-color-primary-foreground);
    box-shadow: inset 0 1px 0 0 oklch(from var(--civ-color-primary-foreground) l c h / 0.12);
  }
  .civ-badge--soft {
    background-color: color-mix(in oklch, var(--civ-color-primary) 12%, transparent);
    color: var(--civ-color-primary);
  }
  .civ-badge--outline {
    background-color: transparent;
    border: var(--civ-shape-border-width-thin) solid var(--civ-color-border);
    color: var(--civ-color-foreground);
  }
  .civ-badge--destructive {
    background-color: var(--civ-color-destructive);
    color: var(--civ-color-destructive-foreground);
    box-shadow: inset 0 1px 0 0 oklch(from var(--civ-color-destructive-foreground) l c h / 0.12);
  }
  .civ-badge--success {
    background-color: var(--civ-color-success);
    color: var(--civ-color-success-foreground);
    box-shadow: inset 0 1px 0 0 oklch(from var(--civ-color-success-foreground) l c h / 0.12);
  }
  .civ-badge--warning {
    background-color: var(--civ-color-warning);
    color: var(--civ-color-warning-foreground);
    box-shadow: inset 0 1px 0 0 oklch(from var(--civ-color-warning-foreground) l c h / 0.12);
  }
}
```

- [ ] **Step 2: Polish `chip.css`**

Replace with:

```css
@layer civ-elements {
  .civ-chip {
    display: inline-flex; align-items: center; gap: var(--civ-spacing-1);
    padding-inline: var(--civ-spacing-3); padding-block: var(--civ-spacing-1);
    font-size: var(--civ-font-size-sm); font-weight: var(--civ-font-weight-medium);
    border-radius: var(--civ-shape-radius-full);
    border: var(--civ-shape-border-width-thin) solid var(--civ-color-border);
    background-color: var(--civ-surface-raised);
    color: var(--civ-color-foreground);
  }
  .civ-chip__remove {
    display: inline-flex; align-items: center; justify-content: center;
    min-block-size: 16px; min-inline-size: 16px;
    border-radius: var(--civ-shape-radius-full); cursor: pointer;
    color: var(--civ-color-muted-foreground); background: none; border: none;
    font-size: var(--civ-font-size-xs);
  }
  .civ-chip__remove:hover { color: var(--civ-color-foreground); background-color: var(--civ-color-border); }
  .civ-chip--primary {
    background-color: color-mix(in oklch, var(--civ-color-primary) 12%, transparent);
    color: var(--civ-color-primary);
    border-color: transparent;
  }
  .civ-chip--success {
    background-color: color-mix(in oklch, var(--civ-color-success) 12%, transparent);
    color: var(--civ-color-success);
    border-color: transparent;
  }
  .civ-chip--destructive {
    background-color: color-mix(in oklch, var(--civ-color-destructive) 12%, transparent);
    color: var(--civ-color-destructive);
    border-color: transparent;
  }

  @media (prefers-reduced-motion: no-preference) {
    .civ-chip {
      transition-property: background-color, color, border-color;
      transition-duration: var(--civ-motion-duration-fast);
      transition-timing-function: var(--civ-motion-easing-standard);
    }
  }
}
```

- [ ] **Step 3: Polish `avatar.css`**

Open the file and ensure it matches this shape:

```css
@layer civ-elements {
  .civ-avatar {
    display: inline-flex; align-items: center; justify-content: center;
    overflow: hidden;
    inline-size: 40px; block-size: 40px;
    border-radius: var(--civ-shape-radius-full);
    background-color: var(--civ-color-muted);
    color: var(--civ-color-muted-foreground);
    font-weight: var(--civ-font-weight-medium); font-size: var(--civ-font-size-sm);
    box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--civ-color-foreground) 6%, transparent);
  }
  .civ-avatar__image { inline-size: 100%; block-size: 100%; object-fit: cover; }
  .civ-avatar--sm { inline-size: 32px; block-size: 32px; font-size: var(--civ-font-size-xs); }
  .civ-avatar--lg { inline-size: 48px; block-size: 48px; font-size: var(--civ-font-size-base); }
  .civ-avatar--xl { inline-size: 64px; block-size: 64px; font-size: var(--civ-font-size-lg); }
  .civ-avatar--square { border-radius: var(--civ-shape-radius-md); }
}
```

If the existing file has additional selectors (e.g., `__fallback`, `__group`), preserve them but apply the same token-based color scheme.

- [ ] **Step 4: Polish `skeleton.css`**

Replace with:

```css
@layer civ-elements {
  .civ-skeleton {
    display: block;
    background-color: var(--civ-color-muted);
    border-radius: var(--civ-shape-radius-base);
    position: relative;
    overflow: hidden;
  }
  @media (prefers-reduced-motion: no-preference) {
    .civ-skeleton::after {
      content: "";
      position: absolute; inset: 0;
      background-image: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in oklch, var(--civ-color-background) 50%, transparent) 50%,
        transparent 100%
      );
      animation: civ-skeleton-shimmer 1.6s var(--civ-motion-easing-standard) infinite;
    }
  }
  @keyframes civ-skeleton-shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .civ-skeleton--circle { border-radius: var(--civ-shape-radius-full); }
  .civ-skeleton--line   { block-size: 1em; }
}
```

- [ ] **Step 5: Polish `card.css`**

Replace with:

```css
@layer civ-elements {
  .civ-card {
    background-color: var(--civ-surface-raised);
    color: var(--civ-color-card-foreground);
    border: var(--civ-shape-border-width-thin) solid var(--civ-color-border);
    border-radius: var(--civ-shape-radius-lg);
    box-shadow: var(--civ-elevation-2);
    container-type: inline-size; container-name: civ-card;
  }
  .civ-card__header {
    display: flex; align-items: center; gap: var(--civ-spacing-3);
    padding: var(--civ-spacing-6); padding-block-end: 0;
  }
  .civ-card__content { padding: var(--civ-spacing-6); }
  .civ-card__footer {
    display: flex; align-items: center; gap: var(--civ-spacing-2);
    padding: var(--civ-spacing-6); padding-block-start: 0;
  }
  @container civ-card (max-width: 300px) {
    .civ-card__header { flex-direction: column; align-items: flex-start; }
  }

  .civ-card--interactive { cursor: pointer; }

  @media (prefers-reduced-motion: no-preference) {
    .civ-card--interactive {
      transition-property: transform, box-shadow, border-color;
      transition-duration: var(--civ-motion-duration-base);
      transition-timing-function: var(--civ-motion-easing-standard);
    }
    .civ-card--interactive:hover {
      transform: translateY(-2px);
      box-shadow: var(--civ-elevation-3);
    }
  }
}
```

- [ ] **Step 6: Build + test + visual check**

Run: `pnpm --filter @civaria/css build && pnpm --filter civaria test -- -t "Badge|Chip|Avatar|Skeleton|Card"`
Expected: success.

Open `/docs/components/data-display` in the dev server and confirm the five components now have the refined look.

- [ ] **Step 7: Commit**

```bash
git add packages/css/src/elements/badge.css \
        packages/css/src/elements/chip.css \
        packages/css/src/elements/avatar.css \
        packages/css/src/elements/skeleton.css \
        packages/css/src/elements/card.css
git commit -m "style(css): polish display primitives — badges, chips, avatars, skeletons, cards"
```

---

## Task 9: Polish overlay-family CSS — drawer, toast, command-palette

**Files:**
- Modify: `packages/css/src/elements/drawer.css`
- Modify: `packages/css/src/elements/toast.css`
- Modify: `packages/css/src/elements/command-palette.css`

Note: Dialog, Popover, Tooltip, Menu do NOT have Layer 1 CSS files; they ship via Layer 3 React variants only. Those are handled in Tasks 14–18.

- [ ] **Step 1: Polish each file following the overlay recipe**

For each of the three files, open and make these edits:

1. Change the main surface selector's background from `--civ-color-card` (or `--civ-color-background`) to `var(--civ-surface-overlay)`.
2. Replace any raw `box-shadow` with `var(--civ-elevation-4)`.
3. Add `backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);` on the main panel.
4. Add a `@supports not (backdrop-filter: blur(8px)) { ... }` fallback that sets `background-color: var(--civ-color-card);`.
5. Wrap any existing transitions in `@media (prefers-reduced-motion: no-preference)` and use `var(--civ-motion-duration-base)` + `var(--civ-motion-easing-emphasized)` for enter/exit.

Do not change keyframe names, data-attribute hooks, or selectors — only the properties listed.

- [ ] **Step 2: Build + test**

Run: `pnpm --filter @civaria/css build && pnpm --filter civaria test -- -t "Drawer|Toast|CommandPalette"`

- [ ] **Step 3: Visual check**

Open `/docs/components/sidebar-drawer`, `/docs/components/toast-chip-progress`, `/docs/components/command-palette` and confirm new look.

- [ ] **Step 4: Commit**

```bash
git add packages/css/src/elements/drawer.css \
        packages/css/src/elements/toast.css \
        packages/css/src/elements/command-palette.css
git commit -m "style(css): polish overlay family — elevation-4, backdrop blur, emphasized easing"
```

---

## Task 10: Polish navigation CSS — sidebar, app-bar, bottom-nav, pagination, speed-dial, accordion

**Files:**
- Modify: `packages/css/src/elements/sidebar.css`
- Modify: `packages/css/src/elements/app-bar.css`
- Modify: `packages/css/src/elements/bottom-nav.css`
- Modify: `packages/css/src/elements/pagination.css`
- Modify: `packages/css/src/elements/speed-dial.css`
- Modify: `packages/css/src/elements/accordion.css`

- [ ] **Step 1: Apply the recipe to each file**

For each, make these edits:

1. Use `var(--civ-elevation-2)` for primary chrome shadow (AppBar, BottomNav, Sidebar floating container).
2. Replace raw transition durations with `var(--civ-motion-duration-fast)` for hover and `var(--civ-motion-duration-base)` for state changes.
3. Replace raw easing with `var(--civ-motion-easing-standard)`.
4. Wrap all transitions in `@media (prefers-reduced-motion: no-preference)`.
5. Item hover: `background-color: color-mix(in oklch, var(--civ-color-primary) 8%, transparent); color: var(--civ-color-primary);`
6. Active item: use the same tonal style at 15%.

- [ ] **Step 2: Build + test**

Run: `pnpm --filter @civaria/css build && pnpm --filter civaria test -- -t "Sidebar|AppBar|BottomNav|Pagination|SpeedDial|Accordion"`

- [ ] **Step 3: Commit**

```bash
git add packages/css/src/elements/sidebar.css \
        packages/css/src/elements/app-bar.css \
        packages/css/src/elements/bottom-nav.css \
        packages/css/src/elements/pagination.css \
        packages/css/src/elements/speed-dial.css \
        packages/css/src/elements/accordion.css
git commit -m "style(css): polish navigation components — elevation-2, tonal hover, motion tokens"
```

---

## Task 11: Polish data-display CSS — data-table, tree-view, transfer, stepper, timeline, splitter

**Files:**
- Modify: `packages/css/src/elements/data-table.css`
- Modify: `packages/css/src/elements/tree-view.css`
- Modify: `packages/css/src/elements/transfer.css`
- Modify: `packages/css/src/elements/stepper.css`
- Modify: `packages/css/src/elements/timeline.css`
- Modify: `packages/css/src/elements/splitter.css`

- [ ] **Step 1: Apply the recipe to each file**

For each:

1. Container elements get `var(--civ-elevation-1)` (very subtle) + `1px solid var(--civ-color-border)` + `border-radius: var(--civ-shape-radius-lg)`.
2. Header rows / column headers: `background-color: var(--civ-surface-sunken);`.
3. Row hover: `background-color: color-mix(in oklch, var(--civ-color-primary) 4%, transparent);`.
4. Selected row: `background-color: color-mix(in oklch, var(--civ-color-primary) 8%, transparent);`.
5. Motion-safe transitions on `background-color` using duration-fast + easing-standard.
6. Active handles (stepper dots, splitter grabbers): inset 1px highlight like the solid button recipe.

- [ ] **Step 2: Build + test**

Run: `pnpm --filter @civaria/css build && pnpm --filter civaria test -- -t "DataTable|TreeView|Transfer|Stepper|Timeline|Splitter"`

- [ ] **Step 3: Commit**

```bash
git add packages/css/src/elements/data-table.css \
        packages/css/src/elements/tree-view.css \
        packages/css/src/elements/transfer.css \
        packages/css/src/elements/stepper.css \
        packages/css/src/elements/timeline.css \
        packages/css/src/elements/splitter.css
git commit -m "style(css): polish data-display components — sunken headers, tonal row states"
```

---

## Task 12: Polish advanced CSS — date-picker, calendar, color-picker, slider, rating, progress, chart, editor

**Files:**
- Modify: `packages/css/src/elements/date-picker.css`
- Modify: `packages/css/src/elements/calendar.css`
- Modify: `packages/css/src/elements/color-picker.css`
- Modify: `packages/css/src/elements/slider.css`
- Modify: `packages/css/src/elements/rating.css`
- Modify: `packages/css/src/elements/progress.css`
- Modify: `packages/css/src/elements/chart.css`
- Modify: `packages/css/src/elements/editor.css`

- [ ] **Step 1: Apply the recipe to each file**

For each:

1. Container: `var(--civ-elevation-3)` on floating popover wrappers (date-picker, color-picker) with `backdrop-filter: blur(8px)` + fallback.
2. Inputs inside: inherit the polished input recipe (inset shadow + ring-soft focus).
3. Slider track: `background-color: var(--civ-color-muted);` with the filled portion using the primary color; thumb gets inset highlight + `var(--civ-elevation-2)`.
4. Rating star: solid has inset highlight; unfilled uses `color-mix(in oklch, var(--civ-color-foreground) 20%, transparent)`.
5. Progress bar: inset shadow on track, solid fill with inset highlight. Indeterminate animation uses `var(--civ-motion-easing-emphasized)` with duration 1500ms.
6. All transitions wrapped in motion-safe.

- [ ] **Step 2: Build + test**

Run: `pnpm --filter @civaria/css build && pnpm --filter civaria test -- -t "DatePicker|Calendar|ColorPicker|Slider|Rating|ProgressBar|Chart|Editor"`

- [ ] **Step 3: Commit**

```bash
git add packages/css/src/elements/date-picker.css \
        packages/css/src/elements/calendar.css \
        packages/css/src/elements/color-picker.css \
        packages/css/src/elements/slider.css \
        packages/css/src/elements/rating.css \
        packages/css/src/elements/progress.css \
        packages/css/src/elements/chart.css \
        packages/css/src/elements/editor.css
git commit -m "style(css): polish advanced components — elevation on popovers, refined slider/rating/progress"
```

---

## Task 13: Polish form primitive CSS — button-group, toggle-group

**Files:**
- Modify: `packages/css/src/elements/button-group.css`
- Modify: `packages/css/src/elements/toggle-group.css`

- [ ] **Step 1: Apply polish**

For `button-group.css`:
1. Ensure `.civ-button-group` has `display: inline-flex; box-shadow: var(--civ-elevation-1); border-radius: var(--civ-shape-radius-md); overflow: hidden;`.
2. Internal buttons drop their own box-shadow; only the wrapping group carries the elevation.
3. Divider between buttons: `border-inline-end: 1px solid color-mix(in oklch, var(--civ-color-border) 70%, transparent);` on all but last.

For `toggle-group.css`:
1. Container: `background-color: var(--civ-surface-sunken); border-radius: var(--civ-shape-radius-md); padding: var(--civ-spacing-1);`
2. Selected item: `background-color: var(--civ-surface-raised); box-shadow: var(--civ-elevation-1);`
3. Motion-safe transition between states using duration-fast + easing-standard.

- [ ] **Step 2: Build + test**

Run: `pnpm --filter @civaria/css build && pnpm --filter civaria test -- -t "ButtonGroup|ToggleGroup"`

- [ ] **Step 3: Commit**

```bash
git add packages/css/src/elements/button-group.css packages/css/src/elements/toggle-group.css
git commit -m "style(css): polish form primitives — grouped elevation, sunken toggle container"
```

---

## Task 14: Polish React Button variants (Layer 3)

**Files:**
- Modify: `packages/react/src/variants/button.ts`

- [ ] **Step 1: Replace entire file**

Replace `packages/react/src/variants/button.ts` with:

```ts
import { tv } from "tailwind-variants";

export const buttonVariants = tv({
  base: [
    "inline-flex items-center justify-center gap-2",
    "font-medium select-none whitespace-nowrap",
    "border-2 border-transparent",
    "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--civ-color-ring)]",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
    "min-h-[44px] min-w-[44px]",
    "motion-safe:transition-[transform,box-shadow,background-color,border-color,color]",
    "motion-safe:duration-[var(--civ-motion-duration-fast)]",
    "motion-safe:ease-[var(--civ-motion-easing-standard)]",
  ],
  variants: {
    variant: {
      solid: [
        "text-[var(--civ-color-primary-foreground)]",
        "shadow-[inset_0_1px_0_0_oklch(from_var(--civ-color-primary-foreground)_l_c_h_/_0.12)]",
        "motion-safe:hover:-translate-y-px",
        "motion-safe:hover:shadow-[var(--civ-shadow-sm),inset_0_1px_0_0_oklch(from_var(--civ-color-primary-foreground)_l_c_h_/_0.18)]",
        "motion-safe:active:translate-y-0",
      ],
      outline: [
        "bg-transparent",
        "motion-safe:hover:-translate-y-px",
      ],
      ghost: "bg-transparent",
      soft: [
        "motion-safe:hover:-translate-y-px",
      ],
      link: "bg-transparent underline-offset-4 hover:underline p-0 min-h-0 min-w-0 shadow-none",
    },
    size: {
      sm: "h-9 px-3 text-sm rounded-[var(--civ-shape-radius-base)]",
      md: "h-11 px-4 text-sm rounded-[var(--civ-shape-radius-md)]",
      lg: "h-12 px-6 text-base rounded-[var(--civ-shape-radius-md)]",
      xl: "h-14 px-8 text-lg rounded-[var(--civ-shape-radius-lg)]",
      icon: "size-11 rounded-[var(--civ-shape-radius-md)]",
    },
    color: {
      primary: "",
      secondary: "",
      destructive: "",
      success: "",
      warning: "",
      neutral: "",
    },
  },
  compoundVariants: [
    { variant: "solid", color: "primary", className: "bg-[var(--civ-color-primary)]" },
    { variant: "solid", color: "destructive", className: "bg-[var(--civ-color-destructive)] text-[var(--civ-color-destructive-foreground)] shadow-[inset_0_1px_0_0_oklch(from_var(--civ-color-destructive-foreground)_l_c_h_/_0.12)] motion-safe:hover:shadow-[var(--civ-shadow-sm),inset_0_1px_0_0_oklch(from_var(--civ-color-destructive-foreground)_l_c_h_/_0.18)]" },
    { variant: "solid", color: "success", className: "bg-[var(--civ-color-success)] text-[var(--civ-color-success-foreground)] shadow-[inset_0_1px_0_0_oklch(from_var(--civ-color-success-foreground)_l_c_h_/_0.12)]" },
    { variant: "outline", color: "primary", className: "border-[var(--civ-color-primary)] text-[var(--civ-color-primary)] hover:bg-[color-mix(in_oklch,var(--civ-color-primary)_8%,transparent)]" },
    { variant: "ghost", color: "primary", className: "text-[var(--civ-color-primary)] hover:bg-[color-mix(in_oklch,var(--civ-color-primary)_8%,transparent)]" },
    { variant: "soft", color: "primary", className: "bg-[color-mix(in_oklch,var(--civ-color-primary)_10%,transparent)] text-[var(--civ-color-primary)] hover:bg-[color-mix(in_oklch,var(--civ-color-primary)_15%,transparent)]" },
  ],
  defaultVariants: {
    variant: "solid",
    size: "md",
    color: "primary",
  },
});

export type ButtonVariants = Parameters<typeof buttonVariants>[0];
```

- [ ] **Step 2: Build + test**

Run: `pnpm --filter civaria build && pnpm --filter civaria test -- -t "Button"`
Expected: build succeeds; tests pass.

- [ ] **Step 3: Visual check**

Open `/docs/components/button` and confirm the React-rendered Button matches the Layer 1 CSS button visual.

- [ ] **Step 4: Commit**

```bash
git add packages/react/src/variants/button.ts
git commit -m "style(react): polish Button variants — inset highlight, hover lift, motion tokens"
```

---

## Task 15: Polish remaining React variant files

**Files:** every file under `packages/react/src/variants/*.ts` except `button.ts`.

- [ ] **Step 1: Inventory**

Run: `ls packages/react/src/variants/` and list every `.ts` file. Write them to memory.

- [ ] **Step 2: For each variant file, apply the recipe**

For every variant file:

1. Add to `base` array (if not present):
   - `"motion-safe:transition-[transform,box-shadow,background-color,border-color,color]"`
   - `"motion-safe:duration-[var(--civ-motion-duration-fast)]"`
   - `"motion-safe:ease-[var(--civ-motion-easing-standard)]"`

2. Wherever the variant targets a "solid" appearance (filled background with foreground text), add:
   - `"shadow-[inset_0_1px_0_0_oklch(from_var(--civ-color-primary-foreground)_l_c_h_/_0.12)]"`

3. Wherever the variant targets an "input-like" (bordered container with background), add:
   - `"shadow-[inset_0_1px_2px_0_oklch(0_0_0_/_0.04)]"`
   - Replace `focus:outline-[var(--civ-color-ring)]` with `focus-visible:outline-[3px] focus-visible:outline-[var(--civ-color-ring)]` and add `focus-visible:[outline-style:solid]`.

4. Replace any literal `duration-*` (e.g., `duration-200`) with the token-backed variant: `motion-safe:duration-[var(--civ-motion-duration-fast)]`.

5. Wherever a component is "overlay-like" (popover, menu, tooltip, dialog, drawer), add to its surface classes:
   - `"shadow-[var(--civ-elevation-4)]"`
   - `"backdrop-blur-[8px]"`
   - `"supports-[not_(backdrop-filter:blur(8px))]:bg-[var(--civ-color-card)]"`

Edit each file, save.

- [ ] **Step 3: Build + test after every 5 files**

Run after editing each batch of 5: `pnpm --filter civaria build && pnpm --filter civaria test`
If any batch fails, stop, fix, then continue.

- [ ] **Step 4: Visual check**

Run: `pnpm --filter docs dev`
Walk every component doc page in `/docs/components/` and confirm visual consistency with the Layer 1 polish.

- [ ] **Step 5: Commit in batches of ~6 files**

After each batch:

```bash
git add packages/react/src/variants/<file1>.ts packages/react/src/variants/<file2>.ts ...
git commit -m "style(react): polish <family> variants — apply Phase 0 recipe"
```

Example family groupings (create one commit per group):
- Inputs: input.ts, textarea.ts, input-number.ts, input-otp.ts, autocomplete.ts, multi-select.ts, file-upload.ts
- Display: badge.ts, chip.ts, avatar.ts, skeleton.ts, alert.ts, empty-state.ts, card.ts
- Overlays: dialog.ts, drawer.ts, popover.ts, tooltip.ts, menu.ts, toast.ts, command-palette.ts
- Navigation: tabs.ts, breadcrumb.ts, pagination.ts, sidebar.ts, app-bar.ts, bottom-nav.ts, accordion.ts, speed-dial.ts
- Data: data-table.ts, tree-view.ts, transfer.ts, stepper.ts, timeline.ts, splitter.ts
- Advanced: date-picker.ts, calendar.ts, color-picker.ts, slider.ts, rating.ts, progress.ts, chart.ts, editor.ts
- Forms: checkbox.ts, radio-group.ts, switch.ts, toggle-group.ts, button-group.ts, field.ts, label.ts

Some files may not exist yet — that's fine, skip those and note them in the commit message as "not present".

---

## Task 16: Refresh Playwright visual-regression baselines

**Files:**
- Update snapshot files under `packages/react/tests/` and/or `apps/docs/e2e/`

- [ ] **Step 1: Locate existing visual-regression tests**

Run: `grep -rn "toHaveScreenshot\|toMatchSnapshot" packages apps`
Identify which test files generate visual snapshots. If none exist, skip this task.

- [ ] **Step 2: Run the visual suite with snapshot update**

Run: `pnpm --filter docs exec playwright test --update-snapshots`
(Or the equivalent command for whichever package owns the visual tests.)

- [ ] **Step 3: Manually review updated snapshots**

Open each `.png` that changed and confirm the new look matches the polish recipe — specifically:
- Solid buttons show inset highlight
- Inputs show inset shadow
- Cards show refined elevation
- Overlays show blurred backdrop

If any snapshot looks wrong (unintended change), revert just that change and diagnose the cause.

- [ ] **Step 4: Commit updated baselines**

```bash
git add **/*-snapshots/**
git commit -m "test(visual): refresh baselines for Phase 0 polish"
```

---

## Task 17: Final verification

**Files:** none modified.

- [ ] **Step 1: Full build**

Run: `pnpm build`
Expected: every workspace package builds.

- [ ] **Step 2: All tests**

Run: `pnpm test`
Expected: all green.

- [ ] **Step 3: Type check**

Run: `pnpm -r typecheck`
Expected: zero errors.

- [ ] **Step 4: Contrast validation**

Run: `pnpm --filter @civaria/tokens validate`
Expected: all AAA-required pairs pass; AA-minimum pairs pass.

- [ ] **Step 5: Accessibility tests**

Run: `pnpm --filter docs exec playwright test --grep @a11y` (or the equivalent tag used in the suite)
Expected: zero axe violations.

- [ ] **Step 6: Lighthouse sanity check (manual)**

Run: `pnpm --filter docs build && pnpm --filter docs start`
Open `/docs/components/button` in Chrome, run Lighthouse on Desktop. Confirm Performance ≥95, Accessibility = 100.

- [ ] **Step 7: Announce Phase 0 complete**

Phase 0 is complete when all seven verification steps pass. Write a summary comment on the tracking PR (or in the conversation) listing any P1/P2 polish items deferred, ready to receive the Phase 1 plan.

---

## Self-review — done against spec §4

- Shadow 8-level scale: Task 1 ✓
- Motion scale with emphasized/decelerated/accelerated/standard: Task 2 ✓
- Elevation tokens 0–5: Task 3 ✓
- Surface raised/overlay/sunken: Task 3 ✓
- Ring-soft: Task 3 ✓
- Button solid inset highlight: Task 6 + Task 14 ✓
- Input soft inner shadow + sharper focus ring: Task 7 + Task 15 ✓
- Card 2-layer shadow + hairline border: Task 8 ✓
- Overlay backdrop-blur + elevation-4 + fallback: Task 9 + Task 15 ✓
- Chips/badges tonal OKLCH color-mix: Task 8 + Task 15 ✓
- Transitions tokenized + motion-safe: every Layer 1 and Layer 3 task ✓
- Specificity budget 0-2-0, no `!important`, logical properties only: enforced by the recipe doc ✓
