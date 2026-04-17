"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@weiui/react";

export function ToggleGroupDemo() {
  const [alignment, setAlignment] = useState<string>("left");
  const [formatting, setFormatting] = useState<string[]>(["bold"]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-4)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--wui-spacing-2)",
        }}
      >
        <span
          style={{
            fontSize: "var(--wui-font-size-sm)",
            color: "var(--wui-color-muted-foreground)",
          }}
        >
          Single — alignment: <strong>{alignment}</strong>
        </span>
        <ToggleGroup
          type="single"
          label="Text alignment"
          value={alignment}
          onChange={(v) => setAlignment(v as string)}
        >
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--wui-spacing-2)",
        }}
      >
        <span
          style={{
            fontSize: "var(--wui-font-size-sm)",
            color: "var(--wui-color-muted-foreground)",
          }}
        >
          Multiple — formatting: <strong>{formatting.join(", ") || "none"}</strong>
        </span>
        <ToggleGroup
          type="multiple"
          label="Text formatting"
          value={formatting}
          onChange={(v) => setFormatting(v as string[])}
        >
          <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
          <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
          <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
