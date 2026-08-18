const fs = require("node:fs");
const path = require("node:path");
const { transformFileSync } = require("@babel/core");
const solid = require("babel-preset-solid");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "src");
const dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
const result = transformFileSync(path.join(src, "index.jsx"), {
  babelrc: false,
  configFile: false,
  presets: [[solid, { generate: "dom", hydratable: true }]],
  sourceMaps: false,
});
if (!result || !result.code) throw new Error("Solid client compilation produced no output");
fs.writeFileSync(path.join(dist, "index.js"), `${result.code}\n`);
fs.copyFileSync(path.join(src, "index.jsx"), path.join(dist, "index.jsx"));
fs.copyFileSync(path.join(src, "index.d.ts"), path.join(dist, "index.d.ts"));
