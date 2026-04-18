"use client";

import { Container, Stack } from "@weiui/react";

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "var(--wui-spacing-3) var(--wui-spacing-4)",
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

export function ContainerDemo() {
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
          Default container (max 1200px, centered):
        </p>
        <div
          style={{
            padding: "var(--wui-spacing-2)",
            border: "1px dashed var(--wui-color-border)",
            borderRadius: "var(--wui-shape-radius-md)",
          }}
        >
          <Container>
            <Box>Centered content, caps at 1200px</Box>
          </Container>
        </div>
      </div>

      <div>
        <p
          style={{
            margin: "0 0 var(--wui-spacing-2)",
            fontSize: "var(--wui-font-size-sm)",
            color: "var(--wui-color-muted-foreground)",
          }}
        >
          Narrow container (maxWidth=520px):
        </p>
        <div
          style={{
            padding: "var(--wui-spacing-2)",
            border: "1px dashed var(--wui-color-border)",
            borderRadius: "var(--wui-shape-radius-md)",
          }}
        >
          <Container maxWidth="520px">
            <Box>Narrow 520px column</Box>
          </Container>
        </div>
      </div>

      <div>
        <p
          style={{
            margin: "0 0 var(--wui-spacing-2)",
            fontSize: "var(--wui-font-size-sm)",
            color: "var(--wui-color-muted-foreground)",
          }}
        >
          Reading width (maxWidth=65ch):
        </p>
        <div
          style={{
            padding: "var(--wui-spacing-2)",
            border: "1px dashed var(--wui-color-border)",
            borderRadius: "var(--wui-shape-radius-md)",
          }}
        >
          <Container maxWidth="65ch">
            <Box>Ideal measure for long-form text — around 60-75 characters per line keeps prose readable.</Box>
          </Container>
        </div>
      </div>
    </Stack>
  );
}
