"use client";

import { Text } from "@weiui/react";

export function TextDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-2)",
      }}
    >
      <Text size="xl" weight="bold">
        Extra-large bold text
      </Text>
      <Text size="lg" color="primary" weight="semibold">
        Large primary semibold
      </Text>
      <Text>Default body paragraph.</Text>
      <Text size="sm" color="muted">
        Small muted helper text.
      </Text>
      <Text size="xs" color="destructive">
        Extra-small destructive note.
      </Text>
      <Text color="success" weight="medium">
        Success message.
      </Text>
    </div>
  );
}
