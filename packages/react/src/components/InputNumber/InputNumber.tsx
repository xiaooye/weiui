"use client";
import { forwardRef, useState, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface InputNumberProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
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
      className,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = useState(defaultValue);
    const value = controlled ?? internal;

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
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseFloat(e.target.value);
      if (!isNaN(parsed)) update(parsed);
    };

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
        <input
          type="number"
          className="wui-input-number__input"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label="Number input"
        />
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
