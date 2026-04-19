import type { LegacyComponentNode } from "./component-tree";

export function generateJsx(nodes: LegacyComponentNode[]): string {
  return nodes.map(nodeToJsx).join("\n");
}

function nodeToJsx(node: LegacyComponentNode): string {
  const propsStr = Object.entries(node.props)
    .filter(([, v]) => v !== "" && v !== false)
    .map(([k, v]) => (typeof v === "boolean" ? k : `${k}="${v}"`))
    .join(" ");

  const open = propsStr ? `<${node.type} ${propsStr}>` : `<${node.type}>`;

  if (!node.children) return `${open} />`.replace("> />", " />");
  return `${open}${node.children}</${node.type}>`;
}

export function generateHtml(nodes: LegacyComponentNode[]): string {
  return nodes.map(nodeToHtml).join("\n");
}

function nodeToHtml(node: LegacyComponentNode): string {
  const typeToClass: Record<string, string> = {
    Button: "wui-button wui-button--solid",
    Input: "wui-input",
    Badge: "wui-badge wui-badge--solid",
    Card: "wui-card",
    Avatar: "wui-avatar",
    Alert: "wui-alert",
    Divider: "wui-divider",
    Heading: "h2",
    Text: "p",
  };

  const tag = node.type === "Heading" ? "h2" : node.type === "Text" ? "p" : node.type === "Input" ? "input" : node.type === "Divider" ? "hr" : node.type === "Button" ? "button" : "div";
  const cls = typeToClass[node.type] || "";

  if (tag === "input" || tag === "hr") {
    return `<${tag} class="${cls}"${node.props.placeholder ? ` placeholder="${node.props.placeholder}"` : ""} />`;
  }
  return `<${tag} class="${cls}">${node.children}</${tag}>`;
}
