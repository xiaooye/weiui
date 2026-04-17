"use client";

import { Stack } from "@weiui/react";

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "var(--wui-spacing-2) var(--wui-spacing-3)",
        borderRadius: "var(--wui-shape-radius-md)",
        border: "1px solid var(--wui-color-border)",
        background: "var(--wui-color-muted)",
        fontSize: "var(--wui-font-size-sm)",
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
            margin: "0 0 var(--wui-spacing-2)",
            fontSize: "var(--wui-font-size-sm)",
            color: "var(--wui-color-muted-foreground)",
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
            margin: "0 0 var(--wui-spacing-2)",
            fontSize: "var(--wui-font-size-sm)",
            color: "var(--wui-color-muted-foreground)",
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
            margin: "0 0 var(--wui-spacing-2)",
            fontSize: "var(--wui-font-size-sm)",
            color: "var(--wui-color-muted-foreground)",
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
