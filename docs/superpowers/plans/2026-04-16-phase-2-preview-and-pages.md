# Phase 2 — Preview Infrastructure + Missing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Replace the bare `ComponentPreview` with a polished `<Preview>` component that has Preview/Code tabs, copy-to-clipboard, theme toggle, RTL toggle, and viewport resizer. Add 7 missing doc pages: Typography, Colors, Icons, Installation, CLI, Migration, Changelog. Update sidebar to include them.

**Architecture:** `<Preview>` is a client component that wraps children in an iframe-free sandbox when no toggles are active (fast), and renders an `<iframe>` only when theme/RTL/viewport toggles are flipped (isolation). Code tab shows the raw JSX source passed as a string prop. New pages under `apps/docs/src/app/docs/*` follow the MDX convention used by existing pages.

**Tech Stack:** Same as Phase 1 — Next.js 15, React 19, MDX. No new deps.

**Spec reference:** `docs/superpowers/specs/2026-04-16-polish-overhaul-design.md` §6.

---

## File Structure

**New files:**
- `apps/docs/src/components/preview/Preview.tsx` — new preview component
- `apps/docs/src/components/preview/PreviewToolbar.tsx` — internal toolbar
- `apps/docs/src/components/preview/PreviewFrame.tsx` — iframe variant for isolation
- `apps/docs/src/styles/preview.css` — preview-scoped styles
- `apps/docs/src/app/docs/typography/page.mdx`
- `apps/docs/src/app/docs/colors/page.mdx`
- `apps/docs/src/app/docs/icons/page.mdx`
- `apps/docs/src/app/docs/installation/page.mdx`
- `apps/docs/src/app/docs/cli/page.mdx`
- `apps/docs/src/app/docs/migration/page.mdx`
- `apps/docs/src/app/docs/changelog/page.mdx`
- `apps/docs/src/lib/token-catalog.ts` — build-time extraction of token data for colors/typography pages

**Modified files:**
- `apps/docs/src/components/ComponentPreview.tsx` — re-export Preview for back-compat (drop-in)
- `apps/docs/src/lib/site-config.ts` — add new pages to sidebarGroups
- `apps/docs/src/app/layout.tsx` — import `preview.css`

---

## Task 1: New Preview component (tabs, copy, no toggles yet)

**Files:**
- Create: `apps/docs/src/components/preview/Preview.tsx`
- Create: `apps/docs/src/styles/preview.css`
- Modify: `apps/docs/src/components/ComponentPreview.tsx` (re-export shim)
- Modify: `apps/docs/src/app/layout.tsx` (import preview.css)

- [ ] **Step 1: Create `apps/docs/src/components/preview/Preview.tsx`**

```tsx
"use client";

import { useState, type ReactNode } from "react";

export interface PreviewProps {
  children: ReactNode;
  code?: string;
  label?: string;
}

export function Preview({ children, code, label }: PreviewProps) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="wui-preview">
      <div className="wui-preview__header">
        {label && <span className="wui-preview__label">{label}</span>}
        <div className="wui-preview__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "preview"}
            onClick={() => setTab("preview")}
            className="wui-preview__tab"
            data-active={tab === "preview" || undefined}
          >
            Preview
          </button>
          {code && (
            <button
              type="button"
              role="tab"
              aria-selected={tab === "code"}
              onClick={() => setTab("code")}
              className="wui-preview__tab"
              data-active={tab === "code" || undefined}
            >
              Code
            </button>
          )}
        </div>
        <div className="wui-preview__actions">
          {code && (
            <button
              type="button"
              onClick={onCopy}
              className="wui-preview__copy"
              aria-label={copied ? "Copied" : "Copy code"}
            >
              {copied ? "✓" : "⧉"}
            </button>
          )}
        </div>
      </div>
      {tab === "preview" ? (
        <div className="wui-preview__stage">{children}</div>
      ) : (
        <pre className="wui-preview__code"><code>{code}</code></pre>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `apps/docs/src/styles/preview.css`**

```css
@layer wui-base {
  .wui-preview {
    border: 1px solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-lg);
    overflow: hidden;
    margin-block: var(--wui-spacing-4);
    background-color: var(--wui-surface-raised);
  }
  .wui-preview__header {
    display: flex; align-items: center; gap: var(--wui-spacing-3);
    padding-inline: var(--wui-spacing-3); padding-block: var(--wui-spacing-2);
    background-color: var(--wui-surface-sunken);
    border-block-end: 1px solid var(--wui-color-border);
  }
  .wui-preview__label {
    font-size: var(--wui-font-size-xs);
    color: var(--wui-color-muted-foreground);
    font-weight: var(--wui-font-weight-medium);
  }
  .wui-preview__tabs {
    display: inline-flex;
    gap: 2px;
    background-color: var(--wui-color-background);
    border: 1px solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-base);
    padding: 2px;
  }
  .wui-preview__tab {
    font-size: var(--wui-font-size-xs);
    font-weight: var(--wui-font-weight-medium);
    padding-inline: var(--wui-spacing-3); padding-block: var(--wui-spacing-1);
    background-color: transparent;
    color: var(--wui-color-muted-foreground);
    border: none;
    border-radius: var(--wui-shape-radius-sm);
    cursor: pointer;
  }
  .wui-preview__tab[data-active] {
    background-color: var(--wui-surface-raised);
    color: var(--wui-color-foreground);
    box-shadow: var(--wui-elevation-1);
  }
  .wui-preview__actions {
    margin-inline-start: auto;
    display: inline-flex;
    gap: var(--wui-spacing-2);
  }
  .wui-preview__copy {
    inline-size: 28px; block-size: 28px;
    display: inline-flex; align-items: center; justify-content: center;
    background-color: transparent;
    color: var(--wui-color-muted-foreground);
    border: 1px solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-base);
    cursor: pointer;
    font-size: var(--wui-font-size-xs);
  }
  .wui-preview__copy:hover {
    color: var(--wui-color-foreground);
    background-color: var(--wui-color-muted);
  }
  .wui-preview__stage {
    display: flex; flex-wrap: wrap;
    gap: var(--wui-spacing-3);
    padding: var(--wui-spacing-6);
    align-items: center;
    min-block-size: 96px;
  }
  .wui-preview__code {
    padding: var(--wui-spacing-4);
    overflow-x: auto;
    font-family: var(--wui-font-family-mono);
    font-size: var(--wui-font-size-sm);
    line-height: 1.6;
    margin: 0;
    background-color: var(--wui-surface-sunken);
  }

  @media (prefers-reduced-motion: no-preference) {
    .wui-preview__tab,
    .wui-preview__copy {
      transition-property: background-color, color, box-shadow;
      transition-duration: var(--wui-motion-duration-fast);
      transition-timing-function: var(--wui-motion-easing-standard);
    }
  }
}
```

- [ ] **Step 3: Replace `apps/docs/src/components/ComponentPreview.tsx` with a shim**

```tsx
export { Preview as ComponentPreview, type PreviewProps as ComponentPreviewProps } from "./preview/Preview";
```

This keeps every existing `<ComponentPreview>` working while we migrate callers.

- [ ] **Step 4: Add `preview.css` import to `apps/docs/src/app/layout.tsx`**

After the `import "../styles/chrome.css";` line, add:
```tsx
import "../styles/preview.css";
```

- [ ] **Step 5: Build + test**

```bash
pnpm --filter @weiui/docs build
```
Expected: all 31 pages still build.

- [ ] **Step 6: Commit**

```bash
git add apps/docs/src/components/preview/Preview.tsx \
        apps/docs/src/components/ComponentPreview.tsx \
        apps/docs/src/styles/preview.css \
        apps/docs/src/app/layout.tsx
git commit -m "feat(docs): add Preview component with tabs + copy (ComponentPreview shim preserved)"
```

---

## Task 2: Preview toggles (theme/RTL/viewport) via iframe isolation

**Files:**
- Modify: `apps/docs/src/components/preview/Preview.tsx`
- Create: `apps/docs/src/components/preview/PreviewFrame.tsx`
- Modify: `apps/docs/src/styles/preview.css` (append)

- [ ] **Step 1: Create `apps/docs/src/components/preview/PreviewFrame.tsx`**

```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface PreviewFrameProps {
  children: ReactNode;
  theme: "light" | "dark" | "system";
  dir: "ltr" | "rtl";
  width: number | "100%";
}

export function PreviewFrame({ children, theme, dir, width }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [container, setContainer] = useUseContainer();

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    const sheets = Array.from(document.styleSheets)
      .map((s) => {
        try {
          return (s.ownerNode as HTMLElement)?.outerHTML ?? "";
        } catch {
          return "";
        }
      })
      .filter(Boolean)
      .join("\n");

    const resolved =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    doc.open();
    doc.write(`<!DOCTYPE html>
<html dir="${dir}" data-theme="${resolved}" class="${resolved === "dark" ? "dark" : ""}">
  <head>
    ${sheets}
    <style>
      body { margin: 0; padding: 24px; font-family: var(--wui-font-family-sans); background: var(--wui-color-background); color: var(--wui-color-foreground); }
      #wui-preview-root { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
    </style>
  </head>
  <body><div id="wui-preview-root"></div></body>
</html>`);
    doc.close();

    const root = doc.getElementById("wui-preview-root");
    setContainer(root);
  }, [theme, dir, setContainer]);

  const inlineSize = width === "100%" ? "100%" : `${width}px`;

  return (
    <>
      <iframe
        ref={iframeRef}
        className="wui-preview__frame"
        style={{ inlineSize, blockSize: 320, border: 0 }}
        title="Component preview"
      />
      {container && createPortal(children, container)}
    </>
  );
}

function useUseContainer(): [HTMLElement | null, (el: HTMLElement | null) => void] {
  const ref = useRef<HTMLElement | null>(null);
  const setRef = (el: HTMLElement | null) => {
    ref.current = el;
  };
  return [ref.current, setRef];
}
```

NOTE: The `useUseContainer` hook re-renders via the wrapping component when the iframe is (re)written. Because the iframe effect runs on each `theme/dir/width` change and sets container to a fresh element, React portal targets will swap. Acceptable for Phase 2 simplicity.

- [ ] **Step 2: Rewrite `Preview.tsx` to include toggles**

Replace `apps/docs/src/components/preview/Preview.tsx` with:

```tsx
"use client";

import { useState, type ReactNode } from "react";
import { PreviewFrame } from "./PreviewFrame";

export interface PreviewProps {
  children: ReactNode;
  code?: string;
  label?: string;
}

type ViewportPreset = "100%" | 768 | 375;

export function Preview({ children, code, label }: PreviewProps) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"inherit" | "light" | "dark">("inherit");
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");
  const [viewport, setViewport] = useState<ViewportPreset>("100%");

  const onCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const isolated = theme !== "inherit" || dir !== "ltr" || viewport !== "100%";

  return (
    <div className="wui-preview">
      <div className="wui-preview__header">
        {label && <span className="wui-preview__label">{label}</span>}
        <div className="wui-preview__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "preview"}
            onClick={() => setTab("preview")}
            className="wui-preview__tab"
            data-active={tab === "preview" || undefined}
          >
            Preview
          </button>
          {code && (
            <button
              type="button"
              role="tab"
              aria-selected={tab === "code"}
              onClick={() => setTab("code")}
              className="wui-preview__tab"
              data-active={tab === "code" || undefined}
            >
              Code
            </button>
          )}
        </div>
        <div className="wui-preview__actions">
          {tab === "preview" && (
            <>
              <SegmentToggle
                value={theme}
                options={[
                  { value: "inherit", label: "Auto" },
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
                onChange={setTheme}
                aria-label="Theme"
              />
              <SegmentToggle
                value={dir}
                options={[
                  { value: "ltr", label: "LTR" },
                  { value: "rtl", label: "RTL" },
                ]}
                onChange={setDir}
                aria-label="Direction"
              />
              <SegmentToggle
                value={viewport}
                options={[
                  { value: "100%", label: "Full" },
                  { value: 768, label: "768" },
                  { value: 375, label: "375" },
                ]}
                onChange={setViewport}
                aria-label="Viewport"
              />
            </>
          )}
          {code && (
            <button
              type="button"
              onClick={onCopy}
              className="wui-preview__copy"
              aria-label={copied ? "Copied" : "Copy code"}
            >
              {copied ? "✓" : "⧉"}
            </button>
          )}
        </div>
      </div>
      {tab === "preview" ? (
        isolated ? (
          <div className="wui-preview__stage wui-preview__stage--frame">
            <PreviewFrame
              theme={theme === "inherit" ? "system" : theme}
              dir={dir}
              width={viewport}
            >
              {children}
            </PreviewFrame>
          </div>
        ) : (
          <div className="wui-preview__stage">{children}</div>
        )
      ) : (
        <pre className="wui-preview__code"><code>{code}</code></pre>
      )}
    </div>
  );
}

interface SegmentToggleProps<T extends string | number> {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
  "aria-label": string;
}

function SegmentToggle<T extends string | number>({ value, options, onChange, ...rest }: SegmentToggleProps<T>) {
  return (
    <div className="wui-preview__segment" role="radiogroup" aria-label={rest["aria-label"]}>
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className="wui-preview__segment-item"
          data-active={value === opt.value || undefined}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Append styles to `preview.css`**

```css
@layer wui-base {
  .wui-preview__segment {
    display: inline-flex;
    background-color: var(--wui-color-background);
    border: 1px solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-base);
    padding: 2px;
    gap: 2px;
  }
  .wui-preview__segment-item {
    font-size: var(--wui-font-size-xs);
    padding-inline: var(--wui-spacing-2); padding-block: var(--wui-spacing-1);
    color: var(--wui-color-muted-foreground);
    background: transparent;
    border: none;
    cursor: pointer;
    border-radius: calc(var(--wui-shape-radius-base) - 2px);
  }
  .wui-preview__segment-item[data-active] {
    background-color: var(--wui-surface-raised);
    color: var(--wui-color-foreground);
    box-shadow: var(--wui-elevation-1);
  }
  .wui-preview__stage--frame {
    padding: var(--wui-spacing-2);
    background-color: var(--wui-surface-sunken);
    display: flex;
    justify-content: center;
  }
  .wui-preview__frame {
    background-color: var(--wui-color-background);
    border-radius: var(--wui-shape-radius-md);
  }

  @media (prefers-reduced-motion: no-preference) {
    .wui-preview__segment-item {
      transition: background-color var(--wui-motion-duration-fast) var(--wui-motion-easing-standard),
                  color var(--wui-motion-duration-fast) var(--wui-motion-easing-standard);
    }
  }
}
```

- [ ] **Step 4: Build + commit**

```bash
pnpm --filter @weiui/docs build
git add apps/docs/src/components/preview/Preview.tsx \
        apps/docs/src/components/preview/PreviewFrame.tsx \
        apps/docs/src/styles/preview.css
git commit -m "feat(docs): add theme/RTL/viewport toggles with iframe isolation"
```

---

## Task 3: Typography page

**Files:**
- Create: `apps/docs/src/app/docs/typography/page.mdx`

- [ ] **Step 1: Create the page**

```markdown
# Typography

WeiUI ships three type stacks exposed as CSS variables:

- `--wui-font-family-sans` — **Inter** (body, UI, prose)
- `--wui-font-family-display` — **Instrument Serif** (hero/display headings)
- `--wui-font-family-mono` — **JetBrains Mono** (code)

## Scale

| Token | Value | Example |
|-------|-------|---------|
| `--wui-font-size-xs` | 12px | <span style={{ fontSize: "var(--wui-font-size-xs)" }}>The quick brown fox</span> |
| `--wui-font-size-sm` | 14px | <span style={{ fontSize: "var(--wui-font-size-sm)" }}>The quick brown fox</span> |
| `--wui-font-size-base` | 16px | <span style={{ fontSize: "var(--wui-font-size-base)" }}>The quick brown fox</span> |
| `--wui-font-size-lg` | 18px | <span style={{ fontSize: "var(--wui-font-size-lg)" }}>The quick brown fox</span> |
| `--wui-font-size-xl` | 20px | <span style={{ fontSize: "var(--wui-font-size-xl)" }}>The quick brown fox</span> |
| `--wui-font-size-2xl` | 24px | <span style={{ fontSize: "var(--wui-font-size-2xl)" }}>The quick brown fox</span> |
| `--wui-font-size-3xl` | 30px | <span style={{ fontSize: "var(--wui-font-size-3xl)" }}>The quick brown fox</span> |
| `--wui-font-size-4xl` | 36px | <span style={{ fontSize: "var(--wui-font-size-4xl)" }}>The quick brown fox</span> |
| `--wui-font-size-5xl` | 48px | <span style={{ fontSize: "var(--wui-font-size-5xl)" }}>The quick brown fox</span> |

## Display typography

The hero on the landing page uses the display stack. Add `className="wui-display"` to any heading to opt in.

<div style={{ padding: "2rem", border: "1px solid var(--wui-color-border)", borderRadius: "var(--wui-shape-radius-lg)" }}>
  <h2 className="wui-display" style={{ fontSize: "var(--wui-font-size-5xl)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
    A design system that earns its place.
  </h2>
</div>

## Weights

`var(--wui-font-weight-regular)` = 400, `-medium` = 500, `-semibold` = 600, `-bold` = 700.
```

- [ ] **Step 2: Build + commit**

```bash
pnpm --filter @weiui/docs build
git add apps/docs/src/app/docs/typography/page.mdx
git commit -m "feat(docs): add /docs/typography page"
```

---

## Task 4: Colors page

**Files:**
- Create: `apps/docs/src/app/docs/colors/page.mdx`
- Create: `apps/docs/src/components/docs/ColorSwatch.tsx`

- [ ] **Step 1: Create `apps/docs/src/components/docs/ColorSwatch.tsx`**

```tsx
"use client";

import { useState } from "react";

interface ColorSwatchProps {
  name: string;
  cssVar: string;
}

export function ColorSwatch({ name, cssVar }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(`var(${cssVar})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      className="wui-color-swatch"
      aria-label={`Copy var(${cssVar})`}
    >
      <span
        className="wui-color-swatch__chip"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <span className="wui-color-swatch__body">
        <span className="wui-color-swatch__name">{name}</span>
        <code className="wui-color-swatch__var">{copied ? "copied!" : `var(${cssVar})`}</code>
      </span>
    </button>
  );
}
```

- [ ] **Step 2: Append styles to `preview.css`**

```css
@layer wui-base {
  .wui-color-swatch {
    display: flex; align-items: center; gap: var(--wui-spacing-3);
    inline-size: 100%;
    padding: var(--wui-spacing-3);
    background-color: var(--wui-surface-raised);
    border: 1px solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-md);
    text-align: start;
    cursor: pointer;
  }
  .wui-color-swatch:hover { border-color: var(--wui-color-primary); }
  .wui-color-swatch__chip {
    inline-size: 40px; block-size: 40px;
    border-radius: var(--wui-shape-radius-base);
    border: 1px solid color-mix(in oklch, var(--wui-color-foreground) 10%, transparent);
    flex: 0 0 auto;
  }
  .wui-color-swatch__body { display: flex; flex-direction: column; gap: 2px; min-inline-size: 0; }
  .wui-color-swatch__name { font-size: var(--wui-font-size-sm); font-weight: var(--wui-font-weight-medium); }
  .wui-color-swatch__var {
    font-family: var(--wui-font-family-mono);
    font-size: var(--wui-font-size-xs);
    color: var(--wui-color-muted-foreground);
  }
  .wui-color-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--wui-spacing-3);
    margin-block: var(--wui-spacing-4);
  }
}
```

- [ ] **Step 3: Create `apps/docs/src/app/docs/colors/page.mdx`**

```markdown
import { ColorSwatch } from "../../../components/docs/ColorSwatch";

# Colors

All colors in WeiUI use the OKLCH color space. Semantic tokens are derived from primitive neutrals and hues. Click any swatch to copy its CSS variable.

## Semantic

<div className="wui-color-grid">
  <ColorSwatch name="Primary" cssVar="--wui-color-primary" />
  <ColorSwatch name="Primary foreground" cssVar="--wui-color-primary-foreground" />
  <ColorSwatch name="Background" cssVar="--wui-color-background" />
  <ColorSwatch name="Foreground" cssVar="--wui-color-foreground" />
  <ColorSwatch name="Card" cssVar="--wui-color-card" />
  <ColorSwatch name="Card foreground" cssVar="--wui-color-card-foreground" />
  <ColorSwatch name="Muted" cssVar="--wui-color-muted" />
  <ColorSwatch name="Muted foreground" cssVar="--wui-color-muted-foreground" />
  <ColorSwatch name="Border" cssVar="--wui-color-border" />
  <ColorSwatch name="Ring" cssVar="--wui-color-ring" />
  <ColorSwatch name="Ring soft" cssVar="--wui-color-ring-soft" />
</div>

## Status

<div className="wui-color-grid">
  <ColorSwatch name="Destructive" cssVar="--wui-color-destructive" />
  <ColorSwatch name="Success" cssVar="--wui-color-success" />
  <ColorSwatch name="Warning" cssVar="--wui-color-warning" />
</div>

## Surfaces

<div className="wui-color-grid">
  <ColorSwatch name="Raised" cssVar="--wui-surface-raised" />
  <ColorSwatch name="Overlay" cssVar="--wui-surface-overlay" />
  <ColorSwatch name="Sunken" cssVar="--wui-surface-sunken" />
</div>

## Contrast

All content-text token pairs are validated at build time. Run `pnpm --filter @weiui/tokens validate` to see the full matrix.

| Foreground | Background | Ratio | Passes |
|------------|------------|-------|--------|
| Card foreground | Card | 19.78:1 | AAA |
| Muted foreground | Muted | 6.86:1 | AA |
| Primary foreground | Primary | 5.26:1 | AA |
| Destructive foreground | Destructive | 4.91:1 | AA |
| Success foreground | Success | 5.16:1 | AA |
| Warning foreground | Warning | 6.71:1 | AA |
```

- [ ] **Step 4: Build + commit**

```bash
pnpm --filter @weiui/docs build
git add apps/docs/src/app/docs/colors/page.mdx \
        apps/docs/src/components/docs/ColorSwatch.tsx \
        apps/docs/src/styles/preview.css
git commit -m "feat(docs): add /docs/colors page with click-to-copy swatches"
```

---

## Task 5: Installation page

**Files:**
- Create: `apps/docs/src/app/docs/installation/page.mdx`
- Create: `apps/docs/src/components/docs/PackageManagerTabs.tsx`

- [ ] **Step 1: Create `PackageManagerTabs.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";

interface Props {
  command: string; // e.g. "add @weiui/react"
}

const MANAGERS = [
  { id: "npm", label: "npm", prefix: "npm install" },
  { id: "pnpm", label: "pnpm", prefix: "pnpm add" },
  { id: "yarn", label: "yarn", prefix: "yarn add" },
  { id: "bun", label: "bun", prefix: "bun add" },
] as const;

type ManagerId = (typeof MANAGERS)[number]["id"];

export function PackageManagerTabs({ command }: Props) {
  const [active, setActive] = useState<ManagerId>("pnpm");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("wui-pm") as ManagerId | null;
    if (stored && MANAGERS.some((m) => m.id === stored)) setActive(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("wui-pm", active);
  }, [active]);

  const current = MANAGERS.find((m) => m.id === active)!;
  const full = `${current.prefix} ${command}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="wui-pm-tabs">
      <div className="wui-pm-tabs__row" role="tablist">
        {MANAGERS.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={active === m.id}
            onClick={() => setActive(m.id)}
            data-active={active === m.id || undefined}
            className="wui-pm-tabs__tab"
          >
            {m.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onCopy}
          className="wui-pm-tabs__copy"
          aria-label={copied ? "Copied" : "Copy command"}
        >
          {copied ? "✓" : "⧉"}
        </button>
      </div>
      <pre className="wui-pm-tabs__cmd"><code>{full}</code></pre>
    </div>
  );
}
```

- [ ] **Step 2: Append styles to `preview.css`**

```css
@layer wui-base {
  .wui-pm-tabs {
    border: 1px solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-md);
    overflow: hidden;
    margin-block: var(--wui-spacing-4);
    background-color: var(--wui-surface-raised);
  }
  .wui-pm-tabs__row {
    display: flex; align-items: center; gap: 2px;
    padding: var(--wui-spacing-2);
    background-color: var(--wui-surface-sunken);
    border-block-end: 1px solid var(--wui-color-border);
  }
  .wui-pm-tabs__tab {
    font-size: var(--wui-font-size-xs);
    font-weight: var(--wui-font-weight-medium);
    padding-inline: var(--wui-spacing-3); padding-block: var(--wui-spacing-1);
    background-color: transparent;
    color: var(--wui-color-muted-foreground);
    border: none;
    border-radius: var(--wui-shape-radius-sm);
    cursor: pointer;
  }
  .wui-pm-tabs__tab[data-active] {
    background-color: var(--wui-surface-raised);
    color: var(--wui-color-foreground);
    box-shadow: var(--wui-elevation-1);
  }
  .wui-pm-tabs__copy {
    margin-inline-start: auto;
    inline-size: 28px; block-size: 28px;
    display: inline-flex; align-items: center; justify-content: center;
    background: transparent;
    color: var(--wui-color-muted-foreground);
    border: 1px solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-base);
    cursor: pointer;
    font-size: var(--wui-font-size-xs);
  }
  .wui-pm-tabs__cmd {
    padding: var(--wui-spacing-4);
    margin: 0;
    font-family: var(--wui-font-family-mono);
    font-size: var(--wui-font-size-sm);
    overflow-x: auto;
  }
}
```

- [ ] **Step 3: Create `apps/docs/src/app/docs/installation/page.mdx`**

```markdown
import { PackageManagerTabs } from "../../../components/docs/PackageManagerTabs";

# Installation

WeiUI ships four packages. Install only what you need.

## @weiui/react — styled React components

<PackageManagerTabs command="@weiui/react" />

## @weiui/headless — accessible hooks

<PackageManagerTabs command="@weiui/headless" />

## @weiui/css — Layer 1 CSS-only primitives (zero JS)

<PackageManagerTabs command="@weiui/css" />

## @weiui/tokens — design tokens (CSS vars + JSON)

<PackageManagerTabs command="@weiui/tokens" />

## Quick start

```tsx
// your-app/layout.tsx
import "@weiui/tokens/tokens.css";
import "@weiui/css";

export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>;
}
```

```tsx
// your-app/page.tsx
import { Button } from "@weiui/react";

export default function Page() {
  return <Button>Hello WeiUI</Button>;
}
```

Your tokens default to system light/dark via `prefers-color-scheme`. Add a `dark` class or `data-theme="dark"` on `<html>` to opt into manual dark mode.
```

- [ ] **Step 4: Build + commit**

```bash
pnpm --filter @weiui/docs build
git add apps/docs/src/app/docs/installation/page.mdx \
        apps/docs/src/components/docs/PackageManagerTabs.tsx \
        apps/docs/src/styles/preview.css
git commit -m "feat(docs): add /docs/installation page with pkg-manager tabs"
```

---

## Task 6: Icons, CLI, Migration, Changelog pages

**Files:**
- Create: `apps/docs/src/app/docs/icons/page.mdx`
- Create: `apps/docs/src/app/docs/cli/page.mdx`
- Create: `apps/docs/src/app/docs/migration/page.mdx`
- Create: `apps/docs/src/app/docs/changelog/page.mdx`

### Icons page

`apps/docs/src/app/docs/icons/page.mdx`:

```markdown
# Icons

WeiUI does not ship a bundled icon set yet. The Phase 4 component-audit may grow `@weiui/icons`; for now, pair any icon library of your choice.

## Recommended pairings

- **Lucide** — clean, rounded, pairs well with Inter. `pnpm add lucide-react`
- **Tabler** — extensive set with variants. `pnpm add @tabler/icons-react`
- **Phosphor** — multiple weights. `pnpm add @phosphor-icons/react`

All icon libraries respect `currentColor` and `em`-sized dimensions, so they adopt WeiUI's color and typography tokens automatically.

## Example

```tsx
import { Button } from "@weiui/react";
import { Download } from "lucide-react";

<Button>
  <Download size="1em" />
  Download
</Button>
```

## Future

A searchable icon browser is planned for the @weiui/icons release. Track progress on the roadmap page.
```

### CLI page

`apps/docs/src/app/docs/cli/page.mdx`:

```markdown
# CLI

The `@weiui/cli` package scaffolds WeiUI projects, adds components, and validates design tokens.

## Install

```bash
pnpm add -D @weiui/cli
# or run ad-hoc
pnpm dlx @weiui/cli --help
```

## Commands

### `init`

Scaffold a new WeiUI consumer. Creates token imports and an optional theme config.

```bash
pnpm dlx @weiui/cli init
```

### `add`

Copy a single component's source into your project (shadcn-style ownership).

```bash
pnpm dlx @weiui/cli add button
```

### `audit`

Validate that your local token overrides still pass WCAG AAA targets.

```bash
pnpm dlx @weiui/cli audit
```

Exits non-zero if any contrast pair drops below its required threshold.

## Programmatic API

Every CLI command is also exported as a library function — see `@weiui/cli/api` for the full surface. This makes WeiUI's validators composable into your own build pipeline.
```

### Migration page

`apps/docs/src/app/docs/migration/page.mdx`:

```markdown
# Migration Guides

Migration notes land here as major versions ship. WeiUI is pre-1.0; no breaking changes yet.

## v0 → v1 (planned)

- Component APIs will freeze at v1.0.0
- Any breaking rename or prop removal between now and v1 will be documented here with the commit that introduced it

## Contributing a migration note

If you land a breaking change, append a section to this page in the same PR. Each section should include: what changed, why, and a codemod or sed recipe if possible.
```

### Changelog page

`apps/docs/src/app/docs/changelog/page.mdx`:

```markdown
# Changelog

Releases are driven by [Changesets](https://github.com/changesets/changesets). Each package has its own `CHANGELOG.md` — links below.

- [`@weiui/react`](https://github.com/xiaooye/weiui/blob/main/packages/react/CHANGELOG.md)
- [`@weiui/headless`](https://github.com/xiaooye/weiui/blob/main/packages/headless/CHANGELOG.md)
- [`@weiui/css`](https://github.com/xiaooye/weiui/blob/main/packages/css/CHANGELOG.md)
- [`@weiui/tokens`](https://github.com/xiaooye/weiui/blob/main/packages/tokens/CHANGELOG.md)
- [`@weiui/cli`](https://github.com/xiaooye/weiui/blob/main/packages/cli/CHANGELOG.md)

## Pre-releases

Unreleased work is described in the ongoing `docs/superpowers/plans/` directory:

- Phase 0: CSS primitive & token polish — **landed**
- Phase 1: Docs chrome, search, code highlighting — **landed**
- Phase 2: Preview infrastructure + missing pages — in progress
- Phase 3: Homepage overhaul
- Phase 4: Component audit matrix
- Phase 5: Component polish waves
```

- [ ] **Step 1: Write all 4 page files.**

- [ ] **Step 2: Build + commit**

```bash
pnpm --filter @weiui/docs build
git add apps/docs/src/app/docs/icons/page.mdx \
        apps/docs/src/app/docs/cli/page.mdx \
        apps/docs/src/app/docs/migration/page.mdx \
        apps/docs/src/app/docs/changelog/page.mdx
git commit -m "feat(docs): add icons, cli, migration, changelog pages"
```

---

## Task 7: Update sidebar with new pages

**Files:**
- Modify: `apps/docs/src/lib/site-config.ts`

- [ ] **Step 1: Add the new entries**

Edit `apps/docs/src/lib/site-config.ts`. Replace the `sidebarGroups` array with:

```ts
sidebarGroups: [
  {
    title: "Getting Started",
    items: [
      { href: "/docs/getting-started", label: "Installation" },
      { href: "/docs/installation", label: "Package Install" },
      { href: "/docs/tokens", label: "Design Tokens" },
      { href: "/docs/css", label: "CSS Layer" },
      { href: "/docs/accessibility", label: "Accessibility" },
    ],
  },
  {
    title: "Foundations",
    items: [
      { href: "/docs/typography", label: "Typography" },
      { href: "/docs/colors", label: "Colors" },
      { href: "/docs/icons", label: "Icons" },
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
      { href: "/docs/components/typography", label: "Typography (legacy)" },
      { href: "/docs/components/editor", label: "Editor" },
      { href: "/docs/components/command-palette", label: "Command Palette" },
      { href: "/docs/components/accordion", label: "Accordion" },
      { href: "/docs/components/wave2-3", label: "More Components" },
    ],
  },
  {
    title: "Resources",
    items: [
      { href: "/docs/cli", label: "CLI" },
      { href: "/docs/changelog", label: "Changelog" },
      { href: "/docs/migration", label: "Migration" },
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
```

- [ ] **Step 2: Build + commit**

```bash
pnpm --filter @weiui/docs build
git add apps/docs/src/lib/site-config.ts
git commit -m "feat(docs): wire new pages into sidebar nav"
```

---

## Task 8: Final verification

- [ ] Full build: `pnpm build`
- [ ] Tests: `pnpm test` (still 524+)
- [ ] Dev server: open `/docs/typography`, `/docs/colors`, `/docs/installation`, `/docs/cli`, `/docs/migration`, `/docs/changelog`, `/docs/icons` — each renders with new chrome, sidebar active state, TOC.
- [ ] Click a color swatch — copies `var(--wui-color-primary)` etc. to clipboard.
- [ ] Switch package manager tabs on `/docs/installation` — selection persists in localStorage.
- [ ] Any existing doc page using `<ComponentPreview>` still renders (shim preserves compat).
- [ ] Open any preview with a `code` prop and verify Preview/Code tabs + copy work.

Report Phase 2 complete.
