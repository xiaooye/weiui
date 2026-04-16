import { forwardRef, type AnchorHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ external, className, children, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "text-[var(--wui-color-primary)] underline underline-offset-4 hover:text-[var(--wui-color-primary)]/80",
        className,
      )}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {children}
    </a>
  ),
);
Link.displayName = "Link";
