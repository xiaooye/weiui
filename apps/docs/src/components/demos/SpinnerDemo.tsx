"use client";

import { Spinner } from "@weiui/react";

export function SpinnerDemo() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--wui-spacing-4)",
      }}
    >
      <Spinner size="sm" label="Loading small" />
      <Spinner size="md" label="Loading medium" />
      <Spinner size="lg" label="Loading large" />
    </div>
  );
}
