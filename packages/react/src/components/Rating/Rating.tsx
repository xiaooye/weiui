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
  /** When true, clicking the left half of a star sets value to N - 0.5. */
  allowHalf?: boolean;
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
      allowHalf = false,
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

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
      if (disabled || readOnly) return;
      const full = index + 1;
      if (!allowHalf) {
        setValue(full);
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      // Use inline-start half → N - 0.5; inline-end half → full N.
      // getBoundingClientRect is viewport-origin, so left is physical; for
      // RTL documents the "first half" in the reading order is still index 0..N/2,
      // but the visible left half matches that because we reverse layout via flex.
      const localX = e.clientX - rect.left;
      const isLeftHalf = localX < rect.width / 2;
      setValue(isLeftHalf ? full - 0.5 : full);
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
      if (disabled || readOnly) return;
      const step = allowHalf ? 0.5 : 1;
      const isIncrease = e.key === "ArrowRight" || e.key === "ArrowDown";
      const isDecrease = e.key === "ArrowLeft" || e.key === "ArrowUp";

      if (isIncrease || isDecrease) {
        e.preventDefault();
        const next = isIncrease
          ? Math.min(value + step, max)
          : Math.max(value - step, 0);
        setValue(next);
        const focusIndex = Math.max(0, Math.ceil(next) - 1);
        starsRef.current[focusIndex]?.focus();
        return;
      }

      if (e.key === "Home") {
        e.preventDefault();
        setValue(allowHalf ? 0.5 : 1);
        starsRef.current[0]?.focus();
        return;
      }
      if (e.key === "End") {
        e.preventDefault();
        setValue(max);
        starsRef.current[max - 1]?.focus();
        return;
      }
      // Unused index parameter kept for signature stability when roving focus is needed.
      void index;
    };

    // Focusable index: the star that represents the current value.
    const activeIdx = value === 0 ? 0 : Math.max(0, Math.ceil(value) - 1);

    return (
      <div
        ref={ref}
        className={cn("wui-rating", className)}
        role="radiogroup"
        aria-label={label || "Rating"}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
      >
        {Array.from({ length: max }, (_, i) => {
          const full = i + 1;
          const isFilled = i < Math.floor(value);
          const isHalf = allowHalf && value - i === 0.5;
          return (
            <button
              key={i}
              ref={(el) => {
                starsRef.current[i] = el;
              }}
              type="button"
              className="wui-rating__star"
              data-filled={isFilled || undefined}
              data-half={isHalf || undefined}
              role="radio"
              aria-checked={full === value}
              aria-label={
                allowHalf && isHalf
                  ? `${value} stars`
                  : `${full} star${i === 0 ? "" : "s"}`
              }
              onClick={(e) => handleClick(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              tabIndex={i === activeIdx ? 0 : -1}
              disabled={disabled}
            >
              {isFilled || isHalf ? "\u2605" : "\u2606"}
            </button>
          );
        })}
      </div>
    );
  },
);
Rating.displayName = "Rating";
