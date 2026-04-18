import {
  Children,
  Fragment,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /**
   * Maximum number of items to display. When exceeded, middle items are collapsed
   * and replaced with a single `BreadcrumbEllipsis`. Always shows the first item
   * and the last `maxItems - 1` items. Set to 0 or omit to disable truncation.
   */
  maxItems?: number;
}

interface InternalItem {
  node: ReactElement;
  isSeparator: boolean;
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ children, maxItems, className, ...props }, ref) => {
    const items: InternalItem[] = [];
    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;
      const type = child.type as { __wuiBcSep?: boolean };
      items.push({ node: child, isSeparator: type?.__wuiBcSep === true });
    });

    const nonSep = items.filter((i) => !i.isSeparator);
    const shouldTruncate = maxItems !== undefined && maxItems > 0 && nonSep.length > maxItems;

    let rendered: ReactNode;
    if (!shouldTruncate) {
      rendered = items.map((i, idx) => <Fragment key={idx}>{i.node}</Fragment>);
    } else {
      // Keep first item + last (maxItems - 1) items; replace middle non-separators with ellipsis.
      const keepLast = maxItems! - 1;
      const firstItem = nonSep[0]!;
      const lastItems = nonSep.slice(nonSep.length - keepLast);
      const parts: ReactNode[] = [];
      let sepCount = 0;
      // First item + separator (if present in children).
      parts.push(<Fragment key="first">{firstItem.node}</Fragment>);
      const firstSep = items[items.indexOf(firstItem) + 1];
      if (firstSep?.isSeparator) {
        parts.push(<Fragment key="sep-first">{firstSep.node}</Fragment>);
        sepCount += 1;
      }
      // Ellipsis.
      parts.push(<BreadcrumbEllipsis key="ellipsis" />);
      // Separator after ellipsis (from last's preceding sibling if available).
      const firstKeptIdx = items.indexOf(lastItems[0]!);
      const sepBeforeLast = items[firstKeptIdx - 1];
      if (sepBeforeLast?.isSeparator) {
        parts.push(<Fragment key={`sep-ellipsis-${sepCount}`}>{sepBeforeLast.node}</Fragment>);
      }
      // Append last kept items (with their intervening separators).
      const startIdx = items.indexOf(lastItems[0]!);
      for (let i = startIdx; i < items.length; i++) {
        const it = items[i]!;
        parts.push(<Fragment key={`k-${i}`}>{it.node}</Fragment>);
      }
      rendered = parts;
    }

    return (
      <nav ref={ref} aria-label="Breadcrumb" className={cn("wui-breadcrumb", className)} {...props}>
        <ol className="wui-breadcrumb__list">{rendered}</ol>
      </nav>
    );
  },
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
      className={cn("wui-breadcrumb__item", className)}
      aria-current={active ? "page" : undefined}
      {...props}
    >
      {children}
    </li>
  ),
);
BreadcrumbItem.displayName = "BreadcrumbItem";

type BreadcrumbSeparatorComponent = ReturnType<
  typeof forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>
> & { __wuiBcSep?: boolean };

export const BreadcrumbSeparator: BreadcrumbSeparatorComponent = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement>
>(({ children = "/", className, ...props }, ref) => (
  <span ref={ref} aria-hidden="true" className={cn("wui-breadcrumb__separator", className)} {...props}>
    {children}
  </span>
));
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";
BreadcrumbSeparator.__wuiBcSep = true;

export interface BreadcrumbEllipsisProps extends HTMLAttributes<HTMLLIElement> {}

export const BreadcrumbEllipsis = forwardRef<HTMLLIElement, BreadcrumbEllipsisProps>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn("wui-breadcrumb__ellipsis", className)}
      aria-label="More items"
      {...props}
    >
      <span aria-hidden="true">{"\u2026"}</span>
    </li>
  ),
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";
