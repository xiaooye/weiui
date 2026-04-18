/**
 * Shared schema for per-component registry JSON + index.
 *
 * Emitted to `apps/docs/public/registry/` at docs build time and served at
 * `https://weiui.dev/registry/<Name>.json`. Consumers: the @weiui/cli
 * `describe`/`list`/`examples` commands, the @weiui/mcp server tools, and
 * external AI agents that fetch the JSON directly.
 */

/** One row in a component's props table. */
export interface RegistryPropSchema {
  /** Prop identifier (e.g. `variant`, `asChild`). */
  name: string;
  /** TypeScript type text with `import(...)` prefixes stripped. */
  type: string;
  /** Default value literal from the `@default` JSDoc tag, if any. */
  default?: string;
  /** True when the prop has no `?` optional marker. */
  required?: boolean;
  /** One-line JSDoc description, or empty when missing. */
  description: string;
}

/** One code sample pulled from the component's MDX page. */
export interface RegistryExampleSchema {
  /** "Basic" for the first, "Variant 2", "Variant 3", ... thereafter. */
  label: string;
  /** Raw TSX source of the fenced ```tsx block. */
  code: string;
}

/** Full per-component record emitted as `<Name>.json`. */
export interface RegistryComponentSchema {
  /** PascalCase component name (matches its source directory). */
  name: string;
  /** Bucket used for filtering (form, overlay, data, etc.). */
  category: string;
  /** One-line summary pulled from the MDX page's first prose paragraph. */
  description: string;
  /** Subpath when the component is heavy, else the main barrel. */
  importPath: string;
  /** The subpath literal when heavy, else `null`. */
  subpathImport: string | null;
  /** Workspace dependencies the component pulls in. */
  dependencies: string[];
  /** Extracted Props fields. */
  props: RegistryPropSchema[];
  /** Names of compound sub-components that live alongside. */
  compound: string[];
  /** Up to four code samples from the MDX. */
  examples: RegistryExampleSchema[];
  /** Bullets from the MDX `## Accessibility` / `### Accessibility` section. */
  accessibility: string[];
}

/** Summary record emitted as `index.json`. */
export interface RegistryIndex {
  components: Array<{
    name: string;
    category: string;
    description: string;
    /** Absolute URL to the per-component JSON on the docs site. */
    url: string;
  }>;
  /** ISO timestamp of the build that generated the registry. */
  generatedAt: string;
  /** Schema/generator version for consumers to detect upgrades. */
  version: string;
}
