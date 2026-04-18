import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, children, className, ...props }, ref) => (
    <label ref={ref} className={cn("wui-label", className)} {...props}>
      {children}
      {required && <span aria-hidden="true" className="wui-label__required">*</span>}
    </label>
  ),
);
Label.displayName = "Label";
