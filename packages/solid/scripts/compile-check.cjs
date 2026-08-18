const path = require("node:path");
const { transformFileSync } = require("@babel/core");
const solid = require("babel-preset-solid");
const input = path.resolve(__dirname, "../src/index.jsx");
for (const generate of ["dom", "ssr"]) {
  const result = transformFileSync(input, { babelrc: false, configFile: false, presets: [[solid, { generate, hydratable: true }]] });
  if (!result?.code) throw new Error(`Solid ${generate} compilation produced no output`);
}
console.log("Solid client + SSR compilation: OK");
