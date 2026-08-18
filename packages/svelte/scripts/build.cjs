const { cpSync, mkdirSync, rmSync } = require("node:fs");
const { join, resolve } = require("node:path");
const root = resolve(__dirname, "..");
const src = join(root, "src");
const dist = join(root, "dist");
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(src, dist, { recursive: true });
