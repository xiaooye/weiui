"use client";

import { useState, type CSSProperties } from "react";
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuCheckboxItem,
  MenuRadioItem,
  MenuLabel,
  toast,
} from "@weiui/react";

const menuItemStyle: CSSProperties = {
  padding: "var(--wui-spacing-2) var(--wui-spacing-3)",
  borderRadius: "var(--wui-shape-radius-sm)",
  cursor: "pointer",
  fontSize: "var(--wui-font-size-sm)",
  outline: "none",
};

const menuContentStyle: CSSProperties = {
  background: "var(--wui-surface-overlay)",
  border: "1px solid var(--wui-color-border)",
  borderRadius: "var(--wui-shape-radius-md)",
  boxShadow: "var(--wui-elevation-3)",
  padding: "var(--wui-spacing-1)",
  minInlineSize: "200px",
  zIndex: 1000,
};

export function MenuDemo() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(true);
  const [align, setAlign] = useState<string>("left");

  return (
    <div style={{ display: "flex", gap: "var(--wui-spacing-2)", flexWrap: "wrap" }}>
      <Menu>
        <MenuTrigger className="wui-button wui-button--outline">File</MenuTrigger>
        <MenuContent style={menuContentStyle}>
          <MenuItem style={menuItemStyle} shortcut="⌘N" onSelect={() => toast("New file")}>
            New file
          </MenuItem>
          <MenuItem style={menuItemStyle} shortcut="⌘O" onSelect={() => toast("Open dialog triggered")}>
            Open…
          </MenuItem>
          <MenuSeparator
            style={{
              blockSize: "1px",
              background: "var(--wui-color-border)",
              marginBlock: "var(--wui-spacing-1)",
            }}
          />
          <MenuItem style={menuItemStyle} shortcut="⌘S" disabled onSelect={() => toast.error("This should never fire")}>
            Save (disabled)
          </MenuItem>
          <MenuItem style={menuItemStyle} onSelect={() => toast("Goodbye")}>
            Exit
          </MenuItem>
        </MenuContent>
      </Menu>

      <Menu>
        <MenuTrigger className="wui-button wui-button--outline">Format</MenuTrigger>
        <MenuContent style={menuContentStyle}>
          <MenuLabel style={{ padding: "var(--wui-spacing-1) var(--wui-spacing-3)" }}>Style</MenuLabel>
          <MenuCheckboxItem
            style={menuItemStyle}
            checked={bold}
            onCheckedChange={setBold}
            shortcut="⌘B"
          >
            Bold
          </MenuCheckboxItem>
          <MenuCheckboxItem
            style={menuItemStyle}
            checked={italic}
            onCheckedChange={setItalic}
            shortcut="⌘I"
          >
            Italic
          </MenuCheckboxItem>
          <MenuSeparator
            style={{
              blockSize: "1px",
              background: "var(--wui-color-border)",
              marginBlock: "var(--wui-spacing-1)",
            }}
          />
          <MenuLabel style={{ padding: "var(--wui-spacing-1) var(--wui-spacing-3)" }}>Alignment</MenuLabel>
          <MenuRadioItem style={menuItemStyle} value="left" checked={align === "left"} onSelect={setAlign}>
            Left
          </MenuRadioItem>
          <MenuRadioItem style={menuItemStyle} value="center" checked={align === "center"} onSelect={setAlign}>
            Center
          </MenuRadioItem>
          <MenuRadioItem style={menuItemStyle} value="right" checked={align === "right"} onSelect={setAlign}>
            Right
          </MenuRadioItem>
        </MenuContent>
      </Menu>
    </div>
  );
}
