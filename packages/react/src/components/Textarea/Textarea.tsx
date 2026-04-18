"use client";
import { forwardRef, useCallback, useEffect, useRef, type ChangeEvent } from "react";
import { useControllable } from "@weiui/headless";
import { cn } from "../../utils/cn";
import { useFieldContext, computeFieldDescribedBy } from "../Field/Field";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
  /** Grow the textarea to fit its content, bounded by minRows/maxRows. */
  autosize?: boolean;
  /** Minimum visible rows when autosize is enabled. Defaults to 2. */
  minRows?: number;
  /** Maximum visible rows when autosize is enabled. Defaults to 10. */
  maxRows?: number;
  /** Show a character counter. Pair with `maxLength` for "X / N" format. */
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      invalid,
      size = "md",
      autosize,
      minRows = 2,
      maxRows = 10,
      showCount,
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
    const resolvedId = props.id ?? ctx?.fieldId;
    const resolvedDescribedBy = computeFieldDescribedBy(ctx, props["aria-describedby"] as string | undefined);
    const resolvedInvalid = invalid ?? ctx?.hasError ?? undefined;

    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref && typeof ref === "object") (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      },
      [ref],
    );

    const [internalValue, setInternalValue] = useControllable<string>({
      value: value as string | undefined,
      defaultValue: (defaultValue as string | undefined) ?? "",
      onChange: undefined,
    });

    const resize = useCallback(() => {
      if (!autosize) return;
      const ta = innerRef.current;
      if (!ta) return;
      const styles = typeof window !== "undefined" ? window.getComputedStyle(ta) : null;
      const lineHeight = styles ? parseFloat(styles.lineHeight) || 20 : 20;
      const paddingY =
        styles ? (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0) : 0;
      const borderY =
        styles ? (parseFloat(styles.borderTopWidth) || 0) + (parseFloat(styles.borderBottomWidth) || 0) : 0;
      ta.style.height = "auto";
      const scrollH = ta.scrollHeight;
      const minH = minRows * lineHeight + paddingY + borderY;
      const maxH = maxRows * lineHeight + paddingY + borderY;
      const clamped = Math.min(Math.max(scrollH, minH), maxH);
      ta.style.height = `${clamped}px`;
      ta.style.overflowY = scrollH > maxH ? "auto" : "hidden";
    }, [autosize, minRows, maxRows]);

    useEffect(() => {
      if (autosize) resize();
    }, [autosize, resize, internalValue]);

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        setInternalValue(e.target.value);
        onChange?.(e);
        if (autosize) resize();
      },
      [autosize, onChange, resize, setInternalValue],
    );

    const currentValue = internalValue ?? "";
    const countValue = typeof currentValue === "string" ? currentValue.length : 0;

    const textareaEl = (
      <textarea
        ref={setRefs}
        className={cn("wui-input", sizeClass, showCount ? "wui-textarea--with-count" : className)}
        aria-invalid={resolvedInvalid || undefined}
        data-invalid={resolvedInvalid || undefined}
        aria-describedby={resolvedDescribedBy}
        value={value as string | undefined}
        defaultValue={defaultValue as string | undefined}
        onChange={handleChange}
        onInput={autosize ? resize : undefined}
        maxLength={maxLength}
        rows={autosize ? minRows : props.rows}
        {...props}
        id={resolvedId}
      />
    );

    if (!showCount) return textareaEl;

    return (
      <div className={cn("wui-textarea-wrapper", className)}>
        {textareaEl}
        <span className="wui-textarea__count" aria-live="polite">
          {countValue}
          {maxLength !== undefined ? ` / ${maxLength}` : ""}
        </span>
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
