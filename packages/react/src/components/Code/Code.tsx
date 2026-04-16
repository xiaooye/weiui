import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface CodeProps extends HTMLAttributes<HTMLElement> {
  inline?: boolean;
}

export const Code = forwardRef<HTMLElement, CodeProps>(
  ({ inline = true, className, ...props }, ref) => {
    if (inline) {
      return (
        <code
          ref={ref}
          className={cn(
            "font-mono text-sm bg-[var(--wui-color-muted)] px-[var(--wui-spacing-1)] py-[var(--wui-spacing-0\\.5)] rounded-[var(--wui-shape-radius-sm)]",
            className,
          )}
          {...props}
        />
      );
    }
    return (
      <pre
        className={cn(
          "font-mono text-sm bg-[var(--wui-color-muted)] p-[var(--wui-spacing-4)] rounded-[var(--wui-shape-radius-md)] overflow-x-auto",
          className,
        )}
      >
        <code ref={ref} {...props} />
      </pre>
    );
  },
);
Code.displayName = "Code";
