# Using and modifying Civaria

## Architecture rules

1. Choose a native Civaria runtime when behavior/components are needed: `civaria`, `@civaria/vue`, `@civaria/solid`, `@civaria/svelte`, or `@civaria/elements`. CSS-only use remains `@civaria/tokens` + `@civaria/css`.
2. `@civaria/core` owns portable state, event intent, ARIA derivation, collections, IDs/relationships, anatomy and component metadata. It must never import a UI framework.
3. Runtime packages render natively and never depend on another runtime package. Vue/Solid/Svelte must not route through React or Custom Elements.
4. `@civaria/headless` is deprecated React compatibility. Prefer `civaria/headless` for new unstyled React code.
5. Heavy React integrations stay on `civaria/editor`, `civaria/data-table`, and `civaria/chart`.
6. `@civaria/css` is the canonical visual contract. Prefer `.civ-*`, `data-civaria-component`, `data-part`, `data-state`, `data-disabled`, `data-selected`, `data-highlighted`, `data-size` and `data-variant` over framework-private styling truth.
7. Icon-only controls require accessible names. Follow WAI-ARIA keyboard/focus patterns and preserve 44px minimum interactive targets.
8. No import-time DOM, `Date.now()` IDs or `Math.random()` IDs in Core/public runtimes. Defer measurement/focus work to framework lifecycle.

## Component metadata

`@civaria/core/registry` is the machine-readable source of truth for portability class, semantic anatomy and runtime availability. Docs, Composer, MCP and CLI may enrich it but must not invent a competing support matrix.

## Tooling

- `npx @civaria/cli list`
- `npx @civaria/cli init --framework vue`
- `npx @civaria/cli add Button --framework solid`
- `npx @civaria/cli describe Button`
- MCP: `@civaria/mcp` exposes component metadata and runtime-aware examples.

## Verification

Run `pnpm check:boundaries`, `pnpm build`, `pnpm test`, `pnpm check:parity`, `pnpm check:ssr`, `pnpm check:fixtures`, plus token/a11y checks before merging architecture changes.
