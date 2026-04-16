import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("wui-button-group", className)} role="group" {...props}>
      {children}
    </div>
  ),
);
ButtonGroup.displayName = "ButtonGroup";
