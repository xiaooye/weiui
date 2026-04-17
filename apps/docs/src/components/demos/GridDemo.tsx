"use client";

import { Grid, Stack } from "@weiui/react";

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "var(--wui-spacing-3)",
        borderRadius: "var(--wui-shape-radius-md)",
        border: "1px solid var(--wui-color-border)",
        background: "var(--wui-color-muted)",
        fontSize: "var(--wui-font-size-sm)",
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}

export function GridDemo() {
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
          3 equal columns (gap=4):
        </p>
        <Grid columns={3} gap={4}>
          <Cell>1</Cell>
          <Cell>2</Cell>
          <Cell>3</Cell>
          <Cell>4</Cell>
          <Cell>5</Cell>
          <Cell>6</Cell>
        </Grid>
      </div>
      <div>
        <p
          style={{
            margin: "0 0 var(--wui-spacing-2)",
            fontSize: "var(--wui-font-size-sm)",
            color: "var(--wui-color-muted-foreground)",
          }}
        >
          Custom template &quot;1fr 2fr&quot;:
        </p>
        <Grid columns="1fr 2fr" gap={4}>
          <Cell>Narrow</Cell>
          <Cell>Wide (2x)</Cell>
        </Grid>
      </div>
    </Stack>
  );
}
