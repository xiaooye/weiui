"use client";

import { Button } from "@weiui/react";

export function ButtonVariantsDemo() {
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--wui-spacing-3)",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}
