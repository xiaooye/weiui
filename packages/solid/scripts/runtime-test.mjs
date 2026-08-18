import assert from "node:assert/strict";
import { renderToString } from "solid-js/web";
import { Button, Select, Tabs } from "../dist/index.js";

const items = [{ value: "one", label: "One", content: "Panel one" }, { value: "two", label: "Two", content: "Panel two" }];
const button = renderToString(() => Button({ variant: "solid", children: "Save" }));
assert.match(button, /data-wui-component="button"/);
const tabs = renderToString(() => Tabs({ items, value: "one" }));
assert.match(tabs, /data-wui-component="tabs"/);
assert.match(tabs, /aria-selected="true"/);
const select = renderToString(() => Select({ items, value: "two", name: "choice", required: true }));
assert.match(select, /data-wui-component="select"/);
assert.match(select, /name="choice"/);
console.log("Solid native SSR/runtime contract: OK");
