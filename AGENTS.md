# Using and modifying WeiUI

## Architecture rules

1. Choose a native WeiUI runtime when behavior/components are needed: `@weiui/react`, `@weiui/vue`, `@weiui/solid`, `@weiui/svelte`, or `@weiui/elements`. CSS-only use remains `@weiui/tokens` + `@weiui/css`.
2. `@weiui/core` owns portable state, event intent, ARIA derivation, collections, IDs/relationships, anatomy and component metadata. It must never import a UI framework.
3. Runtime packages render natively and never depend on another runtime package. Vue/Solid/Svelte must not route through React or Custom Elements.
4. `@weiui/headless` is deprecated React compatibility. Prefer `@weiui/react/headless` for new unstyled React code.
5. Heavy React integrations stay on `@weiui/react/editor`, `@weiui/react/data-table`, and `@weiui/react/chart`.
6. `@weiui/css` is the canonical visual contract. Prefer `.wui-*`, `data-wui-component`, `data-part`, `data-state`, `data-disabled`, `data-selected`, `data-highlighted`, `data-size` and `data-variant` over framework-private styling truth.
7. Icon-only controls require accessible names. Follow WAI-ARIA keyboard/focus patterns and preserve 44px minimum interactive targets.
8. No import-time DOM, `Date.now()` IDs or `Math.random()` IDs in Core/public runtimes. Defer measurement/focus work to framework lifecycle.

## Component metadata

`@weiui/core/registry` is the machine-readable source of truth for portability class, semantic anatomy and runtime availability. Docs, Composer, MCP and CLI may enrich it but must not invent a competing support matrix.

## Tooling

- `npx @weiui/cli list`
- `npx @weiui/cli init --framework vue`
- `npx @weiui/cli add Button --framework solid`
- `npx @weiui/cli describe Button`
- MCP: `@weiui/mcp` exposes component metadata and runtime-aware examples.

## Verification

Run `pnpm check:boundaries`, `pnpm build`, `pnpm test`, `pnpm check:parity`, `pnpm check:ssr`, `pnpm check:fixtures`, plus token/a11y checks before merging architecture changes.
