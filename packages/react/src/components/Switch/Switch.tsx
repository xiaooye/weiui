"use client";
import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <input ref={ref} type="checkbox" role="switch" id={inputId} {...props} />
        {label && <label htmlFor={inputId}>{label}</label>}
      </div>
    );
  },
);
Switch.displayName = "Switch";
