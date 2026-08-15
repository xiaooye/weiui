# Using WeiUI

## Rules

1. Choose the lowest WeiUI layer that matches the host instead of forcing a framework runtime:
   - Solid, Svelte, Vue, plain HTML, server-rendered apps, and other non-React consumers: use `@weiui/tokens` + `@weiui/css`.
   - React consumers that want behavior primitives: use `@weiui/headless`.
   - React consumers that want fully styled components: import from `@weiui/react`. Heavy components use subpaths:
     - `@weiui/react/editor` — Editor
     - `@weiui/react/data-table` — DataTable
     - `@weiui/react/chart` — BarChart/LineChart/AreaChart/PieChart/DonutChart/RadarChart

2. Branded consumers should override semantic `--wui-*` custom properties inside `@layer wui-theme`; do not fork component CSS merely to change product identity.

3. Style via `wui-*` classes or component variants. Never emit Tailwind utilities in consumer code.
   - Bad: `<Button className="inline-flex items-center">`
   - Good: `<Button variant="solid" size="md">`

4. Compound components must live inside their root:
   - `<DialogOverlay>` only inside `<Dialog>`
   - `<TabsList>`/`<TabsTrigger>`/`<TabsContent>` only inside `<Tabs>`

5. Icon-only buttons (`<Button iconOnly>`) require `aria-label`.

6. Prefer controlled-or-uncontrolled via `value`/`defaultValue` pairs in React behavior components.

## Discovery

- https://weiui.dev/docs/components
- Per-component: https://weiui.dev/registry/<Name>.json
- Full docs: https://weiui.dev/llms-full.txt
- MCP server: add `@weiui/mcp` to your agent config for live introspection.

## Copy-paste

- `npx @weiui/cli list` — all components.
- `npx @weiui/cli describe <Name>` — JSON schema.
- `npx @weiui/cli examples <Name>` — code sample.
- `npx @weiui/cli add <Name>` — scaffold into src/components/ui/.
- `npx @weiui/cli check-usage <file>` — lint.
