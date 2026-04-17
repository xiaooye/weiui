"use client";

import { useState } from "react";
import { CommandPalette, type CommandItem } from "@weiui/react";

const items: CommandItem[] = [
  {
    id: "new-file",
    label: "New File",
    group: "File",
    shortcut: "⌘N",
    onSelect: () => {},
  },
  {
    id: "open-file",
    label: "Open File…",
    group: "File",
    shortcut: "⌘O",
    onSelect: () => {},
  },
  {
    id: "save",
    label: "Save",
    group: "File",
    shortcut: "⌘S",
    onSelect: () => {},
  },
  {
    id: "find",
    label: "Find in Files",
    group: "Edit",
    shortcut: "⇧⌘F",
    onSelect: () => {},
  },
  {
    id: "replace",
    label: "Replace",
    group: "Edit",
    shortcut: "⌘R",
    onSelect: () => {},
  },
  {
    id: "theme-toggle",
    label: "Toggle Dark Mode",
    group: "View",
    onSelect: () => {},
  },
  {
    id: "settings",
    label: "Open Settings",
    group: "View",
    shortcut: "⌘,",
    onSelect: () => {},
  },
];

export function CommandPaletteDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-2)",
      }}
    >
      <button
        type="button"
        className="wui-button wui-button--solid"
        onClick={() => setOpen(true)}
        style={{ inlineSize: "fit-content" }}
      >
        Open palette
      </button>
      <p
        style={{
          fontSize: "var(--wui-font-size-sm)",
          color: "var(--wui-color-muted-foreground)",
          margin: 0,
        }}
      >
        Or press <kbd>⌘</kbd> + <kbd>K</kbd>. Type to filter items, arrow keys to
        navigate, Enter to select, Esc to close.
      </p>
      <CommandPalette open={open} onOpenChange={setOpen} items={items} />
    </div>
  );
}
