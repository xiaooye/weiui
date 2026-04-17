"use client";
import { forwardRef, useRef, useState } from "react";
import { cn } from "../../utils/cn";

export interface InputOTPProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const InputOTP = forwardRef<HTMLDivElement, InputOTPProps>(
  (
    {
      length = 6,
      value: controlled,
      defaultValue = "",
      onChange,
      disabled,
      className,
    },
    ref,
  ) => {
    const [internal, setInternal] = useState(defaultValue.slice(0, length));
    const slots = controlled !== undefined ? controlled.slice(0, length) : internal;
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const update = (next: string) => {
      if (controlled === undefined) setInternal(next);
      onChange?.(next);
    };

    const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const char = e.target.value.slice(-1);
      if (!/^[0-9a-zA-Z]$/.test(char)) return;
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
      update(text);
      const focusIdx = Math.min(text.length, length - 1);
      inputRefs.current[focusIdx]?.focus();
    };

    return (
      <div ref={ref} className={cn("wui-input-otp", className)} role="group" aria-label="One-time password">
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
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
        ))}
      </div>
    );
  },
);
InputOTP.displayName = "InputOTP";
