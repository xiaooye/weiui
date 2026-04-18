"use client";
import { forwardRef, useCallback, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useControllable } from "@weiui/headless";
import { cn } from "../../utils/cn";
import { useFieldContext, computeFieldDescribedBy } from "../Field/Field";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  /** Marks the input as invalid. Falls back to the parent `<Field>` error state when omitted. */
  invalid?: boolean;
  /** Visual size. Controls height, padding, and font size. */
  size?: "sm" | "md" | "lg";
  /** Content rendered inside the input wrapper, before the input (prefix, icon, unit). */
  startAddon?: ReactNode;
  /** Content rendered inside the input wrapper, after the input (suffix, button, unit). */
  endAddon?: ReactNode;
  /** Shows an inline clear button when the input has content. */
  clearable?: boolean;
  /** Text/node rendered inline before the input (e.g. "$"). */
  prefix?: ReactNode;
  /** Text/node rendered inline after the input (e.g. ".00"). */
  suffix?: ReactNode;
  /** Shows a character counter when `maxLength` is set. */
  showCount?: boolean;
  /**
   * When `type="password"`, renders a show/hide toggle button inside the input.
   * Toggle announces with `aria-pressed` and swaps `aria-label` between
   * "Show password" / "Hide password".
   */
  revealable?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      invalid,
      size = "md",
      startAddon,
      endAddon,
      clearable,
      prefix,
      suffix,
      showCount,
      revealable,
      type,
      value,
      defaultValue,
      onChange,
      maxLength,
      ...props
    },
    ref,
  ) => {
    const ctx = useFieldContext();
    const sizeClass = size === "sm" ? "wui-input--sm" : size === "lg" ? "wui-input--lg" : "";
    const hasAddons = Boolean(startAddon || endAddon);
    const showReveal = Boolean(revealable && type === "password");
    const hasGroupChrome = Boolean(hasAddons || clearable || prefix || suffix || showCount || showReveal);
    const [revealed, setRevealed] = useState(false);
    const resolvedType = showReveal && revealed ? "text" : type;

    const innerRef = useRef<HTMLInputElement | null>(null);
    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref && typeof ref === "object") (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      },
      [ref],
    );

    const [internalValue, setInternalValue] = useControllable<string>({
      value: value as string | undefined,
      defaultValue: (defaultValue as string | undefined) ?? "",
      onChange: undefined,
    });

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        setInternalValue(e.target.value);
        onChange?.(e);
      },
      [onChange, setInternalValue],
    );

    const handleClear = useCallback(() => {
      const input = innerRef.current;
      if (!input) return;
      // Use native setter so controlled consumers receive a proper event.
      const proto = Object.getPrototypeOf(input) as typeof HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      if (setter) setter.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      // Synthesize change for React consumers that listen via onChange.
      const event = new Event("change", { bubbles: true });
      input.dispatchEvent(event);
      setInternalValue("");
      input.focus();
    }, [setInternalValue]);

    // Field context auto-wires id, aria-describedby, aria-invalid when not explicitly set.
    const resolvedId = props.id ?? ctx?.fieldId;
    const resolvedDescribedBy = computeFieldDescribedBy(ctx, props["aria-describedby"] as string | undefined);
    const resolvedInvalid = invalid ?? ctx?.hasError ?? undefined;
    const resolvedDisabled = props.disabled ?? ctx?.disabled;

    const currentValue = internalValue ?? "";
    const showClear = clearable && typeof currentValue === "string" && currentValue.length > 0 && !resolvedDisabled && !props.readOnly;
    const countValue = currentValue.length;

    const inputEl = (
      <input
        ref={setRefs}
        className={cn(
          "wui-input",
          sizeClass,
          resolvedDisabled && "wui-input--disabled",
          (hasAddons || hasGroupChrome) && "wui-input--with-addons",
          !hasGroupChrome && className,
        )}
        type={resolvedType}
        aria-invalid={resolvedInvalid || undefined}
        data-invalid={resolvedInvalid || undefined}
        aria-describedby={resolvedDescribedBy}
        value={value as string | undefined}
        defaultValue={defaultValue as string | undefined}
        onChange={handleChange}
        maxLength={maxLength}
        {...props}
        disabled={resolvedDisabled}
        id={resolvedId}
      />
    );

    if (!hasGroupChrome) return inputEl;

    return (
      <div
        className={cn("wui-input-group", sizeClass, className)}
        data-invalid={resolvedInvalid || undefined}
      >
        {startAddon && <span className="wui-input-group__addon">{startAddon}</span>}
        {prefix && <span className="wui-input-group__prefix">{prefix}</span>}
        {inputEl}
        {showCount && (
          <span className="wui-input-group__count" aria-live="polite">
            {countValue}
            {maxLength !== undefined ? ` / ${maxLength}` : ""}
          </span>
        )}
        {showClear && (
          <button
            type="button"
            aria-label="Clear input"
            className="wui-input-group__clear"
            onClick={handleClear}
            tabIndex={-1}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
        {showReveal && (
          <button
            type="button"
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            className="wui-input-group__reveal"
            onClick={() => setRevealed((v) => !v)}
          >
            {revealed ? (
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" x2="23" y1="1" y2="23" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
        {suffix && <span className="wui-input-group__suffix">{suffix}</span>}
        {endAddon && <span className="wui-input-group__addon">{endAddon}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";
