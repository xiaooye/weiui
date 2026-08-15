import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const CONFIG_SCHEMA = "weiui_css_config_v1";
export const MANIFEST_SCHEMA = "weiui_css_bundle_manifest_v1";
export const RESULT_SCHEMA = "weiui_css_bundle_result_v1";

const DIST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TOP_LEVEL_KEYS = new Set(["schema", "foundation", "a11y", "elements", "utilities", "output"]);
const CATEGORY_KEYS = ["a11y", "elements", "utilities"];

export class WeiUIConfigError extends Error {
  constructor(code, message, detail = undefined) {
    super(message);
    this.name = "WeiUIConfigError";
    this.code = code;
    this.detail = detail;
  }
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeList(value, field) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new WeiUIConfigError("invalid_config", `${field} must be an array of strings`);
  const out = [];
  for (const item of value) {
    if (typeof item !== "string" || !item.trim()) {
      throw new WeiUIConfigError("invalid_config", `${field} entries must be non-empty strings`);
    }
    out.push(item.trim());
  }
  return [...new Set(out)].sort((a, b) => a.localeCompare(b));
}

export function normalizeConfig(input) {
  if (!isRecord(input)) throw new WeiUIConfigError("invalid_config", "config root must be an object");
  const extra = Object.keys(input).filter((key) => !TOP_LEVEL_KEYS.has(key)).sort();
  if (extra.length) throw new WeiUIConfigError("invalid_config", `unknown config keys: ${extra.join(", ")}`);
  if (input.schema !== CONFIG_SCHEMA) {
    throw new WeiUIConfigError("invalid_config", `schema must be ${CONFIG_SCHEMA}`);
  }
  if (input.foundation !== undefined && typeof input.foundation !== "boolean") {
    throw new WeiUIConfigError("invalid_config", "foundation must be boolean");
  }
  if (input.output !== undefined && (typeof input.output !== "string" || !input.output.trim())) {
    throw new WeiUIConfigError("invalid_config", "output must be a non-empty relative path");
  }
  return {
    schema: CONFIG_SCHEMA,
    foundation: input.foundation ?? true,
    a11y: normalizeList(input.a11y, "a11y"),
    elements: normalizeList(input.elements, "elements"),
    utilities: normalizeList(input.utilities, "utilities"),
    output: (input.output ?? "weiui.generated.css").trim(),
  };
}

export function canonicalConfig(config) {
  const normalized = normalizeConfig(config);
  return JSON.stringify(normalized);
}

export function fingerprintConfig(config) {
  return `sha256:${createHash("sha256").update(canonicalConfig(config), "utf8").digest("hex")}`;
}

export async function loadManifest(distDir = DIST_DIR) {
  const raw = JSON.parse(await readFile(path.join(distDir, "bundle-manifest.json"), "utf8"));
  if (!isRecord(raw) || raw.schema !== MANIFEST_SCHEMA || !Array.isArray(raw.fragments)) {
    throw new WeiUIConfigError("invalid_manifest", `expected ${MANIFEST_SCHEMA}`);
  }
  return raw;
}

function availableIds(manifest, category) {
  return manifest.fragments.filter((fragment) => fragment.category === category).map((fragment) => fragment.id);
}

function resolveRequested(requested, available, category) {
  if (requested.includes("*")) {
    if (requested.length !== 1) {
      throw new WeiUIConfigError("invalid_selection", `${category}: '*' must be used alone`);
    }
    return new Set(available);
  }
  const allowed = new Set(available);
  const unknown = requested.filter((item) => !allowed.has(item));
  if (unknown.length) {
    throw new WeiUIConfigError("unknown_selection", `unknown ${category}: ${unknown.join(", ")}`, {
      category,
      unknown,
      available,
    });
  }
  return new Set(requested);
}

export function resolveBundlePlan(configInput, manifest) {
  const config = normalizeConfig(configInput);
  const selected = new Map();
  selected.set("foundation", new Set(config.foundation ? availableIds(manifest, "foundation") : []));
  for (const category of CATEGORY_KEYS) {
    selected.set(category, resolveRequested(config[category], availableIds(manifest, category), category));
  }

  const elementFragments = new Map(
    manifest.fragments.filter((fragment) => fragment.category === "elements").map((fragment) => [fragment.id, fragment]),
  );
  const elementSelection = selected.get("elements");
  const queue = [...elementSelection];
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const id = queue[cursor];
    const fragment = elementFragments.get(id);
    if (!fragment) throw new WeiUIConfigError("invalid_manifest", `manifest dependency target missing: ${id}`);
    for (const dependency of fragment.requires ?? []) {
      if (!elementFragments.has(dependency)) {
        throw new WeiUIConfigError("invalid_manifest", `${id} requires unknown element ${dependency}`);
      }
      if (!elementSelection.has(dependency)) {
        elementSelection.add(dependency);
        queue.push(dependency);
      }
    }
  }

  const fragments = manifest.fragments.filter((fragment) => selected.get(fragment.category)?.has(fragment.id));
  return {
    schema: "weiui_css_bundle_plan_v1",
    config,
    config_fingerprint: fingerprintConfig(config),
    manifest_schema: manifest.schema,
    layer_declaration: manifest.layer_declaration,
    fragments,
    dependency_added_elements: [...elementSelection].filter((id) => !config.elements.includes(id)).sort((a, b) => a.localeCompare(b)),
  };
}

function secureOutputPath(configPath, output) {
  if (path.isAbsolute(output)) {
    throw new WeiUIConfigError("invalid_output", "output must be relative to the config directory");
  }
  const base = path.dirname(configPath);
  const resolved = path.resolve(base, output);
  const relative = path.relative(base, resolved);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new WeiUIConfigError("invalid_output", "output must stay inside the config directory");
  }
  return resolved;
}

async function readConfigFile(configPath) {
  let parsed;
  try {
    parsed = JSON.parse(await readFile(configPath, "utf8"));
  } catch (error) {
    throw new WeiUIConfigError("config_read_failed", `cannot read config: ${configPath}`, String(error));
  }
  return normalizeConfig(parsed);
}

export async function validateConfigFile(configFile = "weiui.config.json", options = {}) {
  const configPath = path.resolve(options.cwd ?? process.cwd(), configFile);
  const config = await readConfigFile(configPath);
  const manifest = await loadManifest(options.distDir ?? DIST_DIR);
  const plan = resolveBundlePlan(config, manifest);
  secureOutputPath(configPath, config.output);
  return {
    schema: "weiui_css_config_validation_v1",
    valid: true,
    config: plan.config,
    config_fingerprint: plan.config_fingerprint,
    fragments: plan.fragments.map((fragment) => `${fragment.category}/${fragment.id}`),
    dependency_added_elements: plan.dependency_added_elements,
  };
}

export async function bundleConfigFile(configFile = "weiui.config.json", options = {}) {
  const configPath = path.resolve(options.cwd ?? process.cwd(), configFile);
  const config = await readConfigFile(configPath);
  const distDir = options.distDir ?? DIST_DIR;
  const manifest = await loadManifest(distDir);
  const plan = resolveBundlePlan(config, manifest);
  const outputPath = secureOutputPath(configPath, plan.config.output);

  const header = [
    "/* Generated by @weiui/css config layer. Do not edit by hand.",
    ` * schema: ${CONFIG_SCHEMA}`,
    ` * config-fingerprint: ${plan.config_fingerprint}`,
    ` * manifest-schema: ${manifest.schema}`,
    ` * fragments: ${plan.fragments.map((fragment) => `${fragment.category}/${fragment.id}`).join(", ") || "none"}`,
    " */",
  ].join("\n");

  const parts = [header, manifest.layer_declaration];
  for (const fragment of plan.fragments) {
    parts.push((await readFile(path.join(distDir, fragment.path), "utf8")).trim());
  }
  const css = `${parts.filter(Boolean).join("\n\n")}\n`;
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, css, "utf8");

  return {
    schema: RESULT_SCHEMA,
    config_fingerprint: plan.config_fingerprint,
    output: path.relative(path.dirname(configPath), outputPath).split(path.sep).join("/"),
    bytes: Buffer.byteLength(css, "utf8"),
    fragments: plan.fragments.map((fragment) => `${fragment.category}/${fragment.id}`),
    dependency_added_elements: plan.dependency_added_elements,
    runtime_javascript_required: false,
  };
}

export async function describeConfig(options = {}) {
  const manifest = await loadManifest(options.distDir ?? DIST_DIR);
  return {
    schema: "weiui_css_config_description_v1",
    config_schema: CONFIG_SCHEMA,
    defaults: {
      foundation: true,
      a11y: [],
      elements: [],
      utilities: [],
      output: "weiui.generated.css",
    },
    wildcard: "*",
    categories: {
      foundation: availableIds(manifest, "foundation"),
      a11y: availableIds(manifest, "a11y"),
      elements: availableIds(manifest, "elements"),
      utilities: availableIds(manifest, "utilities"),
    },
    notes: [
      "@weiui/tokens remains a separate import and is not duplicated into generated CSS bundles.",
      "Element dependencies are closed from the CSS bundle manifest before emission.",
      "Config tooling is build-time only; generated CSS requires no WeiUI JavaScript at runtime.",
    ],
  };
}
