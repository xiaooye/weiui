# @weiui/cli

CLI for scaffolding and maintaining WeiUI design system installs.

## Install

```bash
pnpm add -D @weiui/cli
# or run ad-hoc
pnpx @weiui/cli <command>
```

## Commands

### `weiui init`

Creates `weiui.config.json` in the current directory and prints the install snippet for `@weiui/css` and `@weiui/tokens`. Skips if the config already exists.

```bash
pnpx @weiui/cli init
```

### `weiui tokens build`

Compiles the design tokens to CSS custom properties, TypeScript declarations, and flat JSON. Delegates to `pnpm --filter @weiui/tokens build`, so it only works inside the monorepo today.

### `weiui tokens validate`

Runs the WCAG AAA contrast validator over every semantic token pair. Exits non-zero on failure.

## Status

v0.0.1. Commands cover the bootstrap flow; a future release will detach `tokens build` and `tokens validate` from the monorepo so consumers can run them against their own config.
