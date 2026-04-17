"use client";

import { useState } from "react";
import { AutoComplete } from "@weiui/react";

const options = [
  { value: "js", label: "JavaScript" },
  { value: "ts", label: "TypeScript" },
  { value: "py", label: "Python" },
  { value: "rs", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "rb", label: "Ruby" },
  { value: "cs", label: "C#" },
];

export function AutoCompleteDemo() {
  const [value, setValue] = useState<string>("");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
        inlineSize: "280px",
      }}
    >
      <AutoComplete
        options={options}
        value={value}
        onChange={setValue}
        placeholder="Pick a language"
        label="Programming language"
      />
      <p
        style={{
          margin: 0,
          fontSize: "var(--wui-font-size-sm)",
          color: "var(--wui-color-muted-foreground)",
        }}
      >
        {value
          ? `Selected: ${options.find((o) => o.value === value)?.label}`
          : "Start typing to filter."}
      </p>
    </div>
  );
}
