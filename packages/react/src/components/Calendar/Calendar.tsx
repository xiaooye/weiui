"use client";
import { forwardRef, useReducer, useId, useRef, type KeyboardEvent } from "react";
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
  /** BCP 47 locale tag (e.g. "en-US", "fr-FR"). Defaults to "en-US". */
  locale?: string;
  /** 0=Sunday, 1=Monday, ... 6=Saturday. Defaults to 0. */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Optional predicate to disable arbitrary dates. */
  isDateDisabled?: (date: Date) => boolean;
}

type CalendarAction = { type: "PREV_MONTH" } | { type: "NEXT_MONTH" } | { type: "SET_VIEW"; year: number; month: number };

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
    case "SET_VIEW":
      return { viewYear: action.year, viewMonth: action.month };
  }
}

const DEFAULT_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getWeekdays(locale: string, firstDayOfWeek: number): string[] {
  // Reference Sunday: 2023-01-01 was a Sunday.
  const base = new Date(2023, 0, 1);
  const out: string[] = [];
  try {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    for (let i = 0; i < 7; i++) {
      const dayIndex = (firstDayOfWeek + i) % 7;
      const d = new Date(base);
      d.setDate(base.getDate() + dayIndex);
      out.push(fmt.format(d));
    }
  } catch {
    for (let i = 0; i < 7; i++) {
      out.push(DEFAULT_WEEKDAYS[(firstDayOfWeek + i) % 7]!);
    }
  }
  return out;
}

function getDaysInMonth(year: number, month: number, firstDayOfWeek: number): Date[] {
  const days: Date[] = [];
  const startDay = new Date(year, month, 1).getDay();
  // Offset so the first cell is firstDayOfWeek
  const offset = (startDay - firstDayOfWeek + 7) % 7;
  for (let i = offset - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  const lastDate = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= lastDate; d++) {
    days.push(new Date(year, month, d));
  }
  while (days.length < 42) {
    days.push(new Date(year, month + 1, days.length - offset - lastDate + 1));
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

function toKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      minDate,
      maxDate,
      disabled,
      className,
      label,
      locale = "en-US",
      firstDayOfWeek = 0,
      isDateDisabled: isDateDisabledProp,
    },
    ref,
  ) => {
    const initial = value ?? defaultValue ?? new Date();
    const [state, dispatch] = useReducer(calendarReducer, {
      viewYear: initial.getFullYear(),
      viewMonth: initial.getMonth(),
    });
    const calendarId = useId();
    const selectedDate = value ?? defaultValue;
    const days = getDaysInMonth(state.viewYear, state.viewMonth, firstDayOfWeek);
    const weekdays = getWeekdays(locale, firstDayOfWeek);
    const monthLabel = new Date(state.viewYear, state.viewMonth).toLocaleDateString(
      locale,
      { month: "long", year: "numeric" },
    );
    const dayLabelFormatter = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const dayButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    const isDayDisabled = (d: Date) => {
      if (disabled) return true;
      if (minDate && d < minDate) return true;
      if (maxDate && d > maxDate) return true;
      if (isDateDisabledProp && isDateDisabledProp(d)) return true;
      return false;
    };

    const focusDate = (target: Date) => {
      // If target is outside current view, switch view first.
      const sameView =
        target.getFullYear() === state.viewYear && target.getMonth() === state.viewMonth;
      if (!sameView) {
        dispatch({
          type: "SET_VIEW",
          year: target.getFullYear(),
          month: target.getMonth(),
        });
      }
      // Defer focus until after render so the target button exists in the DOM.
      queueMicrotask(() => {
        const btn = dayButtonRefs.current.get(toKey(target));
        btn?.focus();
      });
    };

    const handleDayKeyDown = (e: KeyboardEvent<HTMLButtonElement>, day: Date) => {
      let next: Date | null = null;
      switch (e.key) {
        case "ArrowRight":
          next = new Date(day);
          next.setDate(day.getDate() + 1);
          break;
        case "ArrowLeft":
          next = new Date(day);
          next.setDate(day.getDate() - 1);
          break;
        case "ArrowDown":
          next = new Date(day);
          next.setDate(day.getDate() + 7);
          break;
        case "ArrowUp":
          next = new Date(day);
          next.setDate(day.getDate() - 7);
          break;
        case "Home": {
          // Start of week based on firstDayOfWeek
          const dayOfWeek = day.getDay();
          const back = (dayOfWeek - firstDayOfWeek + 7) % 7;
          next = new Date(day);
          next.setDate(day.getDate() - back);
          break;
        }
        case "End": {
          const dayOfWeek = day.getDay();
          const back = (dayOfWeek - firstDayOfWeek + 7) % 7;
          next = new Date(day);
          next.setDate(day.getDate() + (6 - back));
          break;
        }
        case "PageUp":
          next = new Date(day);
          next.setMonth(day.getMonth() - 1);
          break;
        case "PageDown":
          next = new Date(day);
          next.setMonth(day.getMonth() + 1);
          break;
        default:
          return;
      }
      e.preventDefault();
      focusDate(next);
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
              {weekdays.map((wd, i) => (
                <th key={`${wd}-${i}`} className="wui-calendar__weekday" scope="col" abbr={wd}>
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
                        ref={(el) => {
                          if (el) dayButtonRefs.current.set(toKey(day), el);
                          else dayButtonRefs.current.delete(toKey(day));
                        }}
                        type="button"
                        className="wui-calendar__day-btn"
                        data-selected={selected || undefined}
                        data-today={isToday(day) || undefined}
                        data-outside={outside || undefined}
                        data-disabled={dayDisabled || undefined}
                        disabled={dayDisabled}
                        aria-label={dayLabelFormatter.format(day)}
                        aria-selected={selected}
                        onClick={() => onChange?.(day)}
                        onKeyDown={(e) => handleDayKeyDown(e, day)}
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
