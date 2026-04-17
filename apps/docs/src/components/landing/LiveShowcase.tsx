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

      <div className="wui-home-showcase__tabs" role="tablist" aria-label="Component preview">
        {DEMOS.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            id={`wui-showcase-tab-${d.id}`}
            aria-selected={active === d.id}
            aria-controls={`wui-showcase-panel-${d.id}`}
            tabIndex={active === d.id ? 0 : -1}
            onClick={() => setActive(d.id)}
            onKeyDown={(e) => {
              const idx = DEMOS.findIndex((x) => x.id === active);
              const goto = (i: number) => {
                const next = DEMOS[((i % DEMOS.length) + DEMOS.length) % DEMOS.length];
                if (next) setActive(next.id);
              };
              if (e.key === "ArrowRight") {
                e.preventDefault();
                goto(idx + 1);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                goto(idx - 1);
              } else if (e.key === "Home") {
                e.preventDefault();
                goto(0);
              } else if (e.key === "End") {
                e.preventDefault();
                goto(DEMOS.length - 1);
              }
            }}
            className="wui-home-showcase__tab"
            data-active={active === d.id || undefined}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div
        className="wui-home-showcase__stage"
        role="tabpanel"
        id={`wui-showcase-panel-${active}`}
        aria-labelledby={`wui-showcase-tab-${active}`}
      >
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
