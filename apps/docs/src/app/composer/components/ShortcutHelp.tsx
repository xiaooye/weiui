"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Kbd,
  Stack,
  Text,
} from "@weiui/react";

const ROWS: Array<{ keys: string[]; label: string }> = [
  { keys: ["\u2318", "K"], label: "Open command palette" },
  { keys: ["\u2318", "D"], label: "Duplicate selection" },
  { keys: ["\u2318", "Z"], label: "Undo" },
  { keys: ["\u2318", "\u21E7", "Z"], label: "Redo" },
  { keys: ["\u2318", "C"], label: "Copy selection" },
  { keys: ["\u2318", "V"], label: "Paste" },
  { keys: ["\u2318", "A"], label: "Select all siblings" },
  { keys: ["\u2318", "P"], label: "Toggle preview" },
  { keys: ["\u232B"], label: "Delete selection" },
  { keys: ["\u2191"], label: "Previous sibling" },
  { keys: ["\u2193"], label: "Next sibling" },
  { keys: ["\u2190"], label: "Parent" },
  { keys: ["\u2192"], label: "First child" },
  { keys: ["Tab"], label: "Next node (depth-first)" },
  { keys: ["Esc"], label: "Clear selection / close palette" },
  { keys: ["?"], label: "Show this help" },
];

export interface ShortcutHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutHelp({ open, onOpenChange }: ShortcutHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Keyboard shortcuts</DialogTitle>
        <Stack direction="column" gap={2}>
          {ROWS.map((r) => (
            <Stack
              key={r.label}
              direction="row"
              gap={3}
              style={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Text size="sm">{r.label}</Text>
              <Stack direction="row" gap={1}>
                {r.keys.map((k, i) => (
                  <Kbd key={`${r.label}-${i}`}>{k}</Kbd>
                ))}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
