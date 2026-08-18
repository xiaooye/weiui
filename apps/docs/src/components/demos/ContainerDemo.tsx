"use client";

import { Container, Stack } from "civaria";

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "var(--civ-spacing-3) var(--civ-spacing-4)",
        borderRadius: "var(--civ-shape-radius-md)",
        border: "1px solid var(--civ-color-border)",
        background: "var(--civ-color-muted)",
        fontSize: "var(--civ-font-size-sm)",
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
            margin: "0 0 var(--civ-spacing-2)",
            fontSize: "var(--civ-font-size-sm)",
            color: "var(--civ-color-muted-foreground)",
          }}
        >
          Default container (max 1200px, centered):
        </p>
        <div
          style={{
            padding: "var(--civ-spacing-2)",
            border: "1px dashed var(--civ-color-border)",
            borderRadius: "var(--civ-shape-radius-md)",
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
            margin: "0 0 var(--civ-spacing-2)",
            fontSize: "var(--civ-font-size-sm)",
            color: "var(--civ-color-muted-foreground)",
          }}
        >
          Narrow container (maxWidth=520px):
        </p>
        <div
          style={{
            padding: "var(--civ-spacing-2)",
            border: "1px dashed var(--civ-color-border)",
            borderRadius: "var(--civ-shape-radius-md)",
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
            margin: "0 0 var(--civ-spacing-2)",
            fontSize: "var(--civ-font-size-sm)",
            color: "var(--civ-color-muted-foreground)",
          }}
        >
          Reading width (maxWidth=65ch):
        </p>
        <div
          style={{
            padding: "var(--civ-spacing-2)",
            border: "1px dashed var(--civ-color-border)",
            borderRadius: "var(--civ-shape-radius-md)",
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
