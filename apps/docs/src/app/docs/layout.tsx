export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", maxWidth: "80rem", margin: "0 auto" }}>
      <nav style={{ width: "16rem", padding: "var(--wui-spacing-6)", borderRight: "1px solid var(--wui-color-border)" }}>
        <ul>
          <li><a href="/docs/getting-started">Getting Started</a></li>
          <li style={{ marginTop: "var(--wui-spacing-4)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Components</li>
          <li><a href="/docs/components/button">Button</a></li>
          <li><a href="/docs/components/input">Input &amp; Textarea</a></li>
          <li><a href="/docs/components/overlays">Overlays</a></li>
          <li><a href="/docs/components/form">Form Selection</a></li>
          <li><a href="/docs/components/navigation">Navigation</a></li>
          <li><a href="/docs/components/feedback">Feedback</a></li>
        </ul>
      </nav>
      <main style={{ flex: 1, padding: "var(--wui-spacing-6)" }}>
        {children}
      </main>
    </div>
  );
}
