"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "wui-input",
          props.disabled && "wui-input--disabled",
          className,
        )}
        aria-invalid={invalid || undefined}
        data-invalid={invalid || undefined}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
