import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: "column" | "row";
  gap?: number;
  wrap?: boolean;
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ children, direction = "column", gap, wrap, className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "wui-stack",
          direction === "row" && "wui-stack--row",
          wrap && "wui-stack--wrap",
          className,
        )}
        style={gap !== undefined ? { ...style, gap: `var(--wui-spacing-${gap})` } : style}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Stack.displayName = "Stack";
