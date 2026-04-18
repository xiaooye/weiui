# WeiUI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

An accessibility-first design system with three consumption layers.

- **CSS Layer** — Framework-agnostic CSS-only components. Zero JavaScript.
- **Headless Layer** — React hooks with accessible behavior. Unstyled.
- **React Layer** — Fully styled React components with variant system.

## Features

- WCAG AAA contrast enforcement for content text, AA minimum for accent colors
- OKLCH color space with 127 design tokens
- Dark mode via `.dark` class
- 44px minimum touch targets
- Full keyboard navigation (WAI-ARIA patterns)
- CSS cascade layers (no `!important`)
- 65+ React components across Wave 1, 2, and 3
- Compound components (Accordion, Menu, Select, Tabs, Dialog, Popover, Tooltip, Stepper, Timeline, Sidebar, Drawer, and more)
- Tree-shakable — heavy deps (Editor, DataTable, Charts) live on dedicated subpath imports

## Quick Start

```bash
pnpm add @weiui/tokens @weiui/css
```

```html
<!-- CSS-only usage -->
<link rel="stylesheet" href="@weiui/tokens/tokens.css" />
<link rel="stylesheet" href="@weiui/css" />

<button class="wui-button wui-button--solid">Click me</button>
```

```tsx
// React usage
import { Button } from "@weiui/react";

<Button variant="solid">Click me</Button>
```

```tsx
// Heavy components live on subpaths so the main barrel stays light
import { Editor } from "@weiui/react/editor";
import { DataTable } from "@weiui/react/data-table";
import { BarChart, LineChart } from "@weiui/react/chart";
```

## Packages

| Package | Description |
|---------|-------------|
| `@weiui/tokens` | Design tokens (CSS, TS, JSON) |
| `@weiui/css` | CSS-only components and utilities |
| `@weiui/headless` | Headless React hooks and compound components |
| `@weiui/react` | Styled React components |
| `@weiui/icons` | SVG icon set as React components |
| `@weiui/cli` | CLI for initialization and token management |
| `@weiui/a11y` | Accessibility validation utilities |

## Documentation

Visit [ui.wei-dev.com](https://ui.wei-dev.com) for full documentation, including:

- Per-component API reference with live previews and code tabs
- Design token catalog (color, typography, spacing, motion, elevation)
- **Playground** — tweak props interactively and copy generated code
- **Composer** — drag-and-drop components onto a canvas, export JSX/HTML
- **Theme Builder** — pick a primary color, preview against all components, export CSS or JSON

## Development

```bash
git clone https://github.com/xiaooye/weiui.git
cd weiui
pnpm install
pnpm build
pnpm test
```

The docs site lives in `apps/docs` and can be run with `pnpm --filter @weiui/docs dev`.

## License

MIT
