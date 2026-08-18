import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  /** Axis along which the divider is drawn. @default "horizontal" */
  orientation?: "horizontal" | "vertical";
}

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  ({ orientation = "horizontal", className, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn(
          "civ-divider",
          orientation === "vertical" && "civ-divider--vertical",
          className,
        )}
        aria-orientation={orientation}
        {...props}
      />
    );
  },
);
Divider.displayName = "Divider";
