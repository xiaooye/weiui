"use client";

import { useState } from "react";
import { Rating } from "@weiui/react";

export function RatingDemo() {
  const [rating, setRating] = useState(3);
  const [halfRating, setHalfRating] = useState(3.5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-3)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--wui-spacing-3)" }}>
        <Rating value={rating} onChange={setRating} label="Rate this component" />
        <span style={{ fontSize: "var(--wui-font-size-sm)", color: "var(--wui-color-muted-foreground)" }}>
          {rating}/5
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--wui-spacing-3)" }}>
        <Rating
          allowHalf
          value={halfRating}
          onChange={setHalfRating}
          label="Half-star rating"
        />
        <span style={{ fontSize: "var(--wui-font-size-sm)", color: "var(--wui-color-muted-foreground)" }}>
          {halfRating}/5 (allowHalf)
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--wui-spacing-3)" }}>
        <Rating defaultValue={4} readOnly label="Read-only rating" />
        <span style={{ fontSize: "var(--wui-font-size-sm)", color: "var(--wui-color-muted-foreground)" }}>
          Read-only (4)
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--wui-spacing-3)" }}>
        <Rating defaultValue={2} disabled label="Disabled rating" />
        <span style={{ fontSize: "var(--wui-font-size-sm)", color: "var(--wui-color-muted-foreground)" }}>
          Disabled (2)
        </span>
      </div>
    </div>
  );
}
