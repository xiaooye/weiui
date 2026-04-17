# Phase 3 — Homepage Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Rebuild the landing page with a polished hero, 6-value-prop grid, interactive live showcase, comparison table, install snippet, and footer. Keep the single ambient gradient + single display-serif constraint from the spec.

**Architecture:** Landing page composed of reusable sections under `apps/docs/src/components/landing/`. Each section is a server component where possible (static content + existing WeiUI components). Only the `LiveShowcase` component (interactive demos) is a client component.

**Tech Stack:** Next.js 15 App Router, React 19, existing WeiUI components from `@weiui/react`.

**Spec reference:** `docs/superpowers/specs/2026-04-16-polish-overhaul-design.md` §7.

---

## File Structure

**New files:**
- `apps/docs/src/components/landing/Hero.tsx`
- `apps/docs/src/components/landing/ValueProps.tsx`
- `apps/docs/src/components/landing/LiveShowcase.tsx` (client)
- `apps/docs/src/components/landing/Comparison.tsx`
- `apps/docs/src/components/landing/InstallSnippet.tsx`
- `apps/docs/src/components/landing/Footer.tsx`
- `apps/docs/src/styles/landing.css`

**Modified files:**
- `apps/docs/src/app/page.tsx` — compose new sections
- `apps/docs/src/app/layout.tsx` — import `landing.css`

---

## Task 1: Sections scaffold + Hero

- [ ] **Step 1: Create `apps/docs/src/styles/landing.css`**

```css
@layer wui-base {
  .wui-home-section {
    max-inline-size: 72rem;
    margin-inline: auto;
    padding-inline: var(--wui-spacing-6);
  }
  .wui-home-section__header {
    text-align: center;
    margin-block-end: var(--wui-spacing-8);
  }
  .wui-home-section__eyebrow {
    display: inline-block;
    font-size: var(--wui-font-size-xs);
    font-weight: var(--wui-font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--wui-color-primary);
    background-color: color-mix(in oklch, var(--wui-color-primary) 10%, transparent);
    padding-inline: var(--wui-spacing-3); padding-block: var(--wui-spacing-1);
    border-radius: var(--wui-shape-radius-full);
    margin-block-end: var(--wui-spacing-3);
  }
  .wui-home-section__title {
    font-size: var(--wui-font-size-3xl);
    font-weight: var(--wui-font-weight-semibold);
    line-height: 1.15;
    letter-spacing: -0.01em;
    margin-block-end: var(--wui-spacing-2);
  }
  .wui-home-section__sub {
    color: var(--wui-color-muted-foreground);
    font-size: var(--wui-font-size-lg);
    max-inline-size: 42rem;
    margin-inline: auto;
  }
}
```

- [ ] **Step 2: Create `apps/docs/src/components/landing/Hero.tsx`**

```tsx
import Link from "next/link";
import { siteConfig } from "../../lib/site-config";

export function Hero() {
  return (
    <section className="wui-landing-hero">
      <span className="wui-landing-hero__badge">v{siteConfig.version} · Pre-release</span>
      <h1 className="wui-display wui-landing-hero__title">
        A design system that earns its place.
      </h1>
      <p className="wui-landing-hero__sub">
        Three consumption layers. WCAG AAA enforcement. OKLCH tokens. Designer-friendly.
      </p>
      <div className="wui-landing-hero__cta">
        <Link href="/docs/getting-started" className="wui-button wui-button--solid wui-button--lg">Get Started</Link>
        <Link href="/docs/components" className="wui-button wui-button--outline wui-button--lg">Components</Link>
        <a href={siteConfig.githubUrl} target="_blank" rel="noreferrer" className="wui-button wui-button--ghost wui-button--lg">GitHub</a>
      </div>
      <div className="wui-landing-hero__metrics">
        <div><strong>65+</strong><span>Components</span></div>
        <div><strong>AAA</strong><span>Contrast</span></div>
        <div><strong>3</strong><span>Layers</span></div>
        <div><strong>0</strong><span>JS required</span></div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Append hero-specific styles to `landing.css`**

```css
@layer wui-base {
  .wui-landing-hero__badge {
    display: inline-block;
    font-size: var(--wui-font-size-xs);
    font-weight: var(--wui-font-weight-medium);
    color: var(--wui-color-muted-foreground);
    background-color: var(--wui-surface-sunken);
    border: 1px solid var(--wui-color-border);
    padding-inline: var(--wui-spacing-3); padding-block: var(--wui-spacing-1);
    border-radius: var(--wui-shape-radius-full);
    margin-block-end: var(--wui-spacing-6);
  }
  .wui-landing-hero__metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--wui-spacing-8);
    max-inline-size: 48rem;
    margin-inline: auto;
    margin-block-start: var(--wui-spacing-12);
    padding-block-start: var(--wui-spacing-8);
    border-block-start: 1px solid var(--wui-color-border);
  }
  .wui-landing-hero__metrics > div {
    display: flex; flex-direction: column; align-items: center; gap: var(--wui-spacing-1);
  }
  .wui-landing-hero__metrics strong {
    font-family: var(--wui-font-family-display);
    font-size: var(--wui-font-size-3xl);
    font-weight: var(--wui-font-weight-regular);
    line-height: 1;
    color: var(--wui-color-foreground);
  }
  .wui-landing-hero__metrics span {
    font-size: var(--wui-font-size-xs);
    color: var(--wui-color-muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  @media (max-width: 640px) {
    .wui-landing-hero__metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
}
```

- [ ] **Step 4: Import `landing.css` in `apps/docs/src/app/layout.tsx`**

After the `preview.css` import add:
```tsx
import "../styles/landing.css";
```

- [ ] **Step 5: Update `apps/docs/src/app/page.tsx` to use the new Hero section**

Replace the file with:

```tsx
import { Header } from "../components/chrome/Header";
import { Hero } from "../components/landing/Hero";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
      </main>
    </>
  );
}
```

- [ ] **Step 6: Build + commit**

```bash
pnpm --filter @weiui/docs build
git add apps/docs/src/components/landing/Hero.tsx \
        apps/docs/src/styles/landing.css \
        apps/docs/src/app/layout.tsx \
        apps/docs/src/app/page.tsx
git commit -m "feat(docs): extract Hero into landing/ + add badge + 4-metric bar"
```

---

## Task 2: ValueProps grid (6 cards with icons)

**File:** `apps/docs/src/components/landing/ValueProps.tsx`

- [ ] **Step 1: Create the component**

```tsx
interface Prop {
  title: string;
  body: string;
  glyph: string; // emoji or single char for simplicity — avoids icon-lib dep
}

const PROPS: Prop[] = [
  {
    title: "Three Layers",
    glyph: "◎",
    body: "CSS-only primitives, accessible headless hooks, or fully styled React components. Pick your integration depth.",
  },
  {
    title: "WCAG AAA",
    glyph: "✓",
    body: "7:1 contrast for content text. 44×44 touch targets. Keyboard patterns validated at build time, not in review.",
  },
  {
    title: "OKLCH Tokens",
    glyph: "◐",
    body: "W3C Design Tokens in JSON. Perceptually-uniform color space. Automatic light/dark via relative color functions.",
  },
  {
    title: "Designer-Friendly",
    glyph: "✎",
    body: "Tokens live in JSON, Figma variables, and CSS vars — one source of truth. Designers edit without touching component code.",
  },
  {
    title: "Zero-JS tier",
    glyph: "∅",
    body: "Drop the CSS package into any framework — Vue, Svelte, plain HTML — and get accessible primitives without a bundler.",
  },
  {
    title: "Ownership, not lock-in",
    glyph: "⎘",
    body: "shadcn-style CLI copy-paste for components. Own the code, modify anything, no version-bump fear.",
  },
];

export function ValueProps() {
  return (
    <section className="wui-home-section wui-home-values">
      <header className="wui-home-section__header">
        <span className="wui-home-section__eyebrow">Why WeiUI</span>
        <h2 className="wui-home-section__title">Built for teams that ship serious UI.</h2>
        <p className="wui-home-section__sub">
          Every decision is graded against real production pain: drift, accessibility debt, designer–developer friction.
        </p>
      </header>
      <div className="wui-home-values__grid">
        {PROPS.map((p) => (
          <article key={p.title} className="wui-home-values__card">
            <span className="wui-home-values__glyph" aria-hidden="true">{p.glyph}</span>
            <h3 className="wui-home-values__title">{p.title}</h3>
            <p className="wui-home-values__body">{p.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Append styles to `landing.css`**

```css
@layer wui-base {
  .wui-home-values {
    padding-block: var(--wui-spacing-12);
  }
  .wui-home-values__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: var(--wui-spacing-4);
  }
  .wui-home-values__card {
    padding: var(--wui-spacing-6);
    background-color: var(--wui-surface-raised);
    border: 1px solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-lg);
    box-shadow: var(--wui-elevation-1);
  }
  .wui-home-values__glyph {
    display: inline-flex; align-items: center; justify-content: center;
    inline-size: 40px; block-size: 40px;
    background-color: color-mix(in oklch, var(--wui-color-primary) 10%, transparent);
    color: var(--wui-color-primary);
    border-radius: var(--wui-shape-radius-md);
    font-size: var(--wui-font-size-xl);
    margin-block-end: var(--wui-spacing-3);
  }
  .wui-home-values__title {
    font-size: var(--wui-font-size-lg);
    font-weight: var(--wui-font-weight-semibold);
    margin-block-end: var(--wui-spacing-2);
  }
  .wui-home-values__body {
    color: var(--wui-color-muted-foreground);
    font-size: var(--wui-font-size-sm);
    line-height: 1.6;
  }

  @media (prefers-reduced-motion: no-preference) {
    .wui-home-values__card {
      transition-property: transform, box-shadow, border-color;
      transition-duration: var(--wui-motion-duration-base);
      transition-timing-function: var(--wui-motion-easing-standard);
    }
    .wui-home-values__card:hover {
      transform: translateY(-2px);
      box-shadow: var(--wui-elevation-3);
      border-color: color-mix(in oklch, var(--wui-color-primary) 40%, var(--wui-color-border));
    }
  }
}
```

- [ ] **Step 3: Wire into `page.tsx`**

```tsx
import { Header } from "../components/chrome/Header";
import { Hero } from "../components/landing/Hero";
import { ValueProps } from "../components/landing/ValueProps";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ValueProps />
      </main>
    </>
  );
}
```

- [ ] **Step 4: Build + commit**

```bash
pnpm --filter @weiui/docs build
git add apps/docs/src/components/landing/ValueProps.tsx \
        apps/docs/src/styles/landing.css \
        apps/docs/src/app/page.tsx
git commit -m "feat(docs): add ValueProps section (6 cards with glyphs)"
```

---

## Task 3: LiveShowcase (interactive demos)

**File:** `apps/docs/src/components/landing/LiveShowcase.tsx` (client component)

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useState } from "react";

const DEMOS = [
  { id: "buttons", label: "Buttons" },
  { id: "form", label: "Form" },
  { id: "card", label: "Card" },
  { id: "chips", label: "Chips" },
] as const;

type DemoId = (typeof DEMOS)[number]["id"];

export function LiveShowcase() {
  const [active, setActive] = useState<DemoId>("buttons");

  return (
    <section className="wui-home-section wui-home-showcase">
      <header className="wui-home-section__header">
        <span className="wui-home-section__eyebrow">Live preview</span>
        <h2 className="wui-home-section__title">Components, live — not screenshots.</h2>
        <p className="wui-home-section__sub">
          Everything below is rendered with the same tokens your app will use. Toggle the theme from the header to see dark mode in real time.
        </p>
      </header>

      <div className="wui-home-showcase__tabs" role="tablist">
        {DEMOS.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={active === d.id}
            onClick={() => setActive(d.id)}
            className="wui-home-showcase__tab"
            data-active={active === d.id || undefined}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="wui-home-showcase__stage">
        {active === "buttons" && <ButtonDemo />}
        {active === "form" && <FormDemo />}
        {active === "card" && <CardDemo />}
        {active === "chips" && <ChipDemo />}
      </div>
    </section>
  );
}

function ButtonDemo() {
  return (
    <div className="wui-home-showcase__row">
      <button className="wui-button wui-button--solid">Solid</button>
      <button className="wui-button wui-button--outline">Outline</button>
      <button className="wui-button wui-button--ghost">Ghost</button>
      <button className="wui-button wui-button--soft">Soft</button>
      <button className="wui-button wui-button--solid wui-button--destructive">Delete</button>
      <button className="wui-button wui-button--solid" data-loading="true">Loading…</button>
    </div>
  );
}

function FormDemo() {
  return (
    <div className="wui-home-showcase__form">
      <div>
        <label htmlFor="wui-demo-email" className="wui-home-showcase__label">Email</label>
        <input id="wui-demo-email" type="email" className="wui-input" placeholder="ada@example.com" />
      </div>
      <div>
        <label htmlFor="wui-demo-pass" className="wui-home-showcase__label">Password</label>
        <input id="wui-demo-pass" type="password" className="wui-input" placeholder="••••••••" />
      </div>
      <button className="wui-button wui-button--solid" type="button">Sign in</button>
    </div>
  );
}

function CardDemo() {
  return (
    <div className="wui-card" style={{ maxInlineSize: "360px" }}>
      <div className="wui-card__header">
        <span className="wui-avatar"><span className="wui-avatar__fallback">WU</span></span>
        <div>
          <div style={{ fontWeight: "var(--wui-font-weight-semibold)" }}>WeiUI Shipped</div>
          <div style={{ fontSize: "var(--wui-font-size-xs)", color: "var(--wui-color-muted-foreground)" }}>v0.0.1 · 2 days ago</div>
        </div>
      </div>
      <div className="wui-card__content">
        Phase 0 foundations landed — new shadow, motion, elevation tokens and a polish recipe applied to 36 component CSS files.
      </div>
      <div className="wui-card__footer">
        <button className="wui-button wui-button--soft wui-button--sm">View</button>
        <button className="wui-button wui-button--ghost wui-button--sm">Dismiss</button>
      </div>
    </div>
  );
}

function ChipDemo() {
  return (
    <div className="wui-home-showcase__row">
      <span className="wui-chip">Default</span>
      <span className="wui-chip wui-chip--primary">Primary</span>
      <span className="wui-chip wui-chip--success">Shipped</span>
      <span className="wui-chip wui-chip--destructive">Breaking</span>
      <span className="wui-badge wui-badge--solid">New</span>
      <span className="wui-badge wui-badge--soft">Beta</span>
      <span className="wui-badge wui-badge--outline">v0</span>
      <span className="wui-badge wui-badge--success">AAA</span>
    </div>
  );
}
```

- [ ] **Step 2: Append styles to `landing.css`**

```css
@layer wui-base {
  .wui-home-showcase {
    padding-block: var(--wui-spacing-12);
  }
  .wui-home-showcase__tabs {
    display: inline-flex;
    gap: 2px;
    padding: 2px;
    background-color: var(--wui-surface-sunken);
    border: 1px solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-md);
    margin-block-end: var(--wui-spacing-6);
  }
  .wui-home-showcase__tab {
    font-size: var(--wui-font-size-sm);
    font-weight: var(--wui-font-weight-medium);
    padding-inline: var(--wui-spacing-4); padding-block: var(--wui-spacing-2);
    color: var(--wui-color-muted-foreground);
    background: transparent;
    border: none;
    border-radius: calc(var(--wui-shape-radius-md) - 2px);
    cursor: pointer;
  }
  .wui-home-showcase__tab[data-active] {
    background-color: var(--wui-surface-raised);
    color: var(--wui-color-foreground);
    box-shadow: var(--wui-elevation-1);
  }
  .wui-home-showcase__stage {
    padding: var(--wui-spacing-8);
    background-color: var(--wui-surface-raised);
    border: 1px solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-lg);
    box-shadow: var(--wui-elevation-2);
    min-block-size: 260px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .wui-home-showcase__row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--wui-spacing-3);
    align-items: center;
    justify-content: center;
  }
  .wui-home-showcase__form {
    display: flex;
    flex-direction: column;
    gap: var(--wui-spacing-3);
    max-inline-size: 320px;
    inline-size: 100%;
  }
  .wui-home-showcase__label {
    display: block;
    font-size: var(--wui-font-size-xs);
    font-weight: var(--wui-font-weight-medium);
    color: var(--wui-color-muted-foreground);
    margin-block-end: var(--wui-spacing-1);
  }

  @media (prefers-reduced-motion: no-preference) {
    .wui-home-showcase__tab {
      transition-property: background-color, color, box-shadow;
      transition-duration: var(--wui-motion-duration-fast);
      transition-timing-function: var(--wui-motion-easing-standard);
    }
  }
}
```

- [ ] **Step 3: Wire into `page.tsx`**

```tsx
import { Header } from "../components/chrome/Header";
import { Hero } from "../components/landing/Hero";
import { ValueProps } from "../components/landing/ValueProps";
import { LiveShowcase } from "../components/landing/LiveShowcase";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ValueProps />
        <LiveShowcase />
      </main>
    </>
  );
}
```

- [ ] **Step 4: Build + commit**

```bash
pnpm --filter @weiui/docs build
git add apps/docs/src/components/landing/LiveShowcase.tsx \
        apps/docs/src/styles/landing.css \
        apps/docs/src/app/page.tsx
git commit -m "feat(docs): add LiveShowcase with Buttons/Form/Card/Chips demos"
```

---

## Task 4: Comparison table + InstallSnippet + Footer

- [ ] **Step 1: Create `Comparison.tsx`**

```tsx
interface Lib {
  name: string;
  cells: Record<string, boolean | string>;
}

const ROWS = [
  "AAA enforced",
  "CSS-only tier",
  "Headless tier",
  "Design tokens",
  "Designer contribution path",
  "RTL support",
  "Framework-agnostic CSS",
  "Copy-paste ownership",
] as const;

const LIBS: Lib[] = [
  {
    name: "WeiUI",
    cells: {
      "AAA enforced": true,
      "CSS-only tier": true,
      "Headless tier": true,
      "Design tokens": true,
      "Designer contribution path": true,
      "RTL support": true,
      "Framework-agnostic CSS": true,
      "Copy-paste ownership": true,
    },
  },
  {
    name: "shadcn/ui",
    cells: {
      "AAA enforced": false,
      "CSS-only tier": false,
      "Headless tier": "via Radix",
      "Design tokens": "limited",
      "Designer contribution path": false,
      "RTL support": "partial",
      "Framework-agnostic CSS": false,
      "Copy-paste ownership": true,
    },
  },
  {
    name: "HeroUI",
    cells: {
      "AAA enforced": false,
      "CSS-only tier": false,
      "Headless tier": false,
      "Design tokens": true,
      "Designer contribution path": false,
      "RTL support": true,
      "Framework-agnostic CSS": false,
      "Copy-paste ownership": false,
    },
  },
  {
    name: "Headless UI",
    cells: {
      "AAA enforced": false,
      "CSS-only tier": false,
      "Headless tier": true,
      "Design tokens": false,
      "Designer contribution path": false,
      "RTL support": "partial",
      "Framework-agnostic CSS": false,
      "Copy-paste ownership": false,
    },
  },
  {
    name: "Radix UI",
    cells: {
      "AAA enforced": false,
      "CSS-only tier": false,
      "Headless tier": true,
      "Design tokens": "via Themes",
      "Designer contribution path": false,
      "RTL support": true,
      "Framework-agnostic CSS": false,
      "Copy-paste ownership": false,
    },
  },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true)  return <span className="wui-home-compare__yes" aria-label="Yes">●</span>;
  if (value === false) return <span className="wui-home-compare__no"  aria-label="No">○</span>;
  return <span className="wui-home-compare__partial">{value}</span>;
}

export function Comparison() {
  return (
    <section className="wui-home-section wui-home-compare">
      <header className="wui-home-section__header">
        <span className="wui-home-section__eyebrow">Comparison</span>
        <h2 className="wui-home-section__title">Where WeiUI fits.</h2>
        <p className="wui-home-section__sub">
          Every library has tradeoffs. These are ours, plotted against the closest peers.
        </p>
      </header>
      <div className="wui-home-compare__wrap">
        <table className="wui-home-compare__table">
          <thead>
            <tr>
              <th></th>
              {LIBS.map((lib) => <th key={lib.name}>{lib.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row}>
                <th scope="row">{row}</th>
                {LIBS.map((lib) => <td key={lib.name}><Cell value={lib.cells[row]} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `InstallSnippet.tsx`**

```tsx
import { PackageManagerTabs } from "../docs/PackageManagerTabs";

export function InstallSnippet() {
  return (
    <section className="wui-home-section wui-home-install">
      <header className="wui-home-section__header">
        <span className="wui-home-section__eyebrow">Get started</span>
        <h2 className="wui-home-section__title">One command.</h2>
        <p className="wui-home-section__sub">
          All you need is the React package — tokens and CSS primitives come along for free.
        </p>
      </header>
      <div className="wui-home-install__wrap">
        <PackageManagerTabs command="@weiui/react" />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `Footer.tsx`**

```tsx
import Link from "next/link";
import { siteConfig } from "../../lib/site-config";

export function Footer() {
  return (
    <footer className="wui-home-footer">
      <div className="wui-home-footer__inner">
        <div className="wui-home-footer__brand">
          <span className="wui-home-footer__logo" aria-hidden="true">◐</span>
          <span>{siteConfig.name}</span>
          <span className="wui-home-footer__version">v{siteConfig.version}</span>
        </div>
        <div className="wui-home-footer__cols">
          <div>
            <h4>Docs</h4>
            <Link href="/docs/getting-started">Installation</Link>
            <Link href="/docs/components">Components</Link>
            <Link href="/docs/typography">Typography</Link>
            <Link href="/docs/colors">Colors</Link>
          </div>
          <div>
            <h4>Tools</h4>
            <Link href="/playground">Playground</Link>
            <Link href="/composer">Composer</Link>
            <Link href="/themes">Theme Builder</Link>
          </div>
          <div>
            <h4>Project</h4>
            <a href={siteConfig.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
            <Link href="/docs/changelog">Changelog</Link>
            <Link href="/docs/migration">Migration</Link>
          </div>
        </div>
      </div>
      <div className="wui-home-footer__bottom">
        <span>© 2026 WeiUI. MIT License.</span>
        <span>Made with WeiUI.</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Append styles to `landing.css`**

```css
@layer wui-base {
  /* Comparison */
  .wui-home-compare { padding-block: var(--wui-spacing-12); }
  .wui-home-compare__wrap {
    overflow-x: auto;
    border: 1px solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-lg);
    background-color: var(--wui-surface-raised);
    box-shadow: var(--wui-elevation-1);
  }
  .wui-home-compare__table {
    inline-size: 100%;
    border-collapse: collapse;
    font-size: var(--wui-font-size-sm);
  }
  .wui-home-compare__table th,
  .wui-home-compare__table td {
    padding-inline: var(--wui-spacing-4); padding-block: var(--wui-spacing-3);
    text-align: start;
    border-block-end: 1px solid var(--wui-color-border);
  }
  .wui-home-compare__table thead th {
    background-color: var(--wui-surface-sunken);
    font-weight: var(--wui-font-weight-semibold);
    font-size: var(--wui-font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--wui-color-muted-foreground);
    text-align: center;
  }
  .wui-home-compare__table thead th:first-child { text-align: start; }
  .wui-home-compare__table tbody th {
    font-weight: var(--wui-font-weight-medium);
    color: var(--wui-color-foreground);
  }
  .wui-home-compare__table tbody td { text-align: center; }
  .wui-home-compare__yes {
    color: var(--wui-color-success);
    font-size: var(--wui-font-size-lg);
  }
  .wui-home-compare__no {
    color: var(--wui-color-muted-foreground);
    font-size: var(--wui-font-size-lg);
  }
  .wui-home-compare__partial {
    display: inline-block;
    font-size: var(--wui-font-size-xs);
    color: var(--wui-color-warning);
    font-style: italic;
  }

  /* Install snippet */
  .wui-home-install { padding-block: var(--wui-spacing-12); }
  .wui-home-install__wrap {
    max-inline-size: 48rem;
    margin-inline: auto;
  }

  /* Footer */
  .wui-home-footer {
    margin-block-start: var(--wui-spacing-12);
    padding-block: var(--wui-spacing-12);
    background-color: var(--wui-surface-sunken);
    border-block-start: 1px solid var(--wui-color-border);
  }
  .wui-home-footer__inner {
    max-inline-size: 72rem;
    margin-inline: auto;
    padding-inline: var(--wui-spacing-6);
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--wui-spacing-8);
  }
  .wui-home-footer__brand {
    display: flex; flex-direction: column; gap: var(--wui-spacing-1);
  }
  .wui-home-footer__brand > span:first-child {
    font-size: var(--wui-font-size-xl);
  }
  .wui-home-footer__brand > span:nth-child(2) {
    font-weight: var(--wui-font-weight-semibold);
  }
  .wui-home-footer__version {
    font-size: var(--wui-font-size-xs);
    color: var(--wui-color-muted-foreground);
  }
  .wui-home-footer__cols {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--wui-spacing-6);
  }
  .wui-home-footer__cols h4 {
    font-size: var(--wui-font-size-xs);
    font-weight: var(--wui-font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--wui-color-muted-foreground);
    margin-block-end: var(--wui-spacing-3);
  }
  .wui-home-footer__cols a {
    display: block;
    font-size: var(--wui-font-size-sm);
    color: var(--wui-color-muted-foreground);
    text-decoration: none;
    padding-block: 2px;
  }
  .wui-home-footer__cols a:hover { color: var(--wui-color-foreground); }
  .wui-home-footer__bottom {
    max-inline-size: 72rem;
    margin-inline: auto;
    padding-inline: var(--wui-spacing-6);
    margin-block-start: var(--wui-spacing-8);
    padding-block-start: var(--wui-spacing-6);
    border-block-start: 1px solid var(--wui-color-border);
    display: flex;
    justify-content: space-between;
    font-size: var(--wui-font-size-xs);
    color: var(--wui-color-muted-foreground);
  }

  @media (max-width: 768px) {
    .wui-home-footer__inner { grid-template-columns: 1fr; }
    .wui-home-footer__cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
}
```

- [ ] **Step 5: Final `page.tsx`**

Replace with:

```tsx
import { Header } from "../components/chrome/Header";
import { Hero } from "../components/landing/Hero";
import { ValueProps } from "../components/landing/ValueProps";
import { LiveShowcase } from "../components/landing/LiveShowcase";
import { Comparison } from "../components/landing/Comparison";
import { InstallSnippet } from "../components/landing/InstallSnippet";
import { Footer } from "../components/landing/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ValueProps />
        <LiveShowcase />
        <Comparison />
        <InstallSnippet />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 6: Build + commit**

```bash
pnpm --filter @weiui/docs build
git add apps/docs/src/components/landing/Comparison.tsx \
        apps/docs/src/components/landing/InstallSnippet.tsx \
        apps/docs/src/components/landing/Footer.tsx \
        apps/docs/src/styles/landing.css \
        apps/docs/src/app/page.tsx
git commit -m "feat(docs): add comparison table, install snippet, footer"
```

---

## Task 5: Final verification

- [ ] Full build: `pnpm build`
- [ ] Tests: `pnpm test` (still 524+)
- [ ] Dev server: open `/`, verify:
  - Hero with badge, display heading, 3 CTAs, 4-metric bar
  - ValueProps 6 cards with glyphs, hover lift
  - LiveShowcase tabs switch content, components render with new polish
  - Comparison table with WeiUI column filled vs dotted/partial others
  - Install snippet uses PackageManagerTabs
  - Footer with 3 columns + bottom copyright
- [ ] Toggle theme from header — everything re-themes correctly
- [ ] Report Phase 3 complete
