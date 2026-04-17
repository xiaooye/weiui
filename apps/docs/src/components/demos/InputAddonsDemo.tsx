"use client";

import { Input } from "@weiui/react";

export function InputAddonsDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
      }}
    >
      <Input
        startAddon="$"
        endAddon="USD"
        placeholder="0.00"
        style={{ maxWidth: "280px" }}
      />
      <Input
        startAddon="https://"
        placeholder="example.com"
        style={{ maxWidth: "280px" }}
      />
      <Input
        endAddon="⌕"
        placeholder="Search"
        style={{ maxWidth: "280px" }}
      />
    </div>
  );
}
