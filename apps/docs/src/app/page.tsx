export default function Home() {
  return (
    <div>
      {/* Hero */}
      <header style={{ maxWidth: "64rem", margin: "0 auto", padding: "6rem 1.5rem 4rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "var(--wui-font-size-6xl)", fontWeight: "var(--wui-font-weight-bold)", letterSpacing: "var(--wui-font-letterSpacing-tight)", lineHeight: "var(--wui-font-lineHeight-tight)" }}>
          WeiUI
        </h1>
        <p style={{ fontSize: "var(--wui-font-size-xl)", color: "var(--wui-color-muted-foreground)", marginTop: "var(--wui-spacing-4)", maxWidth: "40rem", marginInline: "auto" }}>
          An accessibility-first design system with three consumption layers and WCAG AAA enforcement.
        </p>
        <div style={{ display: "flex", gap: "var(--wui-spacing-3)", justifyContent: "center", marginTop: "var(--wui-spacing-8)" }}>
          <a href="/docs/getting-started" className="wui-button wui-button--solid">Get Started</a>
          <a href="/docs/components" className="wui-button wui-button--outline">Components</a>
          <a href="/playground" className="wui-button wui-button--ghost">Playground</a>
        </div>
      </header>

      {/* Feature Cards */}
      <section style={{ maxWidth: "64rem", margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--wui-spacing-6)" }}>
          <div className="wui-card">
            <div className="wui-card__header"><h3 style={{ fontWeight: "var(--wui-font-weight-semibold)", fontSize: "var(--wui-font-size-lg)" }}>Three Layers</h3></div>
            <div className="wui-card__content">
              <p style={{ color: "var(--wui-color-muted-foreground)", fontSize: "var(--wui-font-size-sm)" }}>CSS-only primitives, headless behavior hooks, and fully styled React components. Use the layer that fits your needs.</p>
            </div>
          </div>

          <div className="wui-card">
            <div className="wui-card__header"><h3 style={{ fontWeight: "var(--wui-font-weight-semibold)", fontSize: "var(--wui-font-size-lg)" }}>WCAG AAA</h3></div>
            <div className="wui-card__content">
              <p style={{ color: "var(--wui-color-muted-foreground)", fontSize: "var(--wui-font-size-sm)" }}>AAA contrast enforcement for content text, AA minimum for accent colors. 44px touch targets. Full keyboard navigation. Motion-safe animations.</p>
            </div>
          </div>

          <div className="wui-card">
            <div className="wui-card__header"><h3 style={{ fontWeight: "var(--wui-font-weight-semibold)", fontSize: "var(--wui-font-size-lg)" }}>Design Tokens</h3></div>
            <div className="wui-card__content">
              <p style={{ color: "var(--wui-color-muted-foreground)", fontSize: "var(--wui-font-size-sm)" }}>OKLCH color space, W3C token format, automatic dark mode, designer-friendly JSON source of truth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Component Showcase */}
      <section style={{ maxWidth: "64rem", margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        <h2 style={{ fontSize: "var(--wui-font-size-3xl)", fontWeight: "var(--wui-font-weight-semibold)", marginBottom: "var(--wui-spacing-6)", textAlign: "center" }}>Component Preview</h2>
        <div className="wui-card">
          <div className="wui-card__content" style={{ display: "flex", flexWrap: "wrap", gap: "var(--wui-spacing-4)", alignItems: "center" }}>
            <button className="wui-button wui-button--solid">Solid</button>
            <button className="wui-button wui-button--outline">Outline</button>
            <button className="wui-button wui-button--ghost">Ghost</button>
            <button className="wui-button wui-button--soft">Soft</button>
            <span className="wui-badge wui-badge--solid">Badge</span>
            <span className="wui-badge wui-badge--success">Success</span>
            <span className="wui-badge wui-badge--warning">Warning</span>
            <span className="wui-avatar"><span className="wui-avatar__fallback">WU</span></span>
            <input className="wui-input" placeholder="Type here..." style={{ maxWidth: "200px" }} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ maxWidth: "64rem", margin: "0 auto", padding: "2rem 1.5rem", borderTop: "1px solid var(--wui-color-border)", textAlign: "center", color: "var(--wui-color-muted-foreground)", fontSize: "var(--wui-font-size-sm)" }}>
        WeiUI Design System
      </footer>
    </div>
  );
}
