import { describe, it, expect } from "vitest";
import { checkUsage } from "../tools/check-usage.js";

describe("checkUsage tool", () => {
  it("flags Tailwind utility classes on WeiUI components", async () => {
    const code = `<Button className="inline-flex items-center h-11">Hi</Button>`;
    const result = await checkUsage({}, { code });
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]!.message).toMatch(/Tailwind/i);
  });

  it("flags heavy components imported from the main barrel", async () => {
    const code = `import { Editor } from "@weiui/react";`;
    const result = await checkUsage({}, { code });
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]!.message).toMatch(/Editor/);
    expect(result.warnings[0]!.suggestion).toMatch(/@weiui\/react\/editor/);
  });

  it("flags <Button iconOnly> without aria-label", async () => {
    const code = `<Button iconOnly><CloseIcon /></Button>`;
    const result = await checkUsage({}, { code });
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]!.message).toMatch(/aria-label/);
  });

  it("does not flag <Button iconOnly> when aria-label is present", async () => {
    const code = `<Button iconOnly aria-label="Close"><CloseIcon /></Button>`;
    const result = await checkUsage({}, { code });
    expect(result.warnings).toHaveLength(0);
  });

  it("returns zero warnings for clean code", async () => {
    const code = `<Button variant="solid" size="md">Save</Button>`;
    const result = await checkUsage({}, { code });
    expect(result.warnings).toHaveLength(0);
  });
});
