import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, children, className, ...props }, ref) => (
    <label ref={ref} className={cn("text-sm font-medium", className)} {...props}>
      {children}
      {required && <span aria-hidden="true" className="text-[var(--wui-color-destructive)] ml-1">*</span>}
    </label>
  ),
);
Label.displayName = "Label";
