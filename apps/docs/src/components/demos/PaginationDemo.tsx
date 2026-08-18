"use client";

import { useState } from "react";
import { Pagination } from "civaria";

export function PaginationDemo() {
  const [page, setPage] = useState(3);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--civ-spacing-3)", alignItems: "flex-start" }}>
      <Pagination page={page} totalPages={20} onPageChange={setPage} />
      <p
        style={{
          margin: 0,
          fontSize: "var(--civ-font-size-sm)",
          color: "var(--civ-color-muted-foreground)",
        }}
      >
        Current page: <strong style={{ color: "var(--civ-color-foreground)" }}>{page}</strong> of 20
      </p>
    </div>
  );
}
