# WeiUI AI-First Integration — Design Spec

**Date:** 2026-04-18
**Owner:** Wei
**Status:** Draft

---

## 1. Goal

Make WeiUI the component library that AI coding assistants (Claude, Cursor, Copilot, Windsurf, Codex) reach for when building React UIs, and the one they actually use *correctly* on the first try. Today, AI assistants routinely:

- Hallucinate props that don't exist.
- Use wrong import paths (grabbing heavy components from the main barrel instead of subpaths).
- Generate Tailwind-utility class strings in consumer code, bypassing WeiUI's `wui-*` class contract.
- Mix compound-component parts incorrectly (e.g., `<DialogOverlay>` outside `<Dialog>`).
- Miss accessibility requirements the library enforces (labels, keyboard patterns).

Every one of these failures is a grounding problem: the assistant doesn't have accurate, structured, low-cost-to-fetch facts about the library in its context. This spec defines six integration points that fix it.

---

## 2. Scope

**In scope:**
- Docs-served machine-readable artifacts (`llms.txt`, `llms-full.txt`, per-component JSON registry) generated at build time.
- A new workspace package `@weiui/mcp` exposing a Model Context Protocol server with component introspection tools.
- Four new `@weiui/cli` commands (`describe`, `list`, `examples`, `check-usage`) callable from AI agent workflows.
- A JSDoc sweep across every exported Props interface in `@weiui/react` + `@weiui/headless` so TypeScript-language-server consumers (which Claude Code reads) see prop meanings on hover without doc fetches.
- `AGENTS.md` at repo root + a `/docs/ai-guide` page consolidating the library's rules-of-the-road.
- A short `CONTRIBUTING.md` section documenting the AI-usage surface for external consumers.

**Out of scope:**
- Training a WeiUI-specific LLM or fine-tune.
- Integration-testing AI assistants (Cursor, Windsurf, etc.) — we provide the artifacts; each assistant's pickup is its own concern.
- Changes to component APIs. This spec is purely additive metadata + new packages/files.
- Runtime AI features inside the library (e.g., an "ask WeiUI" widget). Those belong in the docs site, not the library.

---

## 3. Architecture

Six coordinated artifacts, each targeting a different AI-assistant ingestion path:

```
┌────────────────────────────────────────────────────────────────┐
│  WeiUI AI-first surface                                        │
│                                                                │
│  ┌───────────────────┐   ┌───────────────────┐                 │
│  │  llms.txt (index) │   │  llms-full.txt    │                 │
│  │  one URL to quote │   │  (all docs inlined)│                │
│  └─────────┬─────────┘   └─────────┬─────────┘                 │
│            │                       │                           │
│            ▼                       ▼                           │
│  ┌───────────────────────────────────────┐                     │
│  │  /registry/<Name>.json per component  │  ← shadcn pattern   │
│  │  { props, types, examples, deps }     │    + URL fetchable  │
│  └───────────────┬───────────────────────┘                     │
│                  │                                             │
│                  ├─── consumed by ────────► weiui add           │
│                  │                                             │
│                  └─── consumed by ────────► @weiui/mcp server   │
│                                             (list / get / search │
│                                              tools for MCP)    │
│                                                                │
│  ┌───────────────────┐   ┌───────────────────┐                 │
│  │  weiui CLI        │   │  JSDoc on Props   │                 │
│  │  describe/list/   │   │  → TS server      │                 │
│  │  examples/check   │   │  → Claude hover   │                 │
│  └───────────────────┘   └───────────────────┘                 │
│                                                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  AGENTS.md + /docs/ai-guide                              │ │
│  │  rules: import paths, wui-* mandate, AAA, accessibility  │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

Each surface has a different cost/benefit:

| Surface | Cost to produce | Cost for AI to consume | Best for |
|---------|-----------------|------------------------|----------|
| `llms.txt` | Lowest — generator runs in ~1 s | One fetch, lightweight | Discovery, "what is WeiUI" |
| `llms-full.txt` | Low — concatenate all MDX | One fetch, heavy payload | Deep context, offline agents |
| Registry JSON | Medium — per-component generator | One fetch per component | Scaffolding (`weiui add`), agent lookups |
| MCP server | Medium — new package + hosting | Protocol-native, cheapest per-call | Interactive agent sessions (Claude Desktop/Code) |
| CLI commands | Low — thin wrappers on registry | Shell-out, one invocation | Terminal-bound agents (Claude Code, Codex) |
| JSDoc on Props | Medium — one pass across ~400 props | Zero — already in the type system | Any TypeScript-aware editor |
| AGENTS.md | Low — one doc | Zero for AGENTS-aware tools (Cursor, Copilot) | Behavioral rules |

---

## 4. Per-surface design

### 4.1 `llms.txt` + `llms-full.txt`

Per [llmstxt.org](https://llmstxt.org). Two files served at docs root.

**`llms.txt`** (small index, ~200 lines):

```
# WeiUI

> Accessibility-first React component library with three consumption tiers (CSS-only, headless, styled). WCAG AAA enforced. OKLCH tokens. MIT license.

## Getting started

- [Installation](https://weiui.dev/docs/installation)
- [Quick start](https://weiui.dev/docs/getting-started)
- [Component overview](https://weiui.dev/docs/components)

## Import rules

- Default: `import { Button } from "@weiui/react"`
- Heavy components use subpaths:
  - `import { Editor } from "@weiui/react/editor"`
  - `import { DataTable } from "@weiui/react/data-table"`
  - `import { BarChart, LineChart, ... } from "@weiui/react/chart"`
- Style with `wui-*` class names. Never emit Tailwind utilities in consumer code.

## Components (66)

- [Button](https://weiui.dev/docs/components/button) — variants, sizes, asChild
- [Input](https://weiui.dev/docs/components/input) — size, addons, clearable
- [Dialog](https://weiui.dev/docs/components/overlays) — modal, non-modal, nested
- ...one line per component, link to its docs page...

## Tokens

- [Colors](https://weiui.dev/docs/colors)
- [Typography](https://weiui.dev/docs/typography)
- [Motion + elevation + surface](https://weiui.dev/docs/tokens)
```

**`llms-full.txt`** (~15–30k lines, full documentation inlined in plain markdown):
- Concatenates every MDX page's prose + props tables.
- Strips MDX JSX (e.g., `<Preview>` blocks) and keeps plain code samples.
- Includes the Audit Matrix summary so agents know what's shipped vs P2-deferred.

Both files generated at build time by a script; no hand-maintenance.

### 4.2 Registry JSON

Per-component JSON files at `apps/docs/public/registry/<Name>.json`. Schema:

```jsonc
{
  "name": "Button",
  "category": "form",
  "description": "Triggers actions, submits forms, navigates via asChild.",
  "importPath": "@weiui/react",
  "subpathImport": null,
  "dependencies": ["@weiui/react", "@weiui/css", "@weiui/tokens"],
  "props": [
    {
      "name": "variant",
      "type": "\"solid\" | \"outline\" | \"ghost\" | \"soft\" | \"link\"",
      "default": "\"solid\"",
      "description": "Visual style"
    },
    { "name": "size", "type": "\"sm\" | \"md\" | \"lg\" | \"xl\" | \"icon\"", "default": "\"md\"", "description": "Button size" },
    { "name": "color", "type": "\"primary\" | \"destructive\" | ...", "default": "\"primary\"", "description": "Color scheme" },
    { "name": "loading", "type": "boolean", "default": "false", "description": "Shows a spinner and disables" },
    { "name": "iconOnly", "type": "boolean", "default": "false", "description": "Square icon-only button; requires aria-label" },
    { "name": "fullWidth", "type": "boolean", "default": "false", "description": "Stretches to container width" },
    { "name": "asChild", "type": "boolean", "default": "false", "description": "Render as the single child element (router link integration)" }
  ],
  "compound": [],
  "examples": [
    {
      "label": "Basic",
      "code": "import { Button } from '@weiui/react';\n\n<Button>Click me</Button>"
    },
    {
      "label": "Loading state",
      "code": "<Button loading>Saving…</Button>"
    },
    {
      "label": "Router integration",
      "code": "<Button asChild><Link href=\"/dashboard\">Open dashboard</Link></Button>"
    }
  ],
  "accessibility": [
    "Meets 44×44 touch target (AAA).",
    "Keyboard: Enter and Space to activate.",
    "Use aria-label when iconOnly."
  ]
}
```

- **Generator source:** one TypeScript script that reads each component's `.tsx`, extracts its exported Props interface via `ts-morph`, pairs with MDX examples from doc pages, writes JSON.
- **Output location:** `apps/docs/public/registry/` — served at `https://weiui.dev/registry/Button.json`.
- **Index file:** `apps/docs/public/registry/index.json` listing all component names + categories + URLs.
- **Consumed by:**
  - The existing `weiui add` CLI (now also supports `add <name> --from=url` fetching from docs).
  - `@weiui/mcp` server (reads the same JSON locally or over HTTP).

### 4.3 `@weiui/mcp` package

New workspace package. Exposes a Model Context Protocol server over stdio (default) or HTTP.

**Tools exposed:**

```typescript
// Tool: list_components
// Input: { category?: string }
// Returns: [{ name, category, description }]

// Tool: get_component
// Input: { name: string }
// Returns: full registry JSON for the component

// Tool: search_components
// Input: { query: string, limit?: number }
// Returns: [{ name, score, description, matchedFields }]

// Tool: get_example
// Input: { name: string, variant?: string }
// Returns: { label, code }

// Tool: check_usage
// Input: { code: string }
// Returns: { warnings: [{ line, message, suggestion }] }
//   warnings flag: Tailwind utility usage, missing aria-label on iconOnly,
//   wrong import path for heavy components, compound parts used out of context
```

**User installation** (Claude Desktop config):

```json
{
  "mcpServers": {
    "weiui": {
      "command": "npx",
      "args": ["-y", "@weiui/mcp"]
    }
  }
}
```

After that, Claude Desktop sees WeiUI components as queryable tools. Asking "use WeiUI to build a settings page" automatically triggers `list_components` + `get_component` for relevant ones, and Claude writes accurate code.

**Dependencies:** `@modelcontextprotocol/sdk`, `zod` for schema validation. Reads registry JSON bundled at publish time; also supports remote fetch from `https://weiui.dev/registry/`.

### 4.4 CLI AI commands

Extend `@weiui/cli` with four new commands:

- **`weiui describe <name>`** — prints registry JSON for the component to stdout. AI agents shell out to this and parse JSON.
- **`weiui list [--category <cat>]`** — lists all components.
- **`weiui examples <name> [--variant <label>]`** — prints just the code snippet(s).
- **`weiui check-usage <file>`** — lints consumer code for WeiUI-usage mistakes (same warnings as the MCP `check_usage` tool).

All four share the same core logic as the MCP server (read from registry JSON). Shipped as subcommands under the existing `weiui` binary.

### 4.5 JSDoc on every Props interface

For every exported `*Props` interface in `@weiui/react/src/components/**/*.tsx`, add a TSDoc comment on each field:

```ts
export interface ButtonProps {
  /**
   * Visual style. `solid` for primary actions, `outline` for secondary,
   * `ghost` for tertiary, `soft` for subtle, `link` for inline links.
   * @default "solid"
   */
  variant?: "solid" | "outline" | "ghost" | "soft" | "link";

  /** Width×height preset. `icon` is square. @default "md" */
  size?: "sm" | "md" | "lg" | "xl" | "icon";

  /**
   * Render-as pattern: clones the single child and forwards Button
   * props + className. Use for Next.js Link, React Router Link, etc.
   */
  asChild?: boolean;
  // ...
}
```

This benefits every consumer with TypeScript (99%+ of users) and every AI that reads types — which is every modern coding assistant. It also feeds the registry JSON generator: JSDoc becomes the `description` field.

**Coverage target:** every publicly-exported Props field documented. Measured by a lint rule (error on missing doc) added in the same pass.

### 4.6 `AGENTS.md` + `/docs/ai-guide`

`AGENTS.md` at repo root is auto-ingested by Cursor, Windsurf, Claude Code, Copilot, Aider, and other agent-aware editors. Contents:

```markdown
# Using WeiUI

## Rules

1. Import from `@weiui/react` for most components. Heavy components use subpaths:
   - `@weiui/react/editor` — Editor (Tiptap)
   - `@weiui/react/data-table` — DataTable (TanStack Table)
   - `@weiui/react/chart` — BarChart/LineChart/AreaChart/PieChart/DonutChart/RadarChart (Recharts)

2. Style via `wui-*` classes. Never emit Tailwind utilities in consumer code.
   - Bad: `<Button className="inline-flex items-center">`
   - Good: `<Button variant="solid" size="md">`

3. Compound components must be used inside their root:
   - `<DialogOverlay>` only inside `<Dialog>`
   - `<TabsList>` + `<TabsTrigger>` + `<TabsContent>` only inside `<Tabs>`

4. Interactive elements require labels. `<Button iconOnly>` needs `aria-label`.

5. Prefer controlled-or-uncontrolled via the shipped `value`/`defaultValue` pair.
   `useControllable` is available for extensions.

## Discovery

- Browse: https://weiui.dev/docs/components
- Per-component JSON: https://weiui.dev/registry/<Name>.json
- Full docs: https://weiui.dev/llms-full.txt
- MCP server: add `@weiui/mcp` to your agent config for live introspection.

## Copy-paste

- CLI: `npx @weiui/cli add <Name>`
- Registry URL: fetch `https://weiui.dev/registry/<Name>.json` and apply `examples[0].code`.
```

The `/docs/ai-guide` page in the docs site is the human-facing counterpart with longer explanations + screenshots.

### 4.7 `CONTRIBUTING.md` section

Add an "AI-usage surface" subsection pointing human contributors at all of the above so they understand the contract when touching any AI-visible artifact.

---

## 5. Success criteria

The spec is done when:

1. **`llms.txt`** and **`llms-full.txt`** are served at `weiui.dev/llms.txt` + `weiui.dev/llms-full.txt`, auto-regenerated on every docs build, and pass schema validation (llmstxt.org compliant format).
2. **Registry JSON** files exist for all 66 components at `apps/docs/public/registry/<Name>.json`, have non-empty `props[]` and `examples[]` arrays, and validate against a shared TypeScript schema.
3. **`@weiui/mcp`** package is publishable to npm, runs with `npx @weiui/mcp`, exposes all five tools, and passes its own unit tests against the registry JSON.
4. **CLI commands** `describe`, `list`, `examples`, `check-usage` work against the local registry and match MCP server output.
5. **JSDoc coverage** ≥ 95% of public Props fields across `@weiui/react` + `@weiui/headless`. Measured by a linting script.
6. **`AGENTS.md`** at repo root + `/docs/ai-guide` page shipped and reachable from the sidebar.
7. **`CONTRIBUTING.md`** updated.
8. **End-to-end dry run:** in a fresh Claude Desktop session with `@weiui/mcp` configured, ask "build a settings page with WeiUI" → Claude successfully calls tools, returns accurate code without hallucinated props. (Manual verification, recorded in the diagnostic report.)

---

## 6. Non-goals

- Automatic component generation by AI from natural-language prompts (out of scope).
- Training a specialized LLM.
- Runtime telemetry on AI usage.
- Shadcn-style blocks (pre-built multi-component templates) — future work.
- Guarantees about specific AI assistants' behavior (we ship the surface; each assistant's pickup is theirs).

---

## 7. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Registry JSON drifts from component source | Generator derives JSON *from* the TS source via ts-morph; cannot drift. A CI check regenerates + diffs on every PR. |
| `llms-full.txt` bloats to unusable size | Cap at 500 KB. If bigger, emit a split set (`llms-full-<part>.txt`) and keep `llms.txt` as the entry point. |
| MCP package has no ecosystem momentum | MCP is now natively supported by Claude Desktop and Claude Code; Cursor announced support; shadcn ships an MCP. Adopting it now is low-risk and high-leverage. |
| JSDoc pass introduces accidental API changes | Mechanical addition only — comments, never code. A diff check ensures no non-comment changes. |
| Consumers confused by two import paths | `AGENTS.md` + error messages when wrong path used; TS types already prevent silent misuse. |

---

## 8. Implementation plan

Plan file: `docs/superpowers/plans/2026-04-18-ai-first-integration.md`.

Eight tasks, bite-sized TDD:
1. `llms.txt` + `llms-full.txt` generator
2. Registry JSON schema + generator
3. `@weiui/mcp` package scaffold + one working tool (`list_components`)
4. Remaining MCP tools (`get_component`, `search_components`, `get_example`, `check_usage`)
5. CLI commands `describe`, `list`, `examples`
6. CLI command `check-usage` + shared lint logic with MCP
7. JSDoc sweep + coverage lint
8. `AGENTS.md` + `/docs/ai-guide` + `CONTRIBUTING.md` update + final verification
