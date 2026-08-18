import { describe, it, expect } from "vitest";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildLlmsTxt } from "../build-llms-txt";

describe("buildLlmsTxt", () => {
  it("emits llms.txt with required sections", () => {
    const dir = mkdtempSync(join(tmpdir(), "civ-llms-"));
    buildLlmsTxt({ outDir: dir, siteUrl: "https://civaria.dev" });
    const small = readFileSync(join(dir, "llms.txt"), "utf-8");
    expect(small).toMatch(/^# Civaria/);
    expect(small).toContain("## Import rules");
    expect(small).toContain("## Components");
    expect(small).toContain("civaria/editor");
    rmSync(dir, { recursive: true, force: true });
  });

  it("emits llms-full.txt with inlined component docs", () => {
    const dir = mkdtempSync(join(tmpdir(), "civ-llms-"));
    buildLlmsTxt({ outDir: dir, siteUrl: "https://civaria.dev" });
    const full = readFileSync(join(dir, "llms-full.txt"), "utf-8");
    expect(full.length).toBeGreaterThan(10_000);
    expect(full).toContain("Button");
    expect(full).toContain("Dialog");
    rmSync(dir, { recursive: true, force: true });
  });

  it("emits llms.txt with Foundations section and absolute doc URLs", () => {
    const dir = mkdtempSync(join(tmpdir(), "civ-llms-"));
    buildLlmsTxt({ outDir: dir, siteUrl: "https://civaria.dev" });
    const small = readFileSync(join(dir, "llms.txt"), "utf-8");
    expect(small).toContain("## Foundations");
    expect(small).toContain("https://civaria.dev/docs/");
    expect(small).toContain("## Getting started");
    rmSync(dir, { recursive: true, force: true });
  });
});
