# @weiui/icons

Tree-shakable SVG icons generated from source `.svg` files. Each icon is a React component rendered through a shared `Icon` primitive with `currentColor` stroke.

## Install

```bash
pnpm add @weiui/icons
```

## Usage

```tsx
import { Check, ChevronDown, Search } from "@weiui/icons";

<Check size={20} />
<ChevronDown aria-hidden />
<Search size="1.5rem" color="var(--wui-color-muted-foreground)" />
```

All icons accept any SVG attribute plus `size` (number | string) which applies to both `width` and `height`. Stroke inherits from `currentColor`.

## Starter set (v0.0.1)

AlertCircle, ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, Info, Menu, Search, X.

Add new icons by dropping `.svg` files into `svg/` and running `pnpm generate`. The script sanitises with SVGO and emits React components into `src/icons/`.

## Status

v0.0.1 ships the 10 icons above. The pipeline is ready for expansion; additional icon sets will follow the design spec priorities.
