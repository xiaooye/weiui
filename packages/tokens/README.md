# @weiui/tokens

Design tokens in W3C Design Tokens Community Group format, compiled to CSS custom properties, TypeScript declarations, and flat JSON.

## Install

```bash
pnpm add @weiui/tokens
```

## Usage

### CSS

```css
@import "@weiui/tokens/tokens.css";
```

Applies all tokens as CSS custom properties on `:root` (light) and `.dark` (dark mode).

### TypeScript

```ts
import { tokens } from "@weiui/tokens";

tokens.color.primary;            // "oklch(...)"
tokens.spacing["4"];
tokens.typography.fontSize.lg;
```

### Raw JSON

```ts
import tokensJson from "@weiui/tokens/tokens.json";
```

## Categories

- `color` — OKLCH, AAA-validated against background pairs
- `typography` — font families, sizes, weights, line heights
- `spacing` — 4px scale
- `radius`, `elevation`, `motion` — shape, shadow, duration tokens

## Scripts

- `pnpm build` — compile tokens to `dist/{tokens.css, tokens.json, index.js, index.d.ts}`
- `pnpm validate` — fail build if any token pair drops below WCAG AAA (7:1 normal, 4.5:1 large)

## Status

v0.0.1. Source lives in `src/primitives/` and `src/semantic.json`. Dark mode derived in `src/dark-mode.ts`.
