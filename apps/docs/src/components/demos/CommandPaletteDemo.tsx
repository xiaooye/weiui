"use client";

import { useState } from "react";
import { Button, CommandPalette, toast, type CommandItem } from "@weiui/react";

const items: CommandItem[] = [
  {
    id: "new-file",
    label: "New File",
    group: "File",
    shortcut: "⌘N",
    onSelect: () => toast("New File"),
  },
  {
    id: "open-file",
    label: "Open File…",
    group: "File",
    shortcut: "⌘O",
    onSelect: () => toast("Open File"),
  },
  {
    id: "save",
    label: "Save",
    group: "File",
    shortcut: "⌘S",
    onSelect: () => toast.success("Saved"),
  },
  {
    id: "find",
    label: "Find in Files",
    group: "Edit",
    shortcut: "⇧⌘F",
    onSelect: () => toast("Find in Files"),
  },
  {
    id: "replace",
    label: "Replace",
    group: "Edit",
    shortcut: "⌘R",
    onSelect: () => toast("Replace"),
  },
  {
    id: "theme-toggle",
    label: "Toggle Dark Mode",
    group: "View",
    onSelect: () => toast("Toggle Dark Mode"),
  },
  {
    id: "settings",
    label: "Open Settings",
    group: "View",
    shortcut: "⌘,",
    onSelect: () => toast("Open Settings"),
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
      <Button
        onClick={() => setOpen(true)}
        style={{ inlineSize: "fit-content" }}
      >
        Open palette
      </Button>
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
