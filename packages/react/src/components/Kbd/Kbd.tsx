import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export const Kbd = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <kbd
      ref={ref}
      className={cn("wui-kbd", className)}
      {...props}
    />
  ),
);
Kbd.displayName = "Kbd";
