import assert from "node:assert/strict";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { transformSync } from "@babel/core";
import solid from "babel-preset-solid";
import { renderToString } from "solid-js/web";

const root = resolve(import.meta.dirname, "..");
const source = await readFile(resolve(root, "dist/index.jsx"), "utf8");
const compiled = transformSync(source, { babelrc: false, configFile: false, presets: [[solid, { generate: "ssr", hydratable: true }]] });
if (!compiled?.code) throw new Error("Solid SSR compilation produced no output");
const temp = resolve(root, "dist/__runtime-ssr.mjs");
await writeFile(temp, compiled.code);
try {
  const runtime = await import(`${pathToFileURL(temp).href}?runtime=${Date.now()}`);
  const items = [{ value: "one", label: "One", content: "Panel one" }, { value: "two", label: "Two", content: "Panel two" }];
  const button = renderToString(() => runtime.Button({ variant: "solid", children: "Save" }));
  assert.match(button, /data-civaria-component="button"/);
  const tabs = renderToString(() => runtime.Tabs({ items, value: "one" }));
  assert.match(tabs, /data-civaria-component="tabs"/);
  assert.match(tabs, /aria-selected="true"/);
  const select = renderToString(() => runtime.Select({ items, value: "two", name: "choice", required: true }));
  assert.match(select, /data-civaria-component="select"/);
  assert.match(select, /name="choice"/);
} finally { await unlink(temp).catch(() => {}); }
console.log("Solid compiler + native SSR contract: OK");
