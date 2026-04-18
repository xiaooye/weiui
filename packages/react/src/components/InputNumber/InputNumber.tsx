"use client";
import { forwardRef, useMemo, useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface InputNumberProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "prefix"> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  formatOptions?: Intl.NumberFormatOptions;
  locale?: string;
  /** Text/node rendered inline before the number input. */
  prefix?: ReactNode;
  /** Text/node rendered inline after the number input. */
  suffix?: ReactNode;
}

export const InputNumber = forwardRef<HTMLDivElement, InputNumberProps>(
  (
    {
      min = -Infinity,
      max = Infinity,
      step = 1,
      value: controlled,
      defaultValue = 0,
      onChange,
      disabled,
      formatOptions,
      locale = "en-US",
      prefix,
      suffix,
      className,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = useState(defaultValue);
    const value = controlled ?? internal;

    const formatter = useMemo(
      () => (formatOptions ? new Intl.NumberFormat(locale, formatOptions) : null),
      [formatOptions, locale],
    );

    const clamp = (v: number) => Math.max(min, Math.min(max, v));

    const update = (next: number) => {
      const clamped = clamp(next);
      if (controlled === undefined) setInternal(clamped);
      onChange?.(clamped);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        update(value + step);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        update(value - step);
      } else if (e.key === "PageUp") {
        e.preventDefault();
        update(value + step * 10);
      } else if (e.key === "PageDown") {
        e.preventDefault();
        update(value - step * 10);
      } else if (e.key === "Home") {
        if (min !== -Infinity) {
          e.preventDefault();
          update(min);
        }
      } else if (e.key === "End") {
        if (max !== Infinity) {
          e.preventDefault();
          update(max);
        }
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9.\-]/g, "");
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) update(parsed);
    };

    const displayValue = formatter ? formatter.format(value) : value;

    return (
      <div
        ref={ref}
        className={cn("wui-input-number", className)}
        data-disabled={disabled || undefined}
        {...props}
      >
        <button
          type="button"
          className="wui-input-number__btn"
          aria-label="Decrement"
          onClick={() => update(value - step)}
          disabled={disabled || value <= min}
          tabIndex={-1}
        >
          −
        </button>
        {prefix && <span className="wui-input-number__affix">{prefix}</span>}
        <input
          type={formatter ? "text" : "number"}
          className="wui-input-number__input"
          value={displayValue}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label="Number input"
          role="spinbutton"
          aria-valuenow={value}
          aria-valuemin={min === -Infinity ? undefined : min}
          aria-valuemax={max === Infinity ? undefined : max}
          aria-valuetext={formatter ? formatter.format(value) : undefined}
        />
        {suffix && <span className="wui-input-number__affix">{suffix}</span>}
        <button
          type="button"
          className="wui-input-number__btn"
          aria-label="Increment"
          onClick={() => update(value + step)}
          disabled={disabled || value >= max}
          tabIndex={-1}
        >
          +
        </button>
      </div>
    );
  },
);
InputNumber.displayName = "InputNumber";
