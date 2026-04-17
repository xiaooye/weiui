# @weiui/css

Framework-agnostic CSS-only components. Zero JavaScript. Works in plain HTML, Rails, Django, Phoenix, Astro — any environment that can `<link>` a stylesheet.

## Install

```bash
pnpm add @weiui/css @weiui/tokens
```

```html
<link rel="stylesheet" href="node_modules/@weiui/tokens/dist/tokens.css" />
<link rel="stylesheet" href="node_modules/@weiui/css/dist/weiui.css" />

<button class="wui-button wui-button--solid">Click</button>
```

## Or via bundler

```css
@import "@weiui/tokens/tokens.css";
@import "@weiui/css";
```

## Conventions

- Class naming: `wui-{component}`, `wui-{component}__{element}`, `wui-{component}--{modifier}`
- State: data attributes, not classes — `[data-disabled]`, `[data-loading]`, `[data-open]`
- Cascade layers: `wui-reset`, `wui-tokens`, `wui-base`, `wui-elements`, `wui-utilities`
- Logical properties only (`padding-inline-start`, `inset-inline-end`)
- OKLCH colors throughout
- Motion wrapped in `@media (prefers-reduced-motion: no-preference)`
- No `!important`

## What's covered

All 65+ components have CSS counterparts — button, input, card, badge, alert, dialog, popover, combobox, data table, editor, chart wrappers, app bar, bottom nav, speed dial, and more.

## Build output

- `dist/weiui.css` — readable bundle
- `dist/weiui.min.css` — minified via `lightningcss`

## Status

v0.0.1. Pairs 1:1 with `@weiui/react` component surface.
