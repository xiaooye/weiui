import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  /** Visual size. Defaults to `md`. */
  size?: "sm" | "md" | "lg";
  /** When true, dims the label. Use to mirror a disabled field. */
  disabled?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, size = "md", disabled, children, className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "wui-label",
        size !== "md" && `wui-label--${size}`,
        disabled && "wui-label--disabled",
        className,
      )}
      data-disabled={disabled || undefined}
      {...props}
    >
      {children}
      {required && <span aria-hidden="true" className="wui-label__required">*</span>}
    </label>
  ),
);
Label.displayName = "Label";
