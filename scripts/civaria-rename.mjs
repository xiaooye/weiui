import { existsSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";

const root = process.cwd();
const self = "scripts/civaria-rename.mjs";
const infraException = "apps/docs/wrangler.jsonc";
const lockfile = "pnpm-lock.yaml";
const ignoredDirs = new Set([".git", "node_modules", ".next", ".turbo", "dist"]);
const textExts = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".jsonc", ".md", ".mdx", ".css", ".scss", ".html", ".yml", ".yaml", ".txt", ".svg", ".toml", ".sh", ".ps1"]);
const textBasenames = new Set(["README", "AGENTS", "CLAUDE", "CONTRIBUTING", "LICENSE", ".gitignore", ".npmrc"]);

const MAIN = "__CIVARIA_MAIN_PACKAGE__";
const preserved = new Map([
  ["https://github.com/xiaooye/weiui.git", "__KEEP_GITHUB_GIT__"],
  ["https://github.com/xiaooye/weiui/issues", "__KEEP_GITHUB_ISSUES__"],
  ["https://github.com/xiaooye/weiui", "__KEEP_GITHUB_REPO__"],
  ["https://api.github.com/repos/xiaooye/weiui", "__KEEP_GITHUB_API__"],
  ["https://raw.githubusercontent.com/xiaooye/weiui", "__KEEP_GITHUB_RAW__"],
  ["xiaooye/weiui", "__KEEP_GITHUB_SLUG__"],
]);

function toPosix(path) { return path.replaceAll("\\", "/"); }
function isText(path) {
  const base = path.split("/").at(-1) ?? "";
  return textExts.has(extname(base).toLowerCase()) || textBasenames.has(base) || base.startsWith("README.");
}
function walk(dir = root) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirs.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}
function protect(value) {
  let out = value;
  for (const [literal, placeholder] of preserved) out = out.split(literal).join(placeholder);
  return out;
}
function restore(value) {
  let out = value;
  for (const [literal, placeholder] of preserved) out = out.split(placeholder).join(literal);
  return out;
}
function migrateText(source) {
  let out = protect(source);
  // The unscoped React package is the canonical main package. Protect it from
  // the scoped namespace rewrite so subpaths become civaria/* rather than @civaria/react/*.
  out = out.split("@weiui/react").join(MAIN);
  out = out.split("@weiui/").join("@civaria/");
  // Product-owned semantic data attributes use the full brand; CSS/classes/custom
  // elements use the compact `civ-` runtime prefix.
  out = out.split("data-wui-").join("data-civaria-");
  out = out.split("WEIUI").join("CIVARIA");
  out = out.split("WeiUI").join("Civaria");
  out = out.split("weiui").join("civaria");
  out = out.split("WUI").join("CIV");
  out = out.split("Wui").join("Civ");
  out = out.split("wui").join("civ");
  out = out.split(MAIN).join("civaria");
  return restore(out);
}
function migrateName(name) {
  return name
    .replaceAll("WEIUI", "CIVARIA")
    .replaceAll("WeiUI", "Civaria")
    .replaceAll("weiui", "civaria")
    .replaceAll("WUI", "CIV")
    .replaceAll("Wui", "Civ")
    .replaceAll("wui", "civ");
}

let edited = 0;
for (const full of walk()) {
  const rel = toPosix(relative(root, full));
  if (rel === self || rel === infraException || rel === lockfile || !isText(rel)) continue;
  const before = readFileSync(full, "utf8");
  const after = migrateText(before);
  if (after !== before) { writeFileSync(full, after); edited += 1; }
}

// Rename branded source/generated files bottom-up. Package directories stay stable,
// especially packages/react: only the package identity becomes unscoped `civaria`.
const paths = walk().sort((a, b) => b.length - a.length);
let renamed = 0;
for (const full of paths) {
  const rel = toPosix(relative(root, full));
  if (rel === self || rel === infraException || rel === lockfile || !existsSync(full)) continue;
  const oldName = full.split(/[\\/]/).at(-1);
  const newName = migrateName(oldName);
  if (newName !== oldName) {
    const next = join(dirname(full), newName);
    if (existsSync(next)) throw new Error(`Refusing branded path collision: ${relative(root, next)}`);
    renameSync(full, next);
    renamed += 1;
  }
}

// The bootstrap package exists only to reserve the unscoped npm name. The production
// package at packages/react takes over `civaria` after this migration.
rmSync(join(root, "bootstrap", "civaria"), { recursive: true, force: true });
try {
  const bootstrapDir = join(root, "bootstrap");
  if (existsSync(bootstrapDir) && readdirSync(bootstrapDir).length === 0) rmSync(bootstrapDir, { recursive: true });
} catch {}

// Canonical README positioning. Preserve the existing deep architecture/docs content
// beginning at the website links, but replace the old centered product masthead.
const readmePath = join(root, "README.md");
if (existsSync(readmePath)) {
  const readme = readFileSync(readmePath, "utf8");
  const marker = '<p align="center">\n  <a href="https://ui.wei-dev.com/">';
  const markerAt = readme.indexOf(marker);
  const rest = markerAt >= 0 ? readme.slice(markerAt) : readme.replace(/^.*?(?=##\s)/s, "");
  const intro = `# Civaria\n\nWCAG-first. Governance-ready.\n\nAccessible by default. Governable by design.\n\nCivaria is a design system for teams that need accessible interfaces, enforceable standards, and evidence they can trust. Tokens, canonical CSS, Headless behavior, React and native framework runtimes, A11y tooling, Icons, CLI, MCP, Registry, Composer, and Governance share one semantic contract.\n\n`;
  writeFileSync(readmePath, intro + rest);
}

// Add a permanent current-surface brand audit without embedding the legacy tokens
// contiguously in the checker itself. Actual GitHub repository URLs and the Cloudflare
// worker name are explicit infrastructure exceptions.
const auditPath = join(root, "scripts", "check-civaria-legacy.mjs");
writeFileSync(auditPath, `import { readFileSync, readdirSync } from "node:fs";\nimport { extname, join, relative } from "node:path";\nconst root=process.cwd();\nconst skipDirs=new Set([".git","node_modules",".next",".turbo","dist"]);\nconst skipFiles=new Set(["apps/docs/wrangler.jsonc","scripts/civaria-rename.mjs","scripts/check-civaria-legacy.mjs"]);\nconst textExts=new Set([".ts",".tsx",".js",".jsx",".mjs",".cjs",".json",".jsonc",".md",".mdx",".css",".scss",".html",".yml",".yaml",".txt",".svg",".toml",".sh",".ps1"]);\nconst pieces={brand:"wei"+"ui",cap:"Wei"+"UI",upper:"WEI"+"UI",short:"w"+"ui",shortCap:"W"+"ui",shortUpper:"W"+"UI"};\nconst forbidden=["@"+pieces.brand+"/",pieces.cap,pieces.upper,"--"+pieces.short+"-","data-"+pieces.short+"-",pieces.short+"-",pieces.brand+"_",pieces.brand+"-",pieces.brand];\nfunction walk(dir=root){const out=[];for(const e of readdirSync(dir,{withFileTypes:true})){if(e.isDirectory()&&skipDirs.has(e.name))continue;const p=join(dir,e.name);if(e.isDirectory())out.push(...walk(p));else out.push(p)}return out}\nfunction rel(p){return relative(root,p).replaceAll("\\\\","/")}\nconst errors=[];\nfor(const file of walk()){const r=rel(file);if(skipFiles.has(r)||r==="pnpm-lock.yaml")continue;const base=r.split("/").at(-1)||"";if(!textExts.has(extname(base).toLowerCase())&&!base.startsWith("README")&&!["AGENTS.md","CLAUDE.md","CONTRIBUTING.md"].includes(base))continue;let s=readFileSync(file,"utf8");s=s.replaceAll("https://github.com/xiaooye/"+pieces.brand+".git","").replaceAll("https://github.com/xiaooye/"+pieces.brand+"/issues","").replaceAll("https://github.com/xiaooye/"+pieces.brand,"").replaceAll("xiaooye/"+pieces.brand,"");for(const token of forbidden)if(s.includes(token))errors.push(r+": "+token);for(const token of forbidden)if(base.includes(token))errors.push(r+" [filename]: "+token)}\nif(errors.length){console.error("Legacy current-surface brand identifiers remain:\\n"+errors.join("\\n"));process.exit(1)}\nconsole.log("Civaria current-surface brand audit: OK (GitHub repo slug and Cloudflare worker identity explicitly exempted)");\n`);

// Root workspace identity and permanent audit command.
const rootPackagePath = join(root, "package.json");
const rootPackage = JSON.parse(readFileSync(rootPackagePath, "utf8"));
rootPackage.name = "civaria-workspace";
rootPackage.scripts = { ...rootPackage.scripts, "check:brand": "node scripts/check-civaria-legacy.mjs" };
writeFileSync(rootPackagePath, JSON.stringify(rootPackage, null, 2) + "\n");

console.log(`Civaria migration harness updated ${edited} text files and renamed ${renamed} branded paths.`);
console.log("Preserved deployment identity: apps/docs/wrangler.jsonc -> worker name weiui");
console.log("Preserved repository authority: github.com/xiaooye/weiui and ui.wei-dev.com");
