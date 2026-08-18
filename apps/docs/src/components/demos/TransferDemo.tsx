"use client";

import { useState } from "react";
import { Transfer, type TransferItem } from "civaria";

const SOURCE: TransferItem[] = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
  { value: "qwik", label: "Qwik" },
];

export function TransferDemo() {
  const [selected, setSelected] = useState<string[]>(["react"]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--civ-spacing-3)", width: "100%" }}>
      <Transfer
        sourceItems={SOURCE}
        targetValues={selected}
        onTargetValuesChange={setSelected}
        sourceTitle="Available frameworks"
        targetTitle="Your stack"
      />
      <p
        style={{
          margin: 0,
          fontSize: "var(--civ-font-size-sm)",
          color: "var(--civ-color-muted-foreground)",
        }}
      >
        Selected ({selected.length}):{" "}
        <strong style={{ color: "var(--civ-color-foreground)" }}>
          {selected.length ? selected.join(", ") : "none"}
        </strong>
      </p>
    </div>
  );
}
