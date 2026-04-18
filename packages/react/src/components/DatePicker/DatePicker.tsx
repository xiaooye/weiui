"use client";
import {
  forwardRef,
  useState,
  useRef,
  useId,
  useMemo,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { useOutsideClick, useFloatingMenu } from "@weiui/headless";
import { Calendar } from "../Calendar";
import { Portal } from "../Portal";

export interface DatePickerPreset {
  label: string;
  value: Date | [Date, Date];
}

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  label?: string;
  /** BCP 47 locale tag. Defaults to "en-US". */
  locale?: string;
  /** 0=Sunday ... 6=Saturday. Defaults to 0. */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Optional predicate to disable arbitrary dates in the calendar. */
  isDateDisabled?: (date: Date) => boolean;
  /** Visual variant. `trigger` is button-style, `input` exposes a typed input. */
  variant?: "trigger" | "input";
  /** "single" for a single date, "range" for start+end tuple. */
  mode?: "single" | "range";
  /** Range-mode value. */
  rangeValue?: [Date | null, Date | null];
  /** Fires in range mode when a complete range is selected. */
  onRangeChange?: (range: [Date, Date]) => void;
  /** Preset chips rendered above the calendar. */
  presets?: DatePickerPreset[];
  /** Shows a clear button that resets the value. */
  clearable?: boolean;
  /** Enables year + month dropdowns in the calendar header. */
  showYearMonthDropdowns?: boolean;
  /** Form field name. Renders a hidden input for form submit. */
  name?: string;
  /** Custom content slot above the calendar. */
  topSlot?: ReactNode;
}

function formatDate(d: Date, locale: string) {
  return d.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function parseTypedDate(input: string): Date | null {
  if (!input) return null;
  const trimmed = input.trim();
  const slash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (slash) {
    const [, mm, dd, yyyy] = slash;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(d.getTime()) ? null : d;
  }
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (iso) {
    const [, yyyy, mm, dd] = iso;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = "Select date...",
      disabled,
      minDate,
      maxDate,
      className,
      label,
      locale = "en-US",
      firstDayOfWeek,
      isDateDisabled,
      variant = "trigger",
      mode = "single",
      rangeValue,
      onRangeChange,
      presets,
      clearable,
      showYearMonthDropdowns,
      name,
      topSlot,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const calendarId = useId();
    const [typedValue, setTypedValue] = useState(value ? formatDate(value, locale) : "");
    const [pendingRange, setPendingRange] = useState<[Date | null, Date | null]>(
      rangeValue ?? [null, null],
    );

    const { refs, floatingStyles } = useFloatingMenu({
      open: isOpen,
      placement: "bottom-start",
      offsetPx: 4,
      collisionPadding: 8,
    });

    const floatingRef = useRef<HTMLDivElement | null>(null);
    useOutsideClick(floatingRef, () => setIsOpen(false), isOpen, containerRef);

    const displayValue = value ? formatDate(value, locale) : null;

    const setFloatingRef = (el: HTMLDivElement | null) => {
      (floatingRef as MutableRefObject<HTMLDivElement | null>).current = el;
      refs.setFloating(el);
    };

    const handlePresetClick = (preset: DatePickerPreset) => {
      if (Array.isArray(preset.value)) {
        setPendingRange([preset.value[0], preset.value[1]]);
        onRangeChange?.([preset.value[0], preset.value[1]]);
      } else {
        onChange?.(preset.value);
      }
      setIsOpen(false);
    };

    const hiddenValue = useMemo(() => {
      if (mode === "range") {
        const r = rangeValue ?? pendingRange;
        const a = r[0] ? r[0].toISOString() : "";
        const b = r[1] ? r[1].toISOString() : "";
        return `${a},${b}`;
      }
      return value ? value.toISOString() : "";
    }, [mode, rangeValue, pendingRange, value]);

    const calendar = (
      <>
        {topSlot}
        {presets && presets.length > 0 && (
          <div className="wui-date-picker__presets" role="group" aria-label="Presets">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                className="wui-date-picker__preset"
                onClick={() => handlePresetClick(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
        <Calendar
          value={mode === "single" ? value : undefined}
          rangeValue={mode === "range" ? (rangeValue ?? pendingRange) : undefined}
          mode={mode}
          onChange={(date) => {
            onChange?.(date);
            setTypedValue(formatDate(date, locale));
            setIsOpen(false);
          }}
          onRangeChange={(range) => {
            setPendingRange(range);
            onRangeChange?.(range);
            if (range[0] && range[1]) setIsOpen(false);
          }}
          minDate={minDate}
          maxDate={maxDate}
          locale={locale}
          firstDayOfWeek={firstDayOfWeek}
          isDateDisabled={isDateDisabled}
          showYearMonthDropdowns={showYearMonthDropdowns}
        />
      </>
    );

    const renderTrigger = () => {
      if (variant === "input") {
        return (
          <div
            ref={refs.setReference as unknown as React.RefCallback<HTMLDivElement>}
            className="wui-date-picker__input-wrapper"
          >
            <input
              type="text"
              className="wui-date-picker__input"
              placeholder={placeholder}
              disabled={disabled}
              aria-label={label}
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              onBlur={() => {
                const parsed = parseTypedDate(typedValue);
                if (parsed) onChange?.(parsed);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const parsed = parseTypedDate(typedValue);
                  if (parsed) onChange?.(parsed);
                }
              }}
              onFocus={() => setIsOpen(true)}
            />
            {clearable && (typedValue || value) && (
              <button
                type="button"
                className="wui-date-picker__clear"
                aria-label="Clear date"
                onClick={() => {
                  setTypedValue("");
                  onChange?.(null);
                }}
                tabIndex={-1}
              >
                &times;
              </button>
            )}
          </div>
        );
      }
      return (
        <div className="wui-date-picker__trigger-row">
          <button
            ref={refs.setReference}
            type="button"
            className="wui-date-picker__trigger"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={calendarId}
            aria-label={label}
          >
            {displayValue || <span className="wui-date-picker__placeholder">{placeholder}</span>}
          </button>
          {clearable && value && (
            <button
              type="button"
              className="wui-date-picker__clear"
              aria-label="Clear date"
              onClick={() => onChange?.(null)}
              tabIndex={-1}
            >
              &times;
            </button>
          )}
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={cn("wui-date-picker", className)}
        data-disabled={disabled || undefined}
      >
        <div ref={containerRef}>
          {renderTrigger()}
          {name && <input type="hidden" name={name} value={hiddenValue} readOnly />}
          {isOpen && (
            <Portal>
              <div
                ref={setFloatingRef}
                className="wui-date-picker__dropdown"
                id={calendarId}
                role="dialog"
                aria-label="Choose date"
                style={floatingStyles}
              >
                {calendar}
              </div>
            </Portal>
          )}
        </div>
      </div>
    );
  },
);
DatePicker.displayName = "DatePicker";
