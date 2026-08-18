"use client";

import { useState } from "react";
import { ButtonGroup, Button } from "civaria";

export function ButtonGroupDemo() {
  const [pressed, setPressed] = useState("middle");
  const options = [
    { id: "left", label: "Left" },
    { id: "middle", label: "Middle" },
    { id: "right", label: "Right" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--civ-spacing-3)",
      }}
    >
      <ButtonGroup aria-label="Alignment">
        {options.map((opt) => (
          <Button
            key={opt.id}
            variant={pressed === opt.id ? "solid" : "outline"}
            onClick={() => setPressed(opt.id)}
            aria-pressed={pressed === opt.id}
          >
            {opt.label}
          </Button>
        ))}
      </ButtonGroup>
      <p
        style={{
          margin: 0,
          fontSize: "var(--civ-font-size-sm)",
          color: "var(--civ-color-muted-foreground)",
        }}
      >
        Pressed: <strong>{pressed}</strong>
      </p>
    </div>
  );
}
