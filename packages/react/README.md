# @weiui/react

Styled React components built on `@weiui/headless` and `@weiui/css`. The top layer of the WeiUI stack — drop it in, get an accessible, theme-aware UI.

## Install

```bash
pnpm add @weiui/react @weiui/css @weiui/tokens
```

```css
/* app globals */
@import "@weiui/tokens/tokens.css";
@import "@weiui/css";
```

## Usage

```tsx
import { Button, Dialog, DialogContent, DialogTrigger } from "@weiui/react";

<Dialog>
  <DialogTrigger asChild>
    <Button variant="solid">Open</Button>
  </DialogTrigger>
  <DialogContent>Hello from WeiUI</DialogContent>
</Dialog>
```

## Entry points

Heavy dependencies live on dedicated subpaths so the main barrel stays light:

```tsx
import { Button } from "@weiui/react";            // main barrel, no TipTap/Recharts
import { Editor } from "@weiui/react/editor";     // TipTap
import { DataTable } from "@weiui/react/data-table"; // TanStack Table
import { BarChart } from "@weiui/react/chart";    // Recharts
```

## Features

- 65+ components across Wave 1/2/3 (Button, Input, Dialog, Popover, Combobox, DataTable, Editor, Charts, AppBar, BottomNav, SpeedDial, etc.)
- `tailwind-variants` variant system — typed, composable, tree-shakable
- Server-first — static components (Card, Badge, Avatar) render without `"use client"`
- SSR-safe — `useId`, no `window`/`document` in render paths
- `forwardRef` and controlled/uncontrolled patterns throughout

## Status

v0.0.1. 562 unit tests passing. See [ui.wei-dev.com](https://ui.wei-dev.com) for the component catalog.
