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
