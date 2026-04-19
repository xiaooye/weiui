import type { ComponentNode } from "./tree";

function newId(): string {
  return `n${Math.random().toString(36).slice(2, 10)}`;
}

export function serialiseNodes(nodes: ComponentNode[]): string {
  return JSON.stringify(nodes);
}

export function deserialiseNodes(json: string): ComponentNode[] {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    const valid = (n: unknown): n is ComponentNode =>
      !!n &&
      typeof n === "object" &&
      typeof (n as ComponentNode).id === "string" &&
      typeof (n as ComponentNode).type === "string" &&
      typeof (n as ComponentNode).props === "object" &&
      Array.isArray((n as ComponentNode).children);
    return parsed.filter(valid);
  } catch {
    return [];
  }
}

export function remapIds(nodes: ComponentNode[]): ComponentNode[] {
  const clone = (n: ComponentNode): ComponentNode => ({
    ...n,
    id: newId(),
    children: n.children.map(clone),
  });
  return nodes.map(clone);
}
