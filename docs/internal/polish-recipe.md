# Polish Recipe — Phase 0

The canonical pattern applied to every component CSS file and tailwind-variants file in Phase 0.
Follow it exactly. Deviations need explicit justification in the PR.

## 1. Solid variants (buttons, badges solid, chips solid)

Add an inset 1px highlight for Volt-style depth:

```css
.wui-button--solid {
  background-color: var(--wui-color-primary);
  color: var(--wui-color-primary-foreground);
  box-shadow: inset 0 1px 0 0 oklch(from var(--wui-color-primary-foreground) l c h / 0.12);
}
```

## 2. Hover lift (buttons, cards, interactive surfaces — NOT inputs)

Motion-safe translateY + shadow bump:

```css
@media (prefers-reduced-motion: no-preference) {
  .wui-button:hover {
    transform: translateY(-1px);
    box-shadow: var(--wui-shadow-sm),
                inset 0 1px 0 0 oklch(from var(--wui-color-primary-foreground) l c h / 0.15);
  }
  .wui-button:active {
    transform: translateY(0);
    box-shadow: inset 0 1px 0 0 oklch(from var(--wui-color-primary-foreground) l c h / 0.10);
  }
}
```

## 3. Inputs (input, textarea, autocomplete, multiselect, input-number, input-otp)

Soft inner shadow at rest; sharper focus ring with color-mix transition. No hover lift.

```css
.wui-input {
  box-shadow: inset 0 1px 2px 0 oklch(0 0 0 / 0.04);
}
.wui-input:focus-within {
  border-color: var(--wui-color-ring);
  outline: 3px solid var(--wui-color-ring-soft);
  outline-offset: 0;
  box-shadow: inset 0 1px 2px 0 oklch(0 0 0 / 0.04);
}
```

## 4. Cards

Use `elevation-2` + `surface-raised` + hairline border.

```css
.wui-card {
  background-color: var(--wui-surface-raised);
  border: 1px solid var(--wui-color-border);
  box-shadow: var(--wui-elevation-2);
}
```

## 5. Overlays (dialog, drawer, popover, tooltip, menu, toast, command palette)

`elevation-4` or higher + backdrop-filter with fallback.

```css
.wui-popover {
  background-color: var(--wui-surface-overlay);
  box-shadow: var(--wui-elevation-4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
@supports not (backdrop-filter: blur(8px)) {
  .wui-popover { background-color: var(--wui-color-card); }
}
```

## 6. Transitions — always motion-safe, always new motion tokens

Replace any raw `200ms` or `cubic-bezier(...)` with tokens:

```css
@media (prefers-reduced-motion: no-preference) {
  .wui-button {
    transition-property: transform, box-shadow, background-color, border-color, color;
    transition-duration: var(--wui-motion-duration-fast);
    transition-timing-function: var(--wui-motion-easing-standard);
  }
}
```

## 7. Tonal / soft variants

Use `color-mix` in OKLCH for consistent tints across light/dark:

```css
.wui-button--soft {
  background-color: color-mix(in oklch, var(--wui-color-primary) 10%, transparent);
  color: var(--wui-color-primary);
}
.wui-button--soft:hover {
  background-color: color-mix(in oklch, var(--wui-color-primary) 15%, transparent);
}
```

## 8. Forbidden

- `!important` (use cascade layers)
- Physical properties (`padding-left` → `padding-inline-start`)
- Raw color values (use tokens)
- Gradient fills on any component (reserved for homepage hero only)
- Transitions outside `@media (prefers-reduced-motion: no-preference)`
