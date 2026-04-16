import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  maxWidth?: string;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className, maxWidth, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("wui-container", className)}
        style={maxWidth ? { ...style, maxInlineSize: maxWidth } : style}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Container.displayName = "Container";
