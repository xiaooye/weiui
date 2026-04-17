"use client";

import { Spacer, Stack } from "@weiui/react";

const pillStyle: React.CSSProperties = {
  padding: "var(--wui-spacing-2) var(--wui-spacing-3)",
  borderRadius: "var(--wui-shape-radius-md)",
  border: "1px solid var(--wui-color-border)",
  background: "var(--wui-color-muted)",
  fontSize: "var(--wui-font-size-sm)",
};

export function SpacerDemo() {
  return (
    <Stack gap={4}>
      <div>
        <p
          style={{
            margin: "0 0 var(--wui-spacing-2)",
            fontSize: "var(--wui-font-size-sm)",
            color: "var(--wui-color-muted-foreground)",
          }}
        >
          Spacer pushes items to opposite ends of a flex row:
        </p>
        <Stack
          direction="row"
          style={{
            alignItems: "center",
            padding: "var(--wui-spacing-3)",
            border: "1px solid var(--wui-color-border)",
            borderRadius: "var(--wui-shape-radius-md)",
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
            margin: "0 0 var(--wui-spacing-2)",
            fontSize: "var(--wui-font-size-sm)",
            color: "var(--wui-color-muted-foreground)",
          }}
        >
          With multiple spacers, each absorbs an equal share of remaining space:
        </p>
        <Stack
          direction="row"
          style={{
            alignItems: "center",
            padding: "var(--wui-spacing-3)",
            border: "1px solid var(--wui-color-border)",
            borderRadius: "var(--wui-shape-radius-md)",
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
