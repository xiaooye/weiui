import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  ({ orientation = "horizontal", className, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn(
          "wui-divider",
          orientation === "vertical" && "wui-divider--vertical",
          className,
        )}
        aria-orientation={orientation}
        {...props}
      />
    );
  },
);
Divider.displayName = "Divider";
