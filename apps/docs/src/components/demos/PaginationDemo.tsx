"use client";

import { useState } from "react";
import { Pagination } from "@weiui/react";

export function PaginationDemo() {
  const [page, setPage] = useState(3);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-3)", alignItems: "flex-start" }}>
      <Pagination page={page} totalPages={20} onPageChange={setPage} />
      <p
        style={{
          margin: 0,
          fontSize: "var(--wui-font-size-sm)",
          color: "var(--wui-color-muted-foreground)",
        }}
      >
        Current page: <strong style={{ color: "var(--wui-color-foreground)" }}>{page}</strong> of 20
      </p>
    </div>
  );
}
