import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type LinkUnderline = "always" | "hover" | "none";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Force-mark the link as external. When undefined, the component auto-detects
   * external links based on `href` — any link starting with `http://`, `https://`,
   * `//`, or `mailto:` / `tel:` is treated as external.
   */
  external?: boolean;
  /**
   * Underline behaviour. `always` (default) uses a permanent underline, `hover`
   * only on hover/focus, `none` never shows one.
   */
  underline?: LinkUnderline;
  /** Render an external-link icon after the text when the link is external. */
  showExternalIcon?: boolean;
  children?: ReactNode;
}

function isExternalHref(href: string | undefined): boolean {
  if (!href) return false;
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ external, href, underline = "always", showExternalIcon = true, className, children, ...props }, ref) => {
    const isExt = external ?? isExternalHref(href);
    const externalAttrs = isExt ? { target: "_blank", rel: "noopener noreferrer" } : {};
    return (
      <a
        ref={ref}
        href={href}
        className={cn("wui-link", className)}
        data-external={isExt || undefined}
        data-underline={underline}
        {...externalAttrs}
        {...props}
      >
        {children}
        {isExt && showExternalIcon && (
          <span className="wui-link__external-icon" aria-hidden="true">
            {"\u2197"}
          </span>
        )}
      </a>
    );
  },
);
Link.displayName = "Link";
