"use client";

import type { CSSProperties } from "react";
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator, toast } from "@weiui/react";

const menuItemStyle: CSSProperties = {
  padding: "var(--wui-spacing-2) var(--wui-spacing-3)",
  borderRadius: "var(--wui-shape-radius-sm)",
  cursor: "pointer",
  fontSize: "var(--wui-font-size-sm)",
  outline: "none",
};

export function MenuDemo() {
  return (
    <Menu>
      <MenuTrigger className="wui-button wui-button--outline">File</MenuTrigger>
      <MenuContent
        style={{
          background: "var(--wui-surface-overlay)",
          border: "1px solid var(--wui-color-border)",
          borderRadius: "var(--wui-shape-radius-md)",
          boxShadow: "var(--wui-elevation-3)",
          padding: "var(--wui-spacing-1)",
          minInlineSize: "180px",
          zIndex: 1000,
        }}
      >
        <MenuItem style={menuItemStyle} onSelect={() => toast("New file")}>
          New file
        </MenuItem>
        <MenuItem style={menuItemStyle} onSelect={() => toast("Open dialog triggered")}>
          Open…
        </MenuItem>
        <MenuSeparator
          style={{
            blockSize: "1px",
            background: "var(--wui-color-border)",
            marginBlock: "var(--wui-spacing-1)",
          }}
        />
        <MenuItem style={menuItemStyle} disabled onSelect={() => toast.error("This should never fire")}>
          Save (disabled)
        </MenuItem>
        <MenuItem style={menuItemStyle} onSelect={() => toast("Goodbye")}>
          Exit
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
