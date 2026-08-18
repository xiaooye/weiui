import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Small icon rendered above the title. */
  icon?: ReactNode;
  /** Larger illustration rendered above the icon/title (e.g. SVG hero). */
  illustration?: ReactNode;
  /** Heading text. */
  title: string;
  /** Secondary text shown below the title. */
  description?: string;
  /** Action content rendered below the description — typically a button. */
  action?: ReactNode;
  /** Visual scale. Defaults to `md`. */
  size?: "sm" | "md" | "lg";
  /** Layout orientation. Defaults to `vertical`. */
  orientation?: "vertical" | "horizontal";
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      illustration,
      title,
      description,
      action,
      size = "md",
      orientation = "vertical",
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "civ-empty-state",
          size !== "md" && `civ-empty-state--${size}`,
          orientation === "horizontal" && "civ-empty-state--horizontal",
          className,
        )}
        {...props}
      >
        {illustration && <div className="civ-empty-state__illustration">{illustration}</div>}
        {icon && <div className="civ-empty-state__icon">{icon}</div>}
        <div className="civ-empty-state__body">
          <h3 className="civ-empty-state__title">{title}</h3>
          {description && <p className="civ-empty-state__description">{description}</p>}
          {action && <div className="civ-empty-state__action">{action}</div>}
        </div>
      </div>
    );
  },
);
EmptyState.displayName = "EmptyState";
