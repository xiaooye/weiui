# @civaria/cli

CLI for scaffolding and maintaining Civaria design system installs.

## Install

```bash
pnpm add -D @civaria/cli
# or run ad-hoc
pnpx @civaria/cli <command>
```

## Commands

### `civaria init`

Creates `civaria.config.json` in the current directory and prints the install snippet for `@civaria/css` and `@civaria/tokens`. Skips if the config already exists.

```bash
pnpx @civaria/cli init
```

### `civaria tokens build`

Compiles the design tokens to CSS custom properties, TypeScript declarations, and flat JSON. Delegates to `pnpm --filter @civaria/tokens build`, so it only works inside the monorepo today.

### `civaria tokens validate`

Runs the WCAG AAA contrast validator over every semantic token pair. Exits non-zero on failure.

## Status

v0.0.1. Commands cover the bootstrap flow; a future release will detach `tokens build` and `tokens validate` from the monorepo so consumers can run them against their own config.
