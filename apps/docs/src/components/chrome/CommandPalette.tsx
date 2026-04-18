"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandPalette as WeiUICommandPalette,
  type CommandItem,
} from "@weiui/react";
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
    fetch("/search-index.json")
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {
        /* ignored */
      });
  }, [open]);

  const items: CommandItem[] = useMemo(
    () =>
      entries.map((entry) => ({
        id: entry.href,
        label: entry.title,
        group: entry.group,
        onSelect: () => {
          router.push(entry.href);
          onClose();
        },
      })),
    [entries, onClose, router],
  );

  return (
    <WeiUICommandPalette
      id="docs-search"
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      items={items}
      label="Search docs"
      placeholder="Search components, guides, tokens\u2026"
      emptyText="No results found."
    />
  );
}
