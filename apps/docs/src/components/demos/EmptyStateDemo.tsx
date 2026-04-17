"use client";

import { useState } from "react";
import { Button, EmptyState } from "@weiui/react";

export function EmptyStateDemo() {
  const [cleared, setCleared] = useState(false);

  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      <EmptyState
        icon={<span style={{ fontSize: "var(--wui-font-size-xl)" }} aria-hidden="true">📭</span>}
        title={cleared ? "Filters cleared" : "No results found"}
        description={
          cleared
            ? "Add items or adjust your search to see results."
            : "Try adjusting your search or filters to find what you are looking for."
        }
        action={
          <Button variant="outline" size="sm" onClick={() => setCleared((c) => !c)}>
            {cleared ? "Reset demo" : "Clear filters"}
          </Button>
        }
      />
    </div>
  );
}
