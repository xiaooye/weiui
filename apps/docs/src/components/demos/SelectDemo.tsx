"use client";

import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "civaria";

export function SelectDemo() {
  const [value, setValue] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--civ-spacing-3)", width: "100%", maxWidth: "280px" }}>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="civ-select__trigger" aria-label="Language">
          <SelectValue placeholder="Pick a language" />
          <span aria-hidden="true">{"\u25BE"}</span>
        </SelectTrigger>
        <SelectContent className="civ-select__content">
          <SelectItem value="en" className="civ-select__item">English</SelectItem>
          <SelectItem value="fr" className="civ-select__item">French</SelectItem>
          <SelectItem value="de" className="civ-select__item">German</SelectItem>
          <SelectItem value="ja" className="civ-select__item">Japanese</SelectItem>
          <SelectItem value="zh" className="civ-select__item">Chinese</SelectItem>
        </SelectContent>
      </Select>
      <p
        style={{
          margin: 0,
          fontSize: "var(--civ-font-size-sm)",
          color: "var(--civ-color-muted-foreground)",
        }}
      >
        Selected: <code style={{ color: "var(--civ-color-foreground)" }}>{value || "(none)"}</code>
      </p>
    </div>
  );
}
