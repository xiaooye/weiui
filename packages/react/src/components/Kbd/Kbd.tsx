import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export const Kbd = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <kbd
      ref={ref}
      className={cn(
        "font-mono text-xs border border-[var(--wui-color-border)] bg-[var(--wui-color-muted)] px-[var(--wui-spacing-1\\.5)] py-[var(--wui-spacing-0\\.5)] rounded-[var(--wui-shape-radius-sm)]",
        className,
      )}
      {...props}
    />
  ),
);
Kbd.displayName = "Kbd";
