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
        className={cn("wui-alert", `wui-alert--${variant}`, className)}
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
    <h5 ref={ref} className={cn("wui-alert__title", className)} {...props} />
  ),
);
AlertTitle.displayName = "AlertTitle";

export const AlertDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("wui-alert__description", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";
