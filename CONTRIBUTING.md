# Contributing to WeiUI

## Development setup

1. Fork/clone the repository.
2. `pnpm install --frozen-lockfile`
3. `pnpm check:boundaries`
4. `pnpm build`
5. `pnpm test`
6. `pnpm check:parity && pnpm check:ssr && pnpm check:fixtures`

## Architecture

```text
packages/tokens   framework-neutral design decisions
packages/css      canonical visual contract
packages/a11y     accessibility validation utilities
packages/core     framework-neutral behavior/state/ARIA/anatomy/registry
packages/react    native React renderer + heavy ecosystem subpaths
packages/vue      native Vue 3 renderer
packages/solid    native Solid renderer
packages/svelte   native Svelte 5 renderer
packages/elements optional native Custom Elements distribution
packages/headless deprecated React compatibility layer
packages/icons    neutral icon data + generated runtime adapters
packages/cli      runtime-aware CLI
packages/mcp      runtime-aware AI tooling
apps/docs         docs/product/Playground/Composer
```

### Dependency laws

- Core imports no UI framework.
- React/Vue/Solid/Svelte/Elements are peers; none depends on another runtime.
- New reusable interactive semantics go to Core first.
- Rendering/lifecycle stays native to the adapter.
- Stable WeiUI classes/data anatomy are the cross-runtime styling/testing contract.
- Do not expose underlying state-machine implementation types as public WeiUI API.

### Portability classes

A = visual primitive; B = interactive primitive; C = complex composite; D = ecosystem integration. Update `@weiui/core/registry` when component support changes. This registry is the canonical support matrix consumed by tooling.

### React heavy subpaths

Keep mature ecosystem dependencies isolated:
- `@weiui/react/editor` — Tiptap React
- `@weiui/react/data-table` — TanStack React Table
- `@weiui/react/chart` — Recharts

Never import those entrypoints from the root barrel.

## Review checklist

- [ ] Core/runtime package-boundary checks pass.
- [ ] TypeScript/source checks pass; avoid `any` escape hatches.
- [ ] Shared state/ARIA/keyboard behavior has Core tests.
- [ ] Native adapter uses its framework conventions rather than wrapping another runtime.
- [ ] Semantic `data-wui-component` / `data-part` / state attributes are compatible where practical.
- [ ] 44px touch targets, focus visibility, keyboard interaction and reduced-motion rules remain intact.
- [ ] CSS uses WeiUI variables/logical properties and avoids visual redesign unless requested.
- [ ] SSR has no import-time DOM/random-ID behavior.
- [ ] Docs, registry metadata and migration notes are updated.
- [ ] Heavy dependencies stay isolated.

## AI/tooling surface

- Core registry owns cross-runtime support/anatomy.
- Docs registry may enrich it with prose/props/examples.
- MCP consumes Core metadata and emits runtime-aware answers.
- CLI detects/scaffolds runtimes using the same metadata.
- Composer canonical representation is semantic WeiUI AST; generated React/Vue/Solid/Svelte/Elements code is derived output.

## Changesets

Core + official runtime packages are a fixed release group. Add a changeset for public behavior/API changes and run the full verification sequence before review.
