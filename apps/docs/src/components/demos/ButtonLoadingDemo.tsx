"use client";

import { useState } from "react";
import { Button } from "@weiui/react";

export function ButtonLoadingDemo() {
  const [loading, setLoading] = useState(false);

  const simulateSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1600);
  };

  return (
    <div style={{ display: "flex", gap: "var(--wui-spacing-3)", flexWrap: "wrap", alignItems: "center" }}>
      <Button loading>Loading…</Button>
      <Button variant="outline" loading>
        Loading…
      </Button>
      <Button onClick={simulateSave} loading={loading}>
        {loading ? "Saving…" : "Click to save"}
      </Button>
    </div>
  );
}
