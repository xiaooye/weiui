"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import type { SearchEntry } from "../../lib/search-index";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [entries, setEntries] = useState<SearchEntry[]>([]);

  useEffect(() => {
    if (!open) return;
    fetch("/search-index.json").then((r) => r.json()).then(setEntries).catch(() => {});
  }, [open]);

  if (!open) return null;

  const grouped = entries.reduce<Record<string, SearchEntry[]>>((acc, e) => {
    (acc[e.group] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="wui-cmdk-overlay" onClick={onClose} role="presentation">
      <div
        className="wui-cmdk-shell"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search docs"
      >
        <Command label="Search docs">
          <Command.Input placeholder="Search components, guides, tokens…" autoFocus />
          <Command.List>
            <Command.Empty>No results.</Command.Empty>
            {Object.entries(grouped).map(([group, items]) => (
              <Command.Group key={group} heading={group}>
                {items.map((item) => (
                  <Command.Item
                    key={item.href}
                    value={`${item.title} ${item.content}`}
                    onSelect={() => {
                      router.push(item.href);
                      onClose();
                    }}
                  >
                    <span className="wui-cmdk-title">{item.title}</span>
                    <span className="wui-cmdk-href">{item.href}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
