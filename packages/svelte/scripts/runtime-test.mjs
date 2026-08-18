import assert from "node:assert/strict";
import { readFile, readdir, writeFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";

const root = resolve(import.meta.dirname, "..");
const src = resolve(root, "src");
for (const name of (await readdir(src)).filter(name => name.endsWith(".svelte"))) {
  const source = await readFile(resolve(src, name), "utf8");
  compile(source, { generate: "server", filename: resolve(src, name), modernAst: true });
}
const buttonSource = await readFile(resolve(src, "Button.svelte"), "utf8");
const compiled = compile(buttonSource, { generate: "server", filename: resolve(root, "dist/Button.svelte") });
const temp = resolve(root, "dist/__runtime-button.mjs");
await writeFile(temp, compiled.js.code);
try {
  const module = await import(`${pathToFileURL(temp).href}?runtime=${Date.now()}`);
  const result = render(module.default, { props: { variant: "solid" } });
  assert.match(result.body, /data-wui-component="button"/);
  assert.match(result.body, /wui-button/);
} finally { await unlink(temp).catch(() => {}); }
console.log("Svelte compiler + native SSR contract: OK");
