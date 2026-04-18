"use client";

import { useMemo, useState } from "react";
import { DatePicker } from "@weiui/react";

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function DatePickerDemo() {
  const [date, setDate] = useState<Date | undefined>();

  // Only allow business days in the next 30 days.
  const { minDate, maxDate } = useMemo(() => {
    const today = startOfDay(new Date());
    return { minDate: today, maxDate: addDays(today, 30) };
  }, []);

  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
        inlineSize: "280px",
      }}
    >
      <DatePicker
        value={date}
        onChange={(d) => setDate(d ?? undefined)}
        placeholder="Pick a business day"
        label="Appointment date"
        minDate={minDate}
        maxDate={maxDate}
        isDateDisabled={isWeekend}
      />
      <p
        style={{
          margin: 0,
          fontSize: "var(--wui-font-size-sm)",
          color: "var(--wui-color-muted-foreground)",
        }}
      >
        {date
          ? `Selected: ${date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}`
          : "Next 30 days. Weekends disabled. Click to open."}
      </p>
    </div>
  );
}
