"use client";

import { useState } from "react";
import { Chip, Button } from "civaria";

const initialChips = ["React", "TypeScript", "CSS", "A11y", "Design"];

export function ChipDemo() {
  const [chips, setChips] = useState<string[]>(initialChips);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--civ-spacing-3)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "var(--civ-spacing-2)",
          flexWrap: "wrap",
          minHeight: "2rem",
        }}
      >
        {chips.length === 0 && (
          <p
            style={{
              margin: 0,
              fontSize: "var(--civ-font-size-sm)",
              color: "var(--civ-color-muted-foreground)",
            }}
          >
            All chips removed. Reset to see them again.
          </p>
        )}
        {chips.map((chip, i) => (
          <Chip
            key={chip}
            color={i === 0 ? "primary" : i === 1 ? "success" : "default"}
            onRemove={() =>
              setChips((current) => current.filter((c) => c !== chip))
            }
          >
            {chip}
          </Chip>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setChips(initialChips)}
        style={{ alignSelf: "flex-start" }}
      >
        Reset
      </Button>
    </div>
  );
}
