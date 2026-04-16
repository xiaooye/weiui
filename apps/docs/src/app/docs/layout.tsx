export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", maxWidth: "80rem", margin: "0 auto" }}>
      <nav style={{ width: "16rem", padding: "var(--wui-spacing-6)", borderRight: "1px solid var(--wui-color-border)" }}>
        <ul>
          <li><a href="/docs/getting-started">Getting Started</a></li>
        </ul>
      </nav>
      <main style={{ flex: 1, padding: "var(--wui-spacing-6)" }}>
        {children}
      </main>
    </div>
  );
}
