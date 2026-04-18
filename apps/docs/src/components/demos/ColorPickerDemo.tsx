"use client";

import { useState } from "react";
import { ColorPicker } from "@weiui/react";

export function ColorPickerDemo() {
  const [color, setColor] = useState("#2563eb");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
        inlineSize: "100%",
      }}
    >
      <ColorPicker
        value={color}
        onChange={setColor}
        swatches={[
          "#2563eb",
          "#16a34a",
          "#dc2626",
          "#ea580c",
          "#9333ea",
          "#0891b2",
          "#0f172a",
          "#f3f4f6",
        ]}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--wui-spacing-2)",
          fontSize: "var(--wui-font-size-sm)",
          color: "var(--wui-color-muted-foreground)",
        }}
      >
        <span>Selected:</span>
        <span
          style={{
            display: "inline-block",
            inlineSize: "16px",
            blockSize: "16px",
            background: color,
            borderRadius: "var(--wui-shape-radius-sm)",
            border: "1px solid var(--wui-color-border)",
          }}
          aria-hidden="true"
        />
        <code>{color}</code>
      </div>
      <p
        style={{
          fontSize: "var(--wui-font-size-xs)",
          color: "var(--wui-color-muted-foreground)",
          margin: 0,
        }}
      >
        Tip: paste an <code>oklch(…)</code> string into the input to use the
        design-system colour space directly — for example{" "}
        <code>oklch(0.65 0.2 265)</code>.
      </p>
    </div>
  );
}
