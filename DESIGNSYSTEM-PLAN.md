# WeiUI — Design System & Component Library

> An accessibility-first, layered design system with three consumption tiers: CSS-only primitives, headless behavior hooks, and fully styled React components.
> Enforces WCAG AAA where architecturally possible. Designed for cross-team adoption — designers, static-site developers, and React engineers each get an appropriate integration point.

---

## 1. Business Case

### Why build a shared design system

Organizations without a shared design system pay a recurring tax:

| Problem | Cost |
|---------|------|
| **Inconsistent UI across products** | Brand dilution, user confusion, duplicated QA effort |
| **Accessibility as afterthought** | Legal exposure, remediation sprints, exclusion of users |
| **Designer–developer handoff friction** | Designers specify in Figma, developers reinterpret in code — drift compounds |
| **Duplicated component work** | Every team builds their own button, modal, select — differently |
| **Styling unmaintainable at scale** | Inline utility classes scattered across hundreds of files with no single source of truth |

### What WeiUI provides

- **Single source of truth** — design tokens flow from one JSON spec to CSS, TypeScript, Tailwind config, and Figma variables
- **WCAG AAA enforcement** — contrast, touch targets, focus indicators, and keyboard patterns validated at build time, not in code review
- **Three adoption tiers** — teams adopt at the level that fits: CSS-only, headless hooks, or fully styled React components
- **Designer contribution path** — designers modify tokens in Figma or JSON without touching component code
- **Incremental adoption** — existing products can start with `@weiui/css` (zero JS) and migrate to React components over time

---

## 2. The Problem

Every existing component library forces a tradeoff:

| Library | Strength | Weakness |
|---------|----------|----------|
| **shadcn/ui** | Ownership (copy-paste) | React-only, no centralized updates, designers can't contribute |
| **Headless UI** | Accessibility + flexibility | No styling, limited component set (~15), high learning curve |
| **HeroUI** | Complete + accessible | React-locked, Tailwind v4 required, bundle size |
| **Bulma** | Framework-agnostic, CSS-only | No JS behavior, no accessibility guarantees, no dark mode logic |

**The gap nobody fills:**
- No library offers a **designer-friendly token system** that non-coders can modify
- No library **enforces WCAG AAA** (not just AA) as a hard requirement
- No library provides **three consumption layers** (CSS-only → headless → styled)
- No library is truly **framework-agnostic** while still providing accessible behavior

**Lesson from production:**
Scaling real products revealed that inline Tailwind styles are unmaintainable at scale. Designers can't read `bg-primary/10 text-purple-600 dark:text-purple-400 hover:bg-muted/80 transition-all duration-200`. There's no visual tool, no single source of truth, no way to audit consistency. The design system is scattered across hundreds of files in arbitrary class strings.

WeiUI solves this by making the design system **the product**, not an afterthought.

### Influences

WeiUI draws from proven systems, taking the strongest pattern from each:

| System | What WeiUI takes from it |
|--------|--------------------------|
| **Bulma** | CSS-only layer with class-based API, zero JS requirement, readable naming |
| **Headless UI** | Accessible behavior hooks, data-attribute state management, unstyled primitives |
| **shadcn/ui** | CLI-driven `add` command (copy-paste ownership), tailwind-variants for styling |
| **Volt UI** | Polished component design language, variant system depth, visual refinement |

The three-layer architecture is WeiUI's original contribution — no existing system offers CSS-only, headless, and styled tiers from a single token source with AAA enforcement across all layers.

---

## 3. Product Overview

WeiUI is a **three-layer design system** where each layer builds on the previous:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Layer 3: @weiui/react                                     │
│   Fully styled React components with variants               │
│   (like shadcn/ui + HeroUI)                                 │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                     │   │
│   │   Layer 2: @weiui/headless                          │   │
│   │   Headless hooks + components with a11y behavior    │   │
│   │   (like Headless UI + React Aria)                   │   │
│   │                                                     │   │
│   │   ┌─────────────────────────────────────────────┐   │   │
│   │   │                                             │   │   │
│   │   │   Layer 1: @weiui/css                       │   │   │
│   │   │   CSS-only design tokens + primitives       │   │   │
│   │   │   (like Bulma — works without JavaScript)   │   │   │
│   │   │                                             │   │   │
│   │   └─────────────────────────────────────────────┘   │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Plus:
  @weiui/tokens    — Design tokens (JSON + CSS + Figma export)
  @weiui/icons     — Icon set (SVG + React + Web Component)
  @weiui/cli       — CLI for scaffolding, auditing, and token management
  @weiui/a11y      — Accessibility testing utilities and WCAG AAA validator
```

### Who uses what

| User | Layers they use | Example |
|------|----------------|---------|
| **Designer** | Tokens (JSON/Figma) | Edit tokens in a visual tool, export to code |
| **Static site developer** | Layer 1 (CSS-only) | Drop in a stylesheet, use class names, no JS needed |
| **React developer (custom design)** | Layer 2 (headless) | Get accessible behavior, apply own styles |
| **React developer (fast ship)** | Layer 3 (styled) | Import polished components, customize via tokens |
| **Any framework developer** | Layer 1 + vanilla JS | CSS tokens + write own behavior in Vue/Svelte/Angular |

---

## 4. Core Principles

### 4.1 WCAG AAA Target, AA Minimum

Accessibility compliance is **enforced at build time** with tiered thresholds:

- **Body content text** (foreground, card-foreground): **AAA (7:1)** — non-negotiable
- **Accent and status colors** (primary, destructive, success, warning + their foregrounds): **AA (4.5:1)** — AAA is the goal, AA is the enforced minimum
- **All other criteria** (touch targets, focus indicators, keyboard nav, motion): **AAA enforced**

This tiered approach reflects the reality that accent/status colors serve as UI chrome (buttons, badges, alerts) where AA contrast is the industry standard, while body content text must meet the highest bar for readability.

**What WCAG AAA requires (beyond AA):**

| Criterion | AA Requirement | AAA Requirement |
|-----------|---------------|-----------------|
| **Text contrast** | 4.5:1 normal, 3:1 large | **7:1 normal, 4.5:1 large** |
| **Non-text contrast** | 3:1 | **3:1** (same) |
| **Target size** | 24×24px | **44×44px minimum** |
| **Timing** | Can extend | **No time limits** |
| **Motion** | Can reduce | **Can disable entirely** |
| **Reading level** | — | **Lower secondary education level** |
| **Focus visible** | Visible | **Enhanced: 2px+ contrasting border** |
| **Reflow** | 320px | **320px** (same) |
| **Text spacing** | Adjustable | **Adjustable** |
| **Headings** | Present | **Descriptive and properly nested** |

**How WeiUI enforces this:**

1. **Build-time token validation** — The CLI rejects any color token pair that fails 7:1 contrast
2. **Runtime contrast checking** — Components that accept color props validate contrast at render time (dev mode)
3. **CSS custom property constraints** — Token definitions include min-contrast metadata
4. **Automated testing** — Every component has axe-core + Playwright accessibility tests that fail the build on AAA violations
5. **Focus indicator enforcement** — Components cannot render without proper focus styling; the CSS layer includes mandatory focus ring styles
6. **Motion safety** — All animations are wrapped in `@media (prefers-reduced-motion: no-preference)` — animations are opt-IN, not opt-out
7. **Touch target enforcement** — Interactive components have `min-width: 44px; min-height: 44px` in the CSS layer, enforced by lint rules

**Scope — what the system enforces vs. what requires content discipline:**

| Enforced by WeiUI (automated) | Requires content/usage discipline (documented) |
|---|---|
| 7:1 contrast for normal text, 4.5:1 for large text | Reading level (lower secondary education) |
| 44×44px minimum touch targets | Descriptive, properly nested headings |
| 3px+ focus indicators with 2px offset | Meaningful link text |
| Keyboard navigation per WAI-ARIA patterns | No time limits (application-level concern) |
| Motion opt-in via `prefers-reduced-motion` | Text spacing adjustability (layout-level concern) |
| `aria-*` attributes wired automatically | Alternative text for images |
| Live region announcements for state changes | Cognitive load and plain language |

WeiUI enforces every AAA criterion that a component library can control at build time and runtime. Content-level AAA criteria are documented with guidance for consuming teams but cannot be enforced at the library level.

### 4.2 Designer-First Token Architecture

Designers should be able to modify the design system without writing code.

**Token flow:**

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Figma /    │     │  Token JSON  │     │  Generated   │
│   Visual     │ ──→ │  Source of   │ ──→ │  Outputs     │
│   Editor     │     │  Truth       │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                          │
                          ├── CSS custom properties
                          ├── Tailwind theme config
                          ├── SCSS variables
                          ├── JSON (for JS consumption)
                          ├── TypeScript constants
                          ├── Figma token sync
                          └── iOS/Android tokens (future)
```

**Token format (W3C Design Tokens Community Group spec):**

```json
{
  "color": {
    "primary": {
      "$value": "oklch(0.546 0.245 262.88)",
      "$type": "color",
      "$description": "Primary brand color",
      "$extensions": {
        "weiui": {
          "wcagMinContrast": 7.0,
          "contrastPairs": ["color.primary-foreground"],
          "darkMode": "oklch(0.637 0.237 261.35)",
          "figmaVariable": "Color/Primary"
        }
      }
    }
  }
}
```

**Why OKLCH color space:**
- Perceptually uniform (unlike HSL where "50% lightness" looks different for different hues)
- Better for generating accessible color scales (predictable contrast ratios)
- Native CSS support: `oklch(0.7 0.15 230)`
- Same approach as shadcn/ui v2 and Tailwind CSS v4

### 4.3 Framework Strategy

Layer 1 (CSS) is truly framework-agnostic — it works with any framework or no framework at all. Layer 2 (headless) and Layer 3 (styled) are React-first, using React hooks and compound components. The token and CSS layers provide an immediate adoption path for non-React teams, and the headless architecture is designed to allow future Vue/Svelte ports of Layer 2 without changing Layer 1 or the token system.

```
                @weiui/tokens (universal)
                      │
         ┌────────────┼────────────┐
         │            │            │
   @weiui/css    @weiui/headless   @weiui/react
   (universal)   (React today,    (React, styled)
                  Vue/Svelte
                  planned)
```

### 4.4 Composability Over Configuration

Components use the **compound component pattern** — small, composable pieces rather than monolithic props.

```tsx
// ✗ Configuration hell (props explosion)
<Select
  label="Country"
  placeholder="Choose..."
  options={countries}
  searchable
  clearable
  multi
  maxItems={5}
  renderOption={(opt) => <Flag code={opt.code} />}
  renderValue={(val) => <Flag code={val.code} />}
/>

// ✓ Composable (each piece is a component)
<Select>
  <Select.Label>Country</Select.Label>
  <Select.Trigger>
    <Select.Value placeholder="Choose..." />
  </Select.Trigger>
  <Select.Content>
    <Select.Search />
    {countries.map((c) => (
      <Select.Item key={c.code} value={c.code}>
        <Flag code={c.code} />
        {c.name}
      </Select.Item>
    ))}
  </Select.Content>
</Select>
```

---

## 5. Tech Stack

### Core

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Monorepo** | Turborepo + pnpm workspaces | Fast builds, dependency hoisting, proven at scale |
| **Language** | TypeScript strict | Type-safe APIs, IntelliSense, zero `any` |
| **Build** | tsup (esbuild-based) | Fast bundling, ESM + CJS dual output, tree-shaking |
| **CSS** | PostCSS + Lightning CSS | Modern CSS transforms, OKLCH support, minification |
| **Testing** | Vitest + Playwright + axe-core | Unit + visual regression + accessibility |
| **Docs** | Next.js 16 + MDX | Interactive documentation site |
| **Linting** | ESLint + Stylelint + custom a11y rules | Code quality + CSS quality + accessibility linting |
| **CI** | GitHub Actions | Build, test, publish, deploy docs |

### Per Package

| Package | Key Dependencies |
|---------|-----------------|
| `@weiui/tokens` | Style Dictionary, W3C design tokens parser |
| `@weiui/css` | PostCSS, Lightning CSS (no JS runtime deps) |
| `@weiui/headless` | React 19, @floating-ui/react (positioning) |
| `@weiui/react` | @weiui/headless, @weiui/css, tailwind-variants |
| `@weiui/icons` | SVGO, @svgr/core |
| `@weiui/cli` | Commander, chalk, prompts |
| `@weiui/a11y` | axe-core, color.js (OKLCH contrast calculation) |

---

## 6. Design Token Architecture

### 6.1 Token Tiers

```
Tier 1: Primitive Tokens (raw values)
  └── color.blue.500: oklch(0.546 0.245 262.88)
  └── spacing.4: 16px
  └── font.size.base: 14px

Tier 2: Semantic Tokens (purpose-mapped)
  └── color.primary: {$value: "{color.blue.500}"}
  └── color.background: {$value: "{color.neutral.50}"}
  └── spacing.component.padding: {$value: "{spacing.4}"}

Tier 3: Component Tokens (scoped overrides)
  └── button.background: {$value: "{color.primary}"}
  └── button.padding-x: {$value: "{spacing.4}"}
  └── card.radius: {$value: "{shape.radius.lg}"}
```

### 6.2 Color System

**OKLCH-based with automatic AAA contrast validation:**

```json
{
  "color": {
    "neutral": {
      "0": { "$value": "oklch(1 0 0)", "$type": "color" },
      "50": { "$value": "oklch(0.985 0.002 240)", "$type": "color" },
      "100": { "$value": "oklch(0.967 0.003 240)", "$type": "color" },
      "200": { "$value": "oklch(0.928 0.006 240)", "$type": "color" },
      "300": { "$value": "oklch(0.872 0.010 240)", "$type": "color" },
      "400": { "$value": "oklch(0.707 0.015 240)", "$type": "color" },
      "500": { "$value": "oklch(0.551 0.018 240)", "$type": "color" },
      "600": { "$value": "oklch(0.446 0.018 240)", "$type": "color" },
      "700": { "$value": "oklch(0.372 0.017 240)", "$type": "color" },
      "800": { "$value": "oklch(0.279 0.015 240)", "$type": "color" },
      "900": { "$value": "oklch(0.208 0.012 240)", "$type": "color" },
      "950": { "$value": "oklch(0.145 0.010 240)", "$type": "color" },
      "1000": { "$value": "oklch(0 0 0)", "$type": "color" }
    },
    "blue": {
      "50": { "$value": "oklch(0.970 0.014 250)", "$type": "color" },
      "100": { "$value": "oklch(0.932 0.032 255)", "$type": "color" },
      "200": { "$value": "oklch(0.882 0.059 258)", "$type": "color" },
      "300": { "$value": "oklch(0.809 0.105 260)", "$type": "color" },
      "400": { "$value": "oklch(0.714 0.169 261)", "$type": "color" },
      "500": { "$value": "oklch(0.623 0.214 262)", "$type": "color" },
      "600": { "$value": "oklch(0.546 0.245 263)", "$type": "color" },
      "700": { "$value": "oklch(0.488 0.243 264)", "$type": "color" },
      "800": { "$value": "oklch(0.424 0.199 265)", "$type": "color" },
      "900": { "$value": "oklch(0.379 0.146 266)", "$type": "color" },
      "950": { "$value": "oklch(0.283 0.108 267)", "$type": "color" }
    }
  }
}
```

**Semantic color mapping:**

```json
{
  "color": {
    "primary": { "$value": "{color.blue.600}" },
    "primary-foreground": { "$value": "{color.neutral.0}" },
    "background": { "$value": "{color.neutral.0}" },
    "foreground": { "$value": "{color.neutral.950}" },
    "muted": { "$value": "{color.neutral.100}" },
    "muted-foreground": { "$value": "{color.neutral.600}" },
    "card": { "$value": "{color.neutral.0}" },
    "card-foreground": { "$value": "{color.neutral.950}" },
    "border": { "$value": "{color.neutral.200}" },
    "ring": { "$value": "{color.blue.600}" },
    "destructive": { "$value": "oklch(0.577 0.245 27.33)" },
    "success": { "$value": "oklch(0.517 0.176 149.57)" },
    "warning": { "$value": "oklch(0.681 0.162 75.83)" }
  }
}
```

**Dark mode is an automatic token transformation:**

The CLI generates dark mode tokens by:
1. Swapping semantic mappings (background ↔ foreground direction)
2. Adjusting lightness values in OKLCH while preserving chroma and hue
3. Validating all pairs still meet 7:1 contrast (AAA)
4. Outputting `.dark` CSS class overrides

### 6.3 Typography Scale

```json
{
  "font": {
    "family": {
      "sans": { "$value": "'Inter', system-ui, sans-serif", "$type": "fontFamily" },
      "mono": { "$value": "'JetBrains Mono', monospace", "$type": "fontFamily" },
      "display": { "$value": "'Inter', system-ui, sans-serif", "$type": "fontFamily" }
    },
    "size": {
      "xs": { "$value": "12px", "$type": "dimension" },
      "sm": { "$value": "14px", "$type": "dimension" },
      "base": { "$value": "16px", "$type": "dimension" },
      "lg": { "$value": "18px", "$type": "dimension" },
      "xl": { "$value": "20px", "$type": "dimension" },
      "2xl": { "$value": "24px", "$type": "dimension" },
      "3xl": { "$value": "30px", "$type": "dimension" },
      "4xl": { "$value": "36px", "$type": "dimension" },
      "5xl": { "$value": "48px", "$type": "dimension" },
      "6xl": { "$value": "60px", "$type": "dimension" }
    },
    "weight": {
      "regular": { "$value": 400, "$type": "number" },
      "medium": { "$value": 500, "$type": "number" },
      "semibold": { "$value": 600, "$type": "number" },
      "bold": { "$value": 700, "$type": "number" }
    },
    "lineHeight": {
      "tight": { "$value": 1.25, "$type": "number" },
      "snug": { "$value": 1.375, "$type": "number" },
      "normal": { "$value": 1.5, "$type": "number" },
      "relaxed": { "$value": 1.625, "$type": "number" },
      "loose": { "$value": 2, "$type": "number" }
    },
    "letterSpacing": {
      "tighter": { "$value": "-0.05em", "$type": "dimension" },
      "tight": { "$value": "-0.025em", "$type": "dimension" },
      "normal": { "$value": "0em", "$type": "dimension" },
      "wide": { "$value": "0.025em", "$type": "dimension" },
      "wider": { "$value": "0.05em", "$type": "dimension" },
      "widest": { "$value": "0.1em", "$type": "dimension" }
    }
  }
}
```

**Minimum font size enforced: 12px** (WCAG AAA readability).

### 6.4 Spacing Scale

4px base grid:

```json
{
  "spacing": {
    "0": { "$value": "0px" },
    "0.5": { "$value": "2px" },
    "1": { "$value": "4px" },
    "1.5": { "$value": "6px" },
    "2": { "$value": "8px" },
    "2.5": { "$value": "10px" },
    "3": { "$value": "12px" },
    "3.5": { "$value": "14px" },
    "4": { "$value": "16px" },
    "5": { "$value": "20px" },
    "6": { "$value": "24px" },
    "8": { "$value": "32px" },
    "10": { "$value": "40px" },
    "12": { "$value": "48px" },
    "16": { "$value": "64px" },
    "20": { "$value": "80px" },
    "24": { "$value": "96px" }
  }
}
```

### 6.5 Shape Tokens

```json
{
  "shape": {
    "radius": {
      "none": { "$value": "0px" },
      "sm": { "$value": "4px" },
      "base": { "$value": "6px" },
      "md": { "$value": "8px" },
      "lg": { "$value": "12px" },
      "xl": { "$value": "16px" },
      "2xl": { "$value": "24px" },
      "full": { "$value": "9999px" }
    },
    "border": {
      "width": {
        "thin": { "$value": "1px" },
        "medium": { "$value": "2px" },
        "thick": { "$value": "3px" }
      }
    }
  }
}
```

### 6.6 Shadow System

```json
{
  "shadow": {
    "xs": { "$value": "0 1px 2px 0 oklch(0 0 0 / 0.03)" },
    "sm": { "$value": "0 1px 3px 0 oklch(0 0 0 / 0.04), 0 1px 2px -1px oklch(0 0 0 / 0.03)" },
    "md": { "$value": "0 4px 6px -1px oklch(0 0 0 / 0.05), 0 2px 4px -2px oklch(0 0 0 / 0.03)" },
    "lg": { "$value": "0 10px 15px -3px oklch(0 0 0 / 0.06), 0 4px 6px -4px oklch(0 0 0 / 0.03)" },
    "xl": { "$value": "0 20px 25px -5px oklch(0 0 0 / 0.08), 0 8px 10px -6px oklch(0 0 0 / 0.04)" }
  }
}
```

### 6.7 Motion Tokens

```json
{
  "motion": {
    "duration": {
      "instant": { "$value": "0ms" },
      "fast": { "$value": "100ms" },
      "normal": { "$value": "200ms" },
      "slow": { "$value": "300ms" },
      "entrance": { "$value": "400ms" }
    },
    "easing": {
      "default": { "$value": "cubic-bezier(0.16, 1, 0.3, 1)" },
      "in": { "$value": "cubic-bezier(0.55, 0, 1, 0.45)" },
      "out": { "$value": "cubic-bezier(0.16, 1, 0.3, 1)" },
      "inOut": { "$value": "cubic-bezier(0.45, 0, 0.55, 1)" },
      "spring": { "$value": "cubic-bezier(0.34, 1.56, 0.64, 1)" }
    }
  }
}
```

**All animations wrapped in motion preference check:**
```css
@media (prefers-reduced-motion: no-preference) {
  .wui-animate-fade-in { animation: wui-fade-in var(--wui-duration-normal) var(--wui-easing-out); }
}
```

---

## 7. Package Architecture

### 7.1 Monorepo Structure

```
weiui/
├── packages/
│   ├── tokens/                    # @weiui/tokens
│   │   ├── src/
│   │   │   ├── primitives/        # Tier 1: raw values
│   │   │   ├── semantic/          # Tier 2: purpose-mapped
│   │   │   └── components/        # Tier 3: component-scoped
│   │   ├── scripts/
│   │   │   ├── build.ts           # Token → CSS/JSON/TS generation
│   │   │   ├── validate.ts        # WCAG AAA contrast validation
│   │   │   └── dark-mode.ts       # Automatic dark mode generation
│   │   └── dist/
│   │       ├── tokens.css         # CSS custom properties
│   │       ├── tokens.json        # JSON for tooling
│   │       ├── tokens.ts          # TypeScript constants
│   │       ├── tailwind.config.ts # Tailwind theme extension
│   │       └── figma.json         # Figma variables export
│   │
│   ├── css/                       # @weiui/css
│   │   ├── src/
│   │   │   ├── reset.css          # Modern CSS reset (opinionated)
│   │   │   ├── base.css           # Base styles (typography, focus)
│   │   │   ├── elements/          # CSS-only components
│   │   │   │   ├── button.css
│   │   │   │   ├── input.css
│   │   │   │   ├── badge.css
│   │   │   │   ├── card.css
│   │   │   │   └── ...
│   │   │   ├── utilities/         # Utility classes
│   │   │   │   ├── layout.css
│   │   │   │   ├── spacing.css
│   │   │   │   └── typography.css
│   │   │   └── a11y/             # Accessibility-specific styles
│   │   │       ├── focus.css      # Enhanced focus indicators
│   │   │       ├── sr-only.css    # Screen reader utilities
│   │   │       └── motion.css     # Motion preference handling
│   │   └── dist/
│   │       ├── weiui.css          # Full bundle
│   │       ├── weiui.min.css      # Minified
│   │       └── elements/          # Individual element CSS files
│   │
│   ├── headless/                  # @weiui/headless
│   │   ├── src/
│   │   │   ├── hooks/             # Behavioral hooks
│   │   │   │   ├── use-dialog.ts
│   │   │   │   ├── use-menu.ts
│   │   │   │   ├── use-listbox.ts
│   │   │   │   ├── use-combobox.ts
│   │   │   │   ├── use-tabs.ts
│   │   │   │   ├── use-tooltip.ts
│   │   │   │   ├── use-toggle.ts
│   │   │   │   ├── use-disclosure.ts
│   │   │   │   ├── use-focus-trap.ts
│   │   │   │   ├── use-keyboard-nav.ts
│   │   │   │   └── use-outside-click.ts
│   │   │   ├── components/        # Compound components (unstyled)
│   │   │   │   ├── Dialog/
│   │   │   │   │   ├── Dialog.tsx
│   │   │   │   │   ├── DialogTrigger.tsx
│   │   │   │   │   ├── DialogContent.tsx
│   │   │   │   │   ├── DialogTitle.tsx
│   │   │   │   │   ├── DialogDescription.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Menu/
│   │   │   │   ├── Select/
│   │   │   │   ├── Combobox/
│   │   │   │   ├── Tabs/
│   │   │   │   ├── Accordion/
│   │   │   │   ├── Tooltip/
│   │   │   │   └── Popover/
│   │   │   ├── utils/
│   │   │   │   ├── floating.ts    # @floating-ui integration
│   │   │   │   ├── focus.ts       # Focus management utilities
│   │   │   │   ├── keyboard.ts    # Keyboard navigation helpers
│   │   │   │   └── id.ts          # Unique ID generation
│   │   │   └── a11y/
│   │   │       ├── announce.ts    # Live region announcements
│   │   │       ├── aria.ts        # ARIA attribute helpers
│   │   │       └── focus-scope.ts # Focus scope/trap
│   │   └── dist/
│   │
│   ├── react/                     # @weiui/react
│   │   ├── src/
│   │   │   ├── components/        # Styled components
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Button.styles.ts   # tailwind-variants
│   │   │   │   │   ├── Button.test.tsx
│   │   │   │   │   ├── Button.a11y.test.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Input/
│   │   │   │   ├── Select/
│   │   │   │   ├── Dialog/
│   │   │   │   ├── Card/
│   │   │   │   ├── Badge/
│   │   │   │   ├── Avatar/
│   │   │   │   ├── Tabs/
│   │   │   │   ├── Table/
│   │   │   │   ├── Toast/
│   │   │   │   └── ... (50+ components)
│   │   │   ├── provider/
│   │   │   │   └── WeiUIProvider.tsx  # Theme provider + a11y context
│   │   │   └── variants/
│   │   │       └── index.ts       # Shared variant definitions
│   │   └── dist/
│   │
│   ├── icons/                     # @weiui/icons
│   │   ├── svg/                   # Source SVGs (24x24 grid)
│   │   ├── src/
│   │   │   ├── react/             # React icon components
│   │   │   └── web/               # Web Component icons
│   │   └── dist/
│   │
│   ├── cli/                       # @weiui/cli
│   │   └── src/
│   │       ├── commands/
│   │       │   ├── init.ts        # Initialize WeiUI in a project
│   │       │   ├── add.ts         # Add a component (copy-paste mode)
│   │       │   ├── audit.ts       # Run accessibility audit
│   │       │   ├── token.ts       # Manage/generate tokens
│   │       │   └── theme.ts       # Generate theme from brand colors
│   │       └── index.ts
│   │
│   └── a11y/                      # @weiui/a11y
│       └── src/
│           ├── validators/
│           │   ├── contrast.ts    # WCAG AAA contrast checker
│           │   ├── target-size.ts # Touch target size validator
│           │   ├── focus.ts       # Focus indicator validator
│           │   └── motion.ts      # Motion preference checker
│           ├── testing/
│           │   ├── axe.ts         # axe-core wrapper with AAA rules
│           │   ├── keyboard.ts    # Keyboard navigation tester
│           │   └── screen-reader.ts # SR announcement tester
│           └── lint/
│               └── rules/         # Custom ESLint rules for a11y
│
├── apps/
│   ├── docs/                      # Documentation site (Next.js 16)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx                # Landing page
│   │   │   │   ├── docs/                   # MDX documentation
│   │   │   │   │   ├── getting-started/
│   │   │   │   │   ├── tokens/
│   │   │   │   │   ├── css/
│   │   │   │   │   ├── headless/
│   │   │   │   │   ├── components/
│   │   │   │   │   └── accessibility/
│   │   │   │   ├── playground/             # Interactive component playground
│   │   │   │   └── themes/                 # Theme gallery + builder
│   │   │   └── components/
│   │   │       ├── ComponentPreview.tsx     # Live component preview
│   │   │       ├── CodeBlock.tsx            # Syntax-highlighted code
│   │   │       ├── PropsTable.tsx           # Auto-generated props table
│   │   │       ├── A11yBadge.tsx            # WCAG compliance indicator
│   │   │       └── TokenPreview.tsx         # Visual token display
│   │   └── content/                # MDX content files
│   │
│   └── playground/                # Component playground (Storybook alternative)
│       └── stories/
│
├── turbo.json                     # Turborepo config
├── pnpm-workspace.yaml            # Monorepo workspace config
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Build + test + a11y audit
│       ├── publish.yml            # npm publish on release
│       └── visual-regression.yml  # Playwright screenshot tests
└── CONTRIBUTING.md
```

### 7.2 Package Dependency Graph

```
@weiui/tokens  ←── @weiui/css  ←── @weiui/react
                                      ↑
                    @weiui/headless ───┘

@weiui/a11y (standalone, used in CI/testing)
@weiui/cli (standalone, dev tool)
@weiui/icons (standalone)
```

---

## 8. Component Library

### 8.1 Component List (Layer 3: @weiui/react)

**Layout (6):**
- Container, Stack, Grid, Divider, Spacer, AspectRatio

**Data Display (10):**
- Avatar, Badge, Card, Chip, Code, Kbd, List, Skeleton, Table, Timeline

**Data Entry (12):**
- Button, Checkbox, ColorPicker, DatePicker, Input, NumberInput, PinInput, RadioGroup, Select, Slider, Switch, Textarea

**Feedback (6):**
- Alert, CircularProgress, LinearProgress, Spinner, Toast, EmptyState

**Navigation (6):**
- Breadcrumb, Link, Menu, Pagination, Stepper, Tabs

**Overlay (5):**
- Dialog, Drawer, Dropdown, Popover, Tooltip

**Typography (4):**
- Heading, Text, Label, Blockquote

**Utility (4):**
- FocusTrap, Portal, ScrollArea, VisuallyHidden

**Total: 53 components**

### 8.2 Component API Pattern

Every component follows this structure:

```tsx
// Button.tsx
import { forwardRef } from "react";
import { useButton } from "@weiui/headless";
import { buttonVariants, type ButtonVariants } from "./Button.styles";
import { cn } from "@weiui/react/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  /** Content to render inside the button */
  children: React.ReactNode;
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Icon to render before the children */
  startIcon?: React.ReactNode;
  /** Icon to render after the children */
  endIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "solid",
      size = "md",
      color = "primary",
      loading = false,
      disabled,
      startIcon,
      endIcon,
      className,
      ...props
    },
    ref
  ) => {
    const { buttonProps } = useButton({
      disabled: disabled || loading,
      ...props,
    });

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, color }), className)}
        {...buttonProps}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
      >
        {loading && <Spinner size="sm" className="wui-button-spinner" />}
        {!loading && startIcon && <span className="wui-button-icon">{startIcon}</span>}
        <span className="wui-button-label">{children}</span>
        {endIcon && <span className="wui-button-icon">{endIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
```

### 8.3 Variant System (tailwind-variants)

```typescript
// Button.styles.ts
import { tv } from "tailwind-variants";

export const buttonVariants = tv({
  base: [
    "inline-flex items-center justify-center gap-2",
    "font-medium transition-all",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wui-color-ring)]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "min-h-[44px] min-w-[44px]", // WCAG AAA touch target
  ],
  variants: {
    variant: {
      solid: "text-[var(--wui-color-primary-foreground)]",
      outline: "border-2 bg-transparent",
      ghost: "bg-transparent",
      soft: "bg-opacity-10",
      link: "bg-transparent underline-offset-4 hover:underline p-0 min-h-0 min-w-0",
    },
    size: {
      sm: "h-9 px-3 text-sm rounded-[var(--wui-radius-base)]",
      md: "h-11 px-4 text-sm rounded-[var(--wui-radius-md)]",
      lg: "h-12 px-6 text-base rounded-[var(--wui-radius-md)]",
      xl: "h-14 px-8 text-lg rounded-[var(--wui-radius-lg)]",
      icon: "size-11 rounded-[var(--wui-radius-md)]",
    },
    color: {
      primary: "",
      secondary: "",
      destructive: "",
      success: "",
      warning: "",
      neutral: "",
    },
  },
  compoundVariants: [
    { variant: "solid", color: "primary", className: "bg-[var(--wui-color-primary)] hover:brightness-110 active:brightness-95" },
    { variant: "solid", color: "destructive", className: "bg-[var(--wui-color-destructive)] hover:brightness-110 active:brightness-95" },
    { variant: "outline", color: "primary", className: "border-[var(--wui-color-primary)] text-[var(--wui-color-primary)] hover:bg-[var(--wui-color-primary)]/5" },
    { variant: "ghost", color: "primary", className: "text-[var(--wui-color-primary)] hover:bg-[var(--wui-color-primary)]/5" },
    { variant: "soft", color: "primary", className: "bg-[var(--wui-color-primary)]/10 text-[var(--wui-color-primary)] hover:bg-[var(--wui-color-primary)]/15" },
  ],
  defaultVariants: {
    variant: "solid",
    size: "md",
    color: "primary",
  },
});

export type ButtonVariants = Parameters<typeof buttonVariants>[0];
```

### 8.4 State Management for Complex Components

Simple components (Button, Badge, Card) use `useState`. Complex interactive components use `useReducer` with typed action discriminators to keep interdependent state transitions explicit:

| Complexity | Components | Approach |
|------------|-----------|----------|
| **Low** | Button, Badge, Card, Avatar | `useState` — one or two independent booleans |
| **Medium** | Tabs, Accordion, Toggle | `useState` — single active index or open/closed |
| **High** | Select, Combobox, Menu | `useReducer` — highlight index, open/close, selection, and typeahead buffer are interdependent |
| **Very high** | DatePicker, ColorPicker | `useReducer` — calendar navigation, range selection, view mode switching, min/max constraints |

**Controlled/uncontrolled pattern:**

All stateful components use a shared `useControllable` hook that mirrors React's native form behavior:

```typescript
function useControllable<T>(props: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (value: T) => void];
```

`value` + `onChange` for controlled mode, `defaultValue` for uncontrolled. Components never break if the consumer switches between modes.

**Dependency policy:** No external state management libraries in `@weiui/headless`. All state logic uses React primitives (`useReducer`, `useState`, `useRef`). The only non-React dependency is `@floating-ui/react` for positioning.

---

## 9. Accessibility (WCAG AAA)

### 9.1 Focus Management

Every interactive component uses enhanced focus indicators:

```css
/* @weiui/css - focus.css */
:where(.wui-focusable):focus-visible {
  outline: 3px solid var(--wui-color-ring);
  outline-offset: 2px;
  border-radius: inherit;
}

/* High contrast mode */
@media (forced-colors: active) {
  :where(.wui-focusable):focus-visible {
    outline: 3px solid Highlight;
  }
}
```

### 9.2 Keyboard Navigation Patterns

Every component implements the appropriate WAI-ARIA keyboard pattern:

| Component | Keys | Behavior |
|-----------|------|----------|
| **Button** | Enter, Space | Activate |
| **Menu** | Arrow Up/Down, Home, End, A-Z | Navigate items |
| **Dialog** | Escape, Tab (trapped) | Close, cycle focus |
| **Tabs** | Arrow Left/Right, Home, End | Switch tabs |
| **Combobox** | Arrow Up/Down, Enter, Escape | Navigate options, select, close |
| **Select** | Arrow Up/Down, Enter, Space, Escape | Navigate, select, close |
| **Accordion** | Arrow Up/Down, Home, End, Enter, Space | Navigate, toggle |
| **Slider** | Arrow Left/Right, Home, End, Page Up/Down | Adjust value |

### 9.3 Screen Reader Support

```typescript
// @weiui/headless - announce.ts
export function announce(message: string, priority: "polite" | "assertive" = "polite") {
  const region = document.getElementById(`wui-live-region-${priority}`);
  if (!region) return;
  region.textContent = "";
  // Force re-read by clearing then setting
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}
```

### 9.4 Build-Time AAA Audit

```typescript
// @weiui/a11y - contrast.ts
import { oklch, wcagContrast } from "color.js";

export function validateContrastAAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): { passes: boolean; ratio: number; required: number } {
  const ratio = wcagContrast(foreground, background);
  const required = isLargeText ? 4.5 : 7.0; // AAA requirements
  return { passes: ratio >= required, ratio, required };
}
```

---

## 10. Documentation Site

### 10.1 Site Structure

```
ui.wei-dev.com/
├── /                          # Landing page (hero, features, quick start)
├── /docs/
│   ├── getting-started/       # Installation, setup, first component
│   ├── design-tokens/         # Token architecture, customization
│   ├── accessibility/         # WCAG AAA guide, testing
│   ├── css/                   # Layer 1 docs (CSS-only usage)
│   ├── headless/              # Layer 2 docs (hooks, unstyled components)
│   └── components/            # Layer 3 docs (full component reference)
│       ├── button/
│       ├── input/
│       ├── select/
│       └── ...
├── /playground/               # Interactive component sandbox
├── /composer/                 # Visual component composer (drag-and-drop page assembly)
├── /themes/                   # Theme gallery + visual builder
└── /icons/                    # Icon browser + search
```

### 10.2 Component Documentation Page Structure

Each component page includes:

1. **Overview** — What it is, when to use it, screenshot
2. **Quick Start** — Minimal code to get the component working
3. **Examples** — Multiple use cases with live previews
4. **API Reference** — Props table (auto-generated from TypeScript)
5. **Variants** — All visual variants with previews
6. **Accessibility** — ARIA attributes, keyboard behavior, screen reader notes
7. **WCAG AAA Badge** — Shows compliance status for this component
8. **Three-layer tabs** — CSS-only | Headless | Styled code for each example

---

## 11. CLI Tool

### 11.1 Commands

```bash
# Initialize WeiUI in a project
weiui init

# Add a component (copy-paste mode, like shadcn)
weiui add button
weiui add dialog select tabs

# Generate theme from brand colors (validates AAA)
weiui theme --primary "#2563eb" --neutral "#64748b"

# Audit accessibility of your project
weiui audit              # Full audit
weiui audit --contrast   # Contrast-only check
weiui audit --keyboard   # Keyboard nav check

# Manage tokens
weiui tokens build       # Compile tokens to CSS/JSON/TS
weiui tokens validate    # Check AAA compliance
weiui tokens sync-figma  # Sync to Figma variables
```

### 11.2 Theme Generator

```bash
$ weiui theme --primary "#2563eb"

✓ Primary color: oklch(0.546 0.245 262.88)
✓ Generated 11-step scale (50-950)
✓ Generated semantic tokens (6 colors)
✓ Generated dark mode tokens
✓ All 24 contrast pairs pass WCAG AAA (7:1)
✓ Written to weiui.tokens.json
✓ Generated CSS: weiui.tokens.css
```

---

## 12. Implementation Phases

### Phase 1: Foundation (Tokens + CSS + CLI)
1. Monorepo setup (Turborepo + pnpm)
2. Token architecture (@weiui/tokens) — primitives, semantic, component tokens
3. Token build pipeline — JSON → CSS/TS/Tailwind/Figma
4. WCAG AAA contrast validator
5. CSS reset + base styles (@weiui/css)
6. CSS-only primitives: Button, Badge, Card, Input, Avatar, Skeleton
7. CLI tool: init, tokens build, tokens validate
8. Documentation site scaffold

### Phase 2: Headless Layer
9. Core hooks: use-dialog, use-menu, use-listbox, use-combobox
10. Core hooks: use-tabs, use-tooltip, use-toggle, use-disclosure
11. Utility hooks: use-focus-trap, use-keyboard-nav, use-outside-click
12. Headless compound components: Dialog, Menu, Select, Tabs
13. Focus management utilities
14. Live region announcements
15. Keyboard navigation testing framework

### Phase 3: Styled Components (React)
16. WeiUIProvider (theme + a11y context)
17. Core components: Button, Input, Textarea, Select, Checkbox, Switch, Radio
18. Layout components: Container, Stack, Grid, Divider
19. Data display: Card, Badge, Avatar, Table, Code, Kbd
20. Overlay: Dialog, Drawer, Popover, Tooltip, Dropdown
21. Feedback: Alert, Toast, Spinner, Progress, EmptyState
22. Navigation: Tabs, Menu, Breadcrumb, Pagination
23. Complex: DatePicker, ColorPicker, Combobox, PinInput

### Phase 4: Polish & Documentation
24. Interactive documentation site with live examples
25. Component playground / sandbox
26. Visual component composer (drag-and-drop page assembly → code export)
27. Theme gallery + visual builder
28. Icon browser
29. Visual regression tests (Playwright)
30. Accessibility test suite (axe-core + custom)
31. npm publish pipeline
32. Contributing guide + changelog

### Phase 5: Deploy
32. Publish packages to npm
33. Deploy docs to ui.wei-dev.com
34. GitHub repository setup (issues, discussions, CI)

---

## 13. Success Criteria

The system is complete when:

- [ ] `@weiui/tokens` generates CSS/JSON/TS from a single token source
- [ ] Token validator rejects any color pair failing 7:1 contrast (WCAG AAA)
- [ ] Dark mode tokens auto-generated from light mode with AAA contrast preserved
- [ ] `@weiui/css` provides CSS-only components that work without JavaScript
- [ ] CSS-only button, input, badge, card, avatar render correctly
- [ ] `@weiui/headless` provides accessible behavior hooks
- [ ] Dialog: focus trap, Escape to close, aria-modal, return focus
- [ ] Menu: arrow navigation, typeahead search, aria-expanded
- [ ] Select: keyboard selection, live announcements
- [ ] `@weiui/react` provides 50+ styled components
- [ ] Every component meets WCAG AAA (7:1 contrast, 44px targets, keyboard nav)
- [ ] Every component has unit tests + accessibility tests
- [ ] Every component documented with live preview + props table
- [ ] Variant system works (solid/outline/ghost/soft × primary/destructive/etc.)
- [ ] `weiui add button` copies a working component into user's project
- [ ] `weiui theme --primary "#..."` generates full AAA-compliant theme
- [ ] `weiui audit` reports accessibility violations
- [ ] Documentation site at ui.wei-dev.com is interactive and polished
- [ ] Theme builder allows visual customization with real-time preview
- [ ] All components respect `prefers-reduced-motion` and `prefers-contrast`
- [ ] Tree-shaking works (import only what you use)
- [ ] ESM + CJS dual build output
- [ ] Published to npm with proper versioning
- [ ] Zero TypeScript errors across all packages
- [ ] Deployed and accessible at ui.wei-dev.com

---

## 14. CSS Architecture

### 14.1 Cascade Layers

WeiUI uses CSS `@layer` to guarantee specificity order. This prevents user styles from being accidentally overridden by library styles.

```css
/* Layer order: lowest → highest specificity */
@layer wui-reset, wui-tokens, wui-base, wui-elements, wui-utilities;

@layer wui-reset {
  /* Modern CSS reset — box-sizing, margins, etc. */
}

@layer wui-tokens {
  /* CSS custom properties from @weiui/tokens */
  :root { --wui-color-primary: oklch(0.546 0.245 262.88); ... }
  .dark { --wui-color-primary: oklch(0.637 0.237 261.35); ... }
}

@layer wui-base {
  /* Base typography, focus styles, body defaults */
}

@layer wui-elements {
  /* Component styles: .wui-button, .wui-input, .wui-card, etc. */
}

@layer wui-utilities {
  /* Utility overrides (always win): .wui-sr-only, .wui-focus-ring, etc. */
}
```

User CSS (outside any @layer) automatically has higher specificity than all WeiUI layers.

### 14.2 Naming Convention

BEM-inspired with `wui-` prefix to avoid collisions:

```
.wui-{component}                     → Block:    .wui-button
.wui-{component}__{element}          → Element:  .wui-button__icon
.wui-{component}--{modifier}         → Modifier: .wui-button--outline
.wui-{component}[data-{state}]       → State:    .wui-button[data-loading]
```

**States use data attributes (not classes) for behavior coupling:**

```css
.wui-button[data-disabled] { opacity: 0.5; cursor: not-allowed; }
.wui-button[data-loading] { position: relative; }
.wui-button[data-active] { transform: scale(0.98); }
.wui-button[data-focus-visible] { outline: 3px solid var(--wui-color-ring); }
```

This mirrors Headless UI's data-attribute approach and enables CSS-only state styling.

### 14.3 CSS Custom Property Naming

All custom properties are prefixed with `--wui-` and follow a hierarchy:

```
--wui-{category}-{name}              → Global:   --wui-color-primary
--wui-{category}-{name}-{variant}    → Variant:  --wui-color-primary-foreground
--wui-{component}-{property}         → Scoped:   --wui-button-height
```

### 14.4 Specificity Budget

| Selector Type | Max Specificity | Usage |
|---------------|----------------|-------|
| Element selectors | 0-0-1 | Reset layer only |
| Single class | 0-1-0 | Base component styles |
| Class + data attribute | 0-2-0 | Component state styles |
| Class + pseudo-class | 0-2-0 | Hover, focus states |
| Utility classes | 0-1-0 (in top layer) | Override utilities |

**No `!important` ever.** The cascade layer system eliminates the need.

---

## 15. Responsive Design System

### 15.1 Breakpoints

```json
{
  "breakpoint": {
    "sm": { "$value": "640px", "$description": "Mobile landscape / small tablet" },
    "md": { "$value": "768px", "$description": "Tablet portrait" },
    "lg": { "$value": "1024px", "$description": "Tablet landscape / small desktop" },
    "xl": { "$value": "1280px", "$description": "Desktop" },
    "2xl": { "$value": "1536px", "$description": "Large desktop" }
  }
}
```

### 15.2 Container Queries

Components use container queries for intrinsic responsiveness — they adapt to their container size, not viewport:

```css
.wui-card {
  container-type: inline-size;
  container-name: wui-card;
}

@container wui-card (max-width: 300px) {
  .wui-card__header {
    flex-direction: column;
    gap: var(--wui-spacing-2);
  }
}

@container wui-card (min-width: 500px) {
  .wui-card__content {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

### 15.3 Fluid Typography

Headings use `clamp()` for smooth scaling:

```css
:root {
  --wui-font-size-display: clamp(2.25rem, 5vw, 3.75rem);
  --wui-font-size-h1: clamp(1.875rem, 3.5vw, 2.25rem);
  --wui-font-size-h2: clamp(1.5rem, 2.5vw, 1.875rem);
  --wui-font-size-h3: clamp(1.25rem, 2vw, 1.5rem);
}
```

### 15.4 Responsive Props

Styled components accept responsive prop values:

```tsx
<Stack direction={{ base: "column", md: "row" }} gap={{ base: 4, lg: 6 }}>
  <Box flex={{ base: "none", md: 1 }}>Sidebar</Box>
  <Box flex={2}>Content</Box>
</Stack>
```

---

## 16. Internationalization (i18n) & RTL

### 16.1 RTL Support

All components support right-to-left text direction via the `dir` attribute:

```html
<html dir="rtl" lang="ar">
```

**CSS logical properties used exclusively:**

```css
/* ✗ Physical properties (breaks in RTL) */
.wui-button { padding-left: 16px; margin-right: 8px; }

/* ✓ Logical properties (works in both LTR and RTL) */
.wui-button { padding-inline-start: 16px; margin-inline-end: 8px; }
```

**Property mapping:**

| Physical | Logical |
|----------|---------|
| `left` / `right` | `inset-inline-start` / `inset-inline-end` |
| `padding-left` / `padding-right` | `padding-inline-start` / `padding-inline-end` |
| `margin-left` / `margin-right` | `margin-inline-start` / `margin-inline-end` |
| `border-left` / `border-right` | `border-inline-start` / `border-inline-end` |
| `text-align: left` | `text-align: start` |
| `float: left` | `float: inline-start` |

### 16.2 Translation-Ready

- All user-facing strings in components are configurable via props
- Default labels provided in English, overridable:

```tsx
<Select>
  <Select.Trigger aria-label="Choose a country" />
  <Select.Content>
    <Select.Empty>No results found</Select.Empty>
  </Select.Content>
</Select>
```

- The `WeiUIProvider` accepts a `locale` object for global label overrides:

```tsx
<WeiUIProvider locale={{
  select: { noResults: "Aucun résultat", placeholder: "Choisir..." },
  dialog: { close: "Fermer" },
  pagination: { next: "Suivant", previous: "Précédent" },
}}>
```

---

## 17. Server-Side Rendering & React Server Components

### 17.1 SSR Compatibility

All components are SSR-safe by default:

- **No `window`/`document` access during render** — all DOM APIs wrapped in `useEffect` or behind `typeof window !== 'undefined'` guards
- **No `useLayoutEffect`** — replaced with `useEffect` + `useInsertionEffect` where needed
- **Deterministic rendering** — no `Math.random()`, no `Date.now()` during render, stable IDs via `useId()`
- **Hydration-safe** — all components render identical HTML on server and client

### 17.2 React Server Component Support

```
"use client" boundary placement:

@weiui/react components:
  ├── Server-safe (no "use client" needed):
  │   Card, Badge, Avatar, Divider, Heading, Text, Code, Kbd,
  │   Container, Stack, Grid, Spacer, Skeleton, VisuallyHidden
  │
  └── Client-only (marked "use client"):
      Button (onClick), Input, Select, Dialog, Menu, Tabs,
      Tooltip, Popover, Dropdown, Toast, Switch, Checkbox,
      Slider, DatePicker, Combobox
```

### 17.3 Streaming Support

Components that fetch data support React Suspense:

```tsx
<Suspense fallback={<Table.Skeleton rows={5} />}>
  <AsyncDataTable />
</Suspense>
```

Every component has a `.Skeleton` variant for loading states.

---

## 18. Performance Budgets

### 18.1 Bundle Size Targets

| Package | Target (gzipped) | Contents |
|---------|------------------|----------|
| `@weiui/tokens` (CSS) | < 3 KB | CSS custom properties only |
| `@weiui/css` (full) | < 15 KB | All CSS-only components |
| `@weiui/css` (per-component) | < 1 KB each | Individual component CSS |
| `@weiui/headless` (full) | < 20 KB | All hooks + compound components |
| `@weiui/headless` (per-hook) | < 2 KB each | Individual hooks |
| `@weiui/react` (per-component, simple) | < 5 KB each | Styled component + headless dep (incremental) |
| `@weiui/react` (per-component, complex) | < 8 KB each | DatePicker, Combobox, ColorPicker (incremental) |
| `@weiui/icons` (per-icon) | < 0.5 KB each | Individual SVG icon |

**Measurement rules:**
- Per-component sizes are **incremental** — the cost of adding one component to a bundle that already includes shared dependencies (`@floating-ui/react`, `tailwind-variants`)
- Shared dependencies are counted once in the full package budget, not per-component
- Budgets enforced in CI via size-limit or bundlemon

### 18.2 Runtime Performance

- **No runtime CSS-in-JS** — styles are pre-compiled CSS, not generated at render time
- **No React context for styling** — only for theme token values
- **Minimal re-renders** — components use `memo`, `useMemo`, and `useCallback` where measurable
- **Tree-shaking** — import `{ Button } from "@weiui/react"` only bundles Button + its dependencies
- **CSS containment** — complex components use `contain: content` for paint isolation

### 18.3 Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| LCP | < 1.5s |
| FID / INP | < 100ms |
| CLS | < 0.05 |
| TBT | < 150ms |

---

## 19. Browser & Device Support

### 19.1 Browser Matrix

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 105+ | Full support including OKLCH, container queries |
| Firefox | 113+ | Full support |
| Safari | 16.4+ | Full support (OKLCH from 15.4, container queries from 16) |
| Edge | 105+ | Chromium-based, same as Chrome |
| iOS Safari | 16.4+ | |
| Samsung Internet | 20+ | |

### 19.2 Progressive Enhancement

For older browsers:

```css
/* OKLCH fallback */
:root {
  --wui-color-primary: hsl(221 83% 53%);          /* Fallback */
  --wui-color-primary: oklch(0.546 0.245 262.88);  /* Modern */
}

/* Container query fallback */
.wui-card__content {
  display: flex;
  flex-direction: column;
}

@supports (container-type: inline-size) {
  .wui-card { container-type: inline-size; }
  @container (min-width: 500px) {
    .wui-card__content { flex-direction: row; }
  }
}
```

### 19.3 Device Support

| Device | Touch targets | Typography | Layout |
|--------|--------------|------------|--------|
| Desktop (1024px+) | 44px minimum | Base 16px | Full layout |
| Tablet (640-1023px) | 44px minimum | Base 16px | Simplified layout |
| Mobile (<640px) | 48px recommended | Base 16px | Single column |
| Screen readers | N/A | Semantic structure | Landmark regions |
| Keyboard-only | Focus visible on all | N/A | Tab order preserved |
| High contrast mode | forced-colors support | System fonts | N/A |

---

## 20. Component State Matrix

Every interactive component must handle ALL applicable states. No two states may look identical.

| State | Visual Treatment | CSS Mechanism | Applies To |
|-------|-----------------|---------------|------------|
| **Default** | Base appearance | — | All |
| **Hover** | Subtle bg shift or border | `:hover` | Buttons, cards, links, rows |
| **Focus visible** | 3px ring + 2px offset (AAA) | `:focus-visible` | All interactive |
| **Focus within** | Subtle ring on container | `:focus-within` | Input groups, selects |
| **Active / Pressed** | Scale(0.98) or darker bg | `:active`, `[data-active]` | Buttons, toggles |
| **Disabled** | 50% opacity + not-allowed cursor | `[data-disabled]`, `:disabled` | Buttons, inputs |
| **Loading** | Spinner replaces content | `[data-loading]` | Buttons, cards |
| **Error / Invalid** | Destructive border + message | `[data-invalid]`, `:invalid` | Inputs, forms |
| **Success / Valid** | Success border or icon | `[data-valid]` | Inputs after validation |
| **Selected** | Primary bg tint + check | `[data-selected]`, `[aria-selected]` | List items, tabs |
| **Checked** | Filled indicator | `[data-checked]`, `:checked` | Checkbox, switch, radio |
| **Indeterminate** | Dash indicator | `[data-indeterminate]` | Checkbox |
| **Read-only** | Muted bg, no cursor change | `[data-readonly]`, `[readonly]` | Inputs |
| **Dragging** | Elevated shadow + scale(1.02) | `[data-dragging]` | Sortable items |
| **Drop target** | Dashed border + primary tint | `[data-drop-target]` | Drop zones |
| **Open / Expanded** | Content visible | `[data-open]`, `[aria-expanded]` | Accordion, dropdown, dialog |
| **Empty** | Placeholder + CTA | `[data-empty]` | Lists, tables |
| **Skeleton** | Shimmer animation | `.wui-skeleton` | All data-loading states |

---

## 21. Form Patterns

### 21.1 Controlled vs Uncontrolled

Every form component supports both patterns:

```tsx
// Uncontrolled (simplest)
<Input name="email" defaultValue="alice@example.com" />

// Controlled
const [email, setEmail] = useState("");
<Input value={email} onChange={(e) => setEmail(e.target.value)} />
```

### 21.2 Form Field Component

The `Field` wrapper connects label, input, helper text, and error message:

```tsx
<Field>
  <Field.Label>Email address</Field.Label>
  <Field.Control>
    <Input type="email" placeholder="you@example.com" />
  </Field.Control>
  <Field.Description>We'll never share your email.</Field.Description>
  <Field.Error>Please enter a valid email address.</Field.Error>
</Field>
```

**Accessibility: Field auto-wires:**
- `htmlFor` on label → `id` on input
- `aria-describedby` on input → description + error IDs
- `aria-invalid` when error is present
- `aria-required` when `required` prop is set

### 21.3 Validation Integration

Works with any validation library (Zod, Yup, Valibot) via standard HTML constraint validation API + custom validation:

```tsx
<Input
  type="email"
  required
  pattern="[^@]+@[^@]+\.[^@]+"
  onInvalid={(e) => e.target.setCustomValidity("Enter a valid email")}
  onInput={(e) => e.target.setCustomValidity("")}
/>
```

---

## 22. Z-Index & Layer Management

Strict z-index scale prevents stacking context chaos:

```json
{
  "zIndex": {
    "hide": { "$value": -1 },
    "base": { "$value": 0 },
    "raised": { "$value": 1 },
    "dropdown": { "$value": 1000 },
    "sticky": { "$value": 1100 },
    "overlay": { "$value": 1200 },
    "modal": { "$value": 1300 },
    "popover": { "$value": 1400 },
    "toast": { "$value": 1500 },
    "tooltip": { "$value": 1600 },
    "max": { "$value": 9999 }
  }
}
```

Components use these tokens exclusively — no magic z-index numbers.

---

## 23. Error Boundaries & Resilience

### 23.1 Component Error Boundaries

```tsx
<WeiUIProvider fallback={<DefaultErrorFallback />}>
  {/* If any WeiUI component throws, the fallback renders */}
</WeiUIProvider>
```

### 23.2 Graceful Degradation

Components handle invalid props gracefully:

```tsx
// Invalid color prop — falls back to "primary" with console warning in dev
<Button color="nonexistent">Click me</Button>

// Invalid children — renders empty state
<Select>{/* no items */}</Select>  // Shows "No options" message

// Missing required context — clear error message
<Select.Item> // Error: "Select.Item must be used within a Select"
```

---

## 24. Figma Workflow for Designers

### 24.1 Token Sync Pipeline

```
Figma Variables  ←→  Token JSON  →  Code Outputs
     ↑                    ↑
     │                    │
  Designer edits     Validated by CLI
  colors/spacing     (AAA contrast check)
  in Figma UI        before merge
```

**Two-way sync:**
1. **Code → Figma**: `weiui tokens sync-figma --push` pushes token changes to Figma
2. **Figma → Code**: `weiui tokens sync-figma --pull` pulls Figma changes to token JSON

### 24.2 Designer's Workflow (No Code Required)

1. Open Figma file with WeiUI token variables
2. Modify a color variable (e.g., change Primary from blue to teal)
3. Figma updates all components using that variable in real-time
4. Export: click "Sync to code" plugin button
5. Plugin generates a PR with updated `tokens.json`
6. CI validates AAA contrast — if it fails, PR is blocked with specific failures
7. If it passes, developer merges → npm publish → all consumers update

### 24.3 Figma Component Library

Every WeiUI component has a matching Figma component with:
- All variants as Figma component properties
- All states as interactive variants
- Auto-layout matching the CSS flexbox model
- Token variables (not hardcoded colors) for all properties

---

## 25. Framework Integration Examples

### 25.1 Next.js 16 (App Router)

```tsx
// app/layout.tsx
import { WeiUIProvider } from "@weiui/react";
import "@weiui/css/reset.css";
import "@weiui/tokens/tokens.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WeiUIProvider>{children}</WeiUIProvider>
      </body>
    </html>
  );
}

// app/page.tsx (Server Component — no "use client")
import { Card, Heading, Text, Badge } from "@weiui/react";

export default function Page() {
  return (
    <Card>
      <Heading level={2}>Dashboard</Heading>
      <Text color="muted">Welcome back</Text>
      <Badge color="success">Active</Badge>
    </Card>
  );
}
```

### 25.2 Vite + React

```tsx
// main.tsx
import "@weiui/css/reset.css";
import "@weiui/tokens/tokens.css";
import { WeiUIProvider } from "@weiui/react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <WeiUIProvider>
    <App />
  </WeiUIProvider>
);
```

### 25.3 Astro (CSS-only, no React)

```html
---
// Component in .astro file — uses Layer 1 only
import "@weiui/css/weiui.css";
---

<button class="wui-button wui-button--solid wui-button--primary wui-button--md">
  Click me
</button>

<div class="wui-card">
  <div class="wui-card__header">
    <h2 class="wui-heading wui-heading--2">Title</h2>
  </div>
  <div class="wui-card__content">
    <p class="wui-text">Content here</p>
  </div>
</div>
```

### 25.4 Vue (CSS + headless hooks ported)

```vue
<!-- Future: @weiui/vue package -->
<template>
  <button class="wui-button wui-button--solid wui-button--primary" v-bind="buttonProps">
    {{ label }}
  </button>
</template>
```

---

## 26. Versioning & Release Strategy

### 26.1 Semantic Versioning

All packages follow strict semver:

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| New component added | Minor | 1.2.0 → 1.3.0 |
| New variant/prop added | Minor | 1.2.0 → 1.3.0 |
| Bug fix | Patch | 1.2.0 → 1.2.1 |
| Accessibility fix | Patch | 1.2.0 → 1.2.1 |
| Breaking API change | Major | 1.2.0 → 2.0.0 |
| Token value change | Minor (with migration guide) | 1.2.0 → 1.3.0 |

### 26.2 Changesets

Uses [Changesets](https://github.com/changesets/changesets) for:
- Developer writes a changeset describing what changed
- CI generates changelogs automatically
- Publishes all affected packages in correct order
- GitHub releases created with release notes

### 26.3 Migration Guides

Every minor/major release includes:
- **What changed** — exact prop/class name changes
- **Why** — the reason for the change
- **Codemod** — automated migration script: `weiui migrate --from 1.x --to 2.x`
- **Manual steps** — anything the codemod can't handle

### 26.4 Long-Term Support

| Track | Duration | Gets |
|-------|----------|------|
| Current | Active development | New features + fixes |
| Previous major | 12 months | Security + a11y fixes only |
| Older | Unsupported | Documentation archived |

---

## 27. Testing Strategy

### 27.1 Test Pyramid

```
                    ┌─────────────┐
                    │   Visual    │  Playwright screenshots
                    │ Regression  │  across browsers + themes
                    ├─────────────┤
                    │    A11y     │  axe-core + keyboard nav
                    │   Audit     │  + screen reader assertions
                    ├─────────────┤
                │   Integration   │  Component interactions
                │     Tests       │  user-event + RTL
                ├─────────────────┤
            │      Unit Tests       │  Props, variants, state
            │      (Vitest)         │  logic, token validation
            └───────────────────────┘
```

### 27.2 Per-Component Test Requirements

Every component must have:

| Test Type | Tool | What It Checks | CI Gate |
|-----------|------|---------------|---------|
| Unit | Vitest | Props render correctly, variants apply | Required |
| Accessibility | axe-core | Zero AAA violations | Required |
| Keyboard | Playwright | All keyboard patterns work | Required |
| Visual | Playwright screenshots | No visual regressions | Required |
| States | Vitest + RTL | All states in state matrix render | Required |
| Dark mode | Playwright | Correct colors in .dark | Required |
| RTL | Playwright | Layout mirrors correctly | Required |
| SSR | Vitest | No hydration mismatch | Required |

### 27.3 Accessibility Test Example

```typescript
// Button.a11y.test.tsx
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Button } from "./Button";

expect.extend(toHaveNoViolations);

describe("Button accessibility", () => {
  it("passes axe audit at AAA level", async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container, {
      rules: {
        "color-contrast": { enabled: true },
        // Force AAA contrast check
      },
      runOnly: {
        type: "tag",
        values: ["wcag2aaa", "wcag21aaa", "wcag22aaa"],
      },
    });
    expect(results).toHaveNoViolations();
  });

  it("has minimum 44x44px touch target", () => {
    const { getByRole } = render(<Button>X</Button>);
    const button = getByRole("button");
    const { width, height } = button.getBoundingClientRect();
    expect(width).toBeGreaterThanOrEqual(44);
    expect(height).toBeGreaterThanOrEqual(44);
  });

  it("shows visible focus indicator", async () => {
    const { getByRole } = render(<Button>Click me</Button>);
    const button = getByRole("button");
    button.focus();
    const styles = window.getComputedStyle(button);
    expect(styles.outlineWidth).not.toBe("0px");
  });

  it("supports keyboard activation", async () => {
    const onClick = vi.fn();
    const { getByRole } = render(<Button onClick={onClick}>Click</Button>);
    const button = getByRole("button");
    await userEvent.tab(); // Focus
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(" "); // Space
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("announces loading state to screen readers", () => {
    const { getByRole } = render(<Button loading>Save</Button>);
    const button = getByRole("button");
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("disables interaction when disabled", () => {
    const onClick = vi.fn();
    const { getByRole } = render(<Button disabled onClick={onClick}>Click</Button>);
    const button = getByRole("button");
    expect(button).toHaveAttribute("aria-disabled", "true");
  });
});
```

---

## 28. Documentation Site Design

### 28.1 Landing Page Sections

1. **Hero** — "The last design system you'll need" + animated component showcase
2. **Three-layer diagram** — Interactive visualization of CSS → Headless → Styled
3. **Accessibility badge** — "WCAG AAA certified" with link to audit results
4. **Quick start** — 3-step installation in a code block
5. **Component gallery** — Grid of all 53 components with live mini-previews
6. **Theme builder** — Interactive: pick a primary color → see all components update live
7. **Comparison table** — WeiUI vs shadcn vs Headless UI vs HeroUI vs Bulma
8. **Framework support** — Next.js, Vite, Astro, Remix logos
9. **npm stats** — Install count, bundle size, test coverage

### 28.2 Component Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  ← Components / Button                                   │
│                                                           │
│  Button                                    [AAA ✓] badge │
│  Triggers an action or event.                             │
│                                                           │
│  ┌─ Tabs ──────────────────────────────────────────────┐ │
│  │ [Preview]  [Code]  [CSS-only]  [Headless]  [API]    │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │                                                     │ │
│  │  ┌─ Live Preview ────────────────────────────────┐  │ │
│  │  │                                               │  │ │
│  │  │  [Solid]  [Outline]  [Ghost]  [Soft]  [Link]  │  │ │
│  │  │                                               │  │ │
│  │  │  ┌─────┐ ┌─────────┐ ┌───────┐ ┌──────┐      │  │ │
│  │  │  │ Btn │ │ Outline │ │ Ghost │ │ Soft │      │  │ │
│  │  │  └─────┘ └─────────┘ └───────┘ └──────┘      │  │ │
│  │  │                                               │  │ │
│  │  └───────────────────────────────────────────────┘  │ │
│  │                                                     │ │
│  │  ┌─ Code ────────────────────────────────────────┐  │ │
│  │  │ import { Button } from "@weiui/react";        │  │ │
│  │  │                                               │  │ │
│  │  │ <Button variant="solid">Click me</Button>     │  │ │
│  │  └───────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Examples                                                 │
│  ─────────────────────────────────────────────────────── │
│  • With icons                    [Preview] [Code]         │
│  • Loading state                 [Preview] [Code]         │
│  • Button group                  [Preview] [Code]         │
│  • As link                       [Preview] [Code]         │
│                                                           │
│  Props                                                    │
│  ─────────────────────────────────────────────────────── │
│  │ Prop      │ Type           │ Default   │ Description │ │
│  │ variant   │ "solid"|"out"  │ "solid"   │ Visual...   │ │
│  │ size      │ "sm"|"md"|"lg" │ "md"      │ Size...     │ │
│  │ color     │ "primary"|...  │ "primary" │ Color...    │ │
│  │ loading   │ boolean        │ false     │ Shows...    │ │
│  │ disabled  │ boolean        │ false     │ Disables... │ │
│                                                           │
│  Accessibility                                            │
│  ─────────────────────────────────────────────────────── │
│  • Keyboard: Enter/Space to activate                      │
│  • Focus: 3px ring (AAA visible)                          │
│  • Touch target: 44×44px minimum                          │
│  • aria-busy when loading, aria-disabled when disabled     │
│  • Works with screen readers (tested: NVDA, VoiceOver)    │
│                                                           │
│  Design Tokens                                            │
│  ─────────────────────────────────────────────────────── │
│  --wui-button-height-sm: 36px                             │
│  --wui-button-height-md: 44px                             │
│  --wui-button-height-lg: 48px                             │
│  --wui-button-radius: var(--wui-radius-md)                │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 29. Governance & Contributing

### 29.1 RFC Process

Major changes require an RFC (Request for Comments):
1. Author opens an RFC issue with: problem, proposed solution, alternatives considered
2. Community discussion for 2 weeks
3. Core team reviews and decides
4. Accepted RFCs become implementation issues

### 29.2 Component Proposal Process

New components must meet these criteria:
1. **Used in 3+ real projects** — not speculative
2. **Not composable from existing components** — no "ButtonGroup" if Stack + Button works
3. **Has clear accessibility pattern** — WAI-ARIA pattern exists
4. **Passes AAA audit** — contrast, targets, keyboard, screen reader

### 29.3 Code Review Checklist

Every PR is checked for:
- [ ] TypeScript strict — zero `any`
- [ ] All states in state matrix implemented
- [ ] Unit tests passing
- [ ] Accessibility tests passing (AAA)
- [ ] Visual regression screenshots reviewed
- [ ] Dark mode verified
- [ ] RTL verified
- [ ] SSR hydration verified
- [ ] Bundle size within budget
- [ ] Documentation updated
- [ ] Changeset added

---

## 30. Expanded Success Criteria

In addition to the criteria in section 13:

- [ ] CSS uses `@layer` cascade — user styles always win without `!important`
- [ ] All CSS uses logical properties (no physical left/right)
- [ ] RTL layout works for all components (tested with `dir="rtl"`)
- [ ] SSR: zero hydration mismatches across all components
- [ ] RSC: static components work without "use client"
- [ ] Container queries used for intrinsic responsive components
- [ ] Fluid typography with `clamp()` for headings
- [ ] Performance: each component < 5KB gzipped
- [ ] Performance: full CSS bundle < 15KB gzipped
- [ ] Core Web Vitals pass on documentation site
- [ ] Figma token sync works bidirectionally
- [ ] Form components integrate with native HTML validation
- [ ] Field wrapper auto-wires label, description, and error aria attributes
- [ ] Z-index scale has no conflicts between overlay components
- [ ] Every component has matching Figma component
- [ ] Migration CLI can upgrade between minor versions
- [ ] Visual regression tests cover all components × all states × light/dark × LTR/RTL
- [ ] Documentation has interactive playground for every component
- [ ] Theme builder generates AAA-compliant themes from a single brand color
- [ ] Visual composer allows drag-and-drop page assembly from WeiUI components
- [ ] Composer exports clean JSX and CSS-only HTML code

---

## 31. Future Roadmap

**WeiUI Page Builder (separate product):**
A standalone visual page builder application using WeiUI as its component foundation. Unlike the composer (which exports code snippets), the page builder would be a full product with backend storage, versioning, collaboration, and CMS integration. This is a separate project with its own design doc and plan — not part of the design system deliverable.
