import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("wui-empty-state", className)}
        {...props}
      >
        {icon && <div className="wui-empty-state__icon">{icon}</div>}
        <h3 className="wui-empty-state__title">{title}</h3>
        {description && <p className="wui-empty-state__description">{description}</p>}
        {action && <div className="wui-empty-state__action">{action}</div>}
      </div>
    );
  },
);
EmptyState.displayName = "EmptyState";
