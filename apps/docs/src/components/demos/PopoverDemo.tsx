"use client";

import { Avatar, AvatarFallback, Popover, PopoverTrigger, PopoverContent, PopoverClose, PopoverArrow } from "civaria";

export function PopoverDemo() {
  return (
    <Popover side="bottom" align="start">
      <PopoverTrigger className="civ-button civ-button--outline">
        Account
      </PopoverTrigger>
      <PopoverContent
        style={{
          background: "var(--civ-surface-overlay)",
          border: "1px solid var(--civ-color-border)",
          borderRadius: "var(--civ-shape-radius-md)",
          boxShadow: "var(--civ-elevation-3)",
          padding: "var(--civ-spacing-4)",
          minInlineSize: "260px",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--civ-spacing-3)",
            marginBlockEnd: "var(--civ-spacing-3)",
          }}
        >
          <Avatar>
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          <div style={{ minInlineSize: 0 }}>
            <div
              style={{
                fontSize: "var(--civ-font-size-sm)",
                fontWeight: "var(--civ-font-weight-semibold)",
                color: "var(--civ-color-foreground)",
              }}
            >
              Ada Lovelace
            </div>
            <div
              style={{
                fontSize: "var(--civ-font-size-xs)",
                color: "var(--civ-color-muted-foreground)",
              }}
            >
              ada@example.com
            </div>
          </div>
        </div>
        <div
          style={{
            blockSize: "1px",
            background: "var(--civ-color-border)",
            marginBlock: "var(--civ-spacing-2)",
          }}
          aria-hidden="true"
        />
        <div
          style={{
            display: "flex",
            gap: "var(--civ-spacing-2)",
            justifyContent: "flex-end",
          }}
        >
          <PopoverClose className="civ-button civ-button--ghost civ-button--sm">
            Sign out
          </PopoverClose>
          <PopoverClose className="civ-button civ-button--solid civ-button--sm">
            Profile
          </PopoverClose>
        </div>
        <PopoverArrow />
      </PopoverContent>
    </Popover>
  );
}
