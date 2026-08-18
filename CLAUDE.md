# CLAUDE.md

## Engineering behavior

Use the smallest correct change, preserve unrelated code, state concrete verification criteria, and keep edits traceable to the requested task. Do not hide unresolved failures behind cleanup or compatibility shims.

## WeiUI architecture

WeiUI is a multi-runtime design system. The dependency model is:

```text
Tokens ─► CSS
A11y  ─► Core ─► React
              ├─► Vue
              ├─► Solid
              ├─► Svelte
              └─► Elements
```

### Hard rules

- `@weiui/core` is framework-neutral. No React/ReactDOM/Vue/Solid/Svelte imports.
- Official runtime packages are peers and may not depend on one another.
- Share semantics, state, accessibility and anatomy; keep rendering/lifecycle native.
- `@weiui/css` is the canonical visual contract. State is expressed with WeiUI-owned data attributes where practical.
- `@weiui/headless` is deprecated React compatibility; do not add duplicate generic behavior there.
- React Editor/DataTable/Chart stay isolated ecosystem integrations on explicit subpaths.
- Core/public runtimes must be SSR/import safe: no import-time browser globals, DOM measurement or random/time-based IDs.
- Web Components use the `wui-` prefix, explicit duplicate-safe registration, scalar attributes and properties for complex values. They are a distribution target, not the canonical implementation model.
- `@weiui/icons` root is framework-neutral; framework renderers are generated subpaths.
- `@weiui/core/registry` owns portability/anatomy/runtime support truth. Composer/MCP/CLI consume it.

### CSS/accessibility

Use logical properties and `--wui-*` tokens. Preserve focus visibility, reduced-motion handling, WAI-ARIA keyboard behavior and 44×44px interactive targets. Avoid gratuitous visual redesign during architecture work.

### Testing

Core behavior tests run once. Adapter tests verify native integration/data/ARIA/events. Cross-runtime tests verify semantic parity, not byte-identical DOM. Keep visual regression focused on the canonical product runtime plus targeted smoke tests.

### Required checks

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

See `MULTI-RUNTIME-ARCHITECTURE.md` and `MIGRATION-MULTI-RUNTIME.md`.
