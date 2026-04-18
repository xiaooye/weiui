"use client";
import { forwardRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type AlertVariant = "info" | "success" | "warning" | "destructive";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  children: ReactNode;
  /** Icon override. Defaults to a variant-specific glyph. Pass `null` to hide. */
  icon?: ReactNode | null;
  /** When true, renders a close button that hides the alert on click. */
  dismissible?: boolean;
  /** Called when the dismiss button is clicked. */
  onDismiss?: () => void;
  /** Content rendered on the trailing edge — typically action buttons. */
  action?: ReactNode;
}

const DEFAULT_ICONS: Record<AlertVariant, string> = {
  info: "\u2139",         // ℹ
  success: "\u2713",      // ✓
  warning: "\u26A0",      // ⚠
  destructive: "\u2715",  // ✕
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    { variant = "info", children, icon, dismissible, onDismiss, action, className, ...props },
    ref,
  ) => {
    const [visible, setVisible] = useState(true);
    if (!visible) return null;

    const resolvedIcon = icon === undefined ? DEFAULT_ICONS[variant] : icon;

    function handleDismiss() {
      onDismiss?.();
      setVisible(false);
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn("wui-alert", `wui-alert--${variant}`, className)}
        {...props}
      >
        {resolvedIcon != null && resolvedIcon !== false && (
          <span className="wui-alert__icon" aria-hidden="true">
            {resolvedIcon}
          </span>
        )}
        <div className="wui-alert__body">{children}</div>
        {action && <div className="wui-alert__action">{action}</div>}
        {dismissible && (
          <button
            type="button"
            aria-label="Dismiss"
            className="wui-alert__close"
            onClick={handleDismiss}
          >
            {"\u2715"}
          </button>
        )}
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
