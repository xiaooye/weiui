"use client";

import { Heading } from "@weiui/react";

export function HeadingDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-2)",
      }}
    >
      <Heading level={1}>Heading 1 — page title</Heading>
      <Heading level={2}>Heading 2 — section</Heading>
      <Heading level={3}>Heading 3 — subsection</Heading>
      <Heading level={4}>Heading 4 — card title</Heading>
      <Heading level={5}>Heading 5 — widget</Heading>
      <Heading level={6}>Heading 6 — caption</Heading>
    </div>
  );
}
