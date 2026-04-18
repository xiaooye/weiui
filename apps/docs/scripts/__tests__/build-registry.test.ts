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
