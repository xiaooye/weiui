"use client";
import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  type HTMLAttributes,
} from "react";
import { cn } from "../../utils/cn";

type SliderValue = number | [number, number];

export interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  min?: number;
  max?: number;
  step?: number;
  mode?: "single" | "range";
  /**
   * Single-mode: a `number`. Range-mode: a `[number, number]` tuple.
   * Use `onChange` for single-mode; use `onRangeChange` for range-mode.
   */
  value?: SliderValue;
  defaultValue?: SliderValue;
  /** Called in single-mode when the value changes. */
  onChange?: (value: number) => void;
  /** Called in range-mode when either thumb moves. */
  onRangeChange?: (value: [number, number]) => void;
  disabled?: boolean;
  label?: string;
  showTooltip?: boolean;
  formatTooltip?: (value: number) => string;
}

const isRange = (v: SliderValue): v is [number, number] => Array.isArray(v);

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      min = 0,
      max = 100,
      step = 1,
      mode = "single",
      value: controlledValue,
      defaultValue,
      onChange,
      onRangeChange,
      disabled,
      label,
      showTooltip = false,
      formatTooltip,
      className,
      ...props
    },
    ref,
  ) => {
    const initial: SliderValue =
      defaultValue ?? (mode === "range" ? [min, max] : 0);
    const [internalValue, setInternalValue] = useState<SliderValue>(initial);
    const value = controlledValue ?? internalValue;
    const trackRef = useRef<HTMLDivElement>(null);
    const activeThumbRef = useRef<0 | 1>(0);
    const [hoveredThumb, setHoveredThumb] = useState<0 | 1 | null>(null);
    const [draggingThumb, setDraggingThumb] = useState<0 | 1 | null>(null);

    const clamp = (n: number) => {
      const stepped = Math.round(n / step) * step;
      return Math.max(min, Math.min(max, stepped));
    };
    const percent = (n: number) => ((n - min) / (max - min)) * 100;

    const commit = useCallback(
      (next: SliderValue) => {
        if (controlledValue === undefined) setInternalValue(next);
        if (isRange(next)) {
          onRangeChange?.(next);
        } else {
          onChange?.(next);
        }
      },
      [controlledValue, onChange, onRangeChange],
    );

    const valueFromPointer = useCallback(
      (clientX: number) => {
        if (!trackRef.current) return min;
        const rect = trackRef.current.getBoundingClientRect();
        const ratio = Math.max(
          0,
          Math.min(1, (clientX - rect.left) / rect.width),
        );
        return clamp(min + ratio * (max - min));
      },
      [min, max, step],
    );

    const updateFromPointer = useCallback(
      (clientX: number, thumb?: 0 | 1) => {
        if (disabled) return;
        const next = valueFromPointer(clientX);
        if (isRange(value)) {
          const idx =
            thumb ??
            (Math.abs(next - value[0]) <= Math.abs(next - value[1]) ? 0 : 1);
          activeThumbRef.current = idx;
          const pair: [number, number] = [...value];
          pair[idx] = next;
          // Keep [low, high] order
          if (pair[0] > pair[1]) pair.reverse();
          commit(pair);
        } else {
          commit(next);
        }
      },
      [disabled, valueFromPointer, value, commit],
    );

    const handleKeyDown = (thumb: 0 | 1) => (e: React.KeyboardEvent) => {
      if (disabled) return;
      const current = isRange(value) ? value[thumb] : (value as number);
      let next = current;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          next = Math.min(max, current + step);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          next = Math.max(min, current - step);
          break;
        case "Home":
          next = min;
          break;
        case "End":
          next = max;
          break;
        default:
          return;
      }
      e.preventDefault();
      if (isRange(value)) {
        const pair: [number, number] = [...value];
        pair[thumb] = next;
        if (pair[0] > pair[1]) pair.reverse();
        commit(pair);
      } else {
        commit(next);
      }
    };

    const renderThumb = (thumb: 0 | 1) => {
      const v = isRange(value) ? value[thumb] : (value as number);
      const pct = percent(v);
      const showTip =
        showTooltip && (hoveredThumb === thumb || draggingThumb === thumb);
      const tipText = formatTooltip ? formatTooltip(v) : String(v);
      return (
        <div
          key={thumb}
          className="wui-slider__thumb"
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuenow={v}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-label={
            label
              ? isRange(value)
                ? `${label} ${thumb === 0 ? "minimum" : "maximum"}`
                : label
              : "Slider"
          }
          aria-disabled={disabled || undefined}
          data-thumb={thumb}
          style={{ insetInlineStart: `${pct}%` }}
          onKeyDown={handleKeyDown(thumb)}
          onPointerEnter={() => setHoveredThumb(thumb)}
          onPointerLeave={() => setHoveredThumb((h) => (h === thumb ? null : h))}
          onFocus={() => setHoveredThumb(thumb)}
          onBlur={() => setHoveredThumb((h) => (h === thumb ? null : h))}
        >
          {showTip ? (
            <span className="wui-slider__tooltip" role="tooltip" aria-hidden>
              {tipText}
            </span>
          ) : null}
        </div>
      );
    };

    const fillStart = isRange(value) ? percent(value[0]) : 0;
    const fillEnd = isRange(value) ? percent(value[1]) : percent(value as number);

    return (
      <div
        ref={ref}
        className={cn("wui-slider", className)}
        data-disabled={disabled || undefined}
        data-mode={mode}
        onPointerDown={(e) => {
          if (disabled) return;
          if (isRange(value)) {
            updateFromPointer(e.clientX);
            setDraggingThumb(activeThumbRef.current);
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } else {
            updateFromPointer(e.clientX);
            setDraggingThumb(0);
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }
        }}
        onPointerMove={(e) => {
          if (disabled || e.buttons === 0 || draggingThumb === null) return;
          updateFromPointer(e.clientX, draggingThumb);
        }}
        onPointerUp={() => setDraggingThumb(null)}
        onPointerCancel={() => setDraggingThumb(null)}
        {...props}
      >
        <div ref={trackRef} className="wui-slider__track">
          <div
            className="wui-slider__fill"
            style={{
              insetInlineStart: `${fillStart}%`,
              inlineSize: `${fillEnd - fillStart}%`,
            }}
          />
          {renderThumb(0)}
          {isRange(value) ? renderThumb(1) : null}
        </div>
      </div>
    );
  },
);
Slider.displayName = "Slider";
