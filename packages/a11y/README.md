# @weiui/a11y

Accessibility validation utilities used by `@weiui/tokens` at build time and available to apps for runtime contrast checks.

## Install

```bash
pnpm add @weiui/a11y
```

## API

### `getContrastRatio(fg, bg): number`

Returns the WCAG contrast ratio (1–21) between two CSS colors. Accepts any value `colorjs.io` parses — OKLCH, hex, rgb, named colors, etc.

```ts
import { getContrastRatio } from "@weiui/a11y";

getContrastRatio("oklch(0 0 0)", "oklch(1 0 0)"); // ~21
```

### `validateContrastAAA(fg, bg, isLargeText?)`

Returns `{ passes, ratio, required }`. `required` is `7` for normal text and `4.5` for large text (WCAG AAA).

```ts
import { validateContrastAAA } from "@weiui/a11y";

const result = validateContrastAAA("oklch(0.446 0.018 240)", "oklch(1 0 0)");
// { passes: true, ratio: 7.2, required: 7 }
```

## Status

v0.0.1 — contrast only. Future releases may add focus-order checks, landmark validation, and a11y tree snapshot helpers as the need arises in the design system.
