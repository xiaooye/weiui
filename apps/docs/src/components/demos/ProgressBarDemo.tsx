"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "@weiui/react";

export function ProgressBarDemo() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => (v >= 100 ? 0 : v + 5));
    }, 600);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-4)", width: "100%", maxWidth: "480px" }}>
      <div>
        <p style={{ margin: 0, marginBlockEnd: "var(--wui-spacing-2)", fontSize: "var(--wui-font-size-sm)", color: "var(--wui-color-muted-foreground)" }}>
          Auto-incrementing ({value}%)
        </p>
        <ProgressBar value={value} label="Upload progress" />
      </div>
      <div>
        <p style={{ margin: 0, marginBlockEnd: "var(--wui-spacing-2)", fontSize: "var(--wui-font-size-sm)", color: "var(--wui-color-muted-foreground)" }}>
          Success (80%)
        </p>
        <ProgressBar value={80} color="success" />
      </div>
      <div>
        <p style={{ margin: 0, marginBlockEnd: "var(--wui-spacing-2)", fontSize: "var(--wui-font-size-sm)", color: "var(--wui-color-muted-foreground)" }}>
          Warning (40%) — small
        </p>
        <ProgressBar value={40} color="warning" size="sm" />
      </div>
      <div>
        <p style={{ margin: 0, marginBlockEnd: "var(--wui-spacing-2)", fontSize: "var(--wui-font-size-sm)", color: "var(--wui-color-muted-foreground)" }}>
          Destructive (25%) — large
        </p>
        <ProgressBar value={25} color="destructive" size="lg" />
      </div>
      <div>
        <p style={{ margin: 0, marginBlockEnd: "var(--wui-spacing-2)", fontSize: "var(--wui-font-size-sm)", color: "var(--wui-color-muted-foreground)" }}>
          Indeterminate
        </p>
        <ProgressBar indeterminate label="Loading data" />
      </div>
    </div>
  );
}
