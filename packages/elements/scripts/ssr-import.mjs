const before = globalThis.customElements;
await import("../dist/index.js");
if (globalThis.customElements !== before) throw new Error("Importing @civaria/elements under Node must not mutate global customElements");
