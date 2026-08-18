# Civaria

WCAG-first. Governance-ready.

Accessible by default. Governable by design.

Civaria is a design system for teams that need accessible interfaces, enforceable standards, and evidence they can trust. Tokens, canonical CSS, Headless behavior, React and native framework runtimes, A11y tooling, Icons, CLI, MCP, Registry, Composer, and Governance share one semantic contract.

<p align="center">
  <a href="https://ui.wei-dev.com/">Website</a> ·
  <a href="https://ui.wei-dev.com/docs/getting-started">Docs</a> ·
  <a href="https://ui.wei-dev.com/docs/components">Components</a> ·
  <a href="https://ui.wei-dev.com/playground">Playground</a> ·
  <a href="https://ui.wei-dev.com/composer">Composer</a> ·
  <a href="https://ui.wei-dev.com/themes">Themes</a>
</p>

> [!IMPORTANT]
> Civaria is no longer architected as “React plus framework-neutral CSS.” `@civaria/core` owns reusable state, event intent, ARIA derivation, collection logic and anatomy; each official framework package renders natively. `@civaria/css` remains the canonical visual contract.
>
> `@civaria/headless` is a deprecated React compatibility surface. New React unstyled code should use `civaria/headless`.

## Quick start

The zero-JS visual layer remains available everywhere:

```bash
pnpm add @civaria/tokens @civaria/css
```

```html
<link rel="stylesheet" href="@civaria/tokens/tokens.css" />
<link rel="stylesheet" href="@civaria/css" />
<button class="civ-button civ-button--solid">Ship it</button>
```

Choose a native runtime when you want Civaria behavior and component ergonomics:

```bash
pnpm add @civaria/css civaria   # or @civaria/vue, @civaria/solid, @civaria/svelte
```

```tsx
import { Button } from "civaria";
import "@civaria/css";
<Button variant="solid">Ship it</Button>
```

```vue
<script setup lang="ts">
import { Button } from "@civaria/vue";
import "@civaria/css";
</script>
<template><Button variant="solid">Ship it</Button></template>
```

Custom Elements are an optional distribution target, not the canonical implementation layer:

```js
import { defineButton } from "@civaria/elements/button";
import "@civaria/css";
defineButton();
```

```html
<civ-button variant="solid">Ship it</civ-button>
```

## Architecture

```text
@civaria/tokens ──► @civaria/css
                     ▲
                     │ canonical classes + data anatomy
@civaria/a11y ──► @civaria/core
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
- Stable `.civ-*`, `data-civaria-component`, `data-part`, `data-state`, `data-selected`, `data-highlighted`, `data-disabled`, `data-size` and `data-variant` hooks form the visual/semantic bridge.
- Heavy ecosystem integrations remain isolated rather than contaminating the shared runtime.

See [`MULTI-RUNTIME-ARCHITECTURE.md`](MULTI-RUNTIME-ARCHITECTURE.md) for the contract and [`MIGRATION-MULTI-RUNTIME.md`](MIGRATION-MULTI-RUNTIME.md) for upgrading existing code.

## Packages

| Package | Responsibility |
| --- | --- |
| `@civaria/tokens` | Framework-neutral design tokens |
| `@civaria/css` | Canonical framework-neutral visual contract |
| `@civaria/a11y` | Accessibility validation utilities |
| `@civaria/core` | Framework-neutral state, events, ARIA derivation, collections, anatomy and metadata |
| `civaria` | Native React renderer; `./headless`, `./editor`, `./data-table`, `./chart` subpaths |
| `@civaria/vue` | Native Vue 3 Composition API renderer |
| `@civaria/solid` | Native SolidJS renderer |
| `@civaria/svelte` | Native Svelte 5 source runtime |
| `@civaria/elements` | Optional light-DOM Custom Elements distribution with explicit registration |
| `@civaria/headless` | **Deprecated** React compatibility package |
| `@civaria/icons` | Framework-neutral icon data plus React/Vue/Solid/Svelte/SVG adapters |
| `@civaria/cli` | Runtime detection, scaffolding and token workflows |
| `@civaria/mcp` | Framework-neutral component metadata and runtime-aware examples for AI tooling |

## Portability

Civaria classifies components by what should be shared:

- **A — Visual primitives:** tokens + CSS + thin native renderer.
- **B — Interactive primitives:** Core behavior/a11y + native renderer + CSS.
- **C — Complex composites:** share state/selection/a11y where practical; renderer may own substantial logic.
- **D — Ecosystem integrations:** framework-specific by design.

Required cross-runtime Class B coverage includes Accordion, Dialog, Menu, Popover, Select, Tabs, Tooltip, Combobox, Checkbox and Switch, alongside Button and a useful visual primitive set. The machine-readable registry in `@civaria/core/registry` is the runtime-support authority used by Composer, MCP and CLI.

## React ecosystem integrations

These intentionally remain React-specific and isolated from the base barrel:

```tsx
import { Editor } from "civaria/editor";        // Tiptap React
import { DataTable } from "civaria/data-table"; // TanStack React Table
import { BarChart } from "civaria/chart";       // Recharts
```

`import { Button } from "civaria"` does not import those heavy integration entrypoints.

## Tooling

- **Composer** stores semantic Civaria nodes and can generate React, Vue, Solid, Svelte and HTML/Elements output from the same composition.
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
pnpm --filter @civaria/tokens validate
```

The repository remains a pnpm + Turborepo monorepo. `apps/docs` is the product/docs surface; reusable packages live under `packages/`. Existing Cloudflare deployment remains unchanged.

## Status

Civaria is pre-1.0 and actively developed. Multi-runtime packages are intentionally allowed to expose framework-native syntax rather than fake syntax parity. Semantic state, accessibility relationships, anatomy and visual identity are the shared contract.

## License

Civaria is distributed under the [MIT License](LICENSE).
