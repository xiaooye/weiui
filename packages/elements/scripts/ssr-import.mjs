const before = globalThis.customElements;
await import("../dist/index.js");
if (globalThis.customElements !== before) throw new Error("Importing @weiui/elements under Node must not mutate global customElements");
