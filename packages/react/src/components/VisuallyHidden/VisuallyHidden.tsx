import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export const VisuallyHidden = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("civ-sr-only", className)} {...props} />
  ),
);
VisuallyHidden.displayName = "VisuallyHidden";
