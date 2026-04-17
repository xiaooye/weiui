# Contributing to WeiUI

Thank you for your interest in contributing to WeiUI.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Build all packages: `pnpm build`
4. Run tests: `pnpm test`

## Project Structure

```
weiui/
├── packages/
│   ├── tokens/     # Design tokens
│   ├── css/        # CSS-only components
│   ├── headless/   # Headless React hooks
│   ├── react/      # Styled React components
│   ├── icons/      # Icon set
│   ├── cli/        # CLI tool
│   └── a11y/       # Accessibility utilities
├── apps/
│   └── docs/       # Documentation site (Next.js)
└── DESIGNSYSTEM-PLAN.md  # Full design specification
```

### Subpath imports in `@weiui/react`

Heavy third-party deps are kept out of the main barrel and live on
dedicated subpath entries, so consumers who never touch those components
pay nothing for them:

- `@weiui/react/editor` — Tiptap-backed rich-text editor
- `@weiui/react/data-table` — TanStack-table-backed DataTable
- `@weiui/react/chart` — Recharts-backed BarChart/LineChart/AreaChart/PieChart/DonutChart/RadarChart

If you add a component with a heavy peer dep, route it through its own
entry file (see `packages/react/src/editor-entry.ts` for the pattern).

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Add a changeset: `pnpm changeset`
4. Ensure all tests pass: `pnpm test`
5. Ensure token contrast validation passes: `pnpm --filter @weiui/tokens validate`
6. Submit a PR

## Code Review Checklist

- [ ] TypeScript strict — zero `any`
- [ ] All tests passing
- [ ] Accessibility tests passing (AAA for content, AA for accents)
- [ ] CSS uses logical properties (no physical left/right)
- [ ] CSS uses `--wui-` custom properties (no hardcoded values)
- [ ] Components use `forwardRef`
- [ ] States use data attributes (`[data-disabled]`, not classes)
- [ ] Animations behind `prefers-reduced-motion: no-preference`
- [ ] 44px minimum touch targets on interactive elements
- [ ] Documentation updated

## Component Proposal

New components must meet these criteria:
1. Has a clear WAI-ARIA pattern
2. Not composable from existing components
3. Passes accessibility audit
4. Includes unit tests, a11y tests, keyboard tests

## Naming Conventions

- CSS classes: `wui-{component}`, `wui-{component}__{element}`, `wui-{component}--{modifier}`
- CSS properties: `--wui-{category}-{name}`
- Files: PascalCase for components, kebab-case for hooks and CSS
