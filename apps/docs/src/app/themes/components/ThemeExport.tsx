"use client";
import { useState } from "react";
import type { ThemeResult } from "../lib/theme-generator";

interface Props {
  theme: ThemeResult;
}

export function ThemeExport({ theme }: Props) {
  const [format, setFormat] = useState<"css" | "json">("css");

  const output = format === "css"
    ? theme.css
    : JSON.stringify(theme.colors, null, 2);

  return (
    <div className="wui-card">
      <div className="wui-card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "var(--wui-spacing-2)" }}>
          <button type="button" className={`wui-button wui-button--${format === "css" ? "soft" : "ghost"} wui-button--sm`} style={{ minHeight: "28px" }} onClick={() => setFormat("css")}>CSS</button>
          <button type="button" className={`wui-button wui-button--${format === "json" ? "soft" : "ghost"} wui-button--sm`} style={{ minHeight: "28px" }} onClick={() => setFormat("json")}>JSON</button>
        </div>
        <button type="button" className="wui-button wui-button--ghost wui-button--sm" style={{ minHeight: "28px" }} onClick={() => navigator.clipboard.writeText(output)}>Copy</button>
      </div>
      <div className="wui-card__content">
        <pre style={{ fontFamily: "var(--wui-font-family-mono)", fontSize: "var(--wui-font-size-xs)", overflow: "auto" }}>
          <code>{output}</code>
        </pre>
      </div>
    </div>
  );
}
