"use client";
import {
  forwardRef,
  useReducer,
  useId,
  useRef,
  useEffect,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";

export interface CalendarDayInfo {
  isToday: boolean;
  isSelected: boolean;
  isOutsideMonth: boolean;
  isDisabled: boolean;
  /** Only set when `mode="range"` and the day sits inside the selected span. */
  isInRange?: boolean;
  /** Whether this is the start of the current range selection. */
  isRangeStart?: boolean;
  /** Whether this is the end of the current range selection. */
  isRangeEnd?: boolean;
}

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
  /** "single" selects a date; "range" selects a [start, end] pair. */
  mode?: "single" | "range";
  /** Range-mode value. */
  rangeValue?: [Date | null, Date | null];
  /** Fires when a range selection changes. */
  onRangeChange?: (range: [Date, Date]) => void;
  /** Render dropdowns in the header for fast month/year navigation. */
  showYearMonthDropdowns?: boolean;
  /** Range of years to list in the year dropdown. Defaults to ±50. */
  yearRange?: [number, number];
  /** Replace the inner day cell UI with custom content. */
  renderDay?: (date: Date, info: CalendarDayInfo) => ReactNode;
  /** Focus the selected day (or today) on mount. */
  autoFocus?: boolean;
}

type CalendarAction =
  | { type: "PREV_MONTH" }
  | { type: "NEXT_MONTH" }
  | { type: "SET_VIEW"; year: number; month: number }
  | { type: "SET_YEAR"; year: number }
  | { type: "SET_MONTH"; month: number };

interface CalendarState {
  viewYear: number;
  viewMonth: number;
}

function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case "PREV_MONTH": {
      const m = state.viewMonth - 1;
      return m < 0 ? { viewYear: state.viewYear - 1, viewMonth: 11 } : { ...state, viewMonth: m };
    }
    case "NEXT_MONTH": {
      const m = state.viewMonth + 1;
      return m > 11 ? { viewYear: state.viewYear + 1, viewMonth: 0 } : { ...state, viewMonth: m };
    }
    case "SET_VIEW":
      return { viewYear: action.year, viewMonth: action.month };
    case "SET_YEAR":
      return { ...state, viewYear: action.year };
    case "SET_MONTH":
      return { ...state, viewMonth: action.month };
  }
}

const DEFAULT_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getWeekdays(locale: string, firstDayOfWeek: number): string[] {
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
      mode = "single",
      rangeValue,
      onRangeChange,
      showYearMonthDropdowns,
      yearRange,
      renderDay,
      autoFocus,
    },
    ref,
  ) => {
    const initial = value ?? defaultValue ?? (rangeValue?.[0] ?? new Date());
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

    // Track the pending range start so the second click completes the range.
    const pendingStartRef = useRef<Date | null>(rangeValue?.[0] ?? null);

    useEffect(() => {
      if (!autoFocus) return;
      const key = toKey(selectedDate ?? new Date());
      const btn = dayButtonRefs.current.get(key);
      btn?.focus();
    }, [autoFocus]); // eslint-disable-line react-hooks/exhaustive-deps

    const isDayDisabled = (d: Date) => {
      if (disabled) return true;
      if (minDate && d < minDate) return true;
      if (maxDate && d > maxDate) return true;
      if (isDateDisabledProp && isDateDisabledProp(d)) return true;
      return false;
    };

    const focusDate = (target: Date) => {
      const sameView =
        target.getFullYear() === state.viewYear && target.getMonth() === state.viewMonth;
      if (!sameView) {
        dispatch({
          type: "SET_VIEW",
          year: target.getFullYear(),
          month: target.getMonth(),
        });
      }
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

    const handleDayClick = (day: Date) => {
      if (mode === "range") {
        const start = pendingStartRef.current;
        if (!start) {
          pendingStartRef.current = day;
          return;
        }
        const [a, b] = start < day ? [start, day] : [day, start];
        pendingStartRef.current = null;
        onRangeChange?.([a, b]);
      } else {
        onChange?.(day);
      }
    };

    const yearsList = (() => {
      const [minY, maxY] = yearRange ?? [state.viewYear - 50, state.viewYear + 50];
      const out: number[] = [];
      for (let y = minY; y <= maxY; y++) out.push(y);
      return out;
    })();

    const monthNames = Array.from({ length: 12 }, (_, m) =>
      new Date(state.viewYear, m, 1).toLocaleDateString(locale, { month: "long" }),
    );

    const rangeStart = rangeValue?.[0] ?? null;
    const rangeEnd = rangeValue?.[1] ?? null;

    const dayInRange = (d: Date) => {
      if (mode !== "range" || !rangeStart || !rangeEnd) return false;
      return d >= rangeStart && d <= rangeEnd;
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
          {showYearMonthDropdowns ? (
            <div className="wui-calendar__dropdowns">
              <select
                className="wui-calendar__select"
                aria-label="Select month"
                value={state.viewMonth}
                onChange={(e) => dispatch({ type: "SET_MONTH", month: Number(e.target.value) })}
              >
                {monthNames.map((name, i) => (
                  <option key={i} value={i}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                className="wui-calendar__select"
                aria-label="Select year"
                value={state.viewYear}
                onChange={(e) => dispatch({ type: "SET_YEAR", year: Number(e.target.value) })}
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="wui-calendar__title" id={`${calendarId}-title`}>
              {monthLabel}
            </span>
          )}
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
                  const isStart = rangeStart ? isSameDay(day, rangeStart) : false;
                  const isEnd = rangeEnd ? isSameDay(day, rangeEnd) : false;
                  const inRange = dayInRange(day);
                  const info: CalendarDayInfo = {
                    isToday: isToday(day),
                    isSelected: selected || isStart || isEnd,
                    isOutsideMonth: outside,
                    isDisabled: dayDisabled,
                    isInRange: inRange,
                    isRangeStart: isStart,
                    isRangeEnd: isEnd,
                  };
                  return (
                    <td key={day.toISOString()} className="wui-calendar__day">
                      <button
                        ref={(el) => {
                          if (el) dayButtonRefs.current.set(toKey(day), el);
                          else dayButtonRefs.current.delete(toKey(day));
                        }}
                        type="button"
                        className="wui-calendar__day-btn"
                        data-selected={info.isSelected || undefined}
                        data-today={info.isToday || undefined}
                        data-outside={outside || undefined}
                        data-disabled={dayDisabled || undefined}
                        data-in-range={inRange || undefined}
                        data-range-start={isStart || undefined}
                        data-range-end={isEnd || undefined}
                        disabled={dayDisabled}
                        aria-label={dayLabelFormatter.format(day)}
                        aria-selected={info.isSelected}
                        onClick={() => handleDayClick(day)}
                        onKeyDown={(e) => handleDayKeyDown(e, day)}
                        tabIndex={info.isSelected ? 0 : -1}
                      >
                        {renderDay ? renderDay(day, info) : day.getDate()}
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
