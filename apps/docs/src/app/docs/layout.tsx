export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", maxWidth: "80rem", margin: "0 auto", minHeight: "100vh" }}>
      <nav style={{ width: "16rem", padding: "var(--wui-spacing-6)", borderRight: "1px solid var(--wui-color-border)", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ marginBottom: "var(--wui-spacing-6)" }}>
          <a href="/" style={{ fontWeight: "var(--wui-font-weight-bold)", fontSize: "var(--wui-font-size-lg)" }}>WeiUI</a>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-6)" }}>
          <div>
            <h4 style={{ fontSize: "var(--wui-font-size-xs)", fontWeight: "var(--wui-font-weight-semibold)", textTransform: "uppercase", letterSpacing: "var(--wui-font-letterSpacing-wider)", color: "var(--wui-color-muted-foreground)", marginBottom: "var(--wui-spacing-2)" }}>Getting Started</h4>
            <ul style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-1)" }}>
              <li><a href="/docs/getting-started" style={{ fontSize: "var(--wui-font-size-sm)", padding: "var(--wui-spacing-1) 0", display: "block" }}>Installation</a></li>
              <li><a href="/docs/tokens" style={{ fontSize: "var(--wui-font-size-sm)", padding: "var(--wui-spacing-1) 0", display: "block" }}>Design Tokens</a></li>
              <li><a href="/docs/css" style={{ fontSize: "var(--wui-font-size-sm)", padding: "var(--wui-spacing-1) 0", display: "block" }}>CSS Layer</a></li>
              <li><a href="/docs/accessibility" style={{ fontSize: "var(--wui-font-size-sm)", padding: "var(--wui-spacing-1) 0", display: "block" }}>Accessibility</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "var(--wui-font-size-xs)", fontWeight: "var(--wui-font-weight-semibold)", textTransform: "uppercase", letterSpacing: "var(--wui-font-letterSpacing-wider)", color: "var(--wui-color-muted-foreground)", marginBottom: "var(--wui-spacing-2)" }}>Components</h4>
            <ul style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-1)" }}>
              <li><a href="/docs/components" style={{ fontSize: "var(--wui-font-size-sm)" }}>Overview</a></li>
              <li><a href="/docs/components/button" style={{ fontSize: "var(--wui-font-size-sm)" }}>Button</a></li>
              <li><a href="/docs/components/input" style={{ fontSize: "var(--wui-font-size-sm)" }}>Input</a></li>
              <li><a href="/docs/components/form" style={{ fontSize: "var(--wui-font-size-sm)" }}>Form Controls</a></li>
              <li><a href="/docs/components/advanced-inputs" style={{ fontSize: "var(--wui-font-size-sm)" }}>Advanced Inputs</a></li>
              <li><a href="/docs/components/date-time" style={{ fontSize: "var(--wui-font-size-sm)" }}>Date & Time</a></li>
              <li><a href="/docs/components/layout" style={{ fontSize: "var(--wui-font-size-sm)" }}>Layout</a></li>
              <li><a href="/docs/components/sidebar-drawer" style={{ fontSize: "var(--wui-font-size-sm)" }}>Sidebar & Drawer</a></li>
              <li><a href="/docs/components/data-display" style={{ fontSize: "var(--wui-font-size-sm)" }}>Data Display</a></li>
              <li><a href="/docs/components/data" style={{ fontSize: "var(--wui-font-size-sm)" }}>Data Components</a></li>
              <li><a href="/docs/components/overlays" style={{ fontSize: "var(--wui-font-size-sm)" }}>Overlays</a></li>
              <li><a href="/docs/components/feedback" style={{ fontSize: "var(--wui-font-size-sm)" }}>Feedback</a></li>
              <li><a href="/docs/components/toast-chip-progress" style={{ fontSize: "var(--wui-font-size-sm)" }}>Toast & Chips</a></li>
              <li><a href="/docs/components/stepper-timeline" style={{ fontSize: "var(--wui-font-size-sm)" }}>Stepper & Timeline</a></li>
              <li><a href="/docs/components/navigation" style={{ fontSize: "var(--wui-font-size-sm)" }}>Navigation</a></li>
              <li><a href="/docs/components/typography" style={{ fontSize: "var(--wui-font-size-sm)" }}>Typography</a></li>
              <li><a href="/docs/components/editor" style={{ fontSize: "var(--wui-font-size-sm)" }}>Editor</a></li>
              <li><a href="/docs/components/command-palette" style={{ fontSize: "var(--wui-font-size-sm)" }}>Command Palette</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "var(--wui-font-size-xs)", fontWeight: "var(--wui-font-weight-semibold)", textTransform: "uppercase", letterSpacing: "var(--wui-font-letterSpacing-wider)", color: "var(--wui-color-muted-foreground)", marginBottom: "var(--wui-spacing-2)" }}>Tools</h4>
            <ul style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-1)" }}>
              <li><a href="/playground" style={{ fontSize: "var(--wui-font-size-sm)" }}>Playground</a></li>
              <li><a href="/composer" style={{ fontSize: "var(--wui-font-size-sm)" }}>Composer</a></li>
              <li><a href="/themes" style={{ fontSize: "var(--wui-font-size-sm)" }}>Theme Builder</a></li>
            </ul>
          </div>
        </div>
      </nav>
      <main className="wui-prose" style={{ flex: 1, padding: "var(--wui-spacing-8)", maxWidth: "48rem" }}>
        {children}
      </main>
    </div>
  );
}
