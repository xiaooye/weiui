# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## WeiUI Project Context

WeiUI is a business-level design system with three consumption layers. See `DESIGNSYSTEM-PLAN.md` for the full spec.

### Architecture Rules

- **Dependency direction:** `@weiui/tokens` → `@weiui/css` → `@weiui/headless` → `@weiui/react` — never backwards
- **Layer 1 (`@weiui/css`):** Zero JavaScript. CSS-only. Must work without a bundler.
- **Layer 2 (`@weiui/headless`):** React hooks + compound components. Unstyled. Only non-React dep is `@floating-ui/react`.
- **Layer 3 (`@weiui/react`):** Styled components built on Layer 2. Uses `tailwind-variants` for variant system.
- **Tokens (`@weiui/tokens`):** W3C Design Tokens Community Group format. JSON source of truth.

### Naming Conventions

- CSS classes: `wui-{component}`, `wui-{component}__{element}`, `wui-{component}--{modifier}`
- CSS custom properties: `--wui-{category}-{name}` (global), `--wui-{component}-{property}` (scoped)
- States: data attributes (`[data-disabled]`, `[data-loading]`) — not CSS classes
- Files: PascalCase for components (`Button.tsx`), kebab-case for hooks (`use-dialog.ts`) and CSS (`button.css`)

### CSS Rules

- **Logical properties only** — `padding-inline-start` not `padding-left`, `inset-inline-end` not `right`
- **Cascade layers:** `@layer wui-reset, wui-tokens, wui-base, wui-elements, wui-utilities`
- **No `!important`** — the layer system eliminates the need
- **OKLCH color space** for all color values
- **Animations opt-in** — all animations inside `@media (prefers-reduced-motion: no-preference)`
- **Specificity budget:** max 0-2-0 for component styles (single class + one data attribute or pseudo-class)

### Accessibility (WCAG AAA)

- 7:1 contrast ratio for normal text, 4.5:1 for large text — validated at build time
- 44×44px minimum touch/click targets on all interactive elements
- Focus indicators: 3px solid `var(--wui-color-ring)`, 2px offset
- Keyboard patterns per WAI-ARIA Authoring Practices for each component type
- Screen reader announcements via live regions for dynamic state changes
- `aria-*` attributes auto-wired by headless hooks — consumers should not need to add them manually

### Component Patterns

- **Compound components** — composable sub-components, not prop explosion
- **`forwardRef`** on every component
- **Controlled + uncontrolled:** form components accept both `value`/`onChange` and `defaultValue` via `useControllable`
- **Complex state:** `useReducer` with typed actions — no external state libraries in headless layer
- **Server Components:** static components (Card, Badge, Avatar) must not use `"use client"`. Interactive components must be marked `"use client"`.
- **SSR safety:** no `window`/`document` in render, no `useLayoutEffect`, use `useId()` for IDs

### TypeScript

- Strict mode, zero `any`
- Export props types alongside components (`export interface ButtonProps`)
- Variant types derived from tailwind-variants: `type ButtonVariants = Parameters<typeof buttonVariants>[0]`

### Testing — Every Component Requires

1. Unit tests (Vitest) — props, variants, state
2. Accessibility tests (axe-core) — zero AAA violations
3. Keyboard tests (Playwright) — all WAI-ARIA keyboard patterns
4. Visual regression tests (Playwright) — all states × light/dark × LTR/RTL
