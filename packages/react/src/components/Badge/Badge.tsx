import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: "solid" | "soft" | "outline";
  color?: "primary" | "destructive" | "success" | "warning";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = "solid", color = "primary", className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "wui-badge",
        `wui-badge--${variant}`,
        color !== "primary" && `wui-badge--${color}`,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  ),
);
Badge.displayName = "Badge";
