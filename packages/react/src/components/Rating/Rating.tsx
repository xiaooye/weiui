"use client";
import { forwardRef, useState, useRef } from "react";
import { cn } from "../../utils/cn";

export interface RatingProps {
  value?: number;
  defaultValue?: number;
  max?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
  className?: string;
}

export const Rating = forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value: controlled,
      defaultValue = 0,
      max = 5,
      onChange,
      disabled,
      readOnly,
      label,
      className,
    },
    ref,
  ) => {
    const [internal, setInternal] = useState(defaultValue);
    const value = controlled ?? internal;
    const starsRef = useRef<(HTMLButtonElement | null)[]>([]);

    const setValue = (v: number) => {
      if (disabled || readOnly) return;
      if (controlled === undefined) setInternal(v);
      onChange?.(v);
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
      if (disabled || readOnly) return;
      let target = index;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          target = Math.min(index + 1, max - 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          target = Math.max(index - 1, 0);
          break;
        case "Home":
          target = 0;
          break;
        case "End":
          target = max - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      setValue(target + 1);
      starsRef.current[target]?.focus();
    };

    return (
      <div
        ref={ref}
        className={cn("wui-rating", className)}
        role="radiogroup"
        aria-label={label || "Rating"}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
      >
        {Array.from({ length: max }, (_, i) => (
          <button
            key={i}
            ref={(el) => { starsRef.current[i] = el; }}
            type="button"
            className="wui-rating__star"
            data-filled={i < value || undefined}
            role="radio"
            aria-checked={i + 1 === value}
            aria-label={`${i + 1} star${i === 0 ? "" : "s"}`}
            onClick={() => setValue(i + 1)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            tabIndex={i + 1 === value || (value === 0 && i === 0) ? 0 : -1}
            disabled={disabled}
          >
            {i < value ? "\u2605" : "\u2606"}
          </button>
        ))}
      </div>
    );
  },
);
Rating.displayName = "Rating";
