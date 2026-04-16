import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ children, className, ...props }, ref) => (
    <nav ref={ref} aria-label="Breadcrumb" className={className} {...props}>
      <ol className="flex items-center gap-[var(--wui-spacing-1)] text-sm">{children}</ol>
    </nav>
  ),
);
Breadcrumb.displayName = "Breadcrumb";

export interface BreadcrumbItemProps extends HTMLAttributes<HTMLLIElement> {
  children: ReactNode;
  active?: boolean;
}

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ children, active, className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn("flex items-center gap-[var(--wui-spacing-1)]", className)}
      aria-current={active ? "page" : undefined}
      {...props}
    >
      {children}
    </li>
  ),
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export const BreadcrumbSeparator = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ children = "/", className, ...props }, ref) => (
    <span ref={ref} aria-hidden="true" className={cn("text-[var(--wui-color-muted-foreground)]", className)} {...props}>
      {children}
    </span>
  ),
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";
