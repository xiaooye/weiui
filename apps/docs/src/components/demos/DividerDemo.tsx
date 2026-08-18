"use client";

import { Divider, Stack } from "civaria";

export function DividerDemo() {
  return (
    <Stack gap={4}>
      <div>
        <p
          style={{
            margin: "0 0 var(--civ-spacing-2)",
            fontSize: "var(--civ-font-size-sm)",
            color: "var(--civ-color-muted-foreground)",
          }}
        >
          Horizontal divider:
        </p>
        <div>Section one</div>
        <Divider />
        <div>Section two</div>
      </div>

      <div>
        <p
          style={{
            margin: "0 0 var(--civ-spacing-2)",
            fontSize: "var(--civ-font-size-sm)",
            color: "var(--civ-color-muted-foreground)",
          }}
        >
          Vertical divider in a row:
        </p>
        <Stack
          direction="row"
          gap={3}
          style={{ alignItems: "center", height: "2rem" }}
        >
          <span>Home</span>
          <Divider orientation="vertical" />
          <span>Docs</span>
          <Divider orientation="vertical" />
          <span>About</span>
        </Stack>
      </div>
    </Stack>
  );
}
