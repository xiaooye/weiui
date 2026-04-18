import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Project, SyntaxKind } from "ts-morph";
import type {
  RegistryComponentSchema,
  RegistryExampleSchema,
  RegistryIndex,
  RegistryPropSchema,
} from "./registry-schema";

/**
 * Build per-component JSON registry files + an index.
 *
 * Reads each component's source via `ts-morph` (for Props introspection) and
 * its docs page via regex (for examples + accessibility bullets), writes one
 * `<Name>.json` per component plus an `index.json` summary.
 */
export interface BuildRegistryOptions {
  /** Directory to emit registry files into. Created if missing. */
  outDir: string;
}

/** Package version label recorded in `index.json`. */
const REGISTRY_VERSION = "0.0.1";

/** Relative to process.cwd() (which is `apps/docs` at runtime). */
const REACT_COMPONENTS_DIR = join(process.cwd(), "..", "..", "packages", "react", "src", "components");
const DOCS_COMPONENTS_DIR = join(process.cwd(), "src", "app", "docs", "components");

/**
 * Heavy components live on subpaths so apps don't pay their cost unless used.
 * The values here are the exact import specifiers agents should emit.
 */
const HEAVY_SUBPATHS: Record<string, string> = {
  Editor: "@weiui/react/editor",
  DataTable: "@weiui/react/data-table",
  BarChart: "@weiui/react/chart",
  LineChart: "@weiui/react/chart",
  AreaChart: "@weiui/react/chart",
  PieChart: "@weiui/react/chart",
  DonutChart: "@weiui/react/chart",
  RadarChart: "@weiui/react/chart",
};

/**
 * Component -> category bucket. Keeps registry consumers (CLI `list --category`,
 * MCP `list_components`, docs sidebar groupings) in sync.
 */
const CATEGORY_MAP: Record<string, string> = {
  // form
  Button: "form",
  ButtonGroup: "form",
  Checkbox: "form",
  Field: "form",
  Input: "form",
  Label: "form",
  RadioGroup: "form",
  Switch: "form",
  Textarea: "form",
  ToggleGroup: "form",
  // overlay
  Dialog: "overlay",
  Drawer: "overlay",
  Menu: "overlay",
  Popover: "overlay",
  Toast: "overlay",
  Tooltip: "overlay",
  CommandPalette: "overlay",
  // data
  DataTable: "data",
  TreeView: "data",
  Transfer: "data",
  Chart: "data",
  // navigation
  AppBar: "navigation",
  BottomNav: "navigation",
  Breadcrumb: "navigation",
  Link: "navigation",
  Pagination: "navigation",
  Sidebar: "navigation",
  SpeedDial: "navigation",
  Stepper: "navigation",
  Tabs: "navigation",
  Timeline: "navigation",
  // feedback
  Alert: "feedback",
  EmptyState: "feedback",
  ProgressBar: "feedback",
  Skeleton: "feedback",
  Spinner: "feedback",
  // display
  Accordion: "display",
  Avatar: "display",
  Badge: "display",
  Card: "display",
  Chip: "display",
  Rating: "display",
  // layout
  AspectRatio: "layout",
  Container: "layout",
  Divider: "layout",
  Grid: "layout",
  Spacer: "layout",
  Splitter: "layout",
  Stack: "layout",
  // typography
  Code: "typography",
  Heading: "typography",
  Kbd: "typography",
  Text: "typography",
  // utility
  Portal: "utility",
  VisuallyHidden: "utility",
  // advanced-input
  AutoComplete: "advanced-input",
  ColorPicker: "advanced-input",
  FileUpload: "advanced-input",
  InputNumber: "advanced-input",
  InputOTP: "advanced-input",
  MultiSelect: "advanced-input",
  Slider: "advanced-input",
  // date
  Calendar: "date",
  DatePicker: "date",
  // interactive (other)
  Editor: "interactive",
};

function listComponentDirs(): string[] {
  if (!existsSync(REACT_COMPONENTS_DIR)) return [];
  return readdirSync(REACT_COMPONENTS_DIR)
    .filter((name) => {
      const full = join(REACT_COMPONENTS_DIR, name);
      return statSync(full).isDirectory();
    })
    .sort();
}

/** Strip `import("..../foo").Bar` noise from a ts-morph-rendered type string. */
function normalizeTypeText(type: string): string {
  return type
    .replace(/import\(["'][^"']+["']\)\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pull the first one-line description from a JSDoc comment (no tags). */
function extractDescription(docText: string): string {
  // Strip the `/**` ... `*/` wrapping first so single-line JSDoc
  // (`/** hello */`) reduces to just "hello".
  let body = docText.trim();
  if (body.startsWith("/**")) body = body.slice(3);
  if (body.endsWith("*/")) body = body.slice(0, -2);
  // We only want the leading summary text -- drop everything from the
  // first JSDoc tag onward.
  const beforeTag = body.split(/^\s*@/m)[0] ?? "";
  return beforeTag
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*\*\s?/, "").trim())
    .filter((l) => l.length > 0)
    .join(" ")
    .trim();
}

function extractDefaultTag(docText: string): string | undefined {
  const match = docText.match(/@default\s+([^\n*]+)/);
  if (!match) return undefined;
  const raw = match[1];
  if (!raw) return undefined;
  return raw.replace(/^\s+|\s+$/g, "").replace(/\*\/\s*$/, "").trim() || undefined;
}

/**
 * Parse a component's `<Name>.tsx` via ts-morph. Returns empty array when the
 * file or the matching `<Name>Props` type is absent -- charts that share a file
 * (e.g. BarChart in Chart.tsx) fall into this branch.
 */
function extractProps(project: Project, tsxPath: string, typeName: string): RegistryPropSchema[] {
  if (!existsSync(tsxPath)) return [];
  const source = project.addSourceFileAtPath(tsxPath);
  const props: RegistryPropSchema[] = [];

  const iface = source.getInterface(typeName);
  if (iface) {
    for (const prop of iface.getProperties()) {
      const docs = prop.getJsDocs();
      const docText = docs.map((d) => d.getText()).join("\n");
      props.push({
        name: prop.getName(),
        type: normalizeTypeText(prop.getTypeNode()?.getText() ?? prop.getType().getText(prop)),
        default: extractDefaultTag(docText),
        required: !prop.hasQuestionToken(),
        description: extractDescription(docText),
      });
    }
    return props;
  }

  // Fallback: `export type FooProps = Base & { ... }` -- read the intersected
  // literal members so `Button` (which uses a type alias) still surfaces props.
  const alias = source.getTypeAlias(typeName);
  if (alias) {
    const typeNode = alias.getTypeNode();
    if (typeNode?.isKind(SyntaxKind.IntersectionType)) {
      for (const member of typeNode.getTypeNodes()) {
        if (member.isKind(SyntaxKind.TypeLiteral)) {
          for (const prop of member.getMembers()) {
            if (!prop.isKind(SyntaxKind.PropertySignature)) continue;
            const docs = prop.getJsDocs();
            const docText = docs.map((d) => d.getText()).join("\n");
            props.push({
              name: prop.getName(),
              type: normalizeTypeText(prop.getTypeNode()?.getText() ?? ""),
              default: extractDefaultTag(docText),
              required: !prop.hasQuestionToken(),
              description: extractDescription(docText),
            });
          }
        }
      }
    } else if (typeNode?.isKind(SyntaxKind.TypeLiteral)) {
      for (const prop of typeNode.getMembers()) {
        if (!prop.isKind(SyntaxKind.PropertySignature)) continue;
        const docs = prop.getJsDocs();
        const docText = docs.map((d) => d.getText()).join("\n");
        props.push({
          name: prop.getName(),
          type: normalizeTypeText(prop.getTypeNode()?.getText() ?? ""),
          default: extractDefaultTag(docText),
          required: !prop.hasQuestionToken(),
          description: extractDescription(docText),
        });
      }
    }
  }

  return props;
}

/** PascalCase -> kebab-case (`DataTable` -> `data-table`). */
function toKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function readFileIfExists(path: string): string | null {
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf-8");
}

/**
 * Locate the MDX doc page that covers this component. Grouped pages
 * (overlays, data, form, etc.) win when no dedicated slug exists.
 */
function findMdxSource(name: string): { source: string; section: string } | null {
  const slug = toKebab(name);
  const dedicated = [
    join(DOCS_COMPONENTS_DIR, slug, "page.mdx"),
    join(DOCS_COMPONENTS_DIR, name.toLowerCase(), "page.mdx"),
  ];
  for (const path of dedicated) {
    const source = readFileIfExists(path);
    if (source) return { source, section: source };
  }

  // Scan grouped pages for a `## <Name>` heading.
  if (!existsSync(DOCS_COMPONENTS_DIR)) return null;
  const entries = readdirSync(DOCS_COMPONENTS_DIR);
  for (const entry of entries) {
    const mdxPath = join(DOCS_COMPONENTS_DIR, entry, "page.mdx");
    const source = readFileIfExists(mdxPath);
    if (!source) continue;
    const heading = new RegExp(`^##\\s+${name}\\s*$`, "m");
    const match = heading.exec(source);
    if (!match) continue;
    // Slice from this heading to the next `## ` heading.
    const start = match.index;
    const rest = source.slice(start + match[0].length);
    const nextHeading = rest.search(/\n##\s+/);
    const section = nextHeading === -1
      ? source.slice(start)
      : source.slice(start, start + match[0].length + nextHeading);
    return { source, section };
  }
  return null;
}

/**
 * Extract fenced `tsx` code blocks that reference `<Name` or `Name(`.
 * Caps at 4 to keep payloads small. First match is labeled "Basic".
 */
function extractExamples(section: string, name: string, limit = 4): RegistryExampleSchema[] {
  const examples: RegistryExampleSchema[] = [];
  const fence = /```tsx\s*\n([\s\S]*?)```/g;
  const refTag = new RegExp(`<${name}[\\s/>]|${name}\\(`);
  let match: RegExpExecArray | null;
  while ((match = fence.exec(section)) !== null) {
    const code = match[1]?.trim() ?? "";
    if (!code) continue;
    if (!refTag.test(code)) continue;
    const label = examples.length === 0 ? "Basic" : `Variant ${examples.length + 1}`;
    examples.push({ label, code });
    if (examples.length >= limit) break;
  }
  return examples;
}

/** Pull bullets from the `## Accessibility` / `### Accessibility` section. */
function extractAccessibility(section: string, limit = 10): string[] {
  const headingRe = /^(#{2,3})\s+Accessibility\s*$/m;
  const match = headingRe.exec(section);
  if (!match) return [];
  const level = match[1]?.length ?? 2;
  const start = match.index + match[0].length;
  const stopRe = new RegExp(`\\n#{2,${level}}\\s+`);
  const rest = section.slice(start);
  const stop = rest.search(stopRe);
  const body = stop === -1 ? rest : rest.slice(0, stop);
  const bullets: string[] = [];
  for (const line of body.split(/\r?\n/)) {
    const bullet = /^-\s+(.+)$/.exec(line.trim());
    if (!bullet) continue;
    bullets.push(bullet[1]!.trim());
    if (bullets.length >= limit) break;
  }
  return bullets;
}

/** First prose paragraph after the `# Title` line -- the summary description. */
function extractDescriptionFromMdx(source: string): string {
  const withoutFrontmatter = source.replace(/^---[\s\S]*?---\n/, "");
  const lines = withoutFrontmatter.split(/\r?\n/);
  let sawH1 = false;
  const buffer: string[] = [];
  for (const line of lines) {
    if (!sawH1) {
      if (/^#\s+/.test(line)) sawH1 = true;
      continue;
    }
    const trimmed = line.trim();
    if (trimmed === "") {
      if (buffer.length > 0) break;
      continue;
    }
    if (trimmed.startsWith("#")) break;
    if (/^<[A-Z]/.test(trimmed)) continue;
    if (/^```/.test(trimmed)) break;
    if (/^import\s/.test(trimmed)) continue;
    buffer.push(trimmed);
  }
  return buffer.join(" ").replace(/\s+/g, " ").replace(/`([^`]+)`/g, "$1").trim();
}

/** Find exported compound sub-components named `<Name>Foo`. */
function extractCompound(project: Project, tsxPath: string, name: string): string[] {
  if (!existsSync(tsxPath)) return [];
  const source = project.getSourceFile(tsxPath) ?? project.addSourceFileAtPath(tsxPath);
  const found = new Set<string>();
  for (const decl of source.getVariableDeclarations()) {
    const declName = decl.getName();
    if (declName.startsWith(name) && declName !== name && decl.isExported()) {
      found.add(declName);
    }
  }
  for (const fn of source.getFunctions()) {
    const fnName = fn.getName();
    if (fnName && fnName.startsWith(name) && fnName !== name && fn.isExported()) {
      found.add(fnName);
    }
  }
  return Array.from(found).sort();
}

function buildComponent(project: Project, name: string): RegistryComponentSchema {
  const tsxPath = join(REACT_COMPONENTS_DIR, name, `${name}.tsx`);
  const props = extractProps(project, tsxPath, `${name}Props`);
  const mdx = findMdxSource(name);
  const description = mdx ? extractDescriptionFromMdx(mdx.source) : "";
  const examples = mdx ? extractExamples(mdx.section, name) : [];
  const accessibility = mdx ? extractAccessibility(mdx.section) : [];
  const compound = extractCompound(project, tsxPath, name);

  const subpath = HEAVY_SUBPATHS[name] ?? null;
  const importPath = subpath ?? "@weiui/react";

  return {
    name,
    category: CATEGORY_MAP[name] ?? "interactive",
    description,
    importPath,
    subpathImport: subpath,
    dependencies: ["@weiui/react", "@weiui/css", "@weiui/tokens"],
    props,
    compound,
    examples,
    accessibility,
  };
}

export function buildRegistry(opts: BuildRegistryOptions): RegistryIndex {
  const { outDir } = opts;
  mkdirSync(outDir, { recursive: true });

  // Shared ts-morph Project -- cheaper than spinning one per component.
  const project = new Project({
    useInMemoryFileSystem: false,
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { allowJs: false, jsx: 4 /* ReactJSX */ },
  });

  const names = listComponentDirs();
  const indexEntries: RegistryIndex["components"] = [];

  for (const name of names) {
    const component = buildComponent(project, name);
    writeFileSync(
      join(outDir, `${name}.json`),
      JSON.stringify(component, null, 2) + "\n",
      "utf-8",
    );
    indexEntries.push({
      name,
      category: component.category,
      description: component.description,
      url: `https://weiui.dev/registry/${name}.json`,
    });
  }

  const index: RegistryIndex = {
    components: indexEntries,
    generatedAt: new Date().toISOString(),
    version: REGISTRY_VERSION,
  };
  writeFileSync(join(outDir, "index.json"), JSON.stringify(index, null, 2) + "\n", "utf-8");

  return index;
}

// CLI entry -- invoked by the docs build pipeline.
const isMain =
  typeof process !== "undefined" &&
  process.argv[1] &&
  process.argv[1].replace(/\\/g, "/").endsWith("scripts/build-registry.ts");

if (isMain) {
  const outDir = join(process.cwd(), "public", "registry");
  const index = buildRegistry({ outDir });
  console.log(`Wrote ${index.components.length} component registry files to ${outDir}`);
}
