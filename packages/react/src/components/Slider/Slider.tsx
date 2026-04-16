"use client";
import { forwardRef, useState, useRef, useCallback, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface SliderProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  label?: string;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      min = 0,
      max = 100,
      step = 1,
      value: controlledValue,
      defaultValue = 0,
      onChange,
      disabled,
      label,
      className,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const value = controlledValue ?? internalValue;
    const trackRef = useRef<HTMLDivElement>(null);
    const percent = ((value - min) / (max - min)) * 100;

    const updateValue = useCallback(
      (clientX: number) => {
        if (!trackRef.current || disabled) return;
        const rect = trackRef.current.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const raw = min + ratio * (max - min);
        const stepped = Math.round(raw / step) * step;
        const clamped = Math.max(min, Math.min(max, stepped));
        if (controlledValue === undefined) setInternalValue(clamped);
        onChange?.(clamped);
      },
      [min, max, step, disabled, onChange, controlledValue],
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
      let newValue = value;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          newValue = Math.min(max, value + step);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          newValue = Math.max(min, value - step);
          break;
        case "Home":
          newValue = min;
          break;
        case "End":
          newValue = max;
          break;
        default:
          return;
      }
      e.preventDefault();
      if (controlledValue === undefined) setInternalValue(newValue);
      onChange?.(newValue);
    };

    return (
      <div
        ref={ref}
        className={cn("wui-slider", className)}
        data-disabled={disabled || undefined}
        onPointerDown={(e) => {
          updateValue(e.clientX);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (e.buttons > 0) updateValue(e.clientX);
        }}
        {...props}
      >
        <div ref={trackRef} className="wui-slider__track">
          <div className="wui-slider__fill" style={{ inlineSize: `${percent}%` }} />
          <div
            className="wui-slider__thumb"
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-label={label || "Slider"}
            aria-disabled={disabled || undefined}
            style={{ insetInlineStart: `${percent}%` }}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    );
  },
);
Slider.displayName = "Slider";
