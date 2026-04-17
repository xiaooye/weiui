"use client";
import { forwardRef, useState, useRef, useId, type MutableRefObject } from "react";
import { cn } from "../../utils/cn";
import { useOutsideClick, useFloatingMenu } from "@weiui/headless";
import { Calendar } from "../Calendar";
import { Portal } from "../Portal";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
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
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const calendarId = useId();

    const { refs, floatingStyles } = useFloatingMenu({
      open: isOpen,
      placement: "bottom-start",
      offsetPx: 4,
      collisionPadding: 8,
    });

    const floatingRef = useRef<HTMLDivElement | null>(null);
    useOutsideClick(floatingRef, () => setIsOpen(false), isOpen, containerRef);

    const displayValue = value
      ? value.toLocaleDateString(locale, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

    const setTriggerRef = (el: HTMLButtonElement | null) => {
      refs.setReference(el);
    };

    const setFloatingRef = (el: HTMLDivElement | null) => {
      (floatingRef as MutableRefObject<HTMLDivElement | null>).current = el;
      refs.setFloating(el);
    };

    return (
      <div
        ref={ref}
        className={cn("wui-date-picker", className)}
        data-disabled={disabled || undefined}
      >
        <div ref={containerRef}>
          <button
            ref={setTriggerRef}
            type="button"
            className="wui-date-picker__trigger"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={calendarId}
            aria-label={label}
          >
            {displayValue || (
              <span className="wui-date-picker__placeholder">{placeholder}</span>
            )}
          </button>
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
                <Calendar
                  value={value}
                  onChange={(date) => {
                    onChange?.(date);
                    setIsOpen(false);
                  }}
                  minDate={minDate}
                  maxDate={maxDate}
                  locale={locale}
                  firstDayOfWeek={firstDayOfWeek}
                  isDateDisabled={isDateDisabled}
                />
              </div>
            </Portal>
          )}
        </div>
      </div>
    );
  },
);
DatePicker.displayName = "DatePicker";
