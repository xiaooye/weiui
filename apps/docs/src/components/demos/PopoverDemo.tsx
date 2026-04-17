"use client";

import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@weiui/react";

export function PopoverDemo() {
  return (
    <Popover side="bottom" align="start">
      <PopoverTrigger className="wui-button wui-button--outline">
        Show Popover
      </PopoverTrigger>
      <PopoverContent
        style={{
          background: "var(--wui-surface-overlay)",
          border: "1px solid var(--wui-color-border)",
          borderRadius: "var(--wui-shape-radius-md)",
          boxShadow: "var(--wui-elevation-3)",
          padding: "var(--wui-spacing-4)",
          maxInlineSize: "240px",
          zIndex: 1000,
        }}
      >
        <p style={{ margin: 0, marginBlockEnd: "var(--wui-spacing-3)", fontSize: "var(--wui-font-size-sm)" }}>
          Popovers attach to a trigger and escape overflow containers.
        </p>
        <PopoverClose className="wui-button wui-button--ghost">
          Close
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
}
