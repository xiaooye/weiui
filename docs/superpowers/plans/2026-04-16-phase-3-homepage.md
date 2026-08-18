# Phase 3 — Homepage Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Rebuild the landing page with a polished hero, 6-value-prop grid, interactive live showcase, comparison table, install snippet, and footer. Keep the single ambient gradient + single display-serif constraint from the spec.

**Architecture:** Landing page composed of reusable sections under `apps/docs/src/components/landing/`. Each section is a server component where possible (static content + existing Civaria components). Only the `LiveShowcase` component (interactive demos) is a client component.

**Tech Stack:** Next.js 15 App Router, React 19, existing Civaria components from `civaria`.

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
@layer civ-base {
  .civ-home-section {
    max-inline-size: 72rem;
    margin-inline: auto;
    padding-inline: var(--civ-spacing-6);
  }
  .civ-home-section__header {
    text-align: center;
    margin-block-end: var(--civ-spacing-8);
  }
  .civ-home-section__eyebrow {
    display: inline-block;
    font-size: var(--civ-font-size-xs);
    font-weight: var(--civ-font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--civ-color-primary);
    background-color: color-mix(in oklch, var(--civ-color-primary) 10%, transparent);
    padding-inline: var(--civ-spacing-3); padding-block: var(--civ-spacing-1);
    border-radius: var(--civ-shape-radius-full);
    margin-block-end: var(--civ-spacing-3);
  }
  .civ-home-section__title {
    font-size: var(--civ-font-size-3xl);
    font-weight: var(--civ-font-weight-semibold);
    line-height: 1.15;
    letter-spacing: -0.01em;
    margin-block-end: var(--civ-spacing-2);
  }
  .civ-home-section__sub {
    color: var(--civ-color-muted-foreground);
    font-size: var(--civ-font-size-lg);
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
    <section className="civ-landing-hero">
      <span className="civ-landing-hero__badge">v{siteConfig.version} · Pre-release</span>
      <h1 className="civ-display civ-landing-hero__title">
        A design system that earns its place.
      </h1>
      <p className="civ-landing-hero__sub">
        Three consumption layers. WCAG AAA enforcement. OKLCH tokens. Designer-friendly.
      </p>
      <div className="civ-landing-hero__cta">
        <Link href="/docs/getting-started" className="civ-button civ-button--solid civ-button--lg">Get Started</Link>
        <Link href="/docs/components" className="civ-button civ-button--outline civ-button--lg">Components</Link>
        <a href={siteConfig.githubUrl} target="_blank" rel="noreferrer" className="civ-button civ-button--ghost civ-button--lg">GitHub</a>
      </div>
      <div className="civ-landing-hero__metrics">
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
@layer civ-base {
  .civ-landing-hero__badge {
    display: inline-block;
    font-size: var(--civ-font-size-xs);
    font-weight: var(--civ-font-weight-medium);
    color: var(--civ-color-muted-foreground);
    background-color: var(--civ-surface-sunken);
    border: 1px solid var(--civ-color-border);
    padding-inline: var(--civ-spacing-3); padding-block: var(--civ-spacing-1);
    border-radius: var(--civ-shape-radius-full);
    margin-block-end: var(--civ-spacing-6);
  }
  .civ-landing-hero__metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--civ-spacing-8);
    max-inline-size: 48rem;
    margin-inline: auto;
    margin-block-start: var(--civ-spacing-12);
    padding-block-start: var(--civ-spacing-8);
    border-block-start: 1px solid var(--civ-color-border);
  }
  .civ-landing-hero__metrics > div {
    display: flex; flex-direction: column; align-items: center; gap: var(--civ-spacing-1);
  }
  .civ-landing-hero__metrics strong {
    font-family: var(--civ-font-family-display);
    font-size: var(--civ-font-size-3xl);
    font-weight: var(--civ-font-weight-regular);
    line-height: 1;
    color: var(--civ-color-foreground);
  }
  .civ-landing-hero__metrics span {
    font-size: var(--civ-font-size-xs);
    color: var(--civ-color-muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  @media (max-width: 640px) {
    .civ-landing-hero__metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
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
pnpm --filter @civaria/docs build
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
    <section className="civ-home-section civ-home-values">
      <header className="civ-home-section__header">
        <span className="civ-home-section__eyebrow">Why Civaria</span>
        <h2 className="civ-home-section__title">Built for teams that ship serious UI.</h2>
        <p className="civ-home-section__sub">
          Every decision is graded against real production pain: drift, accessibility debt, designer–developer friction.
        </p>
      </header>
      <div className="civ-home-values__grid">
        {PROPS.map((p) => (
          <article key={p.title} className="civ-home-values__card">
            <span className="civ-home-values__glyph" aria-hidden="true">{p.glyph}</span>
            <h3 className="civ-home-values__title">{p.title}</h3>
            <p className="civ-home-values__body">{p.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Append styles to `landing.css`**

```css
@layer civ-base {
  .civ-home-values {
    padding-block: var(--civ-spacing-12);
  }
  .civ-home-values__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: var(--civ-spacing-4);
  }
  .civ-home-values__card {
    padding: var(--civ-spacing-6);
    background-color: var(--civ-surface-raised);
    border: 1px solid var(--civ-color-border);
    border-radius: var(--civ-shape-radius-lg);
    box-shadow: var(--civ-elevation-1);
  }
  .civ-home-values__glyph {
    display: inline-flex; align-items: center; justify-content: center;
    inline-size: 40px; block-size: 40px;
    background-color: color-mix(in oklch, var(--civ-color-primary) 10%, transparent);
    color: var(--civ-color-primary);
    border-radius: var(--civ-shape-radius-md);
    font-size: var(--civ-font-size-xl);
    margin-block-end: var(--civ-spacing-3);
  }
  .civ-home-values__title {
    font-size: var(--civ-font-size-lg);
    font-weight: var(--civ-font-weight-semibold);
    margin-block-end: var(--civ-spacing-2);
  }
  .civ-home-values__body {
    color: var(--civ-color-muted-foreground);
    font-size: var(--civ-font-size-sm);
    line-height: 1.6;
  }

  @media (prefers-reduced-motion: no-preference) {
    .civ-home-values__card {
      transition-property: transform, box-shadow, border-color;
      transition-duration: var(--civ-motion-duration-base);
      transition-timing-function: var(--civ-motion-easing-standard);
    }
    .civ-home-values__card:hover {
      transform: translateY(-2px);
      box-shadow: var(--civ-elevation-3);
      border-color: color-mix(in oklch, var(--civ-color-primary) 40%, var(--civ-color-border));
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
pnpm --filter @civaria/docs build
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
    <section className="civ-home-section civ-home-showcase">
      <header className="civ-home-section__header">
        <span className="civ-home-section__eyebrow">Live preview</span>
        <h2 className="civ-home-section__title">Components, live — not screenshots.</h2>
        <p className="civ-home-section__sub">
          Everything below is rendered with the same tokens your app will use. Toggle the theme from the header to see dark mode in real time.
        </p>
      </header>

      <div className="civ-home-showcase__tabs" role="tablist">
        {DEMOS.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={active === d.id}
            onClick={() => setActive(d.id)}
            className="civ-home-showcase__tab"
            data-active={active === d.id || undefined}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="civ-home-showcase__stage">
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
    <div className="civ-home-showcase__row">
      <button className="civ-button civ-button--solid">Solid</button>
      <button className="civ-button civ-button--outline">Outline</button>
      <button className="civ-button civ-button--ghost">Ghost</button>
      <button className="civ-button civ-button--soft">Soft</button>
      <button className="civ-button civ-button--solid civ-button--destructive">Delete</button>
      <button className="civ-button civ-button--solid" data-loading="true">Loading…</button>
    </div>
  );
}

function FormDemo() {
  return (
    <div className="civ-home-showcase__form">
      <div>
        <label htmlFor="civ-demo-email" className="civ-home-showcase__label">Email</label>
        <input id="civ-demo-email" type="email" className="civ-input" placeholder="ada@example.com" />
      </div>
      <div>
        <label htmlFor="civ-demo-pass" className="civ-home-showcase__label">Password</label>
        <input id="civ-demo-pass" type="password" className="civ-input" placeholder="••••••••" />
      </div>
      <button className="civ-button civ-button--solid" type="button">Sign in</button>
    </div>
  );
}

function CardDemo() {
  return (
    <div className="civ-card" style={{ maxInlineSize: "360px" }}>
      <div className="civ-card__header">
        <span className="civ-avatar"><span className="civ-avatar__fallback">WU</span></span>
        <div>
          <div style={{ fontWeight: "var(--civ-font-weight-semibold)" }}>Civaria Shipped</div>
          <div style={{ fontSize: "var(--civ-font-size-xs)", color: "var(--civ-color-muted-foreground)" }}>v0.0.1 · 2 days ago</div>
        </div>
      </div>
      <div className="civ-card__content">
        Phase 0 foundations landed — new shadow, motion, elevation tokens and a polish recipe applied to 36 component CSS files.
      </div>
      <div className="civ-card__footer">
        <button className="civ-button civ-button--soft civ-button--sm">View</button>
        <button className="civ-button civ-button--ghost civ-button--sm">Dismiss</button>
      </div>
    </div>
  );
}

function ChipDemo() {
  return (
    <div className="civ-home-showcase__row">
      <span className="civ-chip">Default</span>
      <span className="civ-chip civ-chip--primary">Primary</span>
      <span className="civ-chip civ-chip--success">Shipped</span>
      <span className="civ-chip civ-chip--destructive">Breaking</span>
      <span className="civ-badge civ-badge--solid">New</span>
      <span className="civ-badge civ-badge--soft">Beta</span>
      <span className="civ-badge civ-badge--outline">v0</span>
      <span className="civ-badge civ-badge--success">AAA</span>
    </div>
  );
}
```

- [ ] **Step 2: Append styles to `landing.css`**

```css
@layer civ-base {
  .civ-home-showcase {
    padding-block: var(--civ-spacing-12);
  }
  .civ-home-showcase__tabs {
    display: inline-flex;
    gap: 2px;
    padding: 2px;
    background-color: var(--civ-surface-sunken);
    border: 1px solid var(--civ-color-border);
    border-radius: var(--civ-shape-radius-md);
    margin-block-end: var(--civ-spacing-6);
  }
  .civ-home-showcase__tab {
    font-size: var(--civ-font-size-sm);
    font-weight: var(--civ-font-weight-medium);
    padding-inline: var(--civ-spacing-4); padding-block: var(--civ-spacing-2);
    color: var(--civ-color-muted-foreground);
    background: transparent;
    border: none;
    border-radius: calc(var(--civ-shape-radius-md) - 2px);
    cursor: pointer;
  }
  .civ-home-showcase__tab[data-active] {
    background-color: var(--civ-surface-raised);
    color: var(--civ-color-foreground);
    box-shadow: var(--civ-elevation-1);
  }
  .civ-home-showcase__stage {
    padding: var(--civ-spacing-8);
    background-color: var(--civ-surface-raised);
    border: 1px solid var(--civ-color-border);
    border-radius: var(--civ-shape-radius-lg);
    box-shadow: var(--civ-elevation-2);
    min-block-size: 260px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .civ-home-showcase__row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--civ-spacing-3);
    align-items: center;
    justify-content: center;
  }
  .civ-home-showcase__form {
    display: flex;
    flex-direction: column;
    gap: var(--civ-spacing-3);
    max-inline-size: 320px;
    inline-size: 100%;
  }
  .civ-home-showcase__label {
    display: block;
    font-size: var(--civ-font-size-xs);
    font-weight: var(--civ-font-weight-medium);
    color: var(--civ-color-muted-foreground);
    margin-block-end: var(--civ-spacing-1);
  }

  @media (prefers-reduced-motion: no-preference) {
    .civ-home-showcase__tab {
      transition-property: background-color, color, box-shadow;
      transition-duration: var(--civ-motion-duration-fast);
      transition-timing-function: var(--civ-motion-easing-standard);
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
pnpm --filter @civaria/docs build
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
    name: "Civaria",
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
  if (value === true)  return <span className="civ-home-compare__yes" aria-label="Yes">●</span>;
  if (value === false) return <span className="civ-home-compare__no"  aria-label="No">○</span>;
  return <span className="civ-home-compare__partial">{value}</span>;
}

export function Comparison() {
  return (
    <section className="civ-home-section civ-home-compare">
      <header className="civ-home-section__header">
        <span className="civ-home-section__eyebrow">Comparison</span>
        <h2 className="civ-home-section__title">Where Civaria fits.</h2>
        <p className="civ-home-section__sub">
          Every library has tradeoffs. These are ours, plotted against the closest peers.
        </p>
      </header>
      <div className="civ-home-compare__wrap">
        <table className="civ-home-compare__table">
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
    <section className="civ-home-section civ-home-install">
      <header className="civ-home-section__header">
        <span className="civ-home-section__eyebrow">Get started</span>
        <h2 className="civ-home-section__title">One command.</h2>
        <p className="civ-home-section__sub">
          All you need is the React package — tokens and CSS primitives come along for free.
        </p>
      </header>
      <div className="civ-home-install__wrap">
        <PackageManagerTabs command="civaria" />
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
    <footer className="civ-home-footer">
      <div className="civ-home-footer__inner">
        <div className="civ-home-footer__brand">
          <span className="civ-home-footer__logo" aria-hidden="true">◐</span>
          <span>{siteConfig.name}</span>
          <span className="civ-home-footer__version">v{siteConfig.version}</span>
        </div>
        <div className="civ-home-footer__cols">
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
      <div className="civ-home-footer__bottom">
        <span>© 2026 Civaria. MIT License.</span>
        <span>Made with Civaria.</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Append styles to `landing.css`**

```css
@layer civ-base {
  /* Comparison */
  .civ-home-compare { padding-block: var(--civ-spacing-12); }
  .civ-home-compare__wrap {
    overflow-x: auto;
    border: 1px solid var(--civ-color-border);
    border-radius: var(--civ-shape-radius-lg);
    background-color: var(--civ-surface-raised);
    box-shadow: var(--civ-elevation-1);
  }
  .civ-home-compare__table {
    inline-size: 100%;
    border-collapse: collapse;
    font-size: var(--civ-font-size-sm);
  }
  .civ-home-compare__table th,
  .civ-home-compare__table td {
    padding-inline: var(--civ-spacing-4); padding-block: var(--civ-spacing-3);
    text-align: start;
    border-block-end: 1px solid var(--civ-color-border);
  }
  .civ-home-compare__table thead th {
    background-color: var(--civ-surface-sunken);
    font-weight: var(--civ-font-weight-semibold);
    font-size: var(--civ-font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--civ-color-muted-foreground);
    text-align: center;
  }
  .civ-home-compare__table thead th:first-child { text-align: start; }
  .civ-home-compare__table tbody th {
    font-weight: var(--civ-font-weight-medium);
    color: var(--civ-color-foreground);
  }
  .civ-home-compare__table tbody td { text-align: center; }
  .civ-home-compare__yes {
    color: var(--civ-color-success);
    font-size: var(--civ-font-size-lg);
  }
  .civ-home-compare__no {
    color: var(--civ-color-muted-foreground);
    font-size: var(--civ-font-size-lg);
  }
  .civ-home-compare__partial {
    display: inline-block;
    font-size: var(--civ-font-size-xs);
    color: var(--civ-color-warning);
    font-style: italic;
  }

  /* Install snippet */
  .civ-home-install { padding-block: var(--civ-spacing-12); }
  .civ-home-install__wrap {
    max-inline-size: 48rem;
    margin-inline: auto;
  }

  /* Footer */
  .civ-home-footer {
    margin-block-start: var(--civ-spacing-12);
    padding-block: var(--civ-spacing-12);
    background-color: var(--civ-surface-sunken);
    border-block-start: 1px solid var(--civ-color-border);
  }
  .civ-home-footer__inner {
    max-inline-size: 72rem;
    margin-inline: auto;
    padding-inline: var(--civ-spacing-6);
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--civ-spacing-8);
  }
  .civ-home-footer__brand {
    display: flex; flex-direction: column; gap: var(--civ-spacing-1);
  }
  .civ-home-footer__brand > span:first-child {
    font-size: var(--civ-font-size-xl);
  }
  .civ-home-footer__brand > span:nth-child(2) {
    font-weight: var(--civ-font-weight-semibold);
  }
  .civ-home-footer__version {
    font-size: var(--civ-font-size-xs);
    color: var(--civ-color-muted-foreground);
  }
  .civ-home-footer__cols {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--civ-spacing-6);
  }
  .civ-home-footer__cols h4 {
    font-size: var(--civ-font-size-xs);
    font-weight: var(--civ-font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--civ-color-muted-foreground);
    margin-block-end: var(--civ-spacing-3);
  }
  .civ-home-footer__cols a {
    display: block;
    font-size: var(--civ-font-size-sm);
    color: var(--civ-color-muted-foreground);
    text-decoration: none;
    padding-block: 2px;
  }
  .civ-home-footer__cols a:hover { color: var(--civ-color-foreground); }
  .civ-home-footer__bottom {
    max-inline-size: 72rem;
    margin-inline: auto;
    padding-inline: var(--civ-spacing-6);
    margin-block-start: var(--civ-spacing-8);
    padding-block-start: var(--civ-spacing-6);
    border-block-start: 1px solid var(--civ-color-border);
    display: flex;
    justify-content: space-between;
    font-size: var(--civ-font-size-xs);
    color: var(--civ-color-muted-foreground);
  }

  @media (max-width: 768px) {
    .civ-home-footer__inner { grid-template-columns: 1fr; }
    .civ-home-footer__cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
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
pnpm --filter @civaria/docs build
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
  - Comparison table with Civaria column filled vs dotted/partial others
  - Install snippet uses PackageManagerTabs
  - Footer with 3 columns + bottom copyright
- [ ] Toggle theme from header — everything re-themes correctly
- [ ] Report Phase 3 complete
