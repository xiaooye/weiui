import { describe, it, expect, afterEach } from "vitest";
import { runAdd } from "../add";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const workspaceRoot = join(__dirname, "..", "..", "..", "..", "..");

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length) {
    const dir = tempDirs.pop()!;
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
});

function makeTemp() {
  const dir = mkdtempSync(join(tmpdir(), "wui-add-"));
  tempDirs.push(dir);
  return dir;
}

describe("runAdd", () => {
  it("scaffolds Button into src/components/ui/Button.tsx", async () => {
    const dir = makeTemp();
    const target = await runAdd("Button", { cwd: dir, projectRoot: workspaceRoot });
    expect(existsSync(target)).toBe(true);
    expect(target).toMatch(/src[\\/]components[\\/]ui[\\/]Button\.tsx$/);
    const contents = readFileSync(target, "utf-8");
    expect(contents).toContain("Button");
  });

  it("throws for an unknown component", async () => {
    const dir = makeTemp();
    await expect(
      runAdd("DoesNotExist", { cwd: dir, projectRoot: workspaceRoot }),
    ).rejects.toThrow(/not found/);
  });
});
