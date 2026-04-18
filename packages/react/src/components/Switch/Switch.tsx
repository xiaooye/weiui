"use client";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { useFieldContext, computeFieldDescribedBy } from "../Field/Field";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Visible label rendered next to the switch. */
  label?: string;
  /** Marks the switch as invalid. Falls back to the parent `<Field>` error state when omitted. */
  invalid?: boolean;
  /** Visual size. Controls the track and thumb dimensions. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Decorative label rendered inside the track when the switch is on. */
  onLabel?: ReactNode;
  /** Decorative label rendered inside the track when the switch is off. */
  offLabel?: ReactNode;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className, id, invalid, size = "md", onLabel, offLabel, ...props }, ref) => {
    const generatedId = useId();
    const ctx = useFieldContext();
    const inputId = id ?? ctx?.fieldId ?? generatedId;
    const describedBy = computeFieldDescribedBy(ctx, props["aria-describedby"] as string | undefined);
    const resolvedInvalid = invalid ?? ctx?.hasError ?? undefined;
    const resolvedDisabled = props.disabled ?? ctx?.disabled;
    const sizeClass = size === "sm" ? "wui-switch--sm" : size === "lg" ? "wui-switch--lg" : "";
    const hasTrackLabels = onLabel != null || offLabel != null;
    return (
      <div className={cn("wui-switch", sizeClass, hasTrackLabels && "wui-switch--with-track-labels", className)}>
        <span className="wui-switch__control">
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
            disabled={resolvedDisabled}
          />
          {hasTrackLabels && (
            <>
              {onLabel != null && (
                <span className="wui-switch__track-label wui-switch__track-label--on" aria-hidden="true">
                  {onLabel}
                </span>
              )}
              {offLabel != null && (
                <span className="wui-switch__track-label wui-switch__track-label--off" aria-hidden="true">
                  {offLabel}
                </span>
              )}
            </>
          )}
        </span>
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
