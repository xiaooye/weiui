# @weiui/css

Framework-agnostic CSS-only components. Zero JavaScript. Works in plain HTML, Rails, Django, Phoenix, Astro, Solid, Svelte, Vue — any environment that can load CSS.

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

## Brand themes

WeiUI registers the canonical cascade order as:

```css
@layer wui-reset, wui-tokens, wui-theme, wui-base, wui-elements, wui-utilities;
```

Product-specific themes should override semantic custom properties in `wui-theme` rather than fork component CSS:

```css
@layer wui-theme {
  :root {
    --wui-color-primary: oklch(0.62 0.16 332);
    --wui-color-ring: var(--wui-color-primary);
  }

  .dark {
    --wui-color-primary: oklch(0.74 0.13 332);
  }
}
```

Keep product identity in theme tokens; keep component structure, touch sizing, focus treatment, motion safety, and logical layout in WeiUI.

## Conventions

- Class naming: `wui-{component}`, `wui-{component}__{element}`, `wui-{component}--{modifier}`
- State: data attributes, not classes — `[data-disabled]`, `[data-loading]`, `[data-open]`
- Cascade layers: `wui-reset`, `wui-tokens`, `wui-theme`, `wui-base`, `wui-elements`, `wui-utilities`
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

v0.0.1. Pairs 1:1 with `@weiui/react` component surface while remaining independently usable by non-React hosts.
