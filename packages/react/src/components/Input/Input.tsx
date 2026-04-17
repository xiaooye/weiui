"use client";
import { forwardRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { useFieldContext, computeFieldDescribedBy } from "../Field/Field";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Marks the input as invalid. Falls back to the parent `<Field>` error state when omitted. */
  invalid?: boolean;
  /** Visual size. Controls height, padding, and font size. */
  size?: "sm" | "md" | "lg";
  /** Content rendered inside the input wrapper, before the input (prefix, icon, unit). */
  startAddon?: ReactNode;
  /** Content rendered inside the input wrapper, after the input (suffix, button, unit). */
  endAddon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, size = "md", startAddon, endAddon, ...props }, ref) => {
    const ctx = useFieldContext();
    const sizeClass = size === "sm" ? "wui-input--sm" : size === "lg" ? "wui-input--lg" : "";
    const hasAddons = Boolean(startAddon || endAddon);

    // Field context auto-wires id, aria-describedby, aria-invalid when not explicitly set.
    const resolvedId = props.id ?? ctx?.fieldId;
    const resolvedDescribedBy = computeFieldDescribedBy(ctx, props["aria-describedby"] as string | undefined);
    const resolvedInvalid = invalid ?? ctx?.hasError ?? undefined;

    const inputEl = (
      <input
        ref={ref}
        className={cn(
          "wui-input",
          sizeClass,
          props.disabled && "wui-input--disabled",
          hasAddons && "wui-input--with-addons",
          !hasAddons && className,
        )}
        aria-invalid={resolvedInvalid || undefined}
        data-invalid={resolvedInvalid || undefined}
        aria-describedby={resolvedDescribedBy}
        {...props}
        id={resolvedId}
      />
    );

    if (!hasAddons) return inputEl;

    return (
      <div
        className={cn("wui-input-group", sizeClass, className)}
        data-invalid={resolvedInvalid || undefined}
      >
        {startAddon && <span className="wui-input-group__addon">{startAddon}</span>}
        {inputEl}
        {endAddon && <span className="wui-input-group__addon">{endAddon}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";
