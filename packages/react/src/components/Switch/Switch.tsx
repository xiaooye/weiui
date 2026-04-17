"use client";
import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { useFieldContext, computeFieldDescribedBy } from "../Field/Field";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className, id, invalid, size = "md", ...props }, ref) => {
    const generatedId = useId();
    const ctx = useFieldContext();
    const inputId = id ?? ctx?.fieldId ?? generatedId;
    const describedBy = computeFieldDescribedBy(ctx, props["aria-describedby"] as string | undefined);
    const resolvedInvalid = invalid ?? ctx?.hasError ?? undefined;
    const sizeClass = size === "sm" ? "wui-switch--sm" : size === "lg" ? "wui-switch--lg" : "";
    return (
      <div className={cn("wui-switch", sizeClass, className)}>
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={inputId}
          className="wui-switch__input"
          aria-invalid={resolvedInvalid || undefined}
          data-invalid={resolvedInvalid || undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {label && (
          <label htmlFor={inputId} className="wui-switch__label">
            {label}
          </label>
        )}
      </div>
    );
  },
);
Switch.displayName = "Switch";
