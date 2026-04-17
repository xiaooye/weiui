"use client";

import { useEffect, useState } from "react";

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
      <button
        type="button"
        className="wui-docs-search-trigger"
        onClick={() => setOpen(true)}
        aria-label="Search docs (Cmd+K)"
      >
        <span>Search…</span>
        <kbd>⌘K</kbd>
      </button>
      {open && (
        <div className="wui-docs-search-trigger__placeholder" role="dialog" aria-modal="true">
          <p>Command palette coming soon.</p>
          <button type="button" onClick={() => setOpen(false)}>Close</button>
        </div>
      )}
    </>
  );
}
