"use client";

import { Link } from "@weiui/react";

export function LinkDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-3)", fontSize: "var(--wui-font-size-sm)" }}>
      <p style={{ margin: 0 }}>
        Internal: <Link href="/docs/components">All components</Link>
      </p>
      <p style={{ margin: 0 }}>
        External: <Link href="https://github.com/weiui" external>GitHub repository</Link>
      </p>
      <p style={{ margin: 0, color: "var(--wui-color-muted-foreground)" }}>
        External links set <code>target="_blank"</code> and <code>rel="noopener noreferrer"</code> automatically.
      </p>
    </div>
  );
}
