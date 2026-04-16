import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: number;
  children: ReactNode;
}

export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 16 / 9, children, className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("wui-aspect-ratio", className)}
        style={{ ...style, aspectRatio: ratio }}
        {...props}
      >
        {children}
      </div>
    );
  },
);
AspectRatio.displayName = "AspectRatio";
