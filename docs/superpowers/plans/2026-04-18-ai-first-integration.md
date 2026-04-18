# WeiUI AI-First Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship six AI-first integration surfaces — `llms.txt` + `llms-full.txt`, per-component registry JSON, a `@weiui/mcp` MCP server package, four new CLI commands, a JSDoc sweep across ~400 Props fields, and `AGENTS.md` + a docs `ai-guide` page — so Claude/Cursor/Codex/Windsurf/Copilot can consume WeiUI accurately on the first try.

**Architecture:** Docs build generates `llms.txt` / `llms-full.txt` / `registry/<Name>.json` using existing MDX + `ts-morph` AST parsing. A new `@weiui/mcp` workspace package reads the same registry at runtime and exposes five MCP tools. Existing `@weiui/cli` gains four subcommands sharing the MCP server's core logic. JSDoc is added uniformly to every `*Props` interface in `@weiui/react` + `@weiui/headless`. `AGENTS.md` at repo root + `/docs/ai-guide` consolidate behavioral rules for AI agents.

**Tech Stack:** Node 20+, TypeScript, `ts-morph` (AST), `@modelcontextprotocol/sdk` (MCP), `zod` (schema), Vitest (tests). Generators plug into docs build like the existing `scripts/build-search-index.ts`.

**Spec:** `docs/superpowers/specs/2026-04-18-ai-first-integration-design.md`.

---

## File structure

**New files:**
- `apps/docs/scripts/build-llms-txt.ts`
- `apps/docs/scripts/build-registry.ts`
- `apps/docs/scripts/registry-schema.ts` — shared types
- `apps/docs/scripts/__tests__/*.test.ts`
- `apps/docs/public/{llms.txt,llms-full.txt,registry/*.json}` (generated)
- `apps/docs/src/app/docs/ai-guide/page.mdx`
- `packages/mcp/` — new workspace package (package.json, tsconfig.json, src/, __tests__/, README.md)
- `packages/cli/src/commands/{describe,list,examples,check-usage}.ts`
- `packages/cli/src/__tests__/ai-commands.test.ts`
- `AGENTS.md` at repo root
- `scripts/check-jsdoc-coverage.ts` at repo root

**Modified files:**
- `apps/docs/package.json` — build pipeline + ts-morph dep
- `apps/docs/src/lib/site-config.ts` — add `/docs/ai-guide` to sidebar
- `packages/cli/src/index.ts` — register 4 new commands
- `packages/cli/package.json` — add `@weiui/mcp` workspace dep
- `CONTRIBUTING.md` — AI-usage surface section
- Every `packages/react/src/components/**/*.tsx` + `packages/headless/src/**/*.ts` Props interface — JSDoc

---

## Task 1: `llms.txt` + `llms-full.txt` generator

**Files:**
- Create: `apps/docs/scripts/build-llms-txt.ts`
- Create: `apps/docs/scripts/__tests__/build-llms-txt.test.ts`
- Modify: `apps/docs/package.json` (build script + ts-morph devDep)

### Step 1: Install ts-morph in docs

- [ ] Run: `pnpm --filter @weiui/docs add -D ts-morph`
- [ ] Commit changes to `apps/docs/package.json` and `pnpm-lock.yaml` at end of this task.

### Step 2: Write failing test

Create `apps/docs/scripts/__tests__/build-llms-txt.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildLlmsTxt } from "../build-llms-txt";

describe("buildLlmsTxt", () => {
  it("emits llms.txt with required sections", () => {
    const dir = mkdtempSync(join(tmpdir(), "wui-llms-"));
    buildLlmsTxt({ outDir: dir, siteUrl: "https://weiui.dev" });
    const small = readFileSync(join(dir, "llms.txt"), "utf-8");
    expect(small).toMatch(/^# WeiUI/);
    expect(small).toContain("## Import rules");
    expect(small).toContain("## Components");
    expect(small).toContain("@weiui/react/editor");
    rmSync(dir, { recursive: true, force: true });
  });

  it("emits llms-full.txt with inlined component docs", () => {
    const dir = mkdtempSync(join(tmpdir(), "wui-llms-"));
    buildLlmsTxt({ outDir: dir, siteUrl: "https://weiui.dev" });
    const full = readFileSync(join(dir, "llms-full.txt"), "utf-8");
    expect(full.length).toBeGreaterThan(10_000);
    expect(full).toContain("Button");
    expect(full).toContain("Dialog");
    rmSync(dir, { recursive: true, force: true });
  });
});
```

- [ ] Run: `pnpm --filter @weiui/docs test -- build-llms-txt`
- [ ] Expected: FAIL (module missing).

### Step 3: Implement the generator

Create `apps/docs/scripts/build-llms-txt.ts` with:
- `buildLlmsTxt({ outDir, siteUrl })` exported function
- Reads every `page.mdx` under `src/app/docs/components/**`
- Extracts `# Title` and first paragraph for each
- Writes `llms.txt` with header, "Getting started", "Import rules" (listing heavy-component subpaths: editor, data-table, chart), "Components" list (one link per component), "Foundations"
- Writes `llms-full.txt` concatenating all MDX bodies with MDX JSX stripped (Preview/ComponentPreview tags removed, JSX components removed) — plain markdown only

Implementation follows `apps/docs/scripts/build-search-index.ts` pattern: `walk()` helper over `src/app/docs`, `readFileSync` per MDX, regex extraction.

- [ ] Run: `pnpm --filter @weiui/docs test -- build-llms-txt` — PASS
- [ ] Run: `pnpm --filter @weiui/docs build` — succeeds; `apps/docs/public/llms.txt` and `llms-full.txt` emitted.
- [ ] Inspect: head of `llms.txt`, line count of `llms-full.txt` (expect ≥ 300).

### Step 4: Wire into build pipeline

Edit `apps/docs/package.json` "build" script — prepend `tsx scripts/build-llms-txt.ts &&` to the existing build chain.

### Step 5: Gitignore generated files

Append to `.gitignore`:
```
apps/docs/public/llms.txt
apps/docs/public/llms-full.txt
```

### Step 6: Commit

- [ ] `git add apps/docs/scripts/build-llms-txt.ts apps/docs/scripts/__tests__/build-llms-txt.test.ts apps/docs/package.json pnpm-lock.yaml .gitignore`
- [ ] `git commit -m "feat(docs): add llms.txt + llms-full.txt generator (AI discovery)"`

---

## Task 2: Registry JSON schema + generator

**Files:**
- Create: `apps/docs/scripts/registry-schema.ts`
- Create: `apps/docs/scripts/build-registry.ts`
- Create: `apps/docs/scripts/__tests__/build-registry.test.ts`
- Modify: `apps/docs/package.json` (build script)

### Step 1: Schema types

Create `apps/docs/scripts/registry-schema.ts` exporting:
- `RegistryPropSchema` — name, type, default?, required?, description
- `RegistryExampleSchema` — label, code
- `RegistryComponentSchema` — name, category, description, importPath, subpathImport, dependencies, props, compound, examples, accessibility
- `RegistryIndex` — components[], generatedAt, version

### Step 2: Failing test

Create `apps/docs/scripts/__tests__/build-registry.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildRegistry } from "../build-registry";
import type { RegistryComponentSchema } from "../registry-schema";

describe("buildRegistry", () => {
  it("emits a JSON file per component with filled props + examples", () => {
    const dir = mkdtempSync(join(tmpdir(), "wui-reg-"));
    buildRegistry({ outDir: dir });
    const buttonPath = join(dir, "Button.json");
    expect(existsSync(buttonPath)).toBe(true);
    const button = JSON.parse(readFileSync(buttonPath, "utf-8")) as RegistryComponentSchema;
    expect(button.name).toBe("Button");
    expect(button.importPath).toBe("@weiui/react");
    expect(button.props.length).toBeGreaterThan(3);
    rmSync(dir, { recursive: true, force: true });
  });

  it("emits index.json listing all components", () => {
    const dir = mkdtempSync(join(tmpdir(), "wui-reg-"));
    buildRegistry({ outDir: dir });
    const index = JSON.parse(readFileSync(join(dir, "index.json"), "utf-8")) as {
      components: Array<{ name: string }>;
    };
    expect(index.components.length).toBeGreaterThanOrEqual(60);
    rmSync(dir, { recursive: true, force: true });
  });

  it("marks heavy components with subpathImport", () => {
    const dir = mkdtempSync(join(tmpdir(), "wui-reg-"));
    buildRegistry({ outDir: dir });
    const editor = JSON.parse(readFileSync(join(dir, "Editor.json"), "utf-8")) as RegistryComponentSchema;
    expect(editor.subpathImport).toBe("@weiui/react/editor");
    rmSync(dir, { recursive: true, force: true });
  });
});
```

- [ ] Run test — confirm FAIL.

### Step 3: Implement generator

Create `apps/docs/scripts/build-registry.ts`:

- `buildRegistry({ outDir })` — exported, returns `RegistryIndex`.
- Lists all component dirs under `packages/react/src/components/`.
- For each component name:
  - Opens `<Name>/<Name>.tsx` via `ts-morph`, finds the exported `<Name>Props` interface, extracts each property's name, type text, JSDoc description, `@default` tag, `?` optionality.
  - Finds the component's MDX doc page (either dedicated `/docs/components/<slug>/page.mdx` or grouped page containing `## <Name>` heading).
  - Scans code blocks in the MDX for ones referencing the component; first 4 become examples.
  - Extracts bullets from `## Accessibility` section.
  - Builds a `RegistryComponentSchema` object, writes `<Name>.json`.
- Hard-coded table for heavy components → subpathImport values: Editor→`@weiui/react/editor`, DataTable→`@weiui/react/data-table`, BarChart/LineChart/AreaChart/PieChart/DonutChart/RadarChart→`@weiui/react/chart`.
- Hard-coded category map (form, overlay, data, navigation, feedback, display, layout, typography, utility, interactive, advanced-input, date).
- Writes `index.json` summarizing all components.

- [ ] Run test — PASS.
- [ ] Run `pnpm --filter @weiui/docs build` — emits `apps/docs/public/registry/*.json` (60+ files).

### Step 4: Wire into build

Edit `apps/docs/package.json` "build" script — append `tsx scripts/build-registry.ts &&` before `next build`.

### Step 5: Gitignore + commit

- [ ] Append `apps/docs/public/registry/` to `.gitignore`.
- [ ] `git add apps/docs/scripts/ apps/docs/package.json .gitignore`
- [ ] `git commit -m "feat(docs): add component registry JSON generator (AI scaffolding surface)"`

---

## Task 3: `@weiui/mcp` package + `list_components` tool

**Files:**
- Create: `packages/mcp/package.json`, `tsconfig.json`, `tsup.config.ts`
- Create: `packages/mcp/src/index.ts` (bin entry)
- Create: `packages/mcp/src/server.ts`
- Create: `packages/mcp/src/registry-loader.ts`
- Create: `packages/mcp/src/tools/list-components.ts`
- Create: `packages/mcp/src/__tests__/list-components.test.ts`
- Create: `packages/mcp/README.md`

### Step 1: Package scaffold

Create `packages/mcp/package.json` with:
- name `@weiui/mcp`, version `0.0.1`, MIT license, author, repository, homepage, keywords
- `"type": "module"`, `"bin": { "weiui-mcp": "./dist/index.js" }`
- Subpath exports for each tool + registry-loader + lint (list below in Task 5 Step 3)
- `"files": ["dist", "registry", "README.md"]`
- Scripts: `"build": "tsup src/index.ts src/tools/*.ts src/registry-loader.ts src/lint.ts --format esm --dts --target node20"`, `"test": "vitest run"`
- Dependencies: `@modelcontextprotocol/sdk ^1.0.0`, `zod ^3.23.0`
- devDependencies: `tsup ^8.3`, `typescript ^5.8`, `vitest ^3.1`

Create `packages/mcp/tsconfig.json` extending `../../tsconfig.base.json` with `outDir: "./dist"`, `module: "ESNext"`, `moduleResolution: "bundler"`, `target: "es2022"`.

- [ ] Run `pnpm install` — workspace picks up new package.

### Step 2: Registry loader

Create `packages/mcp/src/registry-loader.ts`:
- Re-exports the same types from `RegistryPropSchema`/`RegistryExampleSchema`/`RegistryComponentSchema`/`RegistryIndex` (self-contained copy so package is publishable).
- `defaultLoadIndex(registryDir?)` returns `() => Promise<RegistryIndex>` that reads local `registry/index.json` if present, else fetches `https://weiui.dev/registry/index.json`.
- `defaultLoadComponent(registryDir?)` returns `(name: string) => Promise<RegistryComponentSchema>` that reads local or falls back to remote.

### Step 3: Failing test for list_components

Create `packages/mcp/src/__tests__/list-components.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { listComponents } from "../tools/list-components";
import type { RegistryIndex } from "../registry-loader";

const mockIndex: RegistryIndex = {
  components: [
    { name: "Button", category: "form", description: "Buttons", url: "url" },
    { name: "Dialog", category: "overlay", description: "Dialogs", url: "url" },
    { name: "Input", category: "form", description: "Inputs", url: "url" },
  ],
  generatedAt: "2026-04-18",
  version: "0.0.1",
};

describe("listComponents tool", () => {
  it("returns all components when no category filter", async () => {
    const result = await listComponents({ loadIndex: async () => mockIndex }, {});
    expect(result.components).toHaveLength(3);
  });

  it("filters by category", async () => {
    const result = await listComponents({ loadIndex: async () => mockIndex }, { category: "form" });
    expect(result.components).toHaveLength(2);
    expect(result.components.every((c) => c.category === "form")).toBe(true);
  });
});
```

- [ ] Run: `pnpm --filter @weiui/mcp test` — FAIL.

### Step 4: Implement list_components

Create `packages/mcp/src/tools/list-components.ts`:
- Exports `ListComponentsDeps`, `ListComponentsInput`, `ListComponentsOutput` types
- Exports async `listComponents(deps, input)` — loads index, filters by category if set, returns `{ components }`

- [ ] Run test — PASS.

### Step 5: MCP server

Create `packages/mcp/src/server.ts`:
- Imports `Server`, `StdioServerTransport` from `@modelcontextprotocol/sdk/server/...`
- Imports `CallToolRequestSchema`, `ListToolsRequestSchema` from `@modelcontextprotocol/sdk/types.js`
- Imports `zod` for input validation
- `createServer()` factory returns a configured Server with the `list_components` tool registered via `ListToolsRequestSchema` handler + `CallToolRequestSchema` handler that dispatches on tool name
- `run()` async connects to stdio transport and logs a ready message to stderr

Create `packages/mcp/src/index.ts` as the bin entry:
- `#!/usr/bin/env node` shebang
- `await run().catch(...)` — process.exit(1) on error

Create `packages/mcp/README.md` with quick-start JSON for Claude Desktop config + tool list.

### Step 6: Build + commit

- [ ] Run: `pnpm --filter @weiui/mcp build` — succeeds.
- [ ] `git add packages/mcp/ pnpm-lock.yaml`
- [ ] `git commit -m "feat(mcp): scaffold @weiui/mcp package + list_components tool"`

---

## Task 4: Remaining MCP tools

**Files:**
- Create: `packages/mcp/src/tools/get-component.ts`
- Create: `packages/mcp/src/tools/search-components.ts`
- Create: `packages/mcp/src/tools/get-example.ts`
- Create: `packages/mcp/src/tools/check-usage.ts`
- Create: `packages/mcp/src/lint.ts`
- Create: `packages/mcp/src/__tests__/get-component.test.ts`
- Create: `packages/mcp/src/__tests__/search-components.test.ts`
- Create: `packages/mcp/src/__tests__/get-example.test.ts`
- Create: `packages/mcp/src/__tests__/check-usage.test.ts`
- Modify: `packages/mcp/src/server.ts` (register 4 more tools)

### Step 1: Failing tests

Author 4 test files with these assertions:

- **get-component:** returns full schema for a known component; throws/rejects for unknown.
- **search-components:** matches by name (weight 5–10), by description keyword (weight 2), by category (weight 3); sorted by score; limited by `limit`; empty for no match.
- **get-example:** returns first example when no variant; returns specific example when variant matches label; returns `{ example: null }` when none match.
- **check-usage:** flags Tailwind utility patterns on WeiUI component usage; flags wrong import (e.g., `import { Editor } from "@weiui/react"`); flags `<Button iconOnly>` without aria-label; clean output for correct code.

- [ ] Run: `pnpm --filter @weiui/mcp test` — 4 new fails.

### Step 2: Implement `lint.ts`

Create `packages/mcp/src/lint.ts`:
- Exports `LintWarning { line, message, suggestion? }` type
- Exports `lintCode(code: string): LintWarning[]`
- Scans line by line for:
  - Tailwind-ish utility regex (`inline-flex`, `items-center`, `h-9`/`h-11`/`h-12`, `px-\d+`, `py-\d+`, `gap-\d+`, `bg-[var(`, `rounded-[`) combined with `className=` on same line → warn
  - `import { HeavyName }` from `@weiui/react` where HeavyName ∈ {Editor, DataTable, BarChart, LineChart, AreaChart, PieChart, DonutChart, RadarChart} → warn with the correct subpath
  - `<Button iconOnly>` without `aria-label=` on same tag → warn

### Step 3: Implement 4 tool files

- `get-component.ts` — thin wrapper over `loadComponent(name)`.
- `search-components.ts` — score-based search over the index's components; name exact = 10, substring = 5, description substring = 2, category exact = 3; sort desc, slice to limit.
- `get-example.ts` — load component, pick first or variant-labeled example.
- `check-usage.ts` — wraps `lintCode()`.

- [ ] Run tests — PASS.

### Step 4: Wire into server

Edit `packages/mcp/src/server.ts`:
- Import the 4 new tool functions + `loadComponent` from loader.
- Expand the `tools` list with 4 new entries (with name/description/inputSchema JSON-schema).
- Expand the `CallToolRequestSchema` handler with 4 new branches using `zod` validation.

- [ ] Rebuild: `pnpm --filter @weiui/mcp build`.
- [ ] Run: `pnpm --filter @weiui/mcp test` — all pass.

### Step 5: Prepack copies registry

Add to `packages/mcp/package.json` scripts:

```
"prepack": "node -e \"require('fs').cpSync('../../apps/docs/public/registry', './registry', { recursive: true })\""
```

This bundles the generated registry into the published package, so consumers don't need network access. Local dev works via the fallback URL in `defaultLoadIndex`.

### Step 6: Commit

- [ ] `git add packages/mcp/`
- [ ] `git commit -m "feat(mcp): add get_component, search_components, get_example, check_usage tools"`

---

## Task 5: CLI `describe`, `list`, `examples` commands

**Files:**
- Create: `packages/cli/src/commands/describe.ts`
- Create: `packages/cli/src/commands/list.ts`
- Create: `packages/cli/src/commands/examples.ts`
- Create: `packages/cli/src/__tests__/ai-commands.test.ts`
- Modify: `packages/cli/src/index.ts` (register subcommands)
- Modify: `packages/cli/package.json` (add `@weiui/mcp` workspace dep)
- Modify: `packages/mcp/package.json` (expand exports with tool subpaths)

### Step 1: MCP subpath exports

Update `packages/mcp/package.json` "exports" to include:
- `"./tools/list-components"`, `"./tools/get-component"`, `"./tools/search-components"`, `"./tools/get-example"`, `"./tools/check-usage"`
- `"./registry-loader"`, `"./lint"`

Each subpath: `{ "types": "./dist/<path>.d.ts", "import": "./dist/<path>.js" }`.

Update tsup invocation to build all these files: already covered by the `src/tools/*.ts` glob pattern from Task 3.

- [ ] Rebuild: `pnpm --filter @weiui/mcp build`.

### Step 2: Wire CLI to MCP

Edit `packages/cli/package.json` — add `"@weiui/mcp": "workspace:*"` under dependencies.

- [ ] Run `pnpm install`.

### Step 3: Failing test

Create `packages/cli/src/__tests__/ai-commands.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { describeCommand } from "../commands/describe";
import { listCommand } from "../commands/list";
import { examplesCommand } from "../commands/examples";

describe("CLI AI commands", () => {
  it("describe outputs JSON for a known component", async () => {
    const output = await describeCommand("Button");
    expect(output).toMatch(/"name": "Button"/);
    expect(output).toMatch(/"props"/);
  });

  it("list outputs all components, newline-separated", async () => {
    const output = await listCommand({});
    const lines = output.trim().split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(60);
    expect(lines).toContain("Button");
  });

  it("list --category=form filters", async () => {
    const output = await listCommand({ category: "form" });
    const lines = output.trim().split("\n");
    expect(lines).toContain("Button");
    expect(lines).not.toContain("BarChart");
  });

  it("examples outputs the first example code for a component", async () => {
    const output = await examplesCommand("Button", {});
    expect(output).toMatch(/<Button/);
  });
});
```

- [ ] Run: `pnpm --filter @weiui/cli test` — FAIL.

### Step 4: Implement 3 commands

**`describe.ts`:**
```ts
import { getComponent } from "@weiui/mcp/tools/get-component";
import { defaultLoadComponent } from "@weiui/mcp/registry-loader";

export async function describeCommand(name: string): Promise<string> {
  const loadComponent = defaultLoadComponent();
  const result = await getComponent({ loadComponent }, { name });
  return JSON.stringify(result, null, 2);
}
```

**`list.ts`:**
```ts
import { listComponents } from "@weiui/mcp/tools/list-components";
import { defaultLoadIndex } from "@weiui/mcp/registry-loader";

export interface ListCommandOptions { category?: string; }

export async function listCommand(opts: ListCommandOptions): Promise<string> {
  const loadIndex = defaultLoadIndex();
  const result = await listComponents({ loadIndex }, opts);
  return result.components.map((c) => c.name).join("\n");
}
```

**`examples.ts`:**
```ts
import { getExample } from "@weiui/mcp/tools/get-example";
import { defaultLoadComponent } from "@weiui/mcp/registry-loader";

export interface ExamplesCommandOptions { variant?: string; }

export async function examplesCommand(name: string, opts: ExamplesCommandOptions): Promise<string> {
  const loadComponent = defaultLoadComponent();
  const result = await getExample({ loadComponent }, { name, variant: opts.variant });
  if (!result.example) return `No example found for ${name}.`;
  return `# ${result.example.label}\n\n${result.example.code}`;
}
```

### Step 5: Register in CLI index

Edit `packages/cli/src/index.ts` — add three `program.command(...)` declarations:
- `describe <component>` → dynamic-import `./commands/describe.js`, print result
- `list` with `-c, --category <cat>` flag → dynamic-import `./commands/list.js`
- `examples <component>` with `-v, --variant <label>` flag → dynamic-import `./commands/examples.js`

Each action handler `console.log`s the command's return value.

### Step 6: Test + build

- [ ] `pnpm --filter @weiui/mcp build`
- [ ] `pnpm --filter @weiui/cli test` — PASS.
- [ ] `pnpm --filter @weiui/cli build` — success.

### Step 7: Commit

- [ ] `git add packages/cli/src/commands/ packages/cli/src/__tests__/ packages/cli/src/index.ts packages/cli/package.json packages/mcp/package.json pnpm-lock.yaml`
- [ ] `git commit -m "feat(cli): add describe/list/examples commands backed by @weiui/mcp"`

---

## Task 6: CLI `check-usage` command

**Files:**
- Create: `packages/cli/src/commands/check-usage.ts`
- Modify: `packages/cli/src/index.ts`
- Extend: `packages/cli/src/__tests__/ai-commands.test.ts`

### Step 1: Failing test

Append to `ai-commands.test.ts`:

```ts
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkUsageCommand } from "../commands/check-usage";

describe("check-usage", () => {
  it("flags a file with Tailwind utility leakage", async () => {
    const dir = mkdtempSync(join(tmpdir(), "wui-cli-"));
    const file = join(dir, "bad.tsx");
    writeFileSync(file, `<Button className="inline-flex items-center h-11">Hi</Button>`);
    const output = await checkUsageCommand(file);
    expect(output).toMatch(/tailwind/i);
    rmSync(dir, { recursive: true, force: true });
  });

  it("returns clean output when code is correct", async () => {
    const dir = mkdtempSync(join(tmpdir(), "wui-cli-"));
    const file = join(dir, "good.tsx");
    writeFileSync(file, `<Button variant="solid" size="md">Save</Button>`);
    const output = await checkUsageCommand(file);
    expect(output).toMatch(/No issues|0 warnings|✓/);
    rmSync(dir, { recursive: true, force: true });
  });
});
```

- [ ] Run: `pnpm --filter @weiui/cli test` — 2 new fails.

### Step 2: Implement

Create `packages/cli/src/commands/check-usage.ts`:

```ts
import { readFileSync } from "node:fs";
import { checkUsage } from "@weiui/mcp/tools/check-usage";

export async function checkUsageCommand(filePath: string): Promise<string> {
  const code = readFileSync(filePath, "utf-8");
  const result = await checkUsage({}, { code });
  if (result.warnings.length === 0) return "✓ No issues found";
  return result.warnings
    .map((w) => `${filePath}:${w.line} — ${w.message}${w.suggestion ? `\n  → ${w.suggestion}` : ""}`)
    .join("\n");
}
```

### Step 3: Register

Edit `packages/cli/src/index.ts` — add:

```ts
program
  .command("check-usage <file>")
  .description("Lint a .tsx file for WeiUI-usage mistakes")
  .action(async (file: string) => {
    const { checkUsageCommand } = await import("./commands/check-usage.js");
    console.log(await checkUsageCommand(file));
  });
```

### Step 4: Test + commit

- [ ] `pnpm --filter @weiui/cli test` — PASS.
- [ ] `git add packages/cli/src/commands/check-usage.ts packages/cli/src/index.ts packages/cli/src/__tests__/ai-commands.test.ts`
- [ ] `git commit -m "feat(cli): add check-usage command (shared lint with @weiui/mcp)"`

---

## Task 7: JSDoc sweep + coverage lint

**Files:**
- Create: `scripts/check-jsdoc-coverage.ts` (repo root)
- Modify: root `package.json` (add `check-jsdoc` script)
- Modify: every `*Props` interface in `packages/react/src/components/**/*.tsx` and `packages/headless/src/**/*.ts`

### Step 1: Coverage lint tool

Create `scripts/check-jsdoc-coverage.ts`:
- Uses `ts-morph` to load every file in `packages/react/src/components/**/*.tsx` and `packages/headless/src/**/*.ts`.
- For each exported interface whose name ends with `Props`: counts properties, checks each property has a non-empty JSDoc description.
- Prints `documented/total (percentage%)`.
- If coverage < 95%: prints first 30 missing entries with file:line, exits 1.

Add to root `package.json` scripts: `"check-jsdoc": "tsx scripts/check-jsdoc-coverage.ts"`.

Add dev dep: ensure `ts-morph` available at root (add with `pnpm add -Dw ts-morph`).

- [ ] Run: `pnpm check-jsdoc` — reports current baseline. Expected: < 95%.

### Step 2: Mechanical JSDoc pass (grouped commits)

Add `/** Description */` above every property in every exported `*Props` interface. Batch by family for reviewable diffs:

- [ ] **Form primitives:** Button, Input, Textarea, Checkbox, Switch, RadioGroup, Field, Label. Commit: `docs(react): JSDoc on form primitives Props`.
- [ ] **Overlays:** Dialog, Drawer, Popover, Tooltip, Menu, Toast, CommandPalette. Commit: `docs(react): JSDoc on overlay Props`.
- [ ] **Data:** DataTable, TreeView, Transfer, BarChart/LineChart/AreaChart/PieChart/DonutChart/RadarChart, Editor. Commit: `docs(react): JSDoc on data/chart/editor Props`.
- [ ] **Advanced inputs:** Slider, Rating, InputNumber, InputOTP, AutoComplete, MultiSelect, FileUpload, ColorPicker. Commit: `docs(react): JSDoc on advanced-input Props`.
- [ ] **Date:** DatePicker, Calendar. Commit: `docs(react): JSDoc on date Props`.
- [ ] **Navigation:** Tabs, Breadcrumb, Link, Pagination, AppBar, BottomNav, Sidebar (+Trigger/Group/SubMenu), Stepper, Timeline, SpeedDial. Commit: `docs(react): JSDoc on navigation Props`.
- [ ] **Display:** Card, Badge, Avatar (+Group), Skeleton, Alert, Spinner, EmptyState, ProgressBar, Chip. Commit: `docs(react): JSDoc on display Props`.
- [ ] **Layout + Typography:** Container, Stack, Grid, Spacer, Divider, AspectRatio, Heading, Text, Code, Kbd, Portal, VisuallyHidden, ButtonGroup, ToggleGroup, Accordion, Splitter. Commit: `docs(react): JSDoc on layout/typography Props`.
- [ ] **Headless hooks + compound:** every exported `*Props` interface in `packages/headless/src/**`. Commit: `docs(headless): JSDoc on hook + component Props`.

Each prop JSDoc should be one sentence describing what it controls. Add `@default` tag when there's a default value.

### Step 3: Re-run coverage + finalize

- [ ] `pnpm check-jsdoc` — coverage ≥ 95%. Exits 0.

### Step 4: Commit the lint script

- [ ] `git add scripts/check-jsdoc-coverage.ts package.json pnpm-lock.yaml`
- [ ] `git commit -m "feat(scripts): JSDoc coverage lint — enforces ≥95% on *Props"`

---

## Task 8: `AGENTS.md` + `/docs/ai-guide` + `CONTRIBUTING` + verification

**Files:**
- Create: `AGENTS.md` (repo root)
- Create: `apps/docs/src/app/docs/ai-guide/page.mdx`
- Modify: `apps/docs/src/lib/site-config.ts`
- Modify: `CONTRIBUTING.md`
- Create: `docs/superpowers/diagnostics/2026-04-18-ai-first-verification.md`

### Step 1: `AGENTS.md`

Create at repo root with this content:

```markdown
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
```

### Step 2: `/docs/ai-guide`

Create `apps/docs/src/app/docs/ai-guide/page.mdx` mirroring `AGENTS.md` with prose-friendly formatting + headings for each CLI command.

Add to `apps/docs/src/lib/site-config.ts` sidebar: under "Resources" (or create a new "AI" group):

```ts
{ href: "/docs/ai-guide", label: "AI Guide" }
```

### Step 3: `CONTRIBUTING.md` update

Append section:

```markdown
## AI-usage surface

Six integration points for AI assistants. When modifying components, keep them in sync:

1. **Registry JSON** (generated) — regenerated on `pnpm --filter @weiui/docs build` from JSDoc + MDX. Don't hand-edit `apps/docs/public/registry/*.json`.
2. **llms.txt / llms-full.txt** (generated) — same. Source of truth is each doc page's MDX.
3. **@weiui/mcp tools** — if you add a new tool, mirror its logic into a `@weiui/cli` command so CLI and MCP stay in parity.
4. **JSDoc coverage** — new Props fields must have JSDoc descriptions. Run `pnpm check-jsdoc`; fails CI below 95%.
5. **AGENTS.md** — update when import rules or heavy-component subpaths change.
6. **`/docs/ai-guide`** — user-facing mirror of AGENTS.md; keep them in sync.
```

### Step 4: Verification + diagnostic report

- [ ] `pnpm build` — 8/8 pass.
- [ ] `pnpm test` — all pass.
- [ ] `pnpm check-jsdoc` — coverage ≥ 95%.
- [ ] Smoke: run `node packages/cli/dist/index.js list | head` — component names print.
- [ ] Smoke: run `node packages/cli/dist/index.js describe Button | head -20` — JSON prints.
- [ ] Smoke: run `node packages/mcp/dist/index.js` — server starts, logs ready line to stderr, awaits stdio (kill it).
- [ ] Inspect `apps/docs/public/llms.txt` — non-empty.
- [ ] Inspect `apps/docs/public/llms-full.txt` — non-empty, ≥ 10 KB.
- [ ] Inspect `apps/docs/public/registry/Button.json` — non-empty, matches schema.

Create `docs/superpowers/diagnostics/2026-04-18-ai-first-verification.md` with:
- Per-task commit SHAs
- Artifact sizes (llms.txt lines, llms-full.txt KB, registry file count)
- JSDoc coverage percentage
- MCP tool inventory confirmed via smoke test

### Step 5: Commit + push

- [ ] `git add AGENTS.md apps/docs/src/app/docs/ai-guide/ apps/docs/src/lib/site-config.ts CONTRIBUTING.md docs/superpowers/diagnostics/2026-04-18-ai-first-verification.md`
- [ ] `git commit -m "docs: add AGENTS.md + /docs/ai-guide + CONTRIBUTING AI-usage section + verification"`
- [ ] `git push origin main`

---

## Self-review

1. **Spec coverage** (checked against `docs/superpowers/specs/2026-04-18-ai-first-integration-design.md`):
   - §4.1 `llms.txt` / `llms-full.txt` → Task 1 ✓
   - §4.2 Registry JSON → Task 2 ✓
   - §4.3 `@weiui/mcp` package → Tasks 3 + 4 ✓
   - §4.4 CLI AI commands → Tasks 5 + 6 ✓
   - §4.5 JSDoc sweep + coverage lint → Task 7 ✓
   - §4.6 `AGENTS.md` + `/docs/ai-guide` → Task 8 ✓
   - §4.7 `CONTRIBUTING.md` update → Task 8 ✓
2. **Placeholder scan:** Every step has concrete code or exact file edits. The JSDoc bulk pass is constrained by a coverage lint that enforces completion.
3. **Type consistency:** `RegistryComponentSchema` + related types defined once in `apps/docs/scripts/registry-schema.ts` and re-stated in `packages/mcp/src/registry-loader.ts` (necessary duplication because `@weiui/mcp` must stand alone for npm publish). `@weiui/mcp` subpath exports are the single source of truth for tool implementations — CLI commands in Task 5/6 import those exact functions, so CLI and MCP can never drift.

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-18-ai-first-integration.md`. Two execution options:

1. **Subagent-Driven (recommended)** — one fresh subagent per task, two-stage review (spec compliance → code quality), fast iteration. Matches prior phase execution style.
2. **Inline Execution** — batch execution in this session via `superpowers:executing-plans`.

Which approach?
