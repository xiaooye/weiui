import { describe, it, expect, beforeAll } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describeCommand } from "../commands/describe";
import { listCommand } from "../commands/list";
import { examplesCommand } from "../commands/examples";
import { checkUsageCommand } from "../commands/check-usage";

beforeAll(() => {
  process.env.WEIUI_MCP_REGISTRY_DIR = join(
    process.cwd(),
    "..",
    "..",
    "apps",
    "docs",
    "public",
    "registry",
  );
});

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
