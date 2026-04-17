"use client";

import { VisuallyHidden } from "@weiui/react";

export function VisuallyHiddenDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
      }}
    >
      <button
        type="button"
        className="wui-button wui-button--outline"
        style={{ inlineSize: "fit-content" }}
      >
        <span aria-hidden="true" style={{ fontSize: "1.2em" }}>
          🗑
        </span>
        <VisuallyHidden>Delete item</VisuallyHidden>
      </button>
      <p
        style={{
          fontSize: "var(--wui-font-size-sm)",
          color: "var(--wui-color-muted-foreground)",
          margin: 0,
        }}
      >
        The button shows only an icon. Screen readers announce &quot;Delete item&quot;.
      </p>
    </div>
  );
}
