"use client";

import { Spacer, Stack } from "civaria";

const pillStyle: React.CSSProperties = {
  padding: "var(--civ-spacing-2) var(--civ-spacing-3)",
  borderRadius: "var(--civ-shape-radius-md)",
  border: "1px solid var(--civ-color-border)",
  background: "var(--civ-color-muted)",
  fontSize: "var(--civ-font-size-sm)",
};

export function SpacerDemo() {
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
          Spacer pushes items to opposite ends of a flex row:
        </p>
        <Stack
          direction="row"
          style={{
            alignItems: "center",
            padding: "var(--civ-spacing-3)",
            border: "1px solid var(--civ-color-border)",
            borderRadius: "var(--civ-shape-radius-md)",
          }}
        >
          <span style={pillStyle}>Logo</span>
          <Spacer />
          <span style={pillStyle}>Actions</span>
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
          With multiple spacers, each absorbs an equal share of remaining space:
        </p>
        <Stack
          direction="row"
          style={{
            alignItems: "center",
            padding: "var(--civ-spacing-3)",
            border: "1px solid var(--civ-color-border)",
            borderRadius: "var(--civ-shape-radius-md)",
          }}
        >
          <span style={pillStyle}>One</span>
          <Spacer />
          <span style={pillStyle}>Two</span>
          <Spacer />
          <span style={pillStyle}>Three</span>
        </Stack>
      </div>
    </Stack>
  );
}
