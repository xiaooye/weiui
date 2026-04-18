"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Kbd, Text } from "@weiui/react";

const CommandPalette = dynamic(
  () => import("./CommandPalette").then((m) => m.CommandPalette),
  { ssr: false },
);

export function SearchTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label="Search docs (Cmd+K)"
        className="wui-docs-search-trigger"
        endIcon={<Kbd>{"\u2318K"}</Kbd>}
      >
        <Text as="span" size="sm" color="muted">
          Search
        </Text>
      </Button>
      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </>
  );
}
