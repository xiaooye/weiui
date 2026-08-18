<p align="center">
  <strong>◎ &nbsp;&nbsp; ◐ &nbsp;&nbsp; ✓ &nbsp;&nbsp; ∅</strong>
</p>

<h1 align="center">WeiUI</h1>

<p align="center"><strong>The design system that ships everything.</strong></p>
<p align="center">Accessible primitives, perceptual tokens, and layered UI—from zero-JS CSS to fully styled React.</p>

<p align="center">
  <a href="https://ui.wei-dev.com/">Website</a> ·
  <a href="https://ui.wei-dev.com/docs/getting-started">Docs</a> ·
  <a href="https://ui.wei-dev.com/docs/components">Components</a> ·
  <a href="https://ui.wei-dev.com/playground">Playground</a> ·
  <a href="https://ui.wei-dev.com/composer">Composer</a> ·
  <a href="https://ui.wei-dev.com/themes">Themes</a>
</p>

<p align="center">
  <img alt="65+ components" src="https://img.shields.io/badge/65%2B-components-E8DDF8" />
  <img alt="WCAG AAA contrast" src="https://img.shields.io/badge/contrast-WCAG%20AAA-DDEFD8" />
  <img alt="Zero-JS CSS tier" src="https://img.shields.io/badge/CSS%20tier-zero%20JS-F8E5C2" />
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-F3D7E6" /></a>
</p>

<p align="center"><sub>Tokens · CSS · Headless · React · WCAG AAA · batteries included</sub></p>

<p align="center">✦ &nbsp; · &nbsp; · &nbsp; · &nbsp; ✦</p>

> [!IMPORTANT]
> **WeiUI is layered by design.** Use the CSS tier when you want accessible primitives with zero WeiUI JavaScript in the browser, the Headless layer when you want behavior without imposed styling, or the React layer when you want the complete styled system.
>
> **Configuration stays build-time.** `weiui.config.json` selects CSS capabilities deterministically, resolves dependency closure, and emits a generated bundle; it does not become a runtime framework.

## Quick Start

Start with tokens + CSS if you want the smallest, framework-agnostic surface:

```bash
pnpm add @weiui/tokens @weiui/css
```

```html
<link rel="stylesheet" href="@weiui/tokens/tokens.css" />
<link rel="stylesheet" href="@weiui/css" />

<button class="wui-button wui-button--solid">Ship it</button>
```

Or use the styled React layer:

```bash
pnpm add @weiui/react
```

```tsx
import { Button } from "@weiui/react";

<Button variant="solid">Ship it</Button>
```

Heavy components stay on dedicated subpaths so the main barrel stays light:

```tsx
import { Editor } from "@weiui/react/editor";
import { DataTable } from "@weiui/react/data-table";
import { BarChart, LineChart } from "@weiui/react/chart";
```

## Why WeiUI

WeiUI is built around production pressure rather than raw component count. The goal is to reduce the places where real interfaces usually drift: accessibility, color, bundle size, framework coupling, and designer–developer handoff.

| Production pressure | WeiUI answer |
| --- | --- |
| Accessibility becomes a late QA task | **WCAG-first foundations** with contrast, touch-target, keyboard, and motion rules treated as system constraints |
| One UI package is either too small or too opinionated | **Three runtime layers** let you choose CSS-only, Headless, or fully styled React |
| Theme colors drift between files and tools | **OKLCH design tokens** provide a perceptual, semantic source of truth |
| Large components inflate every consumer | **Dedicated subpath imports** isolate Editor, DataTable, and Charts |
| A React dependency blocks other stacks | **Framework-agnostic CSS** works with Vue, Svelte, plain HTML, or no framework at all |
| Design intent disappears between design and code | **JSON tokens, CSS variables, and tooling** keep the system inspectable and portable |

## Choose your integration depth

| Surface | What it owns | WeiUI browser JS |
| --- | --- | --- |
| `@weiui/tokens` | Color, type, spacing, shape, motion, elevation, semantic decisions | None |
| `@weiui/css` | Framework-agnostic visual primitives and utilities | **None** |
| `@weiui/headless` | Accessible React behavior and compound interaction patterns | Behavior only |
| `@weiui/react` | Fully styled React components and variants | As required by the component |
| Config tooling | Build-time bundle selection, dependency closure, provenance | **None at runtime** |

The runtime layers are intentionally separable. You do not have to adopt the entire system to use one useful part of it.

## Build only what you need

For a smaller CSS surface, describe the capabilities you actually ship:

```json
{
  "schema": "weiui_css_config_v1",
  "foundation": true,
  "a11y": ["focus", "motion", "sr-only"],
  "elements": ["button", "input", "card"],
  "utilities": [],
  "output": "src/styles/weiui.generated.css"
}
```

```bash
pnpm exec weiui-css bundle
```

The generated CSS is deterministic and still requires zero WeiUI JavaScript in the browser.

## Accessible by construction

WeiUI treats accessibility as part of the design system contract, not a theme applied afterward.

- **WCAG AAA** contrast target for content text; AA minimum for accent colors
- **44×44 px** minimum touch targets
- Keyboard behavior based on established **WAI-ARIA interaction patterns**
- Focus, screen-reader, and reduced-motion primitives included in the system
- CSS cascade layers instead of specificity escalation and `!important`
- Perceptual color work in **OKLCH** with light/dark semantic surfaces

## Product tools

The documentation site is also a working surface for the system—not just an API index.

| Tool | Use it for |
| --- | --- |
| [Components](https://ui.wei-dev.com/docs/components) | Live previews, APIs, patterns, and implementation examples |
| [Playground](https://ui.wei-dev.com/playground) | Adjust props interactively and copy generated code |
| [Composer](https://ui.wei-dev.com/composer) | Compose components visually and export JSX / HTML |
| [Theme Builder](https://ui.wei-dev.com/themes) | Explore a primary color across the system and export theme output |
| [Design Tokens](https://ui.wei-dev.com/docs/tokens) | Inspect the token model behind color, typography, spacing, motion, and elevation |

## Packages

| Package | Responsibility |
| --- | --- |
| `@weiui/tokens` | Design tokens in CSS / TypeScript / JSON-oriented workflows |
| `@weiui/css` | CSS-only components, utilities, and config-driven bundle tooling |
| `@weiui/headless` | Headless React hooks and compound interaction primitives |
| `@weiui/react` | Styled React components and variants |
| `@weiui/icons` | SVG icon set exposed as React components |
| `@weiui/cli` | Initialization, component discovery, and token-management workflows |
| `@weiui/a11y` | Accessibility validation utilities |

## Development

```bash
git clone https://github.com/xiaooye/weiui.git
cd weiui
pnpm install
pnpm build
pnpm test
```

Run the documentation/product surface locally:

```bash
pnpm --filter @weiui/docs dev
```

The repository is a pnpm + Turborepo monorepo. The live documentation application lives in `apps/docs`; reusable packages live under `packages/`.

## Status

WeiUI is **pre-release and actively developed**. The current system includes the token foundation, CSS and Headless layers, styled React components, accessibility tooling, build-time CSS configuration, CLI workflows, interactive documentation, Playground, Composer, and Theme Builder.

The design direction is intentionally restrained: clear hierarchy, generous spacing, semantic color, soft emphasis, useful motion, and decoration only when it helps comprehension.

## License

WeiUI is distributed under the [MIT License](LICENSE).

---

<p align="center"><sub>✦ Accessible by default. Layered by choice. Yours to ship. ♡</sub></p>
