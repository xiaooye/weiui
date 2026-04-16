import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  color?: "default" | "primary" | "success" | "destructive";
  onRemove?: () => void;
}

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ children, color = "default", onRemove, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "wui-chip",
        color !== "default" && `wui-chip--${color}`,
        className,
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          className="wui-chip__remove"
          onClick={onRemove}
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  ),
);
Chip.displayName = "Chip";
