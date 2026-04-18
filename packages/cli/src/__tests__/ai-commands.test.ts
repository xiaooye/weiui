import { describe, it, expect, beforeAll } from "vitest";
import { join } from "node:path";
import { describeCommand } from "../commands/describe";
import { listCommand } from "../commands/list";
import { examplesCommand } from "../commands/examples";

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
