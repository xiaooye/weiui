"use client";

import { useState } from "react";
import { Button, CommandPalette, toast, type CommandItem } from "@weiui/react";

const items: CommandItem[] = [
  // File
  {
    id: "new-file",
    label: "New File",
    group: "File",
    shortcut: "⌘N",
    onSelect: () => toast("New File"),
  },
  {
    id: "new-window",
    label: "New Window",
    group: "File",
    shortcut: "⇧⌘N",
    onSelect: () => toast("New Window"),
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
    id: "save-as",
    label: "Save As…",
    group: "File",
    shortcut: "⇧⌘S",
    onSelect: () => toast.success("Saved as new file"),
  },
  // Edit
  {
    id: "undo",
    label: "Undo",
    group: "Edit",
    shortcut: "⌘Z",
    onSelect: () => toast("Undo"),
  },
  {
    id: "redo",
    label: "Redo",
    group: "Edit",
    shortcut: "⇧⌘Z",
    onSelect: () => toast("Redo"),
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
  // View
  {
    id: "theme-toggle",
    label: "Toggle Dark Mode",
    group: "View",
    shortcut: "⌘J",
    onSelect: () => toast("Toggle Dark Mode"),
  },
  {
    id: "zen-mode",
    label: "Toggle Zen Mode",
    group: "View",
    onSelect: () => toast("Zen Mode"),
  },
  {
    id: "sidebar",
    label: "Toggle Sidebar",
    group: "View",
    shortcut: "⌘B",
    onSelect: () => toast("Sidebar"),
  },
  // Navigation
  {
    id: "goto-line",
    label: "Go to Line…",
    group: "Navigation",
    shortcut: "⌃G",
    onSelect: () => toast("Go to Line"),
  },
  {
    id: "goto-symbol",
    label: "Go to Symbol…",
    group: "Navigation",
    shortcut: "⌘T",
    onSelect: () => toast("Go to Symbol"),
  },
  {
    id: "goto-file",
    label: "Go to File…",
    group: "Navigation",
    shortcut: "⌘P",
    onSelect: () => toast("Go to File"),
  },
  // Settings
  {
    id: "settings",
    label: "Open Settings",
    group: "Settings",
    shortcut: "⌘,",
    onSelect: () => toast("Open Settings"),
  },
  {
    id: "keybindings",
    label: "Open Keyboard Shortcuts",
    group: "Settings",
    shortcut: "⌘K ⌘S",
    onSelect: () => toast("Keybindings"),
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
        Or press <kbd>⌘</kbd> + <kbd>K</kbd>. {items.length} actions across 5 groups.
        Type to filter, arrow keys to navigate, Enter to select, Esc to close.
      </p>
      <CommandPalette open={open} onOpenChange={setOpen} items={items} />
    </div>
  );
}
