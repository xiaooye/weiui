import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm, access } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  bundleConfigFile,
  loadManifest,
  normalizeConfig,
  resolveBundlePlan,
  validateConfigFile,
  CivariaConfigError,
} from "../dist/config.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const DIST = path.join(ROOT, "dist");
const SRC = path.join(ROOT, "src");
const manifest = await loadManifest(DIST);

assert.equal(manifest.schema, "civaria_css_bundle_manifest_v1");
assert.deepEqual(manifest.layer_order, ["civ-reset", "civ-tokens", "civ-theme", "civ-base", "civ-elements", "civ-utilities"]);
assert.ok(manifest.fragments.length > 20, "expected broad fragment manifest");

const indexSource = await readFile(path.join(SRC, "index.css"), "utf8");
const indexImports = [...indexSource.matchAll(/@import\s+["']\.\/([^"']+)["'];/g)].map((match) => match[1]);
assert.deepEqual(manifest.fragments.map((fragment) => fragment.path), indexImports, "manifest must preserve canonical index import order");
for (const fragment of manifest.fragments) await access(path.join(DIST, fragment.path));

const allPlan = resolveBundlePlan({
  schema: "civaria_css_config_v1",
  foundation: true,
  a11y: ["*"],
  elements: ["*"],
  utilities: ["*"],
  output: "full.generated.css",
}, manifest);
assert.equal(allPlan.fragments.length, manifest.fragments.length, "wildcard config must cover the full manifest");

assert.throws(
  () => normalizeConfig({ schema: "civaria_css_config_v1", elements: [], surprise: true }),
  (error) => error instanceof CivariaConfigError && error.code === "invalid_config",
);
assert.throws(
  () => resolveBundlePlan({ schema: "civaria_css_config_v1", elements: ["definitely-not-a-component"] }, manifest),
  (error) => error instanceof CivariaConfigError && error.code === "unknown_selection",
);

const temp = await mkdtemp(path.join(os.tmpdir(), "civaria-css-config-"));
try {
  const configPath = path.join(temp, "civaria.config.json");
  const configA = {
    schema: "civaria_css_config_v1",
    foundation: true,
    a11y: ["sr-only", "focus", "motion", "focus"],
    elements: ["card", "button-group", "card"],
    utilities: [],
    output: "styles/civaria.generated.css",
  };
  const configB = {
    schema: "civaria_css_config_v1",
    foundation: true,
    a11y: ["motion", "focus", "sr-only"],
    elements: ["button-group", "card"],
    utilities: [],
    output: "styles/civaria.generated.css",
  };

  await writeFile(configPath, JSON.stringify(configA), "utf8");
  const validationA = await validateConfigFile(configPath, { distDir: DIST });
  const resultA = await bundleConfigFile(configPath, { distDir: DIST });
  const cssA = await readFile(path.join(temp, "styles/civaria.generated.css"), "utf8");

  assert.equal(resultA.runtime_javascript_required, false);
  assert.ok(cssA.includes(".civ-card"));
  assert.ok(cssA.includes(".civ-button-group"));
  assert.ok(cssA.includes(".civ-button"), "button-group dependency closure should include button CSS");
  assert.ok(!cssA.includes(".civ-dialog"), "minimal bundle must not include unselected dialog CSS");
  assert.ok(validationA.dependency_added_elements.includes("button"), "button must be inferred as a dependency of button-group");
  assert.ok(cssA.includes(`config-fingerprint: ${resultA.config_fingerprint}`));

  await writeFile(configPath, JSON.stringify(configB), "utf8");
  const resultB = await bundleConfigFile(configPath, { distDir: DIST });
  const cssB = await readFile(path.join(temp, "styles/civaria.generated.css"), "utf8");
  assert.equal(resultA.config_fingerprint, resultB.config_fingerprint, "duplicate/order-only differences must normalize identically");
  assert.equal(cssA, cssB, "normalized-equivalent configs must emit byte-identical CSS");

  await writeFile(configPath, JSON.stringify({ ...configB, output: "../escape.css" }), "utf8");
  await assert.rejects(
    () => validateConfigFile(configPath, { distDir: DIST }),
    (error) => error instanceof CivariaConfigError && error.code === "invalid_output",
  );
} finally {
  await rm(temp, { recursive: true, force: true });
}

console.log(JSON.stringify({ schema: "civaria_css_config_test_v1", status: "pass", fragments: manifest.fragments.length }));
