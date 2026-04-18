import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type AnchorHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
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
  /** When true, clone the single child (e.g. a router Link) and forward link props/class. */
  asChild?: boolean;
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
  (
    {
      external,
      href,
      underline = "always",
      showExternalIcon = true,
      asChild = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isExt = external ?? isExternalHref(href);
    const externalAttrs = isExt ? { target: "_blank", rel: "noopener noreferrer" } : {};

    if (asChild && isValidElement(children)) {
      const child = Children.only(children) as ReactElement<Record<string, unknown>>;
      const childProps = (child.props ?? {}) as { className?: string; children?: ReactNode; href?: string };
      const resolvedHref = href ?? childProps.href;
      const resolvedIsExt = external ?? isExternalHref(resolvedHref);
      const resolvedExternalAttrs = resolvedIsExt ? { target: "_blank", rel: "noopener noreferrer" } : {};
      return cloneElement(child, {
        ...props,
        ...resolvedExternalAttrs,
        ref,
        className: cn("wui-link", childProps.className, className),
        "data-external": resolvedIsExt || undefined,
        "data-underline": underline,
        children: (
          <>
            {childProps.children}
            {resolvedIsExt && showExternalIcon && (
              <span className="wui-link__external-icon" aria-hidden="true">
                {"\u2197"}
              </span>
            )}
          </>
        ),
      } as Record<string, unknown>);
    }

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
