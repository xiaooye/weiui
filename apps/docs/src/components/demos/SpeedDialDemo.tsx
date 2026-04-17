"use client";

import { useState } from "react";
import { SpeedDial } from "@weiui/react";

export function SpeedDialDemo() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "420px",
        minHeight: "220px",
        padding: "var(--wui-spacing-4)",
        borderRadius: "var(--wui-shape-radius-lg)",
        border: "1px solid var(--wui-color-border)",
        background: "var(--wui-color-muted)",
      }}
    >
      <style>{`.speed-dial-demo-scope .wui-speed-dial { position: absolute; inset-block-end: var(--wui-spacing-4); inset-inline-end: var(--wui-spacing-4); z-index: 1; }`}</style>
      <p
        style={{
          margin: 0,
          fontSize: "var(--wui-font-size-sm)",
          color: "var(--wui-color-muted-foreground)",
        }}
      >
        {lastAction ? (
          <>
            Last action: <strong style={{ color: "var(--wui-color-foreground)" }}>{lastAction}</strong>
          </>
        ) : (
          "Click the + button to expand actions."
        )}
      </p>
      <div className="speed-dial-demo-scope" style={{ position: "absolute", inset: 0 }}>
        <SpeedDial
          actions={[
            { id: "add", icon: "+", label: "Add item", onClick: () => setLastAction("Add item") },
            { id: "edit", icon: "\u270F", label: "Edit", onClick: () => setLastAction("Edit") },
            { id: "share", icon: "\u2197", label: "Share", onClick: () => setLastAction("Share") },
          ]}
        />
      </div>
    </div>
  );
}
