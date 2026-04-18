import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Visual style. Defaults to `elevated`. */
  variant?: "elevated" | "outlined" | "filled";
  /** When true, clones the single child element and forwards the card class/props. */
  asChild?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = "elevated", asChild = false, className, ...props }, ref) => {
    const classes = cn(
      "wui-card",
      variant !== "elevated" && `wui-card--${variant}`,
      className,
    );

    if (asChild && isValidElement(children)) {
      const child = Children.only(children) as ReactElement<Record<string, unknown>>;
      const childProps = child.props ?? {};
      return cloneElement(child, {
        ...props,
        ref,
        className: cn(classes, childProps.className as string | undefined),
      });
    }

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("wui-card__header", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("wui-card__content", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("wui-card__footer", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";
