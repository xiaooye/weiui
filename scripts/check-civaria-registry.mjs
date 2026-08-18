import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function npmView(spec, field) {
  try {
    const args = ["view", spec];
    if (field) args.push(field);
    args.push("--json");
    return { ok: true, value: JSON.parse(execFileSync("npm", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })) };
  } catch (error) {
    return { ok: false, error };
  }
}

const reactPackage = JSON.parse(readFileSync("packages/react/package.json", "utf8"));
if (reactPackage.name !== "civaria") throw new Error(`Expected packages/react to be civaria, got ${reactPackage.name}`);
if (reactPackage.version === "0.0.1") throw new Error("Production civaria must never reuse bootstrap version 0.0.1");

const bootstrap = npmView("civaria@0.0.1", "version");
if (!bootstrap.ok || bootstrap.value !== "0.0.1") {
  throw new Error("npm registry does not directly confirm civaria@0.0.1; refusing publication readiness");
}
const repository = npmView("civaria", "repository");
if (!repository.ok) throw new Error("Unable to read civaria repository metadata from npm registry");
const repositoryText = JSON.stringify(repository.value);
if (!repositoryText.includes("xiaooye/weiui")) {
  throw new Error(`Existing civaria package repository does not point at xiaooye/weiui: ${repositoryText}`);
}
const distTags = npmView("civaria", "dist-tags");
if (!distTags.ok) throw new Error("Unable to read civaria dist-tags from npm registry");
const maintainers = npmView("civaria", "maintainers");
if (!maintainers.ok) throw new Error("Unable to read civaria maintainers from npm registry");
console.log("Confirmed bootstrap:", { version: bootstrap.value, repository: repository.value, distTags: distTags.value, maintainers: maintainers.value });

const exactMain = npmView(`civaria@${reactPackage.version}`, "version");
if (exactMain.ok) throw new Error(`Target civaria@${reactPackage.version} already exists; refusing version collision`);

const publicPackages = [];
for (const directory of readdirSync("packages", { withFileTypes: true })) {
  if (!directory.isDirectory()) continue;
  const path = join("packages", directory.name, "package.json");
  let manifest;
  try { manifest = JSON.parse(readFileSync(path, "utf8")); } catch { continue; }
  if (manifest.private || !manifest.name) continue;
  publicPackages.push({ name: manifest.name, version: manifest.version, path });
}

for (const pkg of publicPackages) {
  if (pkg.name === "civaria") continue;
  if (!pkg.name.startsWith("@civaria/")) throw new Error(`Unexpected publishable package outside Civaria namespace: ${pkg.name}`);
  const anyVersion = npmView(pkg.name, "version");
  if (anyVersion.ok) {
    const repo = npmView(pkg.name, "repository");
    const owners = npmView(pkg.name, "maintainers");
    throw new Error(`Target package ${pkg.name} already exists in npm registry (version ${JSON.stringify(anyVersion.value)}, repository ${JSON.stringify(repo.value)}, maintainers ${JSON.stringify(owners.value)}); manual ownership review required`);
  }
  console.log(`Registry name available: ${pkg.name}@${pkg.version}`);
}

console.log(`Civaria npm registry preflight: OK for ${publicPackages.length} publishable packages; target civaria@${reactPackage.version} is available.`);
