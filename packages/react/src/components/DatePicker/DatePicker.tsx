"use client";
import { forwardRef, useState, useRef, useId } from "react";
import { cn } from "../../utils/cn";
import { useOutsideClick } from "@weiui/headless";
import { Calendar } from "../Calendar";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  label?: string;
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
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const calendarId = useId();

    useOutsideClick(containerRef, () => setIsOpen(false), isOpen);

    const displayValue = value
      ? value.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

    return (
      <div
        ref={ref}
        className={cn("wui-date-picker", className)}
        data-disabled={disabled || undefined}
      >
        <div ref={containerRef}>
          <button
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
            <div
              className="wui-date-picker__dropdown"
              id={calendarId}
              role="dialog"
              aria-label="Choose date"
            >
              <Calendar
                value={value}
                onChange={(date) => {
                  onChange?.(date);
                  setIsOpen(false);
                }}
                minDate={minDate}
                maxDate={maxDate}
              />
            </div>
          )}
        </div>
      </div>
    );
  },
);
DatePicker.displayName = "DatePicker";
