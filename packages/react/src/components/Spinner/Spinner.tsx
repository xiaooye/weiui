"use client";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type SpinnerColor = "default" | "primary" | "success" | "warning" | "destructive";

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  label?: string;
  /** Visual color. `default` uses `currentColor`. */
  color?: SpinnerColor;
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = "md", label = "Loading", color = "default", className, ...props }, ref) => {
    const sizeMap = { sm: "16px", md: "24px", lg: "32px" };
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={cn("wui-spinner", color !== "default" && `wui-spinner--${color}`, className)}
        style={{ width: sizeMap[size], height: sizeMap[size] }}
        {...props}
      >
        <span className="wui-sr-only">{label}</span>
      </div>
    );
  },
);
Spinner.displayName = "Spinner";
