"use client";

import { Code } from "civaria";

export function CodeDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--civ-spacing-4)" }}>
      <div>
        <p
          style={{
            margin: "0 0 var(--civ-spacing-2)",
            fontSize: "var(--civ-font-size-sm)",
            color: "var(--civ-color-muted-foreground)",
          }}
        >
          Inline code:
        </p>
        <p style={{ margin: 0, fontSize: "var(--civ-font-size-sm)" }}>
          Install with <Code>pnpm add civaria</Code>, then import{" "}
          <Code>{"{ Button }"}</Code> from <Code>civaria</Code>.
        </p>
      </div>

      <div>
        <p
          style={{
            margin: "0 0 var(--civ-spacing-2)",
            fontSize: "var(--civ-font-size-sm)",
            color: "var(--civ-color-muted-foreground)",
          }}
        >
          Block code:
        </p>
        <Code inline={false}>
          {`import { Button } from "civaria";

export function Example() {
  return <Button>Click me</Button>;
}`}
        </Code>
      </div>
    </div>
  );
}
