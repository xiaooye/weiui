"use client";

import { Link } from "civaria";

export function LinkDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--civ-spacing-3)", fontSize: "var(--civ-font-size-sm)" }}>
      <p style={{ margin: 0 }}>
        Internal: <Link href="/docs/components">All components</Link>
      </p>
      <p style={{ margin: 0 }}>
        External: <Link href="https://github.com/civaria" external>GitHub repository</Link>
      </p>
      <p style={{ margin: 0, color: "var(--civ-color-muted-foreground)" }}>
        External links set <code>target="_blank"</code> and <code>rel="noopener noreferrer"</code> automatically.
      </p>
    </div>
  );
}
