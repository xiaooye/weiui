"use client";
import { forwardRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
  startAddon?: ReactNode;
  endAddon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, size = "md", startAddon, endAddon, ...props }, ref) => {
    const sizeClass = size === "sm" ? "wui-input--sm" : size === "lg" ? "wui-input--lg" : "";
    const hasAddons = Boolean(startAddon || endAddon);

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
        aria-invalid={invalid || undefined}
        data-invalid={invalid || undefined}
        {...props}
      />
    );

    if (!hasAddons) return inputEl;

    return (
      <div
        className={cn("wui-input-group", sizeClass, className)}
        data-invalid={invalid || undefined}
      >
        {startAddon && <span className="wui-input-group__addon">{startAddon}</span>}
        {inputEl}
        {endAddon && <span className="wui-input-group__addon">{endAddon}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";
