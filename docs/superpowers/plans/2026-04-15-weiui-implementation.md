# WeiUI Design System — Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a three-layer design system (CSS-only → headless hooks → styled React) with WCAG AAA enforcement, from monorepo setup through npm publishing and documentation deployment.

**Architecture:** Turborepo monorepo with 7 packages (`tokens`, `css`, `headless`, `react`, `icons`, `cli`, `a11y`) plus 2 apps (`docs`, `playground`). Tokens are the single source of truth — JSON files generate CSS custom properties, TypeScript constants, and Figma variables. The CSS layer provides framework-agnostic primitives. The headless layer provides React hooks with accessible behavior. The React layer provides fully styled compound components. All color tokens use OKLCH color space. All semantic color pairs are validated for 7:1 contrast (WCAG AAA) at build time.

**Tech Stack:** Turborepo, pnpm, TypeScript (strict), tsup, PostCSS, Lightning CSS, Vitest, Playwright, React 19, Next.js 16, MDX, axe-core, tailwind-variants, @floating-ui/react, colorjs.io

**Spec:** `DESIGNSYSTEM-PLAN.md` (root of repo) — the authoritative reference for all design decisions, token values, and component APIs.

---

## Phase Overview

| Phase | Focus | Tasks | Depends On |
|-------|-------|-------|------------|
| **1** | Foundation (tokens, CSS, CLI) | 1–12 | — |
| **2** | Headless Layer (hooks, compound components) | 13–22 | Phase 1 |
| **3** | Styled Components (React) | 23–33 | Phase 2 |
| **4** | Polish & Documentation | 34–40 | Phase 3 |
| **5** | Deploy & Publish | 41–43 | Phase 4 |

---

## Phase 1: Foundation

### Task 1: Monorepo Scaffolding

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.npmrc`
- Create: `vitest.workspace.ts`

- [ ] **Step 1: Initialize git and pnpm**

```bash
cd /c/weiui
git init
pnpm init
```

- [ ] **Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "test:watch": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

- [ ] **Step 4: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInImports": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "jsx": "react-jsx",
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

- [ ] **Step 5: Create .gitignore**

```
node_modules/
dist/
.turbo/
*.tsbuildinfo
.next/
.env*.local
```

- [ ] **Step 6: Create .npmrc**

```ini
auto-install-peers=true
strict-peer-dependencies=false
```

- [ ] **Step 7: Create root package.json scripts**

Update `package.json`:

```json
{
  "name": "weiui",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "dev": "turbo run dev"
  },
  "devDependencies": {
    "turbo": "^2.4",
    "typescript": "^5.8",
    "vitest": "^3.1"
  }
}
```

- [ ] **Step 8: Create vitest.workspace.ts**

```typescript
import { defineWorkspace } from "vitest/config";

export default defineWorkspace(["packages/*/vitest.config.ts"]);
```

- [ ] **Step 9: Install dependencies and verify**

```bash
pnpm install
pnpm turbo build
```

Expected: clean exit (no packages to build yet).

- [ ] **Step 10: Commit**

```bash
git add package.json pnpm-workspace.yaml turbo.json tsconfig.base.json .gitignore .npmrc vitest.workspace.ts pnpm-lock.yaml
git commit -m "chore: scaffold Turborepo monorepo with pnpm workspaces"
```

---

### Task 2: @weiui/tokens — Package + Token Source Files

**Files:**
- Create: `packages/tokens/package.json`
- Create: `packages/tokens/tsconfig.json`
- Create: `packages/tokens/src/primitives/color.json`
- Create: `packages/tokens/src/primitives/spacing.json`
- Create: `packages/tokens/src/primitives/typography.json`
- Create: `packages/tokens/src/primitives/shape.json`
- Create: `packages/tokens/src/primitives/motion.json`
- Create: `packages/tokens/src/primitives/z-index.json`
- Create: `packages/tokens/src/primitives/breakpoint.json`
- Create: `packages/tokens/src/semantic.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@weiui/tokens",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    "./tokens.css": "./dist/tokens.css",
    "./tokens.json": "./dist/tokens.json",
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsx scripts/build.ts",
    "validate": "tsx scripts/validate.ts",
    "test": "vitest run"
  },
  "devDependencies": {
    "tsx": "^4.19",
    "vitest": "^3.1"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*", "scripts/**/*"]
}
```

- [ ] **Step 3: Create primitive color tokens**

Create `packages/tokens/src/primitives/color.json` with the full OKLCH neutral and blue scales from `DESIGNSYSTEM-PLAN.md` section 6.2.

```json
{
  "color": {
    "neutral": {
      "0":    { "$value": "oklch(1 0 0)", "$type": "color" },
      "50":   { "$value": "oklch(0.985 0.002 240)", "$type": "color" },
      "100":  { "$value": "oklch(0.967 0.003 240)", "$type": "color" },
      "200":  { "$value": "oklch(0.928 0.006 240)", "$type": "color" },
      "300":  { "$value": "oklch(0.872 0.010 240)", "$type": "color" },
      "400":  { "$value": "oklch(0.707 0.015 240)", "$type": "color" },
      "500":  { "$value": "oklch(0.551 0.018 240)", "$type": "color" },
      "600":  { "$value": "oklch(0.446 0.018 240)", "$type": "color" },
      "700":  { "$value": "oklch(0.372 0.017 240)", "$type": "color" },
      "800":  { "$value": "oklch(0.279 0.015 240)", "$type": "color" },
      "900":  { "$value": "oklch(0.208 0.012 240)", "$type": "color" },
      "950":  { "$value": "oklch(0.145 0.010 240)", "$type": "color" },
      "1000": { "$value": "oklch(0 0 0)", "$type": "color" }
    },
    "blue": {
      "50":   { "$value": "oklch(0.970 0.014 250)", "$type": "color" },
      "100":  { "$value": "oklch(0.932 0.032 255)", "$type": "color" },
      "200":  { "$value": "oklch(0.882 0.059 258)", "$type": "color" },
      "300":  { "$value": "oklch(0.809 0.105 260)", "$type": "color" },
      "400":  { "$value": "oklch(0.714 0.169 261)", "$type": "color" },
      "500":  { "$value": "oklch(0.623 0.214 262)", "$type": "color" },
      "600":  { "$value": "oklch(0.546 0.245 263)", "$type": "color" },
      "700":  { "$value": "oklch(0.488 0.243 264)", "$type": "color" },
      "800":  { "$value": "oklch(0.424 0.199 265)", "$type": "color" },
      "900":  { "$value": "oklch(0.379 0.146 266)", "$type": "color" },
      "950":  { "$value": "oklch(0.283 0.108 267)", "$type": "color" }
    }
  }
}
```

- [ ] **Step 4: Create remaining primitive tokens**

Create `packages/tokens/src/primitives/spacing.json` (section 6.4 of spec):

```json
{
  "spacing": {
    "0":    { "$value": "0px", "$type": "dimension" },
    "0.5":  { "$value": "2px", "$type": "dimension" },
    "1":    { "$value": "4px", "$type": "dimension" },
    "1.5":  { "$value": "6px", "$type": "dimension" },
    "2":    { "$value": "8px", "$type": "dimension" },
    "2.5":  { "$value": "10px", "$type": "dimension" },
    "3":    { "$value": "12px", "$type": "dimension" },
    "3.5":  { "$value": "14px", "$type": "dimension" },
    "4":    { "$value": "16px", "$type": "dimension" },
    "5":    { "$value": "20px", "$type": "dimension" },
    "6":    { "$value": "24px", "$type": "dimension" },
    "8":    { "$value": "32px", "$type": "dimension" },
    "10":   { "$value": "40px", "$type": "dimension" },
    "12":   { "$value": "48px", "$type": "dimension" },
    "16":   { "$value": "64px", "$type": "dimension" },
    "20":   { "$value": "80px", "$type": "dimension" },
    "24":   { "$value": "96px", "$type": "dimension" }
  }
}
```

Create `packages/tokens/src/primitives/typography.json` (section 6.3):

```json
{
  "font": {
    "family": {
      "sans":    { "$value": "'Inter', system-ui, sans-serif", "$type": "fontFamily" },
      "mono":    { "$value": "'JetBrains Mono', monospace", "$type": "fontFamily" },
      "display": { "$value": "'Inter', system-ui, sans-serif", "$type": "fontFamily" }
    },
    "size": {
      "xs":   { "$value": "12px", "$type": "dimension" },
      "sm":   { "$value": "14px", "$type": "dimension" },
      "base": { "$value": "16px", "$type": "dimension" },
      "lg":   { "$value": "18px", "$type": "dimension" },
      "xl":   { "$value": "20px", "$type": "dimension" },
      "2xl":  { "$value": "24px", "$type": "dimension" },
      "3xl":  { "$value": "30px", "$type": "dimension" },
      "4xl":  { "$value": "36px", "$type": "dimension" },
      "5xl":  { "$value": "48px", "$type": "dimension" },
      "6xl":  { "$value": "60px", "$type": "dimension" }
    },
    "weight": {
      "regular":  { "$value": 400, "$type": "number" },
      "medium":   { "$value": 500, "$type": "number" },
      "semibold": { "$value": 600, "$type": "number" },
      "bold":     { "$value": 700, "$type": "number" }
    },
    "lineHeight": {
      "tight":   { "$value": 1.25, "$type": "number" },
      "snug":    { "$value": 1.375, "$type": "number" },
      "normal":  { "$value": 1.5, "$type": "number" },
      "relaxed": { "$value": 1.625, "$type": "number" },
      "loose":   { "$value": 2, "$type": "number" }
    },
    "letterSpacing": {
      "tighter": { "$value": "-0.05em", "$type": "dimension" },
      "tight":   { "$value": "-0.025em", "$type": "dimension" },
      "normal":  { "$value": "0em", "$type": "dimension" },
      "wide":    { "$value": "0.025em", "$type": "dimension" },
      "wider":   { "$value": "0.05em", "$type": "dimension" },
      "widest":  { "$value": "0.1em", "$type": "dimension" }
    }
  }
}
```

Create `packages/tokens/src/primitives/shape.json` (sections 6.5–6.6):

```json
{
  "shape": {
    "radius": {
      "none": { "$value": "0px", "$type": "dimension" },
      "sm":   { "$value": "4px", "$type": "dimension" },
      "base": { "$value": "6px", "$type": "dimension" },
      "md":   { "$value": "8px", "$type": "dimension" },
      "lg":   { "$value": "12px", "$type": "dimension" },
      "xl":   { "$value": "16px", "$type": "dimension" },
      "2xl":  { "$value": "24px", "$type": "dimension" },
      "full": { "$value": "9999px", "$type": "dimension" }
    },
    "border": {
      "width": {
        "thin":   { "$value": "1px", "$type": "dimension" },
        "medium": { "$value": "2px", "$type": "dimension" },
        "thick":  { "$value": "3px", "$type": "dimension" }
      }
    }
  },
  "shadow": {
    "xs": { "$value": "0 1px 2px 0 oklch(0 0 0 / 0.03)", "$type": "shadow" },
    "sm": { "$value": "0 1px 3px 0 oklch(0 0 0 / 0.04), 0 1px 2px -1px oklch(0 0 0 / 0.03)", "$type": "shadow" },
    "md": { "$value": "0 4px 6px -1px oklch(0 0 0 / 0.05), 0 2px 4px -2px oklch(0 0 0 / 0.03)", "$type": "shadow" },
    "lg": { "$value": "0 10px 15px -3px oklch(0 0 0 / 0.06), 0 4px 6px -4px oklch(0 0 0 / 0.03)", "$type": "shadow" },
    "xl": { "$value": "0 20px 25px -5px oklch(0 0 0 / 0.08), 0 8px 10px -6px oklch(0 0 0 / 0.04)", "$type": "shadow" }
  }
}
```

Create `packages/tokens/src/primitives/motion.json` (section 6.7):

```json
{
  "motion": {
    "duration": {
      "instant":  { "$value": "0ms", "$type": "duration" },
      "fast":     { "$value": "100ms", "$type": "duration" },
      "normal":   { "$value": "200ms", "$type": "duration" },
      "slow":     { "$value": "300ms", "$type": "duration" },
      "entrance": { "$value": "400ms", "$type": "duration" }
    },
    "easing": {
      "default": { "$value": "cubic-bezier(0.16, 1, 0.3, 1)", "$type": "cubicBezier" },
      "in":      { "$value": "cubic-bezier(0.55, 0, 1, 0.45)", "$type": "cubicBezier" },
      "out":     { "$value": "cubic-bezier(0.16, 1, 0.3, 1)", "$type": "cubicBezier" },
      "inOut":   { "$value": "cubic-bezier(0.45, 0, 0.55, 1)", "$type": "cubicBezier" },
      "spring":  { "$value": "cubic-bezier(0.34, 1.56, 0.64, 1)", "$type": "cubicBezier" }
    }
  }
}
```

Create `packages/tokens/src/primitives/z-index.json` (section 22):

```json
{
  "zIndex": {
    "hide":     { "$value": -1, "$type": "number" },
    "base":     { "$value": 0, "$type": "number" },
    "raised":   { "$value": 1, "$type": "number" },
    "dropdown": { "$value": 1000, "$type": "number" },
    "sticky":   { "$value": 1100, "$type": "number" },
    "overlay":  { "$value": 1200, "$type": "number" },
    "modal":    { "$value": 1300, "$type": "number" },
    "popover":  { "$value": 1400, "$type": "number" },
    "toast":    { "$value": 1500, "$type": "number" },
    "tooltip":  { "$value": 1600, "$type": "number" },
    "max":      { "$value": 9999, "$type": "number" }
  }
}
```

Create `packages/tokens/src/primitives/breakpoint.json` (section 15.1):

```json
{
  "breakpoint": {
    "sm":  { "$value": "640px", "$type": "dimension" },
    "md":  { "$value": "768px", "$type": "dimension" },
    "lg":  { "$value": "1024px", "$type": "dimension" },
    "xl":  { "$value": "1280px", "$type": "dimension" },
    "2xl": { "$value": "1536px", "$type": "dimension" }
  }
}
```

- [ ] **Step 5: Create semantic tokens**

Create `packages/tokens/src/semantic.json` (section 6.2 semantic mapping):

```json
{
  "color": {
    "primary":            { "$value": "{color.blue.600}" },
    "primary-foreground": { "$value": "{color.neutral.0}" },
    "background":         { "$value": "{color.neutral.0}" },
    "foreground":         { "$value": "{color.neutral.950}" },
    "muted":              { "$value": "{color.neutral.100}" },
    "muted-foreground":   { "$value": "{color.neutral.600}" },
    "card":               { "$value": "{color.neutral.0}" },
    "card-foreground":    { "$value": "{color.neutral.950}" },
    "border":             { "$value": "{color.neutral.200}" },
    "ring":               { "$value": "{color.blue.600}" },
    "destructive":            { "$value": "oklch(0.577 0.245 27.33)" },
    "destructive-foreground": { "$value": "{color.neutral.0}" },
    "success":                { "$value": "oklch(0.517 0.176 149.57)" },
    "success-foreground":     { "$value": "{color.neutral.0}" },
    "warning":                { "$value": "oklch(0.681 0.162 75.83)" },
    "warning-foreground":     { "$value": "{color.neutral.950}" }
  }
}
```

- [ ] **Step 6: Install deps and commit**

```bash
pnpm install
git add packages/tokens/
git commit -m "feat(tokens): add token package with primitive and semantic source files"
```

---

### Task 3: @weiui/tokens — Build Pipeline

**Files:**
- Create: `packages/tokens/src/types.ts`
- Create: `packages/tokens/src/flatten.ts`
- Create: `packages/tokens/src/resolve.ts`
- Create: `packages/tokens/src/generate-css.ts`
- Create: `packages/tokens/src/generate-ts.ts`
- Create: `packages/tokens/scripts/build.ts`
- Create: `packages/tokens/vitest.config.ts`
- Create: `packages/tokens/src/__tests__/flatten.test.ts`
- Create: `packages/tokens/src/__tests__/resolve.test.ts`
- Create: `packages/tokens/src/__tests__/generate-css.test.ts`

- [ ] **Step 1: Create token types**

```typescript
// packages/tokens/src/types.ts

export interface DesignToken {
  $value: string | number;
  $type?: string;
  $description?: string;
  $extensions?: Record<string, unknown>;
}

export type TokenGroup = {
  [key: string]: TokenGroup | DesignToken;
};

export interface FlatToken {
  path: string[];
  token: DesignToken;
}

export function isDesignToken(node: unknown): node is DesignToken {
  return typeof node === "object" && node !== null && "$value" in node;
}
```

- [ ] **Step 2: Write failing test for flatten**

```typescript
// packages/tokens/src/__tests__/flatten.test.ts
import { describe, it, expect } from "vitest";
import { flatten } from "../flatten";

describe("flatten", () => {
  it("flattens a nested token tree into path-value pairs", () => {
    const tree = {
      color: {
        blue: {
          500: { $value: "oklch(0.623 0.214 262)", $type: "color" },
        },
      },
    };
    const result = flatten(tree);
    expect(result).toHaveLength(1);
    expect(result[0].path).toEqual(["color", "blue", "500"]);
    expect(result[0].token.$value).toBe("oklch(0.623 0.214 262)");
  });

  it("skips keys starting with $", () => {
    const tree = {
      $description: "Top level",
      color: {
        primary: { $value: "blue", $type: "color" },
      },
    };
    const result = flatten(tree);
    expect(result).toHaveLength(1);
    expect(result[0].path).toEqual(["color", "primary"]);
  });

  it("handles multiple levels of nesting", () => {
    const tree = {
      font: {
        size: {
          xs: { $value: "12px", $type: "dimension" },
          sm: { $value: "14px", $type: "dimension" },
        },
      },
    };
    const result = flatten(tree);
    expect(result).toHaveLength(2);
  });
});
```

Create vitest config:

```typescript
// packages/tokens/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd packages/tokens && pnpm vitest run
```

Expected: FAIL — `flatten` module not found.

- [ ] **Step 4: Implement flatten**

```typescript
// packages/tokens/src/flatten.ts
import { type TokenGroup, type FlatToken, isDesignToken } from "./types";

export function flatten(group: TokenGroup, prefix: string[] = []): FlatToken[] {
  const result: FlatToken[] = [];

  for (const [key, value] of Object.entries(group)) {
    if (key.startsWith("$")) continue;

    const currentPath = [...prefix, key];

    if (isDesignToken(value)) {
      result.push({ path: currentPath, token: value });
    } else if (typeof value === "object" && value !== null) {
      result.push(...flatten(value as TokenGroup, currentPath));
    }
  }

  return result;
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd packages/tokens && pnpm vitest run
```

Expected: all flatten tests PASS.

- [ ] **Step 6: Write failing test for resolve**

```typescript
// packages/tokens/src/__tests__/resolve.test.ts
import { describe, it, expect } from "vitest";
import { resolveReferences } from "../resolve";
import type { FlatToken } from "../types";

describe("resolveReferences", () => {
  it("resolves a simple reference", () => {
    const tokens: FlatToken[] = [
      { path: ["color", "blue", "600"], token: { $value: "oklch(0.546 0.245 263)" } },
      { path: ["color", "primary"], token: { $value: "{color.blue.600}" } },
    ];
    const resolved = resolveReferences(tokens);
    const primary = resolved.find((t) => t.path.join(".") === "color.primary");
    expect(primary?.token.$value).toBe("oklch(0.546 0.245 263)");
  });

  it("resolves chained references", () => {
    const tokens: FlatToken[] = [
      { path: ["color", "blue", "600"], token: { $value: "oklch(0.546 0.245 263)" } },
      { path: ["color", "primary"], token: { $value: "{color.blue.600}" } },
      { path: ["color", "ring"], token: { $value: "{color.primary}" } },
    ];
    const resolved = resolveReferences(tokens);
    const ring = resolved.find((t) => t.path.join(".") === "color.ring");
    expect(ring?.token.$value).toBe("oklch(0.546 0.245 263)");
  });

  it("throws on unresolved reference", () => {
    const tokens: FlatToken[] = [
      { path: ["color", "primary"], token: { $value: "{color.nonexistent}" } },
    ];
    expect(() => resolveReferences(tokens)).toThrow("Unresolved reference");
  });

  it("leaves non-reference values unchanged", () => {
    const tokens: FlatToken[] = [
      { path: ["spacing", "4"], token: { $value: "16px" } },
    ];
    const resolved = resolveReferences(tokens);
    expect(resolved[0].token.$value).toBe("16px");
  });
});
```

- [ ] **Step 7: Implement resolve**

```typescript
// packages/tokens/src/resolve.ts
import type { FlatToken } from "./types";

const REF_PATTERN = /^\{(.+)\}$/;

export function resolveReferences(tokens: FlatToken[]): FlatToken[] {
  const lookup = new Map<string, FlatToken>();
  for (const t of tokens) {
    lookup.set(t.path.join("."), t);
  }

  return tokens.map((t) => ({
    path: t.path,
    token: {
      ...t.token,
      $value: resolveValue(t.token.$value, lookup, new Set()),
    },
  }));
}

function resolveValue(
  value: string | number,
  lookup: Map<string, FlatToken>,
  seen: Set<string>,
): string | number {
  if (typeof value !== "string") return value;

  const match = value.match(REF_PATTERN);
  if (!match) return value;

  const refPath = match[1];
  if (seen.has(refPath)) {
    throw new Error(`Circular reference detected: ${refPath}`);
  }

  const target = lookup.get(refPath);
  if (!target) {
    throw new Error(`Unresolved reference: ${value}`);
  }

  seen.add(refPath);
  return resolveValue(target.token.$value, lookup, seen);
}
```

- [ ] **Step 8: Run tests to verify resolve passes**

```bash
cd packages/tokens && pnpm vitest run
```

Expected: all tests PASS.

- [ ] **Step 9: Write failing test for CSS generation**

```typescript
// packages/tokens/src/__tests__/generate-css.test.ts
import { describe, it, expect } from "vitest";
import { generateCss, pathToCssVar } from "../generate-css";
import type { FlatToken } from "../types";

describe("pathToCssVar", () => {
  it("converts token path to CSS custom property name", () => {
    expect(pathToCssVar(["color", "primary"])).toBe("--wui-color-primary");
    expect(pathToCssVar(["font", "size", "base"])).toBe("--wui-font-size-base");
    expect(pathToCssVar(["spacing", "2.5"])).toBe("--wui-spacing-2\\.5");
  });
});

describe("generateCss", () => {
  it("generates CSS with @layer and :root", () => {
    const tokens: FlatToken[] = [
      { path: ["color", "primary"], token: { $value: "oklch(0.546 0.245 263)" } },
      { path: ["spacing", "4"], token: { $value: "16px" } },
    ];
    const css = generateCss(tokens);
    expect(css).toContain("@layer wui-tokens");
    expect(css).toContain(":root");
    expect(css).toContain("--wui-color-primary: oklch(0.546 0.245 263)");
    expect(css).toContain("--wui-spacing-4: 16px");
  });
});
```

- [ ] **Step 10: Implement CSS generator**

```typescript
// packages/tokens/src/generate-css.ts
import type { FlatToken } from "./types";

export function pathToCssVar(path: string[]): string {
  const name = path.join("-").replace(/\./g, "\\.");
  return `--wui-${name}`;
}

export function generateCss(tokens: FlatToken[]): string {
  const lines: string[] = [
    "@layer wui-tokens {",
    "  :root {",
  ];

  for (const { path, token } of tokens) {
    lines.push(`    ${pathToCssVar(path)}: ${token.$value};`);
  }

  lines.push("  }");
  lines.push("}");
  lines.push("");

  return lines.join("\n");
}

export function generateDarkCss(tokens: FlatToken[]): string {
  const lines: string[] = [
    "@layer wui-tokens {",
    "  .dark {",
  ];

  for (const { path, token } of tokens) {
    lines.push(`    ${pathToCssVar(path)}: ${token.$value};`);
  }

  lines.push("  }");
  lines.push("}");
  lines.push("");

  return lines.join("\n");
}
```

- [ ] **Step 11: Run tests to verify CSS generation passes**

```bash
cd packages/tokens && pnpm vitest run
```

Expected: all tests PASS.

- [ ] **Step 12: Implement TypeScript constant generator**

```typescript
// packages/tokens/src/generate-ts.ts
import type { FlatToken } from "./types";
import { pathToCssVar } from "./generate-css";

export function pathToTsName(path: string[]): string {
  return path
    .join("_")
    .replace(/[.-]/g, "_")
    .toUpperCase();
}

export function generateTs(tokens: FlatToken[]): string {
  const lines: string[] = [
    "// Auto-generated by @weiui/tokens — do not edit",
    "",
  ];

  for (const { path } of tokens) {
    const name = pathToTsName(path);
    const cssVar = pathToCssVar(path);
    lines.push(`export const ${name} = "var(${cssVar})" as const;`);
  }

  lines.push("");
  return lines.join("\n");
}
```

- [ ] **Step 13: Write the build script**

```typescript
// packages/tokens/scripts/build.ts
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { flatten } from "../src/flatten";
import { resolveReferences } from "../src/resolve";
import { generateCss } from "../src/generate-css";
import { generateTs } from "../src/generate-ts";
import type { TokenGroup } from "../src/types";

const ROOT = dirname(import.meta.dirname);
const SRC = join(ROOT, "src");
const DIST = join(ROOT, "dist");

const primitiveFiles = [
  "primitives/color.json",
  "primitives/spacing.json",
  "primitives/typography.json",
  "primitives/shape.json",
  "primitives/motion.json",
  "primitives/z-index.json",
  "primitives/breakpoint.json",
];

const merged: TokenGroup = {};

for (const file of primitiveFiles) {
  const content = JSON.parse(readFileSync(join(SRC, file), "utf-8"));
  deepMerge(merged, content);
}

const semantic = JSON.parse(readFileSync(join(SRC, "semantic.json"), "utf-8"));
deepMerge(merged, semantic);

const flat = flatten(merged);
const resolved = resolveReferences(flat);

mkdirSync(DIST, { recursive: true });

writeFileSync(join(DIST, "tokens.css"), generateCss(resolved));
writeFileSync(join(DIST, "index.ts"), generateTs(resolved));
writeFileSync(
  join(DIST, "tokens.json"),
  JSON.stringify(
    Object.fromEntries(resolved.map((t) => [t.path.join("."), t.token.$value])),
    null,
    2,
  ),
);

console.log(`Done — ${resolved.length} tokens generated`);
console.log(`  dist/tokens.css`);
console.log(`  dist/index.ts`);
console.log(`  dist/tokens.json`);

function deepMerge(target: TokenGroup, source: TokenGroup): void {
  for (const [key, value] of Object.entries(source)) {
    if (
      typeof value === "object" &&
      value !== null &&
      !("$value" in value) &&
      typeof target[key] === "object" &&
      target[key] !== null &&
      !("$value" in (target[key] as object))
    ) {
      deepMerge(target[key] as TokenGroup, value as TokenGroup);
    } else {
      target[key] = value;
    }
  }
}
```

- [ ] **Step 14: Run the build and verify output**

```bash
cd packages/tokens && pnpm build
head -20 dist/tokens.css
```

Expected: CSS file with `@layer wui-tokens { :root { --wui-color-neutral-0: oklch(1 0 0); ...`

- [ ] **Step 15: Commit**

```bash
git add packages/tokens/
git commit -m "feat(tokens): add build pipeline — JSON to CSS/TS/JSON generation"
```

---

### Task 4: @weiui/a11y — Contrast Validator

**Files:**
- Create: `packages/a11y/package.json`
- Create: `packages/a11y/tsconfig.json`
- Create: `packages/a11y/vitest.config.ts`
- Create: `packages/a11y/src/contrast.ts`
- Create: `packages/a11y/src/__tests__/contrast.test.ts`
- Create: `packages/a11y/src/index.ts`

- [ ] **Step 1: Create package scaffold**

```json
{
  "name": "@weiui/a11y",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts",
    "test": "vitest run"
  },
  "dependencies": { "colorjs.io": "^0.5" },
  "devDependencies": { "tsup": "^8.4", "vitest": "^3.1" }
}
```

```typescript
// packages/a11y/vitest.config.ts
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { include: ["src/**/*.test.ts"] } });
```

```json
// packages/a11y/tsconfig.json
{ "extends": "../../tsconfig.base.json", "compilerOptions": { "outDir": "dist", "rootDir": "src" }, "include": ["src/**/*"] }
```

- [ ] **Step 2: Write failing contrast tests**

```typescript
// packages/a11y/src/__tests__/contrast.test.ts
import { describe, it, expect } from "vitest";
import { getContrastRatio, validateContrastAAA } from "../contrast";

describe("getContrastRatio", () => {
  it("returns 21:1 for black on white", () => {
    const ratio = getContrastRatio("oklch(0 0 0)", "oklch(1 0 0)");
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("returns 1:1 for same color", () => {
    const ratio = getContrastRatio("oklch(0.5 0.1 250)", "oklch(0.5 0.1 250)");
    expect(ratio).toBeCloseTo(1, 0);
  });
});

describe("validateContrastAAA", () => {
  it("passes for black text on white background (21:1)", () => {
    const result = validateContrastAAA("oklch(0 0 0)", "oklch(1 0 0)");
    expect(result.passes).toBe(true);
    expect(result.required).toBe(7);
  });

  it("fails for low-contrast pair", () => {
    const result = validateContrastAAA("oklch(0.707 0.015 240)", "oklch(1 0 0)");
    expect(result.passes).toBe(false);
  });

  it("uses 4.5:1 threshold for large text", () => {
    const result = validateContrastAAA("oklch(0.707 0.015 240)", "oklch(1 0 0)", true);
    expect(result.ratio).toBeGreaterThan(3);
  });

  it("passes for neutral.600 on white (AAA for normal text)", () => {
    const result = validateContrastAAA("oklch(0.446 0.018 240)", "oklch(1 0 0)");
    expect(result.passes).toBe(true);
    expect(result.ratio).toBeGreaterThanOrEqual(7);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd packages/a11y && pnpm install && pnpm vitest run
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement contrast validator**

```typescript
// packages/a11y/src/contrast.ts
import Color from "colorjs.io";

export function getContrastRatio(fg: string, bg: string): number {
  const fgColor = new Color(fg);
  const bgColor = new Color(bg);
  const fgLum = fgColor.luminance;
  const bgLum = bgColor.luminance;
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
}

export function validateContrastAAA(
  fg: string,
  bg: string,
  isLargeText = false,
): { passes: boolean; ratio: number; required: number } {
  const ratio = getContrastRatio(fg, bg);
  const required = isLargeText ? 4.5 : 7.0;
  return { passes: ratio >= required, ratio, required };
}
```

```typescript
// packages/a11y/src/index.ts
export { getContrastRatio, validateContrastAAA } from "./contrast";
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd packages/a11y && pnpm vitest run
```

Expected: all contrast tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/a11y/
git commit -m "feat(a11y): add WCAG AAA contrast ratio validator using colorjs.io"
```

---

### Task 5: Token Validation Integration

**Files:**
- Create: `packages/tokens/src/validate.ts`
- Create: `packages/tokens/src/__tests__/validate.test.ts`
- Create: `packages/tokens/scripts/validate.ts`

- [ ] **Step 1: Write failing validation test**

```typescript
// packages/tokens/src/__tests__/validate.test.ts
import { describe, it, expect } from "vitest";
import { findContrastPairs, validateTokenContrast } from "../validate";
import type { FlatToken } from "../types";

describe("findContrastPairs", () => {
  it("pairs foreground tokens with their background", () => {
    const tokens: FlatToken[] = [
      { path: ["color", "primary"], token: { $value: "oklch(0.546 0.245 263)" } },
      { path: ["color", "primary-foreground"], token: { $value: "oklch(1 0 0)" } },
    ];
    const pairs = findContrastPairs(tokens);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].fg.path).toEqual(["color", "primary-foreground"]);
    expect(pairs[0].bg.path).toEqual(["color", "primary"]);
  });
});

describe("validateTokenContrast", () => {
  it("passes for high-contrast pairs", () => {
    const tokens: FlatToken[] = [
      { path: ["color", "primary"], token: { $value: "oklch(0.546 0.245 263)" } },
      { path: ["color", "primary-foreground"], token: { $value: "oklch(1 0 0)" } },
    ];
    const results = validateTokenContrast(tokens);
    expect(results.every((r) => r.passes)).toBe(true);
  });

  it("fails for low-contrast pairs", () => {
    const tokens: FlatToken[] = [
      { path: ["color", "bad"], token: { $value: "oklch(0.7 0.01 240)" } },
      { path: ["color", "bad-foreground"], token: { $value: "oklch(0.8 0.01 240)" } },
    ];
    const results = validateTokenContrast(tokens);
    expect(results.some((r) => !r.passes)).toBe(true);
  });
});
```

- [ ] **Step 2: Implement validation**

```typescript
// packages/tokens/src/validate.ts
import type { FlatToken } from "./types";
import { getContrastRatio } from "@weiui/a11y";

export interface ContrastPair {
  fg: FlatToken;
  bg: FlatToken;
}

export interface ContrastResult {
  fg: string;
  bg: string;
  ratio: number;
  required: number;
  passes: boolean;
}

export function findContrastPairs(tokens: FlatToken[]): ContrastPair[] {
  const pairs: ContrastPair[] = [];
  const lookup = new Map(tokens.map((t) => [t.path.join("."), t]));

  for (const token of tokens) {
    const key = token.path.join(".");
    if (key.endsWith("-foreground")) {
      const bgKey = key.replace(/-foreground$/, "");
      const bg = lookup.get(bgKey);
      if (bg) {
        pairs.push({ fg: token, bg });
      }
    }
  }

  return pairs;
}

export function validateTokenContrast(tokens: FlatToken[]): ContrastResult[] {
  const pairs = findContrastPairs(tokens);

  return pairs.map(({ fg, bg }) => {
    const fgValue = String(fg.token.$value);
    const bgValue = String(bg.token.$value);
    const ratio = getContrastRatio(fgValue, bgValue);
    const required = 7.0;
    return {
      fg: fg.path.join("."),
      bg: bg.path.join("."),
      ratio,
      required,
      passes: ratio >= required,
    };
  });
}
```

- [ ] **Step 3: Run tests**

```bash
cd packages/tokens && pnpm vitest run
```

Expected: all tests PASS.

- [ ] **Step 4: Create validate CLI script**

```typescript
// packages/tokens/scripts/validate.ts
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { flatten } from "../src/flatten";
import { resolveReferences } from "../src/resolve";
import { validateTokenContrast } from "../src/validate";
import type { TokenGroup } from "../src/types";

// Load tokens — same logic as build.ts (extract shared loader if desired)
const ROOT = dirname(import.meta.dirname);
const SRC = join(ROOT, "src");
const files = [
  "primitives/color.json", "primitives/spacing.json", "primitives/typography.json",
  "primitives/shape.json", "primitives/motion.json", "primitives/z-index.json",
  "primitives/breakpoint.json",
];
const merged: TokenGroup = {};
for (const f of files) {
  Object.assign(merged, JSON.parse(readFileSync(join(SRC, f), "utf-8")));
}
Object.assign(merged, JSON.parse(readFileSync(join(SRC, "semantic.json"), "utf-8")));

const flat = flatten(merged);
const resolved = resolveReferences(flat);
const results = validateTokenContrast(resolved);

let failed = false;
for (const r of results) {
  const icon = r.passes ? "PASS" : "FAIL";
  console.log(`[${icon}] ${r.fg} on ${r.bg}: ${r.ratio.toFixed(2)}:1 (need ${r.required}:1)`);
  if (!r.passes) failed = true;
}

if (failed) {
  console.error("\nWCAG AAA contrast validation FAILED");
  process.exit(1);
} else {
  console.log(`\nAll ${results.length} contrast pairs pass WCAG AAA (7:1)`);
}
```

- [ ] **Step 5: Run validate and verify**

```bash
cd packages/tokens && pnpm validate
```

Expected: `All N contrast pairs pass WCAG AAA (7:1)`.

- [ ] **Step 6: Commit**

```bash
git add packages/tokens/
git commit -m "feat(tokens): add AAA contrast validation for foreground/background pairs"
```

---

### Task 6: Dark Mode Token Generation

**Files:**
- Create: `packages/tokens/src/dark-mode.ts`
- Create: `packages/tokens/src/__tests__/dark-mode.test.ts`
- Modify: `packages/tokens/scripts/build.ts`

- [ ] **Step 1: Write failing dark mode test**

```typescript
// packages/tokens/src/__tests__/dark-mode.test.ts
import { describe, it, expect } from "vitest";
import { generateDarkTokens } from "../dark-mode";
import type { FlatToken } from "../types";

describe("generateDarkTokens", () => {
  it("produces dark overrides for semantic color tokens", () => {
    const tokens: FlatToken[] = [
      { path: ["color", "background"], token: { $value: "oklch(1 0 0)" } },
      { path: ["color", "foreground"], token: { $value: "oklch(0.145 0.010 240)" } },
    ];
    const dark = generateDarkTokens(tokens);
    const bg = dark.find((t) => t.path.join(".") === "color.background");
    expect(bg).toBeDefined();
    expect(bg!.token.$value).not.toBe("oklch(1 0 0)");
  });
});
```

- [ ] **Step 2: Implement dark mode generator**

```typescript
// packages/tokens/src/dark-mode.ts
import type { FlatToken } from "./types";

const DARK_OVERRIDES: Record<string, string> = {
  "color.background":         "oklch(0.145 0.010 240)",
  "color.foreground":         "oklch(0.985 0.002 240)",
  "color.card":               "oklch(0.208 0.012 240)",
  "color.card-foreground":    "oklch(0.985 0.002 240)",
  "color.muted":              "oklch(0.279 0.015 240)",
  "color.muted-foreground":   "oklch(0.707 0.015 240)",
  "color.border":             "oklch(0.372 0.017 240)",
  "color.primary":            "oklch(0.623 0.214 262)",
  "color.primary-foreground": "oklch(0.145 0.010 240)",
  "color.ring":               "oklch(0.623 0.214 262)",
};

export function generateDarkTokens(tokens: FlatToken[]): FlatToken[] {
  const semanticColors = tokens.filter(
    (t) => t.path[0] === "color" && t.path.length === 2,
  );

  return semanticColors
    .filter((t) => DARK_OVERRIDES[t.path.join(".")])
    .map((t) => ({
      path: t.path,
      token: { ...t.token, $value: DARK_OVERRIDES[t.path.join(".")]! },
    }));
}
```

- [ ] **Step 3: Update build script to emit dark mode CSS**

Append to `scripts/build.ts` after light mode CSS write:

```typescript
import { generateDarkTokens } from "../src/dark-mode";
import { generateDarkCss } from "../src/generate-css";

const darkTokens = generateDarkTokens(resolved);
const darkCss = generateDarkCss(darkTokens);

// Append dark mode to tokens.css
const lightCss = readFileSync(join(DIST, "tokens.css"), "utf-8");
writeFileSync(join(DIST, "tokens.css"), lightCss + "\n" + darkCss);
```

- [ ] **Step 4: Build and verify dark output**

```bash
cd packages/tokens && pnpm build
grep ".dark" dist/tokens.css
```

Expected: `.dark { --wui-color-background: oklch(0.145 0.010 240); ...`

- [ ] **Step 5: Commit**

```bash
git add packages/tokens/
git commit -m "feat(tokens): add dark mode token generation with .dark class overrides"
```

---

### Task 7: @weiui/css — Package + Reset + Base + A11y Styles

**Files:**
- Create: `packages/css/package.json`
- Create: `packages/css/postcss.config.js`
- Create: `packages/css/src/index.css`
- Create: `packages/css/src/reset.css`
- Create: `packages/css/src/base.css`
- Create: `packages/css/src/a11y/focus.css`
- Create: `packages/css/src/a11y/sr-only.css`
- Create: `packages/css/src/a11y/motion.css`

- [ ] **Step 1: Create package scaffold**

```json
{
  "name": "@weiui/css",
  "version": "0.0.1",
  "exports": {
    ".": "./dist/weiui.css",
    "./weiui.css": "./dist/weiui.css",
    "./reset.css": "./dist/reset.css",
    "./elements/*": "./dist/elements/*"
  },
  "files": ["dist"],
  "scripts": {
    "build": "postcss src/index.css -o dist/weiui.css && lightningcss --minify dist/weiui.css -o dist/weiui.min.css"
  },
  "devDependencies": {
    "postcss": "^8.5",
    "postcss-cli": "^11.0",
    "postcss-import": "^16.1",
    "postcss-nesting": "^13.0",
    "lightningcss-cli": "^1.29"
  }
}
```

```javascript
// packages/css/postcss.config.js
module.exports = {
  plugins: [
    require("postcss-import"),
    require("postcss-nesting"),
  ],
};
```

- [ ] **Step 2: Create index.css with layer order + imports**

```css
/* packages/css/src/index.css */
@layer wui-reset, wui-tokens, wui-base, wui-elements, wui-utilities;

@import "./reset.css";
@import "./base.css";
@import "./a11y/focus.css";
@import "./a11y/sr-only.css";
@import "./a11y/motion.css";
```

- [ ] **Step 3: Create CSS reset**

```css
/* packages/css/src/reset.css */
@layer wui-reset {
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-text-size-adjust: 100%; tab-size: 4; line-height: 1.5; }
  body { line-height: inherit; -webkit-font-smoothing: antialiased; }
  img, picture, video, canvas, svg { display: block; max-width: 100%; }
  input, button, textarea, select { font: inherit; color: inherit; }
  p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }
  button { cursor: pointer; background: none; border: none; }
  a { color: inherit; text-decoration: inherit; }
  ul, ol { list-style: none; }
}
```

- [ ] **Step 4: Create base styles**

```css
/* packages/css/src/base.css */
@layer wui-base {
  body {
    font-family: var(--wui-font-family-sans);
    font-size: var(--wui-font-size-base);
    line-height: var(--wui-font-lineHeight-normal);
    color: var(--wui-color-foreground);
    background-color: var(--wui-color-background);
  }
  h1, h2, h3, h4, h5, h6 {
    font-weight: var(--wui-font-weight-semibold);
    line-height: var(--wui-font-lineHeight-tight);
    letter-spacing: var(--wui-font-letterSpacing-tight);
  }
  code, kbd, pre { font-family: var(--wui-font-family-mono); }
}
```

- [ ] **Step 5: Create a11y styles**

```css
/* packages/css/src/a11y/focus.css */
@layer wui-base {
  :where(button, a, input, select, textarea, [tabindex]):focus-visible {
    outline: 3px solid var(--wui-color-ring);
    outline-offset: 2px;
    border-radius: inherit;
  }
  @media (forced-colors: active) {
    :where(button, a, input, select, textarea, [tabindex]):focus-visible {
      outline: 3px solid Highlight;
    }
  }
}
```

```css
/* packages/css/src/a11y/sr-only.css */
@layer wui-utilities {
  .wui-sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;
  }
}
```

```css
/* packages/css/src/a11y/motion.css */
@layer wui-base {
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}
```

Note: The `!important` in motion.css is the single documented exception — forced motion reduction must override all animation declarations for safety.

- [ ] **Step 6: Build and verify**

```bash
cd packages/css && pnpm install && pnpm build
head -30 dist/weiui.css
```

- [ ] **Step 7: Commit**

```bash
git add packages/css/
git commit -m "feat(css): add CSS package with reset, base styles, and a11y utilities"
```

---

### Task 8: @weiui/css — Button Element

**Files:**
- Create: `packages/css/src/elements/button.css`
- Modify: `packages/css/src/index.css`

- [ ] **Step 1: Create button.css**

Full button CSS with all variants (solid, outline, ghost, soft, link), sizes (sm, md, lg, xl, icon), color modifiers (destructive), and states (disabled, loading). Uses logical properties, 44px minimum touch target, data-attribute states, motion-safe transitions. See `DESIGNSYSTEM-PLAN.md` section 14.2 for naming convention.

```css
/* packages/css/src/elements/button.css */
@layer wui-elements {
  .wui-button {
    display: inline-flex; align-items: center; justify-content: center; gap: var(--wui-spacing-2);
    font-family: inherit; font-weight: var(--wui-font-weight-medium);
    border-radius: var(--wui-shape-radius-md); cursor: pointer; user-select: none; white-space: nowrap;
    min-block-size: 44px; min-inline-size: 44px;
    padding-inline: var(--wui-spacing-4); padding-block: var(--wui-spacing-2);
    font-size: var(--wui-font-size-sm); line-height: var(--wui-font-lineHeight-normal);
    border: var(--wui-shape-border-width-medium) solid transparent;
  }
  .wui-button--sm { min-block-size: 36px; padding-inline: var(--wui-spacing-3); font-size: var(--wui-font-size-sm); border-radius: var(--wui-shape-radius-base); }
  .wui-button--lg { min-block-size: 48px; padding-inline: var(--wui-spacing-6); font-size: var(--wui-font-size-base); }
  .wui-button--xl { min-block-size: 56px; padding-inline: var(--wui-spacing-8); font-size: var(--wui-font-size-lg); border-radius: var(--wui-shape-radius-lg); }
  .wui-button--icon { min-block-size: 44px; min-inline-size: 44px; padding: 0; }

  .wui-button--solid { background-color: var(--wui-color-primary); color: var(--wui-color-primary-foreground); }
  .wui-button--solid:hover { filter: brightness(1.1); }
  .wui-button--solid:active { filter: brightness(0.95); transform: scale(0.98); }

  .wui-button--outline { background-color: transparent; border-color: var(--wui-color-primary); color: var(--wui-color-primary); }
  .wui-button--ghost { background-color: transparent; color: var(--wui-color-primary); }
  .wui-button--soft { background-color: oklch(from var(--wui-color-primary) l c h / 0.1); color: var(--wui-color-primary); }
  .wui-button--link { background-color: transparent; color: var(--wui-color-primary); text-decoration: underline; text-underline-offset: 4px; padding: 0; min-block-size: 0; min-inline-size: 0; }

  .wui-button--destructive.wui-button--solid { background-color: var(--wui-color-destructive); color: var(--wui-color-destructive-foreground); }
  .wui-button--destructive.wui-button--outline { border-color: var(--wui-color-destructive); color: var(--wui-color-destructive); }

  .wui-button[data-disabled] { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
  .wui-button[data-loading] { position: relative; cursor: wait; }

  @media (prefers-reduced-motion: no-preference) {
    .wui-button { transition: background-color, border-color, color, filter, transform; transition-duration: var(--wui-motion-duration-fast); transition-timing-function: var(--wui-motion-easing-default); }
  }
}
```

- [ ] **Step 2: Add import, build, commit**

Add `@import "./elements/button.css";` to `packages/css/src/index.css`.

```bash
cd packages/css && pnpm build
git add packages/css/
git commit -m "feat(css): add Button element with solid/outline/ghost/soft/link variants"
```

---

### Task 9: @weiui/css — Input Element

**Files:**
- Create: `packages/css/src/elements/input.css`
- Modify: `packages/css/src/index.css`

- [ ] **Step 1: Create input.css**

```css
@layer wui-elements {
  .wui-input {
    display: flex; align-items: center; inline-size: 100%; min-block-size: 44px;
    padding-inline: var(--wui-spacing-3); padding-block: var(--wui-spacing-2);
    font-size: var(--wui-font-size-sm); color: var(--wui-color-foreground);
    background-color: var(--wui-color-background);
    border: var(--wui-shape-border-width-thin) solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-md);
  }
  .wui-input::placeholder { color: var(--wui-color-muted-foreground); }
  .wui-input:hover { border-color: var(--wui-color-primary); }
  .wui-input:focus-within { border-color: var(--wui-color-ring); outline: 2px solid var(--wui-color-ring); outline-offset: 0; }
  .wui-input[data-invalid], .wui-input:invalid { border-color: var(--wui-color-destructive); }
  .wui-input[data-disabled], .wui-input:disabled { opacity: 0.5; cursor: not-allowed; background-color: var(--wui-color-muted); }
  .wui-input[data-readonly], .wui-input[readonly] { background-color: var(--wui-color-muted); }
  .wui-input--sm { min-block-size: 36px; padding-inline: var(--wui-spacing-2); font-size: var(--wui-font-size-xs); }
  .wui-input--lg { min-block-size: 48px; padding-inline: var(--wui-spacing-4); font-size: var(--wui-font-size-base); }
  textarea.wui-input { min-block-size: 80px; resize: vertical; }
  @media (prefers-reduced-motion: no-preference) {
    .wui-input { transition: border-color, outline-color; transition-duration: var(--wui-motion-duration-fast); }
  }
}
```

- [ ] **Step 2: Add import, build, commit**

```bash
git add packages/css/ && git commit -m "feat(css): add Input element with validation states and sizes"
```

---

### Task 10: @weiui/css — Badge, Card, Avatar, Skeleton

**Files:**
- Create: `packages/css/src/elements/badge.css`
- Create: `packages/css/src/elements/card.css`
- Create: `packages/css/src/elements/avatar.css`
- Create: `packages/css/src/elements/skeleton.css`
- Modify: `packages/css/src/index.css`

Each element follows the same pattern: `@layer wui-elements`, `wui-` prefix, BEM naming, data-attribute states, logical properties, motion-safe animations. See spec sections 14.2 (naming) and 20 (state matrix).

- [ ] **Step 1: Create badge.css** — solid/soft/outline variants, destructive/success/warning colors, full-radius pill shape.

- [ ] **Step 2: Create card.css** — header/content/footer compound, `container-type: inline-size`, container query for small widths, `wui-shadow-sm`.

- [ ] **Step 3: Create avatar.css** — sm/md/lg/xl sizes, image + fallback, circular via `radius-full`.

- [ ] **Step 4: Create skeleton.css** — pulse animation behind `prefers-reduced-motion: no-preference`, text/circle variants.

- [ ] **Step 5: Add all imports, build, commit**

```bash
git add packages/css/ && git commit -m "feat(css): add Badge, Card, Avatar, and Skeleton elements"
```

---

### Task 11: @weiui/cli — Package + Commands

**Files:**
- Create: `packages/cli/package.json`
- Create: `packages/cli/src/index.ts`
- Create: `packages/cli/src/commands/init.ts`
- Create: `packages/cli/src/commands/tokens-build.ts`
- Create: `packages/cli/src/commands/tokens-validate.ts`

- [ ] **Step 1: Create package with commander**

```json
{
  "name": "@weiui/cli",
  "version": "0.0.1",
  "type": "module",
  "bin": { "weiui": "./dist/index.js" },
  "scripts": { "build": "tsup src/index.ts --format esm --dts --shims" },
  "dependencies": { "commander": "^13.1" },
  "devDependencies": { "tsup": "^8.4" }
}
```

- [ ] **Step 2: Create CLI entry with commander program**

```typescript
#!/usr/bin/env node
import { program } from "commander";
import { initCommand } from "./commands/init";
import { tokensBuildCommand } from "./commands/tokens-build";
import { tokensValidateCommand } from "./commands/tokens-validate";

program.name("weiui").description("WeiUI Design System CLI").version("0.0.1");
program.addCommand(initCommand);
const tokens = program.command("tokens").description("Manage design tokens");
tokens.addCommand(tokensBuildCommand);
tokens.addCommand(tokensValidateCommand);
program.parse();
```

- [ ] **Step 3: Implement init command** — creates `weiui.config.json` with token paths and output config, prints next steps.

- [ ] **Step 4: Implement tokens build/validate commands** — uses `execFileSync("pnpm", ["--filter", "@weiui/tokens", "build"])` to delegate to the token package safely (no shell injection).

- [ ] **Step 5: Build and commit**

```bash
git add packages/cli/ && git commit -m "feat(cli): add CLI with init, tokens build, and tokens validate commands"
```

---

### Task 12: Documentation Site Scaffold

**Files:**
- Create: `apps/docs/package.json`
- Create: `apps/docs/next.config.ts`
- Create: `apps/docs/src/app/layout.tsx`
- Create: `apps/docs/src/app/page.tsx`
- Create: `apps/docs/src/app/docs/layout.tsx`
- Create: `apps/docs/src/app/docs/getting-started/page.mdx`

- [ ] **Step 1: Create Next.js 16 app** with MDX support, `@weiui/css` and `@weiui/tokens` as workspace deps.

- [ ] **Step 2: Create root layout** importing `@weiui/tokens/tokens.css` and `@weiui/css/weiui.css`.

- [ ] **Step 3: Create landing page** with heading, description, and two WeiUI button links (Get Started, Components).

- [ ] **Step 4: Create docs layout** with sidebar navigation and main content area.

- [ ] **Step 5: Create getting-started MDX page** with installation instructions and first component example.

- [ ] **Step 6: Verify dev server starts and renders**, then commit.

```bash
git add apps/docs/ && git commit -m "feat(docs): scaffold Next.js 16 documentation site with MDX"
```

---

## Phase 2: Headless Layer

> All Phase 2 tasks follow TDD. Each headless hook/component gets: failing test → implementation → passing test → commit. Tests use `@testing-library/react` + `@testing-library/user-event` with jsdom. Key interfaces and test patterns shown below.

### Task 13: @weiui/headless — Package Scaffold + Core Utilities

Package scaffold with React 19 peer dep, `@floating-ui/react` dep, testing-library dev deps. Core utilities: `Keys` constant object, `announce()` live region helper, `getFocusableElements()` DOM utility.

**Commit:** `feat(headless): scaffold headless package with core utilities`

### Task 14: useControllable + useId

`useControllable<T>({ value?, defaultValue, onChange? })` — shared controlled/uncontrolled hook. `useId(prefix?)` — wraps React's `useId()` with optional prefix for readable IDs.

**Commit:** `feat(headless): add useControllable and useId hooks`

### Task 15: useDisclosure + useToggle

`useDisclosure({ defaultOpen?, open?, onOpenChange? })` returns `{ isOpen, onOpen, onClose, onToggle, getDisclosureProps, getContentProps }`. `useToggle` is a simpler boolean version.

**Commit:** `feat(headless): add useDisclosure and useToggle hooks`

### Task 16: useFocusTrap + useOutsideClick + useKeyboardNav

`useFocusTrap(ref, active)` — traps Tab within container. `useOutsideClick(ref, handler, active)` — fires handler on outside click. `useKeyboardNav({ items, orientation, loop })` — roving tabindex with arrow keys.

**Commit:** `feat(headless): add focus management and keyboard navigation hooks`

### Task 17: Dialog (hook + compound component)

Compound: `Dialog`, `Dialog.Trigger`, `Dialog.Content`, `Dialog.Title`, `Dialog.Description`, `Dialog.Close`. Focus trap, Escape to close, `aria-modal`, scroll lock, return focus to trigger. Full a11y test suite.

**Commit:** `feat(headless): add Dialog compound component with focus trap and a11y`

### Task 18: Menu (hook + compound component)

Compound: `Menu`, `Menu.Trigger`, `Menu.Content`, `Menu.Item`, `Menu.Separator`. Arrow navigation, typeahead, `aria-expanded`, roving tabindex, outside click to close.

**Commit:** `feat(headless): add Menu compound component with keyboard navigation`

### Task 19: Select / Listbox (hook + compound component)

Compound: `Select`, `Select.Trigger`, `Select.Value`, `Select.Content`, `Select.Item`. Arrow navigation, Enter/Space select, Escape close, typeahead, live region announcement, controlled/uncontrolled.

**Commit:** `feat(headless): add Select/Listbox compound component`

### Task 20: Tabs + Accordion

Tabs: `Tabs`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`. Arrow left/right, `aria-selected`, automatic activation mode.
Accordion: `Accordion`, `Accordion.Item`, `Accordion.Trigger`, `Accordion.Content`. Arrow up/down, Enter/Space toggle, single/multi expand.

**Commit:** `feat(headless): add Tabs and Accordion compound components`

### Task 21: Tooltip + Popover

Tooltip: shows on hover/focus, `role="tooltip"`, `aria-describedby`, delay, `@floating-ui` positioning.
Popover: shows on click, focus trap, Escape to close, `@floating-ui` positioning.

**Commit:** `feat(headless): add Tooltip and Popover compound components`

### Task 22: Combobox

Compound: `Combobox`, `Combobox.Input`, `Combobox.Content`, `Combobox.Item`, `Combobox.Empty`. Text input + listbox, `aria-autocomplete`, `aria-activedescendant`, `useReducer` state, filtering callback, live region for result count.

**Commit:** `feat(headless): add Combobox compound component with typeahead filtering`

---

## Phase 3: Styled Components (React)

> Each styled component: `forwardRef` + headless hook + `tailwind-variants` + a11y test (axe-core AAA) + unit test. Components marked `"use client"` only when they use React hooks.

### Task 23: @weiui/react — Package Scaffold + WeiUIProvider

Package scaffold with `@weiui/headless` and `@weiui/css` deps, `tailwind-variants` and `tailwind-merge` deps. `WeiUIProvider` context with locale object. `cn()` utility wrapping `twMerge`.

**Commit:** `feat(react): scaffold React package with WeiUIProvider and cn utility`

### Task 24: Variant System Setup

Create variant definitions in `packages/react/src/variants/` using `tailwind-variants`. Button variants as the reference implementation (spec section 8.3). Establish the pattern all components follow.

**Commit:** `feat(react): add tailwind-variants setup with Button variant definition`

### Task 25: Button + Input + Textarea

Styled wrappers using headless hooks. Button: all variants/sizes/colors from spec. Input/Textarea: validation states, sizes, controlled/uncontrolled. Each gets unit test + a11y test.

**Commit:** `feat(react): add Button, Input, and Textarea styled components`

### Task 26: Select + Checkbox + Switch + Radio

Select wraps headless Select. Checkbox/Switch/Radio are form components with controlled/uncontrolled support, proper aria attributes.

**Commit:** `feat(react): add Select, Checkbox, Switch, and RadioGroup components`

### Task 27: Layout Components

Container, Stack, Grid, Divider, Spacer, AspectRatio. Server-component safe. Stack/Grid accept responsive prop objects: `{ base: "column", md: "row" }`.

**Commit:** `feat(react): add layout components`

### Task 28: Data Display Components

Card, Badge, Avatar, Table, Code, Kbd, Chip, List, Skeleton, Timeline. Most server-safe. Table uses compound pattern. Each component has `.Skeleton` loading variant.

**Commit:** `feat(react): add data display components`

### Task 29: Overlay Components

Dialog, Drawer, Popover, Tooltip, Dropdown. Styled wrappers on headless overlays. Enter/exit animations behind `prefers-reduced-motion`. `@floating-ui` positioning.

**Commit:** `feat(react): add overlay components`

### Task 30: Feedback Components

Alert (info/success/warning/destructive), Toast (queue system, auto-dismiss, pause-on-hover), Spinner, CircularProgress, LinearProgress, EmptyState.

**Commit:** `feat(react): add feedback components`

### Task 31: Navigation Components

Tabs, Menu, Breadcrumb, Pagination, Stepper, Link. Styled wrappers on headless Tabs/Menu.

**Commit:** `feat(react): add navigation components`

### Task 32: Typography + Utility Components

Heading (level prop), Text (color/size/weight), Label, Blockquote — server-safe. FocusTrap, Portal, ScrollArea, VisuallyHidden — client components.

**Commit:** `feat(react): add typography and utility components`

### Task 33: Complex Components + Field Wrapper

DatePicker, ColorPicker, NumberInput, PinInput, Slider — all use `useReducer`. Field compound component auto-wires `htmlFor`, `aria-describedby`, `aria-invalid`, `aria-required`.

**Commit:** `feat(react): add complex components and Field wrapper`

---

## Phase 4: Polish & Documentation

### Task 34: @weiui/icons Package

SVG source files (24x24 grid) → SVGO optimization → React components with `forwardRef` → build script. Each icon < 0.5 KB gzipped. Icon browser on docs site.

**Commit:** `feat(icons): add icon package with SVG to React build pipeline`

### Task 35: Documentation Site — Component Pages

MDX pages for every component following spec section 10.2: Overview, Quick Start, Examples (live preview), API Reference (auto-generated props table), Variants, Accessibility notes, Three-layer tabs (CSS / Headless / Styled). Create `ComponentPreview`, `PropsTable`, `A11yBadge`, `CodeBlock` doc components.

**Commit:** `feat(docs): add component documentation pages with live previews`

### Task 36: Component Playground

Interactive sandbox at `/playground`. Select component → modify props via UI controls → see live preview + generated code. Similar to Storybook controls but built into the docs site.

**Commit:** `feat(docs): add interactive component playground`

### Task 37: Visual Component Composer

Drag-and-drop page assembly tool at `/composer`. Component palette → canvas → props editor → code export (JSX + CSS-only HTML). Uses `@dnd-kit` for drag-and-drop. Component tree data structure, recursive code generation. See spec and plan architecture diagram for layout.

**Commit:** `feat(docs): add visual component composer with drag-and-drop and code export`

### Task 38: Theme Gallery + Builder

Visual theme builder at `/themes`. Pick primary color → generate full AAA-compliant token set → preview all components live → export as CSS or JSON. Uses `@weiui/a11y` to show pass/fail contrast badges for each generated pair.

**Commit:** `feat(docs): add theme gallery and visual theme builder`

### Task 39: Visual Regression Test Suite

Playwright screenshots: every component × all visual states × light/dark × LTR/RTL. Snapshot comparison in CI. Configurable threshold for pixel differences.

**Commit:** `test: add Playwright visual regression suite`

### Task 40: Comprehensive A11y Test Suite

axe-core AAA audit on every component documentation page. Keyboard navigation integration tests for all interactive components. RTL layout verification. Screen reader announcement tests.

**Commit:** `test: add comprehensive axe-core AAA audit for all component pages`

---

## Phase 5: Deploy & Publish

### Task 41: Changesets + npm Publish Pipeline

`@changesets/cli` for versioning. GitHub Action: on push to main with changesets → create "Version Packages" PR → on merge → publish to npm with `public` access. Semantic versioning per spec section 26.1.

**Commit:** `chore: add Changesets for versioning and npm publish pipeline`

### Task 42: GitHub Actions CI/CD

CI workflow: install → build all → test all → validate token contrast → check bundle sizes. Visual regression workflow: build docs → Playwright screenshots → compare → comment on PR.

**Commit:** `ci: add GitHub Actions for build, test, a11y audit, and visual regression`

### Task 43: Deploy Docs + Repository Setup

Deploy docs to ui.wei-dev.com. Repository setup: issue templates, discussion categories, CONTRIBUTING.md, branch protection, LICENSE.

**Commit:** `chore: deploy docs and finalize repository setup`

---

## Dependency Graph

```
Task 1 (monorepo) → Task 2 (token files) → Task 3 (build pipeline)
                                                    │
                    Task 4 (a11y contrast) ────────→ Task 5 (validation)
                                                          │
                                                          → Task 6 (dark mode)
                                                          │
Task 7 (CSS base) ←─────────────────────────────────────┘
    │
    ├→ Task 8 (CSS Button)
    ├→ Task 9 (CSS Input)      ← parallelizable
    └→ Task 10 (CSS Badge etc.)
              │
              → Task 11 (CLI) → Task 12 (Docs scaffold)
                                        │
                                        → Phase 2 (Tasks 13–22)
                                                │
                                                → Phase 3 (Tasks 23–33, parallel after 23-24)
                                                        │
                                                        → Phase 4 (Tasks 34–40, mostly parallel)
                                                                │
                                                                → Phase 5 (Tasks 41–43)
```

**Parallelization opportunities:**
- Phase 1: Tasks 8, 9, 10 can run in parallel after Task 7
- Phase 2: Tasks 18–22 can be parallelized after Tasks 13–17
- Phase 3: Tasks 25–33 can be parallelized after Tasks 23–24
- Phase 4: Tasks 34–40 are mostly independent
