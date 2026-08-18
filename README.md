<p align="center"><strong>◎ &nbsp;&nbsp; ◐ &nbsp;&nbsp; ✓ &nbsp;&nbsp; ∅</strong></p>
<h1 align="center">WeiUI</h1>
<p align="center"><strong>One semantic design system, multiple native runtimes.</strong></p>
<p align="center">Design tokens · canonical CSS · shared behavior/a11y · React · Vue · Solid · Svelte · Web Components</p>

<p align="center">
  <a href="https://ui.wei-dev.com/">Website</a> ·
  <a href="https://ui.wei-dev.com/docs/getting-started">Docs</a> ·
  <a href="https://ui.wei-dev.com/docs/components">Components</a> ·
  <a href="https://ui.wei-dev.com/playground">Playground</a> ·
  <a href="https://ui.wei-dev.com/composer">Composer</a> ·
  <a href="https://ui.wei-dev.com/themes">Themes</a>
</p>

> [!IMPORTANT]
> WeiUI is no longer architected as “React plus framework-neutral CSS.” `@weiui/core` owns reusable state, event intent, ARIA derivation, collection logic and anatomy; each official framework package renders natively. `@weiui/css` remains the canonical visual contract.
>
> `@weiui/headless` is a deprecated React compatibility surface. New React unstyled code should use `@weiui/react/headless`.

## Quick start

The zero-JS visual layer remains available everywhere:

```bash
pnpm add @weiui/tokens @weiui/css
```

```html
<link rel="stylesheet" href="@weiui/tokens/tokens.css" />
<link rel="stylesheet" href="@weiui/css" />
<button class="wui-button wui-button--solid">Ship it</button>
```

Choose a native runtime when you want WeiUI behavior and component ergonomics:

```bash
pnpm add @weiui/css @weiui/react   # or @weiui/vue, @weiui/solid, @weiui/svelte
```

```tsx
import { Button } from "@weiui/react";
import "@weiui/css";
<Button variant="solid">Ship it</Button>
```

```vue
<script setup lang="ts">
import { Button } from "@weiui/vue";
import "@weiui/css";
</script>
<template><Button variant="solid">Ship it</Button></template>
```

Custom Elements are an optional distribution target, not the canonical implementation layer:

```js
import { defineButton } from "@weiui/elements/button";
import "@weiui/css";
defineButton();
```

```html
<wui-button variant="solid">Ship it</wui-button>
```

## Architecture

```text
@weiui/tokens ──► @weiui/css
                     ▲
                     │ canonical classes + data anatomy
@weiui/a11y ──► @weiui/core
                     │
          ┌──────────┼──────────┬──────────┬──────────┐
          ▼          ▼          ▼          ▼          ▼
       React        Vue       Solid      Svelte    Elements
```

The rules are simple:

- Tokens and Core import no UI framework.
- Reusable interaction semantics and accessibility state live in Core where technically reasonable.
- React, Vue, Solid and Svelte use their own native lifecycle/composition models.
- Runtime packages never depend on another runtime package.
- Stable `.wui-*`, `data-wui-component`, `data-part`, `data-state`, `data-selected`, `data-highlighted`, `data-disabled`, `data-size` and `data-variant` hooks form the visual/semantic bridge.
- Heavy ecosystem integrations remain isolated rather than contaminating the shared runtime.

See [`MULTI-RUNTIME-ARCHITECTURE.md`](MULTI-RUNTIME-ARCHITECTURE.md) for the contract and [`MIGRATION-MULTI-RUNTIME.md`](MIGRATION-MULTI-RUNTIME.md) for upgrading existing code.

## Packages

| Package | Responsibility |
| --- | --- |
| `@weiui/tokens` | Framework-neutral design tokens |
| `@weiui/css` | Canonical framework-neutral visual contract |
| `@weiui/a11y` | Accessibility validation utilities |
| `@weiui/core` | Framework-neutral state, events, ARIA derivation, collections, anatomy and metadata |
| `@weiui/react` | Native React renderer; `./headless`, `./editor`, `./data-table`, `./chart` subpaths |
| `@weiui/vue` | Native Vue 3 Composition API renderer |
| `@weiui/solid` | Native SolidJS renderer |
| `@weiui/svelte` | Native Svelte 5 source runtime |
| `@weiui/elements` | Optional light-DOM Custom Elements distribution with explicit registration |
| `@weiui/headless` | **Deprecated** React compatibility package |
| `@weiui/icons` | Framework-neutral icon data plus React/Vue/Solid/Svelte/SVG adapters |
| `@weiui/cli` | Runtime detection, scaffolding and token workflows |
| `@weiui/mcp` | Framework-neutral component metadata and runtime-aware examples for AI tooling |

## Portability

WeiUI classifies components by what should be shared:

- **A — Visual primitives:** tokens + CSS + thin native renderer.
- **B — Interactive primitives:** Core behavior/a11y + native renderer + CSS.
- **C — Complex composites:** share state/selection/a11y where practical; renderer may own substantial logic.
- **D — Ecosystem integrations:** framework-specific by design.

Required cross-runtime Class B coverage includes Accordion, Dialog, Menu, Popover, Select, Tabs, Tooltip, Combobox, Checkbox and Switch, alongside Button and a useful visual primitive set. The machine-readable registry in `@weiui/core/registry` is the runtime-support authority used by Composer, MCP and CLI.

## React ecosystem integrations

These intentionally remain React-specific and isolated from the base barrel:

```tsx
import { Editor } from "@weiui/react/editor";        // Tiptap React
import { DataTable } from "@weiui/react/data-table"; // TanStack React Table
import { BarChart } from "@weiui/react/chart";       // Recharts
```

`import { Button } from "@weiui/react"` does not import those heavy integration entrypoints.

## Tooling

- **Composer** stores semantic WeiUI nodes and can generate React, Vue, Solid, Svelte and HTML/Elements output from the same composition.
- **MCP** returns canonical portability/anatomy/runtime metadata from Core rather than treating React source as the schema.
- **CLI** detects React/Next, Vue/Nuxt, Solid/SolidStart, Svelte/SvelteKit, Astro/plain HTML, with explicit `--framework` overrides.
- **Icons** are generated from one neutral source into all supported renderer formats.

## Verification

```bash
pnpm install --frozen-lockfile
pnpm check:boundaries
pnpm build
pnpm test
pnpm check:parity
pnpm check:ssr
pnpm check:fixtures
pnpm --filter @weiui/tokens validate
```

The repository remains a pnpm + Turborepo monorepo. `apps/docs` is the product/docs surface; reusable packages live under `packages/`. Existing Cloudflare deployment remains unchanged.

## Status

WeiUI is pre-1.0 and actively developed. Multi-runtime packages are intentionally allowed to expose framework-native syntax rather than fake syntax parity. Semantic state, accessibility relationships, anatomy and visual identity are the shared contract.

## License

WeiUI is distributed under the [MIT License](LICENSE).
