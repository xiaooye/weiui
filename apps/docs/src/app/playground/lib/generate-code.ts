export interface CodeGenInput {
  component: string;
  props: Record<string, unknown>;
  importPath: string;
  subpathImport: string | null;
}

export interface CodeGenOptions {
  target: "jsx" | "tsx" | "html";
  includeImports?: boolean;
  componentWrap?: boolean;
  indent?: number;
}

function serializeValue(v: unknown): string {
  if (typeof v === "string") return `"${v.replace(/"/g, '\\"')}"`;
  if (typeof v === "number") return `{${v}}`;
  if (typeof v === "boolean") return `{${v}}`;
  if (v === null) return "{null}";
  return `{${JSON.stringify(v)}}`;
}

function renderJsx(input: CodeGenInput, indent = 0): string {
  const { component, props } = input;
  const ind = " ".repeat(indent);
  const childrenValue = props.children;
  const propsOmit = Object.fromEntries(
    Object.entries(props).filter(([k]) => k !== "children"),
  );
  const propsStr = Object.entries(propsOmit)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => {
      if (typeof v === "string") return `${k}="${v.replace(/"/g, '\\"')}"`;
      return `${k}=${serializeValue(v)}`;
    })
    .join(" ");
  const open = propsStr ? `<${component} ${propsStr}>` : `<${component}>`;
  if (childrenValue == null || childrenValue === "") {
    return `${ind}${open.replace(">", " />")}`;
  }
  return `${ind}${open}${String(childrenValue)}</${component}>`;
}

export function generateCode(input: CodeGenInput, opts: CodeGenOptions): string {
  if (opts.target === "html") {
    return `<!-- HTML output for ${input.component} — see Composer for full HTML export. -->`;
  }
  const body = renderJsx(input, opts.componentWrap ? 4 : 0);
  const lines: string[] = [];
  if (opts.includeImports !== false) {
    lines.push(`import { ${input.component} } from "${input.importPath}";`);
    lines.push("");
  }
  if (opts.componentWrap) {
    lines.push(`export default function Preview() {`);
    lines.push(`  return (`);
    lines.push(body);
    lines.push(`  );`);
    lines.push(`}`);
  } else {
    lines.push(body.trimStart());
  }
  return lines.join("\n");
}
