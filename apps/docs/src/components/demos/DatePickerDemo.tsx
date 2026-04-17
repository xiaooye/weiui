"use client";

import { useState } from "react";
import { DatePicker } from "@weiui/react";

export function DatePickerDemo() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
        inlineSize: "280px",
      }}
    >
      <DatePicker value={date} onChange={setDate} placeholder="Pick a date" />
      <p
        style={{
          margin: 0,
          fontSize: "var(--wui-font-size-sm)",
          color: "var(--wui-color-muted-foreground)",
        }}
      >
        {date
          ? `Selected: ${date.toLocaleDateString()}`
          : "Click the input to open the calendar."}
      </p>
    </div>
  );
}
