"use client";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = "md", label = "Loading", className, ...props }, ref) => {
    const sizeMap = { sm: "16px", md: "24px", lg: "32px" };
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={cn("inline-block animate-spin rounded-full border-2 border-current border-r-transparent", className)}
        style={{ width: sizeMap[size], height: sizeMap[size] }}
        {...props}
      >
        <span className="wui-sr-only">{label}</span>
      </div>
    );
  },
);
Spinner.displayName = "Spinner";
