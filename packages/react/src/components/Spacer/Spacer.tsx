import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export const Spacer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("wui-spacer", className)} aria-hidden="true" {...props} />;
  },
);
Spacer.displayName = "Spacer";
