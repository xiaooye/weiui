export function normalizeSvelteProps(dom = {}) {
  const out = { ...(dom.attributes ?? {}) };
  if (dom.style) {
    out.style = Object.entries(dom.style).filter(([, value]) => value !== undefined).map(([name, value]) => `${name}:${String(value)}`).join(";");
  }
  for (const [name, handler] of Object.entries(dom.listeners ?? {})) out[`on${name}`] = handler;
  return out;
}
