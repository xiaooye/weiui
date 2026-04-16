# WeiUI

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
- 30+ React components
- 8 headless compound components

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

Visit [ui.wei-dev.com](https://ui.wei-dev.com) for full documentation.

## Development

```bash
git clone https://github.com/xiaooye/weiui.git
cd weiui
pnpm install
pnpm build
pnpm test
```

## License

MIT
