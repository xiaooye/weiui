"use client";

import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@weiui/react";

export function SelectDemo() {
  const [value, setValue] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-3)", width: "100%", maxWidth: "280px" }}>
      <style>{`
        .select-demo-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--wui-spacing-2);
          inline-size: 100%;
          min-block-size: 44px;
          padding-inline: var(--wui-spacing-3);
          font: inherit;
          font-size: var(--wui-font-size-sm);
          color: var(--wui-color-foreground);
          background: var(--wui-color-background);
          border: 1px solid var(--wui-color-border);
          border-radius: var(--wui-shape-radius-md);
          cursor: pointer;
          text-align: start;
        }
        .select-demo-trigger:focus-visible {
          outline: 3px solid var(--wui-color-ring);
          outline-offset: 2px;
        }
        .select-demo-trigger[aria-expanded="true"] {
          border-color: var(--wui-color-primary);
        }
        .select-demo-content {
          margin-block-start: var(--wui-spacing-1);
          padding: var(--wui-spacing-1);
          background: var(--wui-color-background);
          border: 1px solid var(--wui-color-border);
          border-radius: var(--wui-shape-radius-md);
          box-shadow: var(--wui-elevation-2);
          display: flex;
          flex-direction: column;
          gap: 2px;
          max-block-size: 240px;
          overflow: auto;
        }
        .select-demo-item {
          padding: var(--wui-spacing-2) var(--wui-spacing-3);
          font-size: var(--wui-font-size-sm);
          color: var(--wui-color-foreground);
          border-radius: var(--wui-shape-radius-sm);
          cursor: pointer;
          min-block-size: 36px;
          display: flex;
          align-items: center;
        }
        .select-demo-item:hover,
        .select-demo-item:focus-visible {
          background: color-mix(in oklch, var(--wui-color-primary) 10%, transparent);
        }
        .select-demo-item[data-selected="true"] {
          background: color-mix(in oklch, var(--wui-color-primary) 15%, transparent);
          color: var(--wui-color-primary);
          font-weight: var(--wui-font-weight-semibold);
        }
      `}</style>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="select-demo-trigger" aria-label="Language">
          <SelectValue placeholder="Pick a language" />
          <span aria-hidden="true">{"\u25BE"}</span>
        </SelectTrigger>
        <SelectContent className="select-demo-content">
          <SelectItem value="en" className="select-demo-item">English</SelectItem>
          <SelectItem value="fr" className="select-demo-item">French</SelectItem>
          <SelectItem value="de" className="select-demo-item">German</SelectItem>
          <SelectItem value="ja" className="select-demo-item">Japanese</SelectItem>
          <SelectItem value="zh" className="select-demo-item">Chinese</SelectItem>
        </SelectContent>
      </Select>
      <p
        style={{
          margin: 0,
          fontSize: "var(--wui-font-size-sm)",
          color: "var(--wui-color-muted-foreground)",
        }}
      >
        Selected: <code style={{ color: "var(--wui-color-foreground)" }}>{value || "(none)"}</code>
      </p>
    </div>
  );
}
