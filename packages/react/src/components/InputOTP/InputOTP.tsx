"use client";
import { Fragment, forwardRef, useRef, useState } from "react";
import { cn } from "../../utils/cn";

export type InputOTPPattern = "numeric" | "alphanumeric" | RegExp;

export interface InputOTPProps {
  /** Number of character slots. @default 6 */
  length?: number;
  /** Controlled value. Pair with onChange. */
  value?: string;
  /** Initial value for uncontrolled mode. */
  defaultValue?: string;
  /** Called when the value changes. */
  onChange?: (value: string) => void;
  /** Fires when all `length` slots are filled. Receives the complete value. */
  onComplete?: (value: string) => void;
  /** Restrict input to numeric, alphanumeric, or a custom RegExp per character. */
  pattern?: InputOTPPattern;
  /** Split slots into visual groups separated by a dash, e.g. `[3, 3]` → `123-456`. */
  groups?: number[];
  /** Disables interaction and applies the disabled styling. */
  disabled?: boolean;
  /** Additional CSS classes merged onto the root element. */
  className?: string;
}

const PATTERNS: Record<string, RegExp> = {
  numeric: /^[0-9]$/,
  alphanumeric: /^[0-9a-zA-Z]$/,
};

function patternFor(p: InputOTPPattern | undefined): RegExp {
  if (!p) return PATTERNS.numeric!;
  if (p instanceof RegExp) return p;
  return PATTERNS[p] ?? PATTERNS.numeric!;
}

export const InputOTP = forwardRef<HTMLDivElement, InputOTPProps>(
  (
    {
      length = 6,
      value: controlled,
      defaultValue = "",
      onChange,
      onComplete,
      pattern,
      groups,
      disabled,
      className,
    },
    ref,
  ) => {
    const [internal, setInternal] = useState(defaultValue.slice(0, length));
    const slots = controlled !== undefined ? controlled.slice(0, length) : internal;
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const rule = patternFor(pattern);

    const update = (next: string) => {
      const safe = next.slice(0, length);
      if (controlled === undefined) setInternal(safe);
      onChange?.(safe);
      if (safe.length === length && onComplete) onComplete(safe);
    };

    const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const char = e.target.value.slice(-1);
      if (!rule.test(char)) return;
      const arr = slots.split("");
      arr[i] = char;
      const next = arr.join("").slice(0, length);
      update(next);
      if (i + 1 < length) inputRefs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        const arr = slots.split("");
        if (arr[i]) {
          arr[i] = "";
          update(arr.join(""));
        } else if (i > 0) {
          arr[i - 1] = "";
          update(arr.join(""));
          inputRefs.current[i - 1]?.focus();
        }
      } else if (e.key === "ArrowLeft" && i > 0) {
        e.preventDefault();
        inputRefs.current[i - 1]?.focus();
      } else if (e.key === "ArrowRight" && i < length - 1) {
        e.preventDefault();
        inputRefs.current[i + 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text").replace(/\s/g, "").slice(0, length);
      // Apply pattern: filter out chars that don't match
      const filtered = text.split("").filter((ch) => rule.test(ch)).join("").slice(0, length);
      update(filtered);
      const focusIdx = Math.min(filtered.length, length - 1);
      inputRefs.current[focusIdx]?.focus();
    };

    // Compute group boundaries — indices that should show a separator *after* them.
    const separatorAfter = new Set<number>();
    if (groups && groups.length > 1) {
      let acc = 0;
      for (let k = 0; k < groups.length - 1; k++) {
        acc += groups[k]!;
        separatorAfter.add(acc - 1);
      }
    }

    return (
      <div ref={ref} className={cn("wui-input-otp", className)} role="group" aria-label="One-time password">
        {Array.from({ length }, (_, i) => (
          <Fragment key={i}>
            <input
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode={pattern === "alphanumeric" || pattern instanceof RegExp ? "text" : "numeric"}
              maxLength={1}
              className="wui-input-otp__slot"
              value={slots[i] ?? ""}
              disabled={disabled}
              aria-label={`Digit ${i + 1}`}
              autoComplete={i === 0 ? "one-time-code" : undefined}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
            />
            {separatorAfter.has(i) && (
              <span className="wui-input-otp__separator" aria-hidden="true">
                -
              </span>
            )}
          </Fragment>
        ))}
      </div>
    );
  },
);
InputOTP.displayName = "InputOTP";
