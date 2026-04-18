# Using WeiUI

## Rules

1. Import from `@weiui/react`. Heavy components use subpaths:
   - `@weiui/react/editor` — Editor
   - `@weiui/react/data-table` — DataTable
   - `@weiui/react/chart` — BarChart/LineChart/AreaChart/PieChart/DonutChart/RadarChart

2. Style via `wui-*` classes or component variants. Never emit Tailwind utilities in consumer code.
   - Bad: `<Button className="inline-flex items-center">`
   - Good: `<Button variant="solid" size="md">`

3. Compound components must live inside their root:
   - `<DialogOverlay>` only inside `<Dialog>`
   - `<TabsList>`/`<TabsTrigger>`/`<TabsContent>` only inside `<Tabs>`

4. Icon-only buttons (`<Button iconOnly>`) require `aria-label`.

5. Prefer controlled-or-uncontrolled via `value`/`defaultValue` pairs.

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
