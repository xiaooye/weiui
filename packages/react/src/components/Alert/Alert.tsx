import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "destructive";
  children: ReactNode;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = "info", children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex gap-[var(--wui-spacing-3)] p-[var(--wui-spacing-4)] rounded-[var(--wui-shape-radius-md)] border border-[var(--wui-color-border)]",
          variant === "destructive" && "border-[var(--wui-color-destructive)] bg-[var(--wui-color-destructive)]/5",
          variant === "success" && "border-[var(--wui-color-success)] bg-[var(--wui-color-success)]/5",
          variant === "warning" && "border-[var(--wui-color-warning)] bg-[var(--wui-color-warning)]/5",
          variant === "info" && "border-[var(--wui-color-primary)] bg-[var(--wui-color-primary)]/5",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Alert.displayName = "Alert";

export const AlertTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("font-semibold", className)} {...props} />
  ),
);
AlertTitle.displayName = "AlertTitle";

export const AlertDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";
