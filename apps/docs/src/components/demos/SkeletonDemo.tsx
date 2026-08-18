"use client";

import { Skeleton } from "civaria";

export function SkeletonDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--civ-spacing-2)",
        width: "100%",
        maxWidth: "320px",
      }}
    >
      <Skeleton style={{ height: "120px", width: "100%" }} />
      <Skeleton variant="text" style={{ width: "80%" }} />
      <Skeleton variant="text" style={{ width: "60%" }} />
      <div style={{ display: "flex", gap: "var(--civ-spacing-2)", alignItems: "center" }}>
        <Skeleton variant="circle" style={{ width: "48px", height: "48px" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--civ-spacing-2)" }}>
          <Skeleton variant="text" style={{ width: "70%" }} />
          <Skeleton variant="text" style={{ width: "40%" }} />
        </div>
      </div>
    </div>
  );
}
