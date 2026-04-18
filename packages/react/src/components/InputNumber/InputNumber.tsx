"use client";
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";

export interface InputNumberProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "prefix"> {
  /** Minimum value. @default -Infinity */
  min?: number;
  /** Maximum value. @default Infinity */
  max?: number;
  /** Step increment for +/- buttons and arrow keys. @default 1 */
  step?: number;
  /** Controlled value. Pair with onChange. */
  value?: number;
  /** Initial value for uncontrolled mode. @default 0 */
  defaultValue?: number;
  /** Called when the value changes. */
  onChange?: (value: number) => void;
  /** Disables interaction and applies the disabled styling. */
  disabled?: boolean;
  /** Intl.NumberFormat options applied when formatting the displayed value. */
  formatOptions?: Intl.NumberFormatOptions;
  /** BCP 47 locale used by Intl.NumberFormat for display. */
  locale?: string;
  /** Text/node rendered inline before the number input. */
  prefix?: ReactNode;
  /** Text/node rendered inline after the number input. */
  suffix?: ReactNode;
  /**
   * Returns a human-readable string used for `aria-valuetext`. Overrides the
   * formatter-derived default so SRs can announce "5 dollars" instead of "5".
   */
  formatValueText?: (value: number) => string;
}

/**
 * Returns true when `raw` is in a committable state (can be parsed to a finite
 * number that fully represents the user's input). Partial strings like `-`,
 * `.`, `-.`, or trailing-decimal `12.` return false so we keep them visible
 * without clobbering.
 */
function isCommittable(raw: string): boolean {
  if (raw === "" || raw === "-" || raw === "." || raw === "-.") return false;
  if (raw.endsWith(".")) return false;
  const n = Number(raw);
  return Number.isFinite(n);
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
      formatValueText,
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

    // Display string — what's visible in the input. Lets us preserve partial
    // typing like "-" or "1." while the consumer's numeric `value` stays in
    // sync with the last committable parse.
    const formatValue = (v: number) => (formatter ? formatter.format(v) : String(v));
    const [displayValue, setDisplayValue] = useState(() => formatValue(value));
    const isFocused = useRef(false);

    // Resync display when the numeric value changes externally (controlled
    // prop update, stepper click, keyboard arrow) but never while typing —
    // that would clobber the user's partial string.
    useEffect(() => {
      if (!isFocused.current) setDisplayValue(formatValue(value));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, formatter]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const next = clamp(value + step);
        update(next);
        setDisplayValue(formatValue(next));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = clamp(value - step);
        update(next);
        setDisplayValue(formatValue(next));
      } else if (e.key === "PageUp") {
        e.preventDefault();
        const next = clamp(value + step * 10);
        update(next);
        setDisplayValue(formatValue(next));
      } else if (e.key === "PageDown") {
        e.preventDefault();
        const next = clamp(value - step * 10);
        update(next);
        setDisplayValue(formatValue(next));
      } else if (e.key === "Home") {
        if (min !== -Infinity) {
          e.preventDefault();
          update(min);
          setDisplayValue(formatValue(min));
        }
      } else if (e.key === "End") {
        if (max !== Infinity) {
          e.preventDefault();
          update(max);
          setDisplayValue(formatValue(max));
        }
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Preserve the exact typed string so partial states like "-" or "1." stay visible.
      setDisplayValue(raw);
      // Commit only when the string is a complete, parseable number.
      if (isCommittable(raw)) {
        const parsed = Number(raw);
        update(parsed);
      }
    };

    const handleFocus = () => {
      isFocused.current = true;
    };

    const handleBlur = () => {
      isFocused.current = false;
      // Normalise display on blur — empty / partial strings snap back to the
      // canonical formatted numeric value.
      setDisplayValue(formatValue(value));
    };

    const ariaValueText = formatValueText
      ? formatValueText(value)
      : formatter
        ? formatter.format(value)
        : undefined;

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
          onClick={() => {
            const next = clamp(value - step);
            update(next);
            setDisplayValue(formatValue(next));
          }}
          disabled={disabled || value <= min}
          tabIndex={-1}
        >
          −
        </button>
        {prefix && <span className="wui-input-number__affix">{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          className="wui-input-number__input"
          value={displayValue}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label="Number input"
          role="spinbutton"
          aria-valuenow={value}
          aria-valuemin={min === -Infinity ? undefined : min}
          aria-valuemax={max === Infinity ? undefined : max}
          aria-valuetext={ariaValueText}
        />
        {suffix && <span className="wui-input-number__affix">{suffix}</span>}
        <button
          type="button"
          className="wui-input-number__btn"
          aria-label="Increment"
          onClick={() => {
            const next = clamp(value + step);
            update(next);
            setDisplayValue(formatValue(next));
          }}
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
