"use client";

import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@weiui/react";

export function SelectDemo() {
  const [value, setValue] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-3)", width: "100%", maxWidth: "280px" }}>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="wui-select__trigger" aria-label="Language">
          <SelectValue placeholder="Pick a language" />
          <span aria-hidden="true">{"\u25BE"}</span>
        </SelectTrigger>
        <SelectContent className="wui-select__content">
          <SelectItem value="en" className="wui-select__item">English</SelectItem>
          <SelectItem value="fr" className="wui-select__item">French</SelectItem>
          <SelectItem value="de" className="wui-select__item">German</SelectItem>
          <SelectItem value="ja" className="wui-select__item">Japanese</SelectItem>
          <SelectItem value="zh" className="wui-select__item">Chinese</SelectItem>
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
