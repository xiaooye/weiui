import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "rect";
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = "rect", className, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "wui-skeleton",
        variant === "text" && "wui-skeleton--text",
        variant === "circle" && "wui-skeleton--circle",
        className,
      )}
      {...props}
    />
  ),
);
Skeleton.displayName = "Skeleton";
