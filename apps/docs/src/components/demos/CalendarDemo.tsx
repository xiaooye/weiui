"use client";

import { useState } from "react";
import { Calendar } from "@weiui/react";

export function CalendarDemo() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
      }}
    >
      <Calendar value={date} onChange={setDate} />
      <p
        style={{
          margin: 0,
          fontSize: "var(--wui-font-size-sm)",
          color: "var(--wui-color-muted-foreground)",
        }}
      >
        Selected:{" "}
        <strong style={{ color: "var(--wui-color-foreground)" }}>
          {date.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </strong>
      </p>
    </div>
  );
}
