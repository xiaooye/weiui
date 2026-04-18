import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /** Aspect ratio as a number (width / height). @default 16 / 9 */
  ratio?: number;
  /** Content constrained to the aspect ratio. */
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
