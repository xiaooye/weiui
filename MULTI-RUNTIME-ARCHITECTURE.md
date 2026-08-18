# WeiUI Multi-Runtime Architecture

## Governing principle

**One semantic design system, multiple native runtimes.** Share semantics, accessibility, state, anatomy and visual contracts; keep rendering native.

## Authority boundaries

`@weiui/tokens` and `@weiui/css` are framework-neutral. `@weiui/core` is framework-neutral TypeScript and owns portable behavior/state/ARIA/anatomy/metadata. `@weiui/react`, `@weiui/vue`, `@weiui/solid`, `@weiui/svelte` and `@weiui/elements` are peer renderers over Core + CSS.

Core may not import `react`, `react-dom`, `vue`, `solid-js` or `svelte`. A runtime package may not depend on another runtime package. `scripts/check-package-boundaries.mjs` enforces both rules in CI, including a prohibition on adapters bypassing semantic controller APIs through an internal store.

## Canonical DOM contract

Runtimes converge on WeiUI-owned hooks where practical:

```text
data-wui-component="select"
data-part="trigger"
data-state="open"
data-selected
data-highlighted
data-disabled
data-orientation
data-size
data-variant
aria-expanded="true"
```

Byte-identical DOM is not required. Semantic state and accessibility relationships are.

## Core abstraction

Core exports generic `WeiDOMProps` rather than React-shaped props. Controllers expose semantic state, explicit actions and synchronization methods, prop getters, and subscriptions. Adapters translate generic event names, styles and attributes into native framework conventions. Controlled synchronization methods such as `syncOpen`, `syncValue`, `syncChecked` and `syncInputValue` update external state without echoing user change callbacks.

Core also owns framework-neutral form serialization helpers, deterministic focus-navigation primitives and pure floating-position calculations. Native runtimes retain lifecycle/DOM ownership while sharing those policies.

Use the smallest behavior abstraction that solves the component: stateless helper → controller/store internally → richer state machine only when complexity warrants it. No FSM is required merely for architectural consistency.

## Runtime responsibilities

- **React:** context, refs, portals, React controlled conventions, JSX, existing mature focus/positioning lifecycle.
- **Vue:** Composition API, slots, `v-model`, Teleport, refs; Dialog focus entry/trap/restore is bound to Vue lifecycle.
- **Solid:** compiler-native JSX, signals/effects/context, `createUniqueId`, native refs/Portal; the package exposes a `solid` JSX condition so Solid toolchains can compile for client or SSR.
- **Svelte:** Svelte 5 runes, bindable state, snippets/actions where appropriate; every shipped `.svelte` component is compiler-checked in CI.
- **Elements:** light DOM by default, `wui-` prefix, CustomEvents, scalar attributes + complex properties, explicit duplicate-safe registration, form-associated Select/Combobox where ElementInternals is available with hidden-input fallback.

Web Components are a distribution target. Official native framework runtimes do not wrap them.

## Portability registry

`@weiui/core/registry` is the machine-readable runtime-support source of truth. It records component name, category, portability A/B/C/D, semantic parts, supported runtimes and status. Docs/Composer/MCP/CLI consume or enrich from this registry rather than each inventing a support matrix.

## Ecosystem integrations

Editor, DataTable and Charts remain React-specific because their mature ecosystems are React-native (Tiptap React, TanStack React Table, Recharts). Their dependencies remain isolated on explicit `@weiui/react/*` subpaths.

## SSR

Core performs no import-time DOM access and expects adapters to provide deterministic IDs. Elements guards `HTMLElement` and `customElements` and has no registration side effect on import. Layout measurement/focus work is deferred to native runtime lifecycle.

Vue is rendered through the official server renderer in CI. Solid's published JSX source is compiler-checked for both DOM and SSR generation and its SSR output is rendered through `solid-js/web`. Svelte compiles every shipped component for the server and renders a representative native component through `svelte/server`. These gates complement the package-wide import-safety check.

## CSS and theming

`@weiui/css` remains the canonical visual contract. Runtime adapters may add ergonomic classes, but framework-specific class generation is not the sole visual source. Light DOM is preferred for Elements so global WeiUI CSS and semantic custom properties remain easy to theme.

## Testing hierarchy

1. Core behavior/state/ARIA/collection/controlled-state/form/focus/positioning tests.
2. Native framework compiler/runtime SSR tests for Vue, Solid and Svelte plus Elements Node import safety.
3. Adapter source/public-contract tests and required cross-runtime metadata parity.
4. Package-boundary, SSR/import and public-consumption fixture gates.
5. Existing canonical visual/a11y browser tests plus targeted runtime smoke fixtures.

CI intentionally avoids multiplying every visual screenshot by every runtime while requiring each official runtime to prove a native executable path.
