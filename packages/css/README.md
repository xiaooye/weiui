# @weiui/css

Framework-agnostic CSS-only components. Zero browser JavaScript. Works in plain HTML, Rails, Django, Phoenix, Astro, Solid, Svelte, Vue — any environment that can load CSS.

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

## Config-driven on-demand bundles

The default full bundle stays available, but applications that care about CSS parse/transfer cost can declare only the WeiUI surface they use.

Create `weiui.config.json`:

```json
{
  "schema": "weiui_css_config_v1",
  "foundation": true,
  "a11y": ["focus", "motion", "sr-only"],
  "elements": ["button", "input", "card", "badge", "command-palette"],
  "utilities": [],
  "output": "src/styles/weiui.generated.css"
}
```

Then run:

```bash
pnpm exec weiui-css validate
pnpm exec weiui-css bundle
```

The config tooling is Node/build-time only and uses no browser runtime JavaScript. Generated bundles:

- preserve the canonical cascade-layer/source order;
- fail closed on unknown keys or component names;
- normalize duplicate/order-only config differences deterministically;
- close element dependencies inferred from the real CSS selectors;
- include a config fingerprint and bundle-manifest provenance header;
- never inline `@weiui/tokens`, so token/theme ownership stays explicit.

Programmatic build tooling is available from `@weiui/css/config`. `@weiui/css/bundle-manifest.json` exposes the generated public fragment catalog; consumers should select public IDs, not internal source paths.

For Solid, Svelte, Vue, or plain HTML the generated file is just CSS:

```css
@import "@weiui/tokens/tokens.css";
@import "./styles/weiui.generated.css";
@import "./product-theme.css";
```

No framework adapter is required.

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

- `dist/weiui.css` — readable full bundle
- `dist/weiui.min.css` — minified full bundle
- `dist/reset.css`, `dist/base.css` — real foundation subpaths
- `dist/a11y/*`, `dist/elements/*`, `dist/utilities/*` — real fragment subpaths
- `dist/bundle-manifest.json` — canonical selection/dependency manifest
- `dist/config.mjs` + `dist/config-cli.mjs` — build-time config tooling

## Status

v0.0.1. The CSS surface pairs with the broader WeiUI component vocabulary while remaining independently usable by non-React hosts.
