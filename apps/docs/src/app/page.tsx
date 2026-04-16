export default function Home() {
  return (
    <main style={{ maxWidth: "64rem", margin: "0 auto", padding: "4rem 1.5rem" }}>
      <h1 style={{ fontSize: "var(--wui-font-size-5xl)", fontWeight: "var(--wui-font-weight-bold)" }}>
        WeiUI
      </h1>
      <p style={{ fontSize: "var(--wui-font-size-xl)", color: "var(--wui-color-muted-foreground)", marginTop: "var(--wui-spacing-4)" }}>
        An accessibility-first design system with WCAG AAA enforcement.
      </p>
      <div style={{ display: "flex", gap: "var(--wui-spacing-3)", marginTop: "var(--wui-spacing-8)" }}>
        <a href="/docs/getting-started" className="wui-button wui-button--solid">
          Get Started
        </a>
        <a href="/docs/getting-started" className="wui-button wui-button--outline">
          Components
        </a>
      </div>
    </main>
  );
}
