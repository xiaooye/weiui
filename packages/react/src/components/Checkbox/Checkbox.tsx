"use client";
import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <input ref={ref} type="checkbox" id={inputId} {...props} />
        {label && <label htmlFor={inputId}>{label}</label>}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";
