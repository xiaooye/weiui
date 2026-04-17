"use client";

import { useState } from "react";
import { MultiSelect } from "@weiui/react";

const options = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "devops", label: "DevOps" },
  { value: "design", label: "Design" },
  { value: "qa", label: "QA" },
  { value: "data", label: "Data" },
];

export function MultiSelectDemo() {
  const [values, setValues] = useState<string[]>(["frontend"]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
        inlineSize: "320px",
      }}
    >
      <MultiSelect
        options={options}
        value={values}
        onChange={setValues}
        placeholder="Pick teams"
        label="Teams"
      />
      <p
        style={{
          margin: 0,
          fontSize: "var(--wui-font-size-sm)",
          color: "var(--wui-color-muted-foreground)",
        }}
      >
        {values.length > 0
          ? `${values.length} selected`
          : "No teams selected."}
      </p>
    </div>
  );
}
