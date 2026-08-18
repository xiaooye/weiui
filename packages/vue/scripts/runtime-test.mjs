import assert from "node:assert/strict";
import { createSSRApp, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { Accordion, Button, Dialog, Select } from "../dist/index.js";

const items = [{ value: "one", label: "One", content: "Panel one" }, { value: "two", label: "Two", content: "Panel two" }];
const app = createSSRApp({ render: () => h("main", {}, [
  h(Button, { variant: "solid" }, () => "Save"),
  h(Accordion, { items, modelValue: ["one"] }),
  h(Select, { items, modelValue: "two", name: "choice", required: true }),
  h(Dialog, { modelValue: true, teleport: false, title: "Runtime dialog" }),
]) });
const html = await renderToString(app);
assert.match(html, /data-wui-component="button"/);
assert.match(html, /data-wui-component="accordion"/);
assert.match(html, /aria-expanded="true"/);
assert.match(html, /data-wui-component="select"/);
assert.match(html, /name="choice"/);
assert.match(html, /role="dialog"/);
console.log("Vue native SSR/runtime contract: OK");
