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
        className={cn(
          "flex flex-col items-center justify-center text-center p-[var(--wui-spacing-8)] gap-[var(--wui-spacing-3)]",
          className,
        )}
        {...props}
      >
        {icon && <div className="text-[var(--wui-color-muted-foreground)]">{icon}</div>}
        <h3 className="font-semibold text-lg">{title}</h3>
        {description && <p className="text-sm text-[var(--wui-color-muted-foreground)]">{description}</p>}
        {action && <div className="mt-[var(--wui-spacing-2)]">{action}</div>}
      </div>
    );
  },
);
EmptyState.displayName = "EmptyState";
