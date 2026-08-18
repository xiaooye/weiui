"use client";

import { useState } from "react";
import { MultiSelect } from "civaria";

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
        gap: "var(--civ-spacing-3)",
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
          fontSize: "var(--civ-font-size-sm)",
          color: "var(--civ-color-muted-foreground)",
        }}
      >
        {values.length > 0
          ? `${values.length} selected`
          : "No teams selected."}
      </p>
    </div>
  );
}
