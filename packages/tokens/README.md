# @civaria/tokens

Design tokens in W3C Design Tokens Community Group format, compiled to CSS custom properties, TypeScript declarations, and flat JSON.

## Install

```bash
pnpm add @civaria/tokens
```

## Usage

### CSS

```css
@import "@civaria/tokens/tokens.css";
```

Applies all tokens as CSS custom properties on `:root` (light) and `.dark` (dark mode). The generated CSS also registers Civaria's canonical cascade order, including the `civ-theme` slot used by branded consumers:

```css
@layer civ-reset, civ-tokens, civ-theme, civ-base, civ-elements, civ-utilities;
```

A product theme should override semantic `--civ-*` properties in `@layer civ-theme` rather than modify the generated token bundle.

### TypeScript

```ts
import { tokens } from "@civaria/tokens";

tokens.color.primary;            // "oklch(...)"
tokens.spacing["4"];
tokens.typography.fontSize.lg;
```

### Raw JSON

```ts
import tokensJson from "@civaria/tokens/tokens.json";
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
