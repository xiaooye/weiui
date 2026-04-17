# Phase 1 — Docs Chrome Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the WeiUI docs site chrome — sticky header with nav/search/theme/GitHub, collapsible left sidebar, right TOC, breadcrumbs, prev/next pager, dark mode toggle with FOUC prevention, ⌘K command palette via cmdk, Shiki-highlighted code blocks with copy + dual theme, and Inter / Instrument Serif / JetBrains Mono typography.

**Architecture:** All chrome components live under `apps/docs/src/components/chrome/`. Search index is generated at build time from MDX frontmatter + headings. Theme state is held in a React context, persisted to `localStorage`, with a pre-hydration script loaded from `public/theme-init.js` (no inline script — avoids XSS-flagged patterns). Shiki runs as a rehype plugin inside the existing `@next/mdx` pipeline, emitting dual-theme HTML.

**Tech Stack:** Next.js 15 App Router, React 19, MDX, rehype-pretty-code, cmdk, next/font, TypeScript 5.8.

**Spec reference:** `docs/superpowers/specs/2026-04-16-polish-overhaul-design.md` §5.

---

## File Structure

**New files:**
- `apps/docs/public/theme-init.js` — pre-hydration theme init (static file, loaded via standard `<script src=...>`)
- `apps/docs/src/lib/site-config.ts` — nav structure, GitHub URL, version
- `apps/docs/src/lib/theme.ts` — theme types and resolveTheme helper
- `apps/docs/src/lib/search-index.ts` — build-time search index generator
- `apps/docs/scripts/build-search-index.ts` — CLI entry that writes `public/search-index.json`
- `apps/docs/src/components/chrome/Header.tsx`
- `apps/docs/src/components/chrome/ThemeToggle.tsx`
- `apps/docs/src/components/chrome/Sidebar.tsx`
- `apps/docs/src/components/chrome/TableOfContents.tsx`
- `apps/docs/src/components/chrome/Breadcrumbs.tsx`
- `apps/docs/src/components/chrome/DocsPager.tsx`
- `apps/docs/src/components/chrome/EditOnGitHub.tsx`
- `apps/docs/src/components/chrome/CommandPalette.tsx`
- `apps/docs/src/components/chrome/SearchTrigger.tsx`
- `apps/docs/src/components/mdx/CodeBlock.tsx`
- `apps/docs/src/styles/chrome.css`
- `apps/docs/src/styles/fonts.css`
- `apps/docs/src/styles/shiki.css`

**Modified files:**
- `apps/docs/package.json` — add cmdk, shiki, rehype-pretty-code, tsx
- `apps/docs/next.config.ts` — wire rehype-pretty-code into MDX pipeline
- `apps/docs/mdx-components.tsx` — register pre → CodeBlock
- `apps/docs/src/app/layout.tsx` — load fonts, wire chrome styles, load theme-init.js
- `apps/docs/src/app/page.tsx` — new landing hero
- `apps/docs/src/app/docs/layout.tsx` — replace inline sidebar with new chrome

---

## Task 1: Install dependencies

**Files:** `apps/docs/package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Add packages**

Run from `C:/weiui`:
```bash
pnpm --filter @weiui/docs add cmdk shiki rehype-pretty-code
pnpm --filter @weiui/docs add -D tsx
```

- [ ] **Step 2: Verify install**

`pnpm --filter @weiui/docs build` should still succeed (no code changes yet, just added deps).

- [ ] **Step 3: Commit**

```bash
git add apps/docs/package.json pnpm-lock.yaml
git commit -m "build(docs): add cmdk, shiki, rehype-pretty-code, tsx"
```

---

## Task 2: Fonts + theme helpers + theme-init script

**Files:**
- Create: `apps/docs/src/lib/theme.ts`
- Create: `apps/docs/public/theme-init.js`
- Create: `apps/docs/src/styles/fonts.css`

- [ ] **Step 1: Create `apps/docs/src/lib/theme.ts`**

```ts
export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "wui-theme";

export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}
```

- [ ] **Step 2: Create `apps/docs/public/theme-init.js`**

```js
(function () {
  try {
    var stored = localStorage.getItem("wui-theme");
    var theme = stored || "system";
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
    document.documentElement.dataset.theme = resolved;
    if (resolved === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
```

- [ ] **Step 3: Create `apps/docs/src/styles/fonts.css`**

```css
@layer wui-base {
  :root {
    --wui-font-family-sans: var(--font-sans), system-ui, -apple-system, sans-serif;
    --wui-font-family-display: var(--font-display), Georgia, serif;
    --wui-font-family-mono: var(--font-mono), "SF Mono", Consolas, monospace;
  }
  body {
    font-family: var(--wui-font-family-sans);
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }
  .wui-display {
    font-family: var(--wui-font-family-display);
    letter-spacing: -0.02em;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/docs/src/lib/theme.ts apps/docs/public/theme-init.js apps/docs/src/styles/fonts.css
git commit -m "feat(docs): add theme helpers + pre-hydration init script + font vars"
```

---

## Task 3: Root layout with fonts, theme script, and imports

**Files:**
- Modify: `apps/docs/src/app/layout.tsx`

- [ ] **Step 1: Replace `apps/docs/src/app/layout.tsx` with this content**

```tsx
import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "@weiui/tokens/tokens.css";
import "@weiui/css";
import "../styles/fonts.css";
import "../styles/shiki.css";
import "../styles/chrome.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "WeiUI — Design System",
  description: "An accessibility-first, layered design system with WCAG AAA enforcement",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

Note: `chrome.css` and `shiki.css` don't exist yet — they're created in later tasks. Build will fail until then, so commit this task together with Task 4 (which creates those files).

- [ ] **Step 2: Do NOT commit standalone — continue to Task 4.**

---

## Task 4: Create empty chrome.css + shiki.css then verify root layout builds

**Files:**
- Create: `apps/docs/src/styles/chrome.css` (empty layer scaffold)
- Create: `apps/docs/src/styles/shiki.css` (empty layer scaffold)

- [ ] **Step 1: Create `apps/docs/src/styles/chrome.css`**

```css
@layer wui-base {
  /* Chrome styles land in tasks 5-9. */
}
```

- [ ] **Step 2: Create `apps/docs/src/styles/shiki.css`**

```css
@layer wui-base {
  /* Shiki token styles land in task 6. */
}
```

- [ ] **Step 3: Build**

Run: `pnpm --filter @weiui/docs build`
Expected: success. Fonts download + embed. No CSS errors.

- [ ] **Step 4: Commit tasks 3 + 4 together**

```bash
git add apps/docs/src/app/layout.tsx \
        apps/docs/src/styles/chrome.css \
        apps/docs/src/styles/shiki.css
git commit -m "feat(docs): wire next/font, theme init script, chrome/shiki style scaffolds"
```

---

## Task 5: Site config + ThemeToggle + Header

**Files:**
- Create: `apps/docs/src/lib/site-config.ts`
- Create: `apps/docs/src/components/chrome/ThemeToggle.tsx`
- Create: `apps/docs/src/components/chrome/Header.tsx`
- Create: `apps/docs/src/components/chrome/SearchTrigger.tsx` (placeholder — real palette in Task 8)
- Modify: `apps/docs/src/styles/chrome.css`

- [ ] **Step 1: Create `apps/docs/src/lib/site-config.ts`**

```ts
export const siteConfig = {
  name: "WeiUI",
  description: "An accessibility-first, layered design system with WCAG AAA enforcement",
  githubUrl: "https://github.com/xiaooye/weiui",
  version: "0.0.1",
  primaryNav: [
    { href: "/docs/getting-started", label: "Docs" },
    { href: "/docs/components", label: "Components" },
    { href: "/playground", label: "Playground" },
    { href: "/composer", label: "Composer" },
    { href: "/themes", label: "Themes" },
  ],
  sidebarGroups: [
    {
      title: "Getting Started",
      items: [
        { href: "/docs/getting-started", label: "Installation" },
        { href: "/docs/tokens", label: "Design Tokens" },
        { href: "/docs/css", label: "CSS Layer" },
        { href: "/docs/accessibility", label: "Accessibility" },
      ],
    },
    {
      title: "Components",
      items: [
        { href: "/docs/components", label: "Overview" },
        { href: "/docs/components/button", label: "Button" },
        { href: "/docs/components/input", label: "Input" },
        { href: "/docs/components/form", label: "Form Controls" },
        { href: "/docs/components/advanced-inputs", label: "Advanced Inputs" },
        { href: "/docs/components/date-time", label: "Date & Time" },
        { href: "/docs/components/layout", label: "Layout" },
        { href: "/docs/components/sidebar-drawer", label: "Sidebar & Drawer" },
        { href: "/docs/components/data-display", label: "Data Display" },
        { href: "/docs/components/data", label: "Data Components" },
        { href: "/docs/components/overlays", label: "Overlays" },
        { href: "/docs/components/feedback", label: "Feedback" },
        { href: "/docs/components/toast-chip-progress", label: "Toast & Chips" },
        { href: "/docs/components/stepper-timeline", label: "Stepper & Timeline" },
        { href: "/docs/components/navigation", label: "Navigation" },
        { href: "/docs/components/typography", label: "Typography" },
        { href: "/docs/components/editor", label: "Editor" },
        { href: "/docs/components/command-palette", label: "Command Palette" },
        { href: "/docs/components/accordion", label: "Accordion" },
        { href: "/docs/components/wave2-3", label: "More Components" },
      ],
    },
    {
      title: "Tools",
      items: [
        { href: "/playground", label: "Playground" },
        { href: "/composer", label: "Composer" },
        { href: "/themes", label: "Theme Builder" },
      ],
    },
  ],
} as const;

export type SidebarGroup = typeof siteConfig.sidebarGroups[number];
export type SidebarItem = SidebarGroup["items"][number];
```

- [ ] **Step 2: Create `ThemeToggle.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { type Theme, THEME_STORAGE_KEY, resolveTheme } from "../../lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? "system";
    setTheme(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const resolved = resolveTheme(theme);
    document.documentElement.dataset.theme = resolved;
    document.documentElement.classList.toggle("dark", resolved === "dark");
    if (theme === "system") {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const resolved = mq.matches ? "dark" : "light";
      document.documentElement.dataset.theme = resolved;
      document.documentElement.classList.toggle("dark", resolved === "dark");
    };
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const cycle = () =>
    setTheme((t) => (t === "light" ? "dark" : t === "dark" ? "system" : "light"));

  const label = theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";
  const icon = theme === "light" ? "☀" : theme === "dark" ? "☾" : "⌘";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${label}. Click to change.`}
      className="wui-theme-toggle"
      suppressHydrationWarning
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}
```

- [ ] **Step 3: Create `SearchTrigger.tsx` (temporary placeholder — real palette lands Task 8)**

```tsx
"use client";

import { useEffect, useState } from "react";

export function SearchTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        className="wui-docs-search-trigger"
        onClick={() => setOpen(true)}
        aria-label="Search docs (Cmd+K)"
      >
        <span>Search…</span>
        <kbd>⌘K</kbd>
      </button>
      {open && (
        <div className="wui-docs-search-trigger__placeholder" role="dialog" aria-modal="true">
          <p>Command palette coming soon.</p>
          <button type="button" onClick={() => setOpen(false)}>Close</button>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Create `Header.tsx`**

```tsx
import Link from "next/link";
import { siteConfig } from "../../lib/site-config";
import { ThemeToggle } from "./ThemeToggle";
import { SearchTrigger } from "./SearchTrigger";

export function Header() {
  return (
    <header className="wui-docs-header">
      <div className="wui-docs-header__inner">
        <Link href="/" className="wui-docs-header__brand">
          <span className="wui-docs-header__logo" aria-hidden="true">◐</span>
          <span className="wui-docs-header__name">{siteConfig.name}</span>
          <span className="wui-docs-header__version">{siteConfig.version}</span>
        </Link>
        <nav className="wui-docs-header__nav" aria-label="Primary">
          {siteConfig.primaryNav.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>
        <div className="wui-docs-header__actions">
          <SearchTrigger />
          <ThemeToggle />
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="wui-docs-header__github"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Replace `apps/docs/src/styles/chrome.css`**

```css
@layer wui-base {
  /* Header */
  .wui-docs-header {
    position: sticky;
    inset-block-start: 0;
    z-index: 40;
    inline-size: 100%;
    background-color: color-mix(in oklch, var(--wui-color-background) 80%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-block-end: 1px solid var(--wui-color-border);
  }
  .wui-docs-header__inner {
    display: flex; align-items: center; gap: var(--wui-spacing-6);
    max-inline-size: 80rem; margin-inline: auto;
    padding-inline: var(--wui-spacing-6); padding-block: var(--wui-spacing-3);
  }
  .wui-docs-header__brand {
    display: inline-flex; align-items: baseline; gap: var(--wui-spacing-2);
    text-decoration: none; color: inherit;
  }
  .wui-docs-header__logo {
    font-size: var(--wui-font-size-lg);
    color: var(--wui-color-primary);
  }
  .wui-docs-header__name {
    font-weight: var(--wui-font-weight-bold);
    font-size: var(--wui-font-size-base);
  }
  .wui-docs-header__version {
    font-size: var(--wui-font-size-xs);
    color: var(--wui-color-muted-foreground);
  }
  .wui-docs-header__nav {
    display: flex; gap: var(--wui-spacing-4);
    margin-inline-start: var(--wui-spacing-6);
    font-size: var(--wui-font-size-sm);
  }
  .wui-docs-header__nav a {
    color: var(--wui-color-muted-foreground);
    text-decoration: none;
  }
  .wui-docs-header__nav a:hover {
    color: var(--wui-color-foreground);
  }
  .wui-docs-header__actions {
    display: flex; gap: var(--wui-spacing-2); align-items: center;
    margin-inline-start: auto;
  }
  .wui-docs-header__github {
    font-size: var(--wui-font-size-sm);
    color: var(--wui-color-muted-foreground);
    padding-inline: var(--wui-spacing-3); padding-block: var(--wui-spacing-2);
    border-radius: var(--wui-shape-radius-base);
    text-decoration: none;
  }
  .wui-docs-header__github:hover {
    background-color: var(--wui-color-muted);
    color: var(--wui-color-foreground);
  }

  /* Theme toggle */
  .wui-theme-toggle {
    inline-size: 36px; block-size: 36px;
    display: inline-flex; align-items: center; justify-content: center;
    background-color: transparent;
    color: var(--wui-color-muted-foreground);
    border: 1px solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-base);
    cursor: pointer;
    font-size: var(--wui-font-size-sm);
  }
  .wui-theme-toggle:hover {
    color: var(--wui-color-foreground);
    background-color: var(--wui-color-muted);
  }

  /* Search trigger */
  .wui-docs-search-trigger {
    display: inline-flex; align-items: center; gap: var(--wui-spacing-3);
    padding-inline-start: var(--wui-spacing-3); padding-inline-end: var(--wui-spacing-2);
    padding-block: var(--wui-spacing-1);
    min-block-size: 36px; min-inline-size: 220px;
    background-color: var(--wui-surface-sunken);
    border: 1px solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-base);
    color: var(--wui-color-muted-foreground);
    font-size: var(--wui-font-size-sm);
    cursor: pointer;
  }
  .wui-docs-search-trigger kbd {
    font-family: var(--wui-font-family-mono);
    font-size: var(--wui-font-size-xs);
    padding-inline: var(--wui-spacing-1); padding-block: 2px;
    background-color: var(--wui-color-background);
    border: 1px solid var(--wui-color-border);
    border-radius: 4px;
    margin-inline-start: auto;
  }
  .wui-docs-search-trigger__placeholder {
    position: fixed; inset: 0;
    background-color: color-mix(in oklch, var(--wui-color-background) 60%, transparent);
    display: flex; align-items: center; justify-content: center; gap: var(--wui-spacing-4);
    z-index: 60;
  }

  @media (prefers-reduced-motion: no-preference) {
    .wui-docs-header__nav a,
    .wui-docs-header__github,
    .wui-theme-toggle,
    .wui-docs-search-trigger {
      transition-property: background-color, color, border-color;
      transition-duration: var(--wui-motion-duration-fast);
      transition-timing-function: var(--wui-motion-easing-standard);
    }
  }
}
```

- [ ] **Step 6: Build + verify**

Run: `pnpm --filter @weiui/docs build`
Expected: success.

- [ ] **Step 7: Commit**

```bash
git add apps/docs/src/lib/site-config.ts \
        apps/docs/src/components/chrome/ThemeToggle.tsx \
        apps/docs/src/components/chrome/SearchTrigger.tsx \
        apps/docs/src/components/chrome/Header.tsx \
        apps/docs/src/styles/chrome.css
git commit -m "feat(docs): add site config, theme toggle, search trigger, sticky header"
```

---

## Task 6: Shiki code blocks with dual theme + copy button

**Files:**
- Modify: `apps/docs/next.config.ts`
- Modify: `apps/docs/mdx-components.tsx`
- Create: `apps/docs/src/components/mdx/CodeBlock.tsx`
- Modify: `apps/docs/src/styles/shiki.css`
- Modify: `apps/docs/src/styles/chrome.css` (append code-block chrome)

- [ ] **Step 1: Replace `apps/docs/next.config.ts`**

```ts
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: {
            light: "vitesse-light",
            dark: "vitesse-dark",
          },
          keepBackground: false,
        },
      ],
    ],
  },
});

const nextConfig = {
  pageExtensions: ["tsx", "mdx"],
};

export default withMDX(nextConfig);
```

- [ ] **Step 2: Replace `apps/docs/src/styles/shiki.css`**

```css
@layer wui-base {
  figure[data-rehype-pretty-code-figure] {
    background-color: var(--wui-surface-sunken);
    border: 1px solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-lg);
    overflow: hidden;
    margin-block: var(--wui-spacing-4);
    position: relative;
  }
  figure[data-rehype-pretty-code-figure] > pre {
    padding: var(--wui-spacing-4);
    overflow-x: auto;
    font-family: var(--wui-font-family-mono);
    font-size: var(--wui-font-size-sm);
    line-height: 1.6;
  }
  figure[data-rehype-pretty-code-figure] code {
    counter-reset: line;
  }
  figure[data-rehype-pretty-code-figure] code > [data-line] {
    padding-inline: var(--wui-spacing-4);
    border-inline-start: 2px solid transparent;
  }
  figure[data-rehype-pretty-code-figure] code > [data-highlighted-line] {
    background-color: color-mix(in oklch, var(--wui-color-primary) 6%, transparent);
    border-inline-start-color: var(--wui-color-primary);
  }
  /* rehype-pretty-code emits two color tokens per span (--shiki-light / --shiki-dark) */
  code[data-theme*=" "],
  code[data-theme*=" "] span {
    color: var(--shiki-light);
    background-color: var(--shiki-light-bg);
  }
  html.dark code[data-theme*=" "],
  html.dark code[data-theme*=" "] span {
    color: var(--shiki-dark);
    background-color: var(--shiki-dark-bg);
  }
}
```

- [ ] **Step 3: Create `apps/docs/src/components/mdx/CodeBlock.tsx`**

```tsx
"use client";

import { useRef, useState, type HTMLAttributes } from "react";

export function CodeBlock({ children, ...props }: HTMLAttributes<HTMLPreElement>) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const text = ref.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="wui-code-block">
      <button
        type="button"
        className="wui-code-block__copy"
        onClick={onCopy}
        aria-label={copied ? "Copied" : "Copy code"}
      >
        {copied ? "✓" : "⧉"}
      </button>
      <pre ref={ref} {...props}>{children}</pre>
    </div>
  );
}
```

- [ ] **Step 4: Register CodeBlock in `apps/docs/mdx-components.tsx`**

```tsx
import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "./src/components/mdx/CodeBlock";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    pre: (props) => <CodeBlock {...props} />,
  };
}
```

- [ ] **Step 5: Append code-block chrome styles to `chrome.css`**

Append at the bottom of the file (inside or after existing `@layer wui-base` block):

```css
@layer wui-base {
  .wui-code-block {
    position: relative;
  }
  .wui-code-block__copy {
    position: absolute;
    inset-block-start: var(--wui-spacing-2);
    inset-inline-end: var(--wui-spacing-2);
    inline-size: 32px;
    block-size: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: color-mix(in oklch, var(--wui-surface-overlay) 80%, transparent);
    color: var(--wui-color-muted-foreground);
    border: 1px solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-base);
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    z-index: 2;
  }
  .wui-code-block:hover .wui-code-block__copy,
  .wui-code-block:focus-within .wui-code-block__copy {
    opacity: 1;
    pointer-events: auto;
  }
  .wui-code-block__copy:hover {
    color: var(--wui-color-foreground);
    background-color: var(--wui-color-muted);
  }
  @media (prefers-reduced-motion: no-preference) {
    .wui-code-block__copy {
      transition: opacity var(--wui-motion-duration-fast) var(--wui-motion-easing-standard);
    }
  }
}
```

- [ ] **Step 6: Build and verify**

Run: `pnpm --filter @weiui/docs build`
Expected: success. Some build time increase for Shiki is normal.

- [ ] **Step 7: Commit**

```bash
git add apps/docs/next.config.ts \
        apps/docs/mdx-components.tsx \
        apps/docs/src/styles/shiki.css \
        apps/docs/src/styles/chrome.css \
        apps/docs/src/components/mdx/CodeBlock.tsx
git commit -m "feat(docs): add Shiki dual-theme code highlighting + copy button"
```

---

## Task 7: Sidebar + TOC + Breadcrumbs + Pager + EditOnGitHub + docs layout

**Files:**
- Create: 5 chrome components
- Modify: `apps/docs/src/app/docs/layout.tsx`
- Modify: `apps/docs/src/styles/chrome.css`

- [ ] **Step 1: Create `Sidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "../../lib/site-config";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="wui-docs-sidebar" aria-label="Docs navigation">
      {siteConfig.sidebarGroups.map((group) => (
        <div key={group.title} className="wui-docs-sidebar__group">
          <h4 className="wui-docs-sidebar__title">{group.title}</h4>
          <ul className="wui-docs-sidebar__list">
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="wui-docs-sidebar__link"
                    aria-current={active ? "page" : undefined}
                    data-active={active || undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
```

- [ ] **Step 2: Create `TableOfContents.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const nodes = main.querySelectorAll("h2, h3");
    const list: Heading[] = [];
    nodes.forEach((node) => {
      if (!node.id) {
        node.id =
          node.textContent?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") ?? "";
      }
      list.push({
        id: node.id,
        text: node.textContent ?? "",
        level: node.tagName === "H2" ? 2 : 3,
      });
    });
    setHeadings(list);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 1.0 },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <aside className="wui-docs-toc" aria-label="On this page">
      <h4 className="wui-docs-toc__title">On this page</h4>
      <ul className="wui-docs-toc__list">
        {headings.map((h) => (
          <li key={h.id} data-level={h.level}>
            <a
              href={`#${h.id}`}
              className="wui-docs-toc__link"
              data-active={active === h.id || undefined}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

- [ ] **Step 3: Create `Breadcrumbs.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return null;

  return (
    <nav className="wui-docs-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><Link href="/">Home</Link></li>
        {segments.map((seg, idx) => {
          const href = "/" + segments.slice(0, idx + 1).join("/");
          const isLast = idx === segments.length - 1;
          const label = seg.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
          return (
            <li key={href}>
              <span aria-hidden="true">/</span>
              {isLast ? (
                <span aria-current="page">{label}</span>
              ) : (
                <Link href={href}>{label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 4: Create `DocsPager.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "../../lib/site-config";

export function DocsPager() {
  const pathname = usePathname();
  const allItems = siteConfig.sidebarGroups.flatMap((g) => g.items);
  const idx = allItems.findIndex((item) => item.href === pathname);
  if (idx === -1) return null;
  const prev = allItems[idx - 1];
  const next = allItems[idx + 1];

  return (
    <nav className="wui-docs-pager" aria-label="Pager">
      {prev ? (
        <Link href={prev.href} className="wui-docs-pager__prev">
          <span className="wui-docs-pager__direction">← Previous</span>
          <span className="wui-docs-pager__label">{prev.label}</span>
        </Link>
      ) : <span />}
      {next ? (
        <Link href={next.href} className="wui-docs-pager__next">
          <span className="wui-docs-pager__direction">Next →</span>
          <span className="wui-docs-pager__label">{next.label}</span>
        </Link>
      ) : <span />}
    </nav>
  );
}
```

- [ ] **Step 5: Create `EditOnGitHub.tsx`**

```tsx
"use client";

import { usePathname } from "next/navigation";
import { siteConfig } from "../../lib/site-config";

export function EditOnGitHub() {
  const pathname = usePathname();
  const relative =
    pathname === "/"
      ? "apps/docs/src/app/page.tsx"
      : `apps/docs/src/app${pathname}/page.mdx`;
  const url = `${siteConfig.githubUrl}/edit/main/${relative}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="wui-docs-edit-link"
    >
      Edit on GitHub →
    </a>
  );
}
```

- [ ] **Step 6: Replace `apps/docs/src/app/docs/layout.tsx`**

```tsx
import { Header } from "../../components/chrome/Header";
import { Sidebar } from "../../components/chrome/Sidebar";
import { TableOfContents } from "../../components/chrome/TableOfContents";
import { Breadcrumbs } from "../../components/chrome/Breadcrumbs";
import { DocsPager } from "../../components/chrome/DocsPager";
import { EditOnGitHub } from "../../components/chrome/EditOnGitHub";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="wui-docs-shell">
        <Sidebar />
        <main className="wui-prose wui-docs-main">
          <Breadcrumbs />
          {children}
          <EditOnGitHub />
          <DocsPager />
        </main>
        <TableOfContents />
      </div>
    </>
  );
}
```

- [ ] **Step 7: Append shell + chrome styles to `chrome.css`**

```css
@layer wui-base {
  .wui-docs-shell {
    display: grid;
    grid-template-columns: 16rem minmax(0, 1fr) 14rem;
    max-inline-size: 90rem;
    margin-inline: auto;
    padding-inline: var(--wui-spacing-6);
    gap: var(--wui-spacing-6);
    min-block-size: 100vh;
  }
  @media (max-width: 1024px) {
    .wui-docs-shell { grid-template-columns: 16rem minmax(0, 1fr); }
    .wui-docs-toc { display: none; }
  }
  @media (max-width: 768px) {
    .wui-docs-shell { grid-template-columns: minmax(0, 1fr); }
    .wui-docs-sidebar { display: none; }
  }
  .wui-docs-main {
    padding-block: var(--wui-spacing-8);
    max-inline-size: 48rem;
    min-inline-size: 0;
  }

  /* Sidebar */
  .wui-docs-sidebar {
    position: sticky;
    inset-block-start: calc(var(--wui-spacing-3) * 2 + 36px + 1px);
    block-size: calc(100vh - (var(--wui-spacing-3) * 2 + 36px + 1px));
    overflow-y: auto;
    padding-block: var(--wui-spacing-6);
    padding-inline: var(--wui-spacing-4);
    border-inline-end: 1px solid var(--wui-color-border);
  }
  .wui-docs-sidebar__group + .wui-docs-sidebar__group {
    margin-block-start: var(--wui-spacing-6);
  }
  .wui-docs-sidebar__title {
    font-size: var(--wui-font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--wui-color-muted-foreground);
    font-weight: var(--wui-font-weight-semibold);
    margin-block-end: var(--wui-spacing-2);
  }
  .wui-docs-sidebar__list {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-direction: column; gap: 2px;
  }
  .wui-docs-sidebar__link {
    display: block;
    padding-inline: var(--wui-spacing-3); padding-block: var(--wui-spacing-1);
    font-size: var(--wui-font-size-sm);
    color: var(--wui-color-muted-foreground);
    border-radius: var(--wui-shape-radius-base);
    text-decoration: none;
  }
  .wui-docs-sidebar__link:hover {
    color: var(--wui-color-foreground);
    background-color: var(--wui-color-muted);
  }
  .wui-docs-sidebar__link[data-active] {
    color: var(--wui-color-primary);
    background-color: color-mix(in oklch, var(--wui-color-primary) 10%, transparent);
    font-weight: var(--wui-font-weight-medium);
  }

  /* TOC */
  .wui-docs-toc {
    position: sticky;
    inset-block-start: calc(var(--wui-spacing-3) * 2 + 36px + 1px);
    padding-block-start: var(--wui-spacing-6);
    padding-inline-start: var(--wui-spacing-6);
    inline-size: 14rem;
    align-self: flex-start;
  }
  .wui-docs-toc__title {
    font-size: var(--wui-font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--wui-color-muted-foreground);
    font-weight: var(--wui-font-weight-semibold);
    margin-block-end: var(--wui-spacing-2);
  }
  .wui-docs-toc__list {
    list-style: none; padding: 0; margin: 0;
    border-inline-start: 1px solid var(--wui-color-border);
  }
  .wui-docs-toc__list li[data-level="3"] {
    padding-inline-start: var(--wui-spacing-3);
  }
  .wui-docs-toc__link {
    display: block;
    padding-inline: var(--wui-spacing-3); padding-block: var(--wui-spacing-1);
    font-size: var(--wui-font-size-sm);
    color: var(--wui-color-muted-foreground);
    text-decoration: none;
    margin-inline-start: -1px;
  }
  .wui-docs-toc__link:hover {
    color: var(--wui-color-foreground);
  }
  .wui-docs-toc__link[data-active] {
    color: var(--wui-color-primary);
    border-inline-start: 1px solid var(--wui-color-primary);
    font-weight: var(--wui-font-weight-medium);
  }

  /* Breadcrumbs */
  .wui-docs-breadcrumbs {
    font-size: var(--wui-font-size-sm);
    color: var(--wui-color-muted-foreground);
    margin-block-end: var(--wui-spacing-6);
  }
  .wui-docs-breadcrumbs ol {
    list-style: none; padding: 0; margin: 0;
    display: flex; gap: var(--wui-spacing-2); flex-wrap: wrap; align-items: center;
  }
  .wui-docs-breadcrumbs a {
    color: inherit; text-decoration: none;
  }
  .wui-docs-breadcrumbs a:hover {
    color: var(--wui-color-foreground);
    text-decoration: underline;
  }

  /* Pager */
  .wui-docs-pager {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: var(--wui-spacing-4);
    margin-block-start: var(--wui-spacing-12);
    padding-block-start: var(--wui-spacing-6);
    border-block-start: 1px solid var(--wui-color-border);
  }
  .wui-docs-pager a {
    display: flex; flex-direction: column; gap: var(--wui-spacing-1);
    padding: var(--wui-spacing-4);
    border: 1px solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-md);
    text-decoration: none;
    color: inherit;
  }
  .wui-docs-pager__next { text-align: end; }
  .wui-docs-pager__direction {
    font-size: var(--wui-font-size-xs);
    color: var(--wui-color-muted-foreground);
  }
  .wui-docs-pager__label {
    font-size: var(--wui-font-size-base);
    font-weight: var(--wui-font-weight-medium);
    color: var(--wui-color-foreground);
  }
  .wui-docs-pager a:hover {
    border-color: var(--wui-color-primary);
    background-color: color-mix(in oklch, var(--wui-color-primary) 4%, transparent);
  }

  /* Edit link */
  .wui-docs-edit-link {
    display: inline-block;
    font-size: var(--wui-font-size-sm);
    color: var(--wui-color-muted-foreground);
    text-decoration: none;
    margin-block-start: var(--wui-spacing-8);
  }
  .wui-docs-edit-link:hover {
    color: var(--wui-color-primary);
  }
}
```

- [ ] **Step 8: Build + verify**

Run: `pnpm --filter @weiui/docs build`
Expected: success.

- [ ] **Step 9: Commit**

```bash
git add apps/docs/src/components/chrome/Sidebar.tsx \
        apps/docs/src/components/chrome/TableOfContents.tsx \
        apps/docs/src/components/chrome/Breadcrumbs.tsx \
        apps/docs/src/components/chrome/DocsPager.tsx \
        apps/docs/src/components/chrome/EditOnGitHub.tsx \
        apps/docs/src/app/docs/layout.tsx \
        apps/docs/src/styles/chrome.css
git commit -m "feat(docs): add sidebar, TOC, breadcrumbs, pager, edit-on-github + new docs layout"
```

---

## Task 8: Build-time search index + CommandPalette

**Files:**
- Create: `apps/docs/src/lib/search-index.ts`
- Create: `apps/docs/scripts/build-search-index.ts`
- Create: `apps/docs/src/components/chrome/CommandPalette.tsx`
- Modify: `apps/docs/src/components/chrome/SearchTrigger.tsx`
- Modify: `apps/docs/package.json` (build script)
- Modify: `apps/docs/src/styles/chrome.css` (append palette)

- [ ] **Step 1: Create `apps/docs/src/lib/search-index.ts`**

```ts
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";

export interface SearchEntry {
  title: string;
  href: string;
  content: string;
  group: "Component" | "Guide" | "Page";
}

const MDX_ROOT = join(process.cwd(), "src", "app");

function walk(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) results.push(...walk(full));
    else if (entry === "page.mdx" || entry === "page.tsx") results.push(full);
  }
  return results;
}

function extractTitleAndText(raw: string): { title: string; content: string } {
  const titleMatch = raw.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : "Untitled";
  const content = raw
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 800);
  return { title, content };
}

export function buildSearchIndex(): SearchEntry[] {
  const files = walk(MDX_ROOT);
  const entries: SearchEntry[] = [];
  for (const file of files) {
    if (!file.endsWith("page.mdx")) continue;
    const raw = readFileSync(file, "utf-8");
    const rel = relative(MDX_ROOT, file).replace(/\\/g, "/").replace(/\/page\.mdx$/, "");
    const href = "/" + rel;
    const { title, content } = extractTitleAndText(raw);
    const group: SearchEntry["group"] = href.startsWith("/docs/components/")
      ? "Component"
      : href.startsWith("/docs/")
        ? "Guide"
        : "Page";
    entries.push({ title, href, content, group });
  }
  return entries;
}

export function writeSearchIndex(outPath: string): void {
  const entries = buildSearchIndex();
  mkdirSync(join(outPath, ".."), { recursive: true });
  writeFileSync(outPath, JSON.stringify(entries, null, 2));
}
```

- [ ] **Step 2: Create `apps/docs/scripts/build-search-index.ts`**

```ts
import { writeSearchIndex } from "../src/lib/search-index";
import { join } from "node:path";

const out = join(process.cwd(), "public", "search-index.json");
writeSearchIndex(out);
console.log("Wrote search index:", out);
```

- [ ] **Step 3: Wire into docs build script**

Edit `apps/docs/package.json`, change the `"build"` script:

```json
"build": "tsx scripts/build-search-index.ts && next build",
```

Leave all other scripts unchanged.

- [ ] **Step 4: Create `CommandPalette.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import type { SearchEntry } from "../../lib/search-index";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [entries, setEntries] = useState<SearchEntry[]>([]);

  useEffect(() => {
    if (!open) return;
    fetch("/search-index.json").then((r) => r.json()).then(setEntries).catch(() => {});
  }, [open]);

  if (!open) return null;

  const grouped = entries.reduce<Record<string, SearchEntry[]>>((acc, e) => {
    (acc[e.group] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="wui-cmdk-overlay" onClick={onClose} role="presentation">
      <div
        className="wui-cmdk-shell"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search docs"
      >
        <Command label="Search docs">
          <Command.Input placeholder="Search components, guides, tokens…" autoFocus />
          <Command.List>
            <Command.Empty>No results.</Command.Empty>
            {Object.entries(grouped).map(([group, items]) => (
              <Command.Group key={group} heading={group}>
                {items.map((item) => (
                  <Command.Item
                    key={item.href}
                    value={`${item.title} ${item.content}`}
                    onSelect={() => {
                      router.push(item.href);
                      onClose();
                    }}
                  >
                    <span className="wui-cmdk-title">{item.title}</span>
                    <span className="wui-cmdk-href">{item.href}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Replace `SearchTrigger.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const CommandPalette = dynamic(
  () => import("./CommandPalette").then((m) => m.CommandPalette),
  { ssr: false },
);

export function SearchTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        className="wui-docs-search-trigger"
        onClick={() => setOpen(true)}
        aria-label="Search docs (Cmd+K)"
      >
        <span>Search…</span>
        <kbd>⌘K</kbd>
      </button>
      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

- [ ] **Step 6: Append palette styles to `chrome.css`**

```css
@layer wui-base {
  .wui-cmdk-overlay {
    position: fixed; inset: 0;
    background-color: color-mix(in oklch, var(--wui-color-foreground) 40%, transparent);
    backdrop-filter: blur(4px);
    display: flex; align-items: flex-start; justify-content: center;
    padding-block-start: 12vh;
    z-index: 60;
  }
  .wui-cmdk-shell {
    inline-size: min(640px, 90vw);
    background-color: var(--wui-surface-overlay);
    border: 1px solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-lg);
    box-shadow: var(--wui-elevation-5);
    overflow: hidden;
  }
  .wui-cmdk-shell [cmdk-input] {
    inline-size: 100%;
    padding-inline: var(--wui-spacing-4); padding-block: var(--wui-spacing-4);
    background-color: transparent;
    border: none;
    border-block-end: 1px solid var(--wui-color-border);
    font-size: var(--wui-font-size-base);
    color: var(--wui-color-foreground);
    font-family: inherit;
    outline: none;
  }
  .wui-cmdk-shell [cmdk-list] {
    max-block-size: 50vh;
    overflow-y: auto;
    padding-block: var(--wui-spacing-2);
  }
  .wui-cmdk-shell [cmdk-group-heading] {
    padding-inline: var(--wui-spacing-4); padding-block: var(--wui-spacing-2);
    font-size: var(--wui-font-size-xs);
    text-transform: uppercase; letter-spacing: 0.06em;
    color: var(--wui-color-muted-foreground);
    font-weight: var(--wui-font-weight-semibold);
  }
  .wui-cmdk-shell [cmdk-item] {
    display: flex; align-items: center; justify-content: space-between;
    padding-inline: var(--wui-spacing-4); padding-block: var(--wui-spacing-2);
    cursor: pointer;
    color: var(--wui-color-foreground);
  }
  .wui-cmdk-shell [cmdk-item][data-selected="true"] {
    background-color: color-mix(in oklch, var(--wui-color-primary) 8%, transparent);
  }
  .wui-cmdk-shell .wui-cmdk-href {
    font-family: var(--wui-font-family-mono);
    font-size: var(--wui-font-size-xs);
    color: var(--wui-color-muted-foreground);
  }
  .wui-cmdk-shell [cmdk-empty] {
    padding: var(--wui-spacing-6);
    text-align: center;
    color: var(--wui-color-muted-foreground);
  }
}
```

- [ ] **Step 7: Build and verify**

Run: `pnpm --filter @weiui/docs build`
Expected: `tsx scripts/build-search-index.ts` emits `public/search-index.json`, next build succeeds.

- [ ] **Step 8: Commit**

```bash
git add apps/docs/src/lib/search-index.ts \
        apps/docs/scripts/build-search-index.ts \
        apps/docs/src/components/chrome/CommandPalette.tsx \
        apps/docs/src/components/chrome/SearchTrigger.tsx \
        apps/docs/src/styles/chrome.css \
        apps/docs/package.json
git commit -m "feat(docs): add build-time search index + cmdk command palette"
```

---

## Task 9: Landing hero refresh

**Files:**
- Modify: `apps/docs/src/app/page.tsx`
- Modify: `apps/docs/src/styles/chrome.css`

- [ ] **Step 1: Replace `apps/docs/src/app/page.tsx`**

```tsx
import Link from "next/link";
import { Header } from "../components/chrome/Header";
import { siteConfig } from "../lib/site-config";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="wui-landing-hero">
          <h1 className="wui-display wui-landing-hero__title">
            A design system that earns its place.
          </h1>
          <p className="wui-landing-hero__sub">
            Three consumption layers. WCAG AAA enforcement. OKLCH tokens. Designer-friendly.
          </p>
          <div className="wui-landing-hero__cta">
            <Link href="/docs/getting-started" className="wui-button wui-button--solid">Get Started</Link>
            <Link href="/docs/components" className="wui-button wui-button--outline">Components</Link>
            <a href={siteConfig.githubUrl} className="wui-button wui-button--ghost" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </section>

        <section className="wui-landing-grid">
          <div className="wui-card">
            <div className="wui-card__header"><h3>Three Layers</h3></div>
            <div className="wui-card__content">CSS-only primitives, headless behavior hooks, and fully styled React components.</div>
          </div>
          <div className="wui-card">
            <div className="wui-card__header"><h3>WCAG AAA</h3></div>
            <div className="wui-card__content">7:1 contrast for content text, 44px touch targets, full keyboard navigation.</div>
          </div>
          <div className="wui-card">
            <div className="wui-card__header"><h3>OKLCH Tokens</h3></div>
            <div className="wui-card__content">W3C Design Tokens in JSON. Auto dark mode. Designer-friendly source of truth.</div>
          </div>
        </section>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Append landing hero styles to `chrome.css`**

```css
@layer wui-base {
  .wui-landing-hero {
    max-inline-size: 72rem;
    margin-inline: auto;
    padding-inline: var(--wui-spacing-6);
    padding-block: calc(var(--wui-spacing-12) * 2) var(--wui-spacing-12);
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .wui-landing-hero::before {
    content: "";
    position: absolute;
    inset-block-start: -20%;
    inset-inline: 10%;
    block-size: 60%;
    background-image: radial-gradient(
        60% 50% at 30% 30%,
        color-mix(in oklch, var(--wui-color-primary) 20%, transparent) 0%,
        transparent 60%
      ),
      radial-gradient(
        60% 50% at 70% 40%,
        oklch(0.7 0.18 320 / 0.2) 0%,
        transparent 60%
      );
    filter: blur(40px);
    z-index: -1;
    pointer-events: none;
  }
  .wui-landing-hero__title {
    font-family: var(--wui-font-family-display);
    font-size: clamp(var(--wui-font-size-5xl), 8vw, var(--wui-font-size-6xl));
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin-block-end: var(--wui-spacing-4);
  }
  .wui-landing-hero__sub {
    font-size: var(--wui-font-size-lg);
    color: var(--wui-color-muted-foreground);
    max-inline-size: 40rem;
    margin-inline: auto;
    margin-block-end: var(--wui-spacing-8);
  }
  .wui-landing-hero__cta {
    display: flex; gap: var(--wui-spacing-3); justify-content: center; flex-wrap: wrap;
  }

  .wui-landing-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: var(--wui-spacing-6);
    max-inline-size: 72rem;
    margin-inline: auto;
    padding-inline: var(--wui-spacing-6);
    padding-block-end: var(--wui-spacing-12);
  }
}
```

- [ ] **Step 3: Build + commit**

```bash
pnpm --filter @weiui/docs build
git add apps/docs/src/app/page.tsx apps/docs/src/styles/chrome.css
git commit -m "feat(docs): refresh landing hero with ambient gradient + Instrument Serif display"
```

---

## Task 10: Final verification

- [ ] **Step 1: Full build**

Run: `pnpm build`
Expected: every package/app builds. Docs emits `public/search-index.json`.

- [ ] **Step 2: All tests pass**

Run: `pnpm test`
Expected: 524+ tests pass (no regressions from Phase 0).

- [ ] **Step 3: Manual dev server check**

Run: `pnpm --filter @weiui/docs dev`

Open http://localhost:3000 and confirm:
- Hero has ambient gradient + Instrument Serif display heading.
- Sticky header with backdrop blur.
- Theme toggle cycles Light / Dark / System, persists across refresh, no FOUC.
- ⌘K (or Ctrl+K) opens command palette; fuzzy search works; navigation works.

Open http://localhost:3000/docs/components/button and confirm:
- Sidebar active state visible.
- TOC right-side highlights current section while scrolling.
- Breadcrumbs show path.
- Prev/Next pager at bottom.
- Edit on GitHub link present.
- Code blocks syntax-highlighted (vitesse-light / vitesse-dark) with copy on hover.

Stop dev server (Ctrl+C).

- [ ] **Step 4: Report Phase 1 complete**

Summary of commits and any deferred items.
