import type { ComponentNode } from "./tree";

export interface GenerateOptions {
  target: "jsx" | "tsx" | "html";
  componentWrap?: boolean;
  includeImports?: boolean;
}

export interface ImportResolver {
  /** Given a component name, return its import path (main barrel or subpath). */
  resolveImport(name: string): string;
}

/* ---------- JSX / TSX ---------- */

function serializeProp(key: string, value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") {
    if (value === "") return null;
    return `${key}="${value.replace(/"/g, '\\"')}"`;
  }
  if (typeof value === "boolean") {
    return `${key}={${value}}`;
  }
  if (typeof value === "number") {
    return `${key}={${value}}`;
  }
  return `${key}={${JSON.stringify(value)}}`;
}

function collectUsedNames(tree: ComponentNode[], names: Set<string>): void {
  for (const node of tree) {
    names.add(node.type);
    collectUsedNames(node.children, names);
  }
}

function groupImports(
  names: Set<string>,
  resolver: ImportResolver,
): Map<string, string[]> {
  const byPath = new Map<string, string[]>();
  for (const name of names) {
    const path = resolver.resolveImport(name);
    const list = byPath.get(path) ?? [];
    list.push(name);
    byPath.set(path, list);
  }
  for (const list of byPath.values()) list.sort();
  return byPath;
}

function emitImports(byPath: Map<string, string[]>): string {
  // Main barrel first, then subpaths alphabetised.
  const entries = Array.from(byPath.entries()).sort(([a], [b]) => {
    const aIsBarrel = a === "@weiui/react";
    const bIsBarrel = b === "@weiui/react";
    if (aIsBarrel && !bIsBarrel) return -1;
    if (!aIsBarrel && bIsBarrel) return 1;
    return a.localeCompare(b);
  });
  return entries
    .map(([path, names]) => `import { ${names.join(", ")} } from "${path}";`)
    .join("\n");
}

function renderNodeJsx(node: ComponentNode, depth: number): string {
  const indent = "  ".repeat(depth);
  const propsEntries = Object.entries(node.props)
    .filter(([k]) => k !== "children")
    .map(([k, v]) => serializeProp(k, v))
    .filter((p): p is string => p !== null);
  const propsStr = propsEntries.length > 0 ? " " + propsEntries.join(" ") : "";

  const hasText = typeof node.text === "string" && node.text.length > 0;
  const hasChildren = node.children.length > 0;

  if (!hasText && !hasChildren) {
    return `${indent}<${node.type}${propsStr} />`;
  }

  if (hasText && !hasChildren) {
    return `${indent}<${node.type}${propsStr}>${node.text}</${node.type}>`;
  }

  const childLines = node.children.map((c) => renderNodeJsx(c, depth + 1));
  const textLine = hasText ? `${"  ".repeat(depth + 1)}${node.text}` : null;
  const inner = [textLine, ...childLines].filter((l): l is string => l !== null);
  return [
    `${indent}<${node.type}${propsStr}>`,
    ...inner,
    `${indent}</${node.type}>`,
  ].join("\n");
}

function emitJsx(tree: ComponentNode[], depth: number): string {
  return tree.map((n) => renderNodeJsx(n, depth)).join("\n");
}

function generateJsxOrTsx(
  tree: ComponentNode[],
  resolver: ImportResolver,
  opts: GenerateOptions,
): string {
  const includeImports = opts.includeImports !== false;
  const used = new Set<string>();
  collectUsedNames(tree, used);

  if (opts.componentWrap) {
    const importsBlock = includeImports
      ? emitImports(groupImports(used, resolver)) + "\n\n"
      : "";
    const body = emitJsx(tree, 2);
    const lines = [
      `${importsBlock}export default function Composition() {`,
      `  return (`,
      `    <>`,
      body.replace(/^/gm, "  "),
      `    </>`,
      `  );`,
      `}`,
    ];
    return lines.join("\n");
  }

  const importsBlock = includeImports && used.size > 0
    ? emitImports(groupImports(used, resolver)) + "\n\n"
    : "";
  return importsBlock + emitJsx(tree, 0);
}

/* ---------- HTML ---------- */

const HTML_TAG_MAP: Record<string, string> = {
  Button: "button",
  Input: "input",
  Textarea: "textarea",
  Checkbox: "input",
  Switch: "input",
  Divider: "hr",
  Heading: "h2",
  Text: "p",
  Link: "a",
  Stack: "div",
  Container: "div",
  Grid: "div",
  Card: "div",
  Badge: "span",
  Chip: "span",
  Avatar: "span",
  Alert: "div",
  Spinner: "div",
  ProgressBar: "div",
  EmptyState: "div",
  Field: "div",
  Label: "label",
  Code: "code",
  Kbd: "kbd",
  Tabs: "div",
  Breadcrumb: "nav",
  Pagination: "nav",
  AppBar: "header",
  BottomNav: "nav",
  Sidebar: "aside",
  Stepper: "ol",
  Menu: "ul",
  Spacer: "div",
  AspectRatio: "div",
  Splitter: "div",
  Accordion: "div",
  VisuallyHidden: "span",
  Timeline: "ol",
  TreeView: "ul",
  Transfer: "div",
  Skeleton: "div",
  ToggleGroup: "div",
  ButtonGroup: "div",
  SpeedDial: "div",
  Toast: "div",
};

const HTML_CLASS_MAP: Record<string, string> = {
  Button: "wui-button wui-button--solid",
  Input: "wui-input",
  Textarea: "wui-textarea",
  Card: "wui-card",
  Badge: "wui-badge wui-badge--solid",
  Chip: "wui-chip",
  Avatar: "wui-avatar",
  Alert: "wui-alert",
  Divider: "wui-divider",
  Heading: "wui-heading",
  Text: "wui-text",
  Stack: "wui-stack",
  Container: "wui-container",
  Grid: "wui-grid",
  Link: "wui-link",
  Spinner: "wui-spinner",
  ProgressBar: "wui-progress",
  EmptyState: "wui-empty-state",
  Field: "wui-field",
  Label: "wui-label",
  Code: "wui-code",
  Kbd: "wui-kbd",
  Tabs: "wui-tabs",
  Breadcrumb: "wui-breadcrumb",
  Pagination: "wui-pagination",
  AppBar: "wui-app-bar",
  BottomNav: "wui-bottom-nav",
  Sidebar: "wui-sidebar",
  Stepper: "wui-stepper",
  Menu: "wui-menu",
  Spacer: "wui-spacer",
  AspectRatio: "wui-aspect-ratio",
  Splitter: "wui-splitter",
  Accordion: "wui-accordion",
  VisuallyHidden: "wui-visually-hidden",
  Timeline: "wui-timeline",
  TreeView: "wui-tree-view",
  Transfer: "wui-transfer",
  Skeleton: "wui-skeleton",
  ToggleGroup: "wui-toggle-group",
  ButtonGroup: "wui-button-group",
  SpeedDial: "wui-speed-dial",
  Toast: "wui-toast",
  Checkbox: "wui-checkbox",
  Switch: "wui-switch",
};

const HTML_VOID_TAGS = new Set(["input", "hr", "br", "img"]);

const NO_HTML_EQUIVALENT = new Set([
  "Editor",
  "ColorPicker",
  "DataTable",
  "Chart",
  "Calendar",
  "DatePicker",
  "Slider",
  "Rating",
  "RadioGroup",
  "AutoComplete",
  "MultiSelect",
  "InputNumber",
  "InputOTP",
  "FileUpload",
  "Dialog",
  "Drawer",
  "Popover",
  "Tooltip",
  "CommandPalette",
  "Portal",
]);

const HTML_PASSTHROUGH_ATTRS = new Set([
  "id",
  "name",
  "type",
  "placeholder",
  "value",
  "checked",
  "disabled",
  "readonly",
  "required",
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "role",
  "tabindex",
  "autocomplete",
  "autofocus",
  "min",
  "max",
  "step",
  "pattern",
  "maxlength",
  "minlength",
  "rows",
  "cols",
]);

function htmlAttr(key: string, value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  const kebab = key === "className"
    ? "class"
    : key.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
  if (!HTML_PASSTHROUGH_ATTRS.has(kebab) && !kebab.startsWith("aria-") && !kebab.startsWith("data-")) {
    return null;
  }
  if (typeof value === "boolean") {
    return value ? kebab : null;
  }
  return `${kebab}="${String(value).replace(/"/g, "&quot;")}"`;
}

function renderNodeHtml(node: ComponentNode, depth: number): string {
  const indent = "  ".repeat(depth);

  if (NO_HTML_EQUIVALENT.has(node.type)) {
    return `${indent}<!-- ${node.type}: no plain-HTML equivalent. Use @weiui/react. -->`;
  }

  const tag = HTML_TAG_MAP[node.type] ?? "div";
  const cls = HTML_CLASS_MAP[node.type] ?? "";

  // Add Stack modifier class based on direction.
  let classAttr = cls;
  if (node.type === "Stack") {
    const dir = (node.props.direction as string | undefined) ?? "column";
    classAttr = `${cls} wui-stack--${dir === "row" ? "row" : "column"}`.trim();
  }

  const attrs: string[] = [];
  if (classAttr) attrs.push(`class="${classAttr}"`);
  for (const [k, v] of Object.entries(node.props)) {
    if (k === "children" || k === "direction") continue;
    const a = htmlAttr(k, v);
    if (a) attrs.push(a);
  }
  const attrStr = attrs.length > 0 ? " " + attrs.join(" ") : "";

  if (HTML_VOID_TAGS.has(tag)) {
    return `${indent}<${tag}${attrStr} />`;
  }

  const hasText = typeof node.text === "string" && node.text.length > 0;
  const hasChildren = node.children.length > 0;

  if (!hasText && !hasChildren) {
    return `${indent}<${tag}${attrStr}></${tag}>`;
  }

  if (hasText && !hasChildren) {
    return `${indent}<${tag}${attrStr}>${node.text}</${tag}>`;
  }

  const childLines = node.children.map((c) => renderNodeHtml(c, depth + 1));
  const textLine = hasText ? `${"  ".repeat(depth + 1)}${node.text}` : null;
  const inner = [textLine, ...childLines].filter((l): l is string => l !== null);
  return [
    `${indent}<${tag}${attrStr}>`,
    ...inner,
    `${indent}</${tag}>`,
  ].join("\n");
}

function generateHtml(tree: ComponentNode[]): string {
  const body = tree.map((n) => renderNodeHtml(n, 2)).join("\n");
  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
    "  <title>WeiUI Composition</title>",
    '  <link rel="stylesheet" href="https://weiui.dev/weiui.min.css" />',
    "</head>",
    "<body>",
    body,
    "</body>",
    "</html>",
  ].join("\n");
}

/* ---------- Public ---------- */

export function generateCode(
  tree: ComponentNode[],
  resolver: ImportResolver,
  opts: GenerateOptions,
): string {
  if (opts.target === "html") {
    return generateHtml(tree);
  }
  return generateJsxOrTsx(tree, resolver, opts);
}

/* ---------- Resolver helpers ---------- */

export interface SchemaLike {
  name: string;
  importPath: string;
  subpathImport?: string | null;
}

/**
 * Build a resolver from a list of component schemas. Unknown components
 * default to the main barrel.
 */
export function makeSchemaResolver(schemas: SchemaLike[]): ImportResolver {
  const map = new Map<string, string>();
  for (const s of schemas) {
    map.set(s.name, s.subpathImport ?? s.importPath ?? "@weiui/react");
  }
  return {
    resolveImport(name: string): string {
      return map.get(name) ?? "@weiui/react";
    },
  };
}
