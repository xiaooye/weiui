"use client";

import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@weiui/react";

export function PopoverDemo() {
  return (
    <Popover side="bottom" align="start">
      <PopoverTrigger className="wui-button wui-button--outline">
        Account
      </PopoverTrigger>
      <PopoverContent
        style={{
          background: "var(--wui-surface-overlay)",
          border: "1px solid var(--wui-color-border)",
          borderRadius: "var(--wui-shape-radius-md)",
          boxShadow: "var(--wui-elevation-3)",
          padding: "var(--wui-spacing-4)",
          minInlineSize: "260px",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--wui-spacing-3)",
            marginBlockEnd: "var(--wui-spacing-3)",
          }}
        >
          <span className="wui-avatar">
            <span className="wui-avatar__fallback">AL</span>
          </span>
          <div style={{ minInlineSize: 0 }}>
            <div
              style={{
                fontSize: "var(--wui-font-size-sm)",
                fontWeight: "var(--wui-font-weight-semibold)",
                color: "var(--wui-color-foreground)",
              }}
            >
              Ada Lovelace
            </div>
            <div
              style={{
                fontSize: "var(--wui-font-size-xs)",
                color: "var(--wui-color-muted-foreground)",
              }}
            >
              ada@example.com
            </div>
          </div>
        </div>
        <div
          style={{
            blockSize: "1px",
            background: "var(--wui-color-border)",
            marginBlock: "var(--wui-spacing-2)",
          }}
          aria-hidden="true"
        />
        <div
          style={{
            display: "flex",
            gap: "var(--wui-spacing-2)",
            justifyContent: "flex-end",
          }}
        >
          <PopoverClose className="wui-button wui-button--ghost wui-button--sm">
            Sign out
          </PopoverClose>
          <PopoverClose className="wui-button wui-button--solid wui-button--sm">
            Profile
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
