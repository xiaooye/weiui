"use client";

import { useState } from "react";
import { Button, Portal } from "civaria";

export function PortalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--civ-spacing-3)",
        inlineSize: "100%",
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "var(--civ-spacing-4)",
          border: "1px solid var(--civ-color-border)",
          borderRadius: "var(--civ-shape-radius-md)",
          blockSize: "120px",
          overflow: "hidden",
          background: "var(--civ-surface-sunken)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "var(--civ-font-size-sm)",
            color: "var(--civ-color-muted-foreground)",
          }}
        >
          This box has <code>overflow: hidden</code>. Portal content escapes to
          document.body.
        </p>
        <Button
          onClick={() => setOpen((v) => !v)}
          style={{ marginBlockStart: "var(--civ-spacing-3)" }}
        >
          {open ? "Hide" : "Show"} portal content
        </Button>
      </div>
      {open && (
        <Portal>
          <div
            style={{
              position: "fixed",
              inset: "auto 0 var(--civ-spacing-6) 0",
              marginInline: "auto",
              inlineSize: "fit-content",
              padding: "var(--civ-spacing-4) var(--civ-spacing-6)",
              background: "var(--civ-surface-overlay)",
              border: "1px solid var(--civ-color-border)",
              borderRadius: "var(--civ-shape-radius-md)",
              boxShadow: "var(--civ-elevation-4)",
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
