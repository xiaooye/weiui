"use client";

import { useState } from "react";
import { Button, Portal } from "@weiui/react";

export function PortalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
        inlineSize: "100%",
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "var(--wui-spacing-4)",
          border: "1px solid var(--wui-color-border)",
          borderRadius: "var(--wui-shape-radius-md)",
          blockSize: "120px",
          overflow: "hidden",
          background: "var(--wui-surface-sunken)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "var(--wui-font-size-sm)",
            color: "var(--wui-color-muted-foreground)",
          }}
        >
          This box has <code>overflow: hidden</code>. Portal content escapes to
          document.body.
        </p>
        <Button
          onClick={() => setOpen((v) => !v)}
          style={{ marginBlockStart: "var(--wui-spacing-3)" }}
        >
          {open ? "Hide" : "Show"} portal content
        </Button>
      </div>
      {open && (
        <Portal>
          <div
            style={{
              position: "fixed",
              inset: "auto 0 var(--wui-spacing-6) 0",
              marginInline: "auto",
              inlineSize: "fit-content",
              padding: "var(--wui-spacing-4) var(--wui-spacing-6)",
              background: "var(--wui-surface-overlay)",
              border: "1px solid var(--wui-color-border)",
              borderRadius: "var(--wui-shape-radius-md)",
              boxShadow: "var(--wui-elevation-4)",
              zIndex: 1000,
            }}
            role="status"
          >
            Rendered via Portal at document.body
          </div>
        </Portal>
      )}
    </div>
  );
}
