"use client";
import { forwardRef, useReducer, useId } from "react";
import { cn } from "../../utils/cn";

export interface CalendarProps {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
  label?: string;
}

type CalendarAction = { type: "PREV_MONTH" } | { type: "NEXT_MONTH" };

interface CalendarState {
  viewYear: number;
  viewMonth: number;
}

function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case "PREV_MONTH": {
      const m = state.viewMonth - 1;
      return m < 0
        ? { viewYear: state.viewYear - 1, viewMonth: 11 }
        : { ...state, viewMonth: m };
    }
    case "NEXT_MONTH": {
      const m = state.viewMonth + 1;
      return m > 11
        ? { viewYear: state.viewYear + 1, viewMonth: 0 }
        : { ...state, viewMonth: m };
    }
  }
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const startDay = new Date(year, month, 1).getDay();
  for (let i = startDay - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  const lastDate = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= lastDate; d++) {
    days.push(new Date(year, month, d));
  }
  while (days.length < 42) {
    days.push(new Date(year, month + 1, days.length - startDay - lastDate + 1));
  }
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  (
    { value, defaultValue, onChange, minDate, maxDate, disabled, className, label },
    ref,
  ) => {
    const initial = value ?? defaultValue ?? new Date();
    const [state, dispatch] = useReducer(calendarReducer, {
      viewYear: initial.getFullYear(),
      viewMonth: initial.getMonth(),
    });
    const calendarId = useId();
    const selectedDate = value ?? defaultValue;
    const days = getDaysInMonth(state.viewYear, state.viewMonth);
    const monthLabel = new Date(state.viewYear, state.viewMonth).toLocaleDateString(
      "en-US",
      { month: "long", year: "numeric" },
    );

    const isDayDisabled = (d: Date) => {
      if (disabled) return true;
      if (minDate && d < minDate) return true;
      if (maxDate && d > maxDate) return true;
      return false;
    };

    return (
      <div
        ref={ref}
        className={cn("wui-calendar", className)}
        role="group"
        aria-label={label || "Calendar"}
      >
        <div className="wui-calendar__header">
          <button
            type="button"
            className="wui-calendar__nav"
            onClick={() => dispatch({ type: "PREV_MONTH" })}
            aria-label="Previous month"
          >
            &lsaquo;
          </button>
          <span className="wui-calendar__title" id={`${calendarId}-title`}>
            {monthLabel}
          </span>
          <button
            type="button"
            className="wui-calendar__nav"
            onClick={() => dispatch({ type: "NEXT_MONTH" })}
            aria-label="Next month"
          >
            &rsaquo;
          </button>
        </div>
        <table
          className="wui-calendar__grid"
          role="grid"
          aria-labelledby={`${calendarId}-title`}
        >
          <thead>
            <tr>
              {WEEKDAYS.map((wd) => (
                <th key={wd} className="wui-calendar__weekday" scope="col" abbr={wd}>
                  {wd}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }, (_, row) => (
              <tr key={row}>
                {days.slice(row * 7, row * 7 + 7).map((day) => {
                  const outside = day.getMonth() !== state.viewMonth;
                  const dayDisabled = isDayDisabled(day);
                  const selected = selectedDate ? isSameDay(day, selectedDate) : false;
                  return (
                    <td key={day.toISOString()} className="wui-calendar__day">
                      <button
                        type="button"
                        className="wui-calendar__day-btn"
                        data-selected={selected || undefined}
                        data-today={isToday(day) || undefined}
                        data-outside={outside || undefined}
                        data-disabled={dayDisabled || undefined}
                        disabled={dayDisabled}
                        aria-label={day.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        aria-selected={selected}
                        onClick={() => onChange?.(day)}
                        tabIndex={selected ? 0 : -1}
                      >
                        {day.getDate()}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);
Calendar.displayName = "Calendar";
