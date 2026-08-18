"use client";

import { useState } from "react";
import { Calendar } from "civaria";

export function CalendarDemo() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--civ-spacing-3)",
      }}
    >
      <Calendar value={date} onChange={setDate} />
      <p
        style={{
          margin: 0,
          fontSize: "var(--civ-font-size-sm)",
          color: "var(--civ-color-muted-foreground)",
        }}
      >
        Selected:{" "}
        <strong style={{ color: "var(--civ-color-foreground)" }}>
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
