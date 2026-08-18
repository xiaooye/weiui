"use client";

import { Stack } from "civaria";

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "var(--civ-spacing-2) var(--civ-spacing-3)",
        borderRadius: "var(--civ-shape-radius-md)",
        border: "1px solid var(--civ-color-border)",
        background: "var(--civ-color-muted)",
        fontSize: "var(--civ-font-size-sm)",
      }}
    >
      {children}
    </div>
  );
}

export function StackDemo() {
  return (
    <Stack gap={6}>
      <div>
        <p
          style={{
            margin: "0 0 var(--civ-spacing-2)",
            fontSize: "var(--civ-font-size-sm)",
            color: "var(--civ-color-muted-foreground)",
          }}
        >
          Vertical stack (gap=4):
        </p>
        <Stack gap={4}>
          <Box>Item 1</Box>
          <Box>Item 2</Box>
          <Box>Item 3</Box>
        </Stack>
      </div>

      <div>
        <p
          style={{
            margin: "0 0 var(--civ-spacing-2)",
            fontSize: "var(--civ-font-size-sm)",
            color: "var(--civ-color-muted-foreground)",
          }}
        >
          Horizontal row (gap=2):
        </p>
        <Stack direction="row" gap={2}>
          <Box>Left</Box>
          <Box>Center</Box>
          <Box>Right</Box>
        </Stack>
      </div>

      <div>
        <p
          style={{
            margin: "0 0 var(--civ-spacing-2)",
            fontSize: "var(--civ-font-size-sm)",
            color: "var(--civ-color-muted-foreground)",
          }}
        >
          Wrapping row (gap=2):
        </p>
        <Stack direction="row" gap={2} wrap>
          {Array.from({ length: 8 }, (_, i) => (
            <Box key={i}>Tag {i + 1}</Box>
          ))}
        </Stack>
      </div>
    </Stack>
  );
}
