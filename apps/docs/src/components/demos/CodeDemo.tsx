"use client";

import { Code } from "@weiui/react";

export function CodeDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-4)" }}>
      <div>
        <p
          style={{
            margin: "0 0 var(--wui-spacing-2)",
            fontSize: "var(--wui-font-size-sm)",
            color: "var(--wui-color-muted-foreground)",
          }}
        >
          Inline code:
        </p>
        <p style={{ margin: 0, fontSize: "var(--wui-font-size-sm)" }}>
          Install with <Code>pnpm add @weiui/react</Code>, then import{" "}
          <Code>{"{ Button }"}</Code> from <Code>@weiui/react</Code>.
        </p>
      </div>

      <div>
        <p
          style={{
            margin: "0 0 var(--wui-spacing-2)",
            fontSize: "var(--wui-font-size-sm)",
            color: "var(--wui-color-muted-foreground)",
          }}
        >
          Block code:
        </p>
        <Code inline={false}>
          {`import { Button } from "@weiui/react";

export function Example() {
  return <Button>Click me</Button>;
}`}
        </Code>
      </div>
    </div>
  );
}
