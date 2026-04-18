import { forwardRef, Fragment, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Shape variant. @default "rect" */
  variant?: "text" | "circle" | "rect";
  /**
   * When `visible` is false, renders `children` instead of the skeleton —
   * convenient for `<Skeleton visible={loading}>actual content</Skeleton>`.
   * Defaults to `true`.
   */
  visible?: boolean;
  /** CSS width. Accepts a number (px) or any CSS length. Maps to `inline-size`. */
  width?: string | number;
  /** CSS height. Accepts a number (px) or any CSS length. Maps to `block-size`. */
  height?: string | number;
  /** Render `count` identical skeleton blocks (stacked). Defaults to 1. */
  count?: number;
  /** Content rendered in place of the skeleton when `visible` is false. */
  children?: ReactNode;
}

function toCssLength(v: string | number | undefined): string | undefined {
  if (v == null) return undefined;
  return typeof v === "number" ? `${v}px` : v;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    { variant = "rect", visible = true, width, height, count = 1, style, children, className, ...props },
    ref,
  ) => {
    if (!visible) return <>{children}</>;

    const mergedStyle = {
      inlineSize: toCssLength(width),
      blockSize: toCssLength(height),
      ...style,
    };

    if (count <= 1) {
      return (
        <div
          ref={ref}
          aria-hidden="true"
          className={cn(
            "wui-skeleton",
            variant === "text" && "wui-skeleton--text",
            variant === "circle" && "wui-skeleton--circle",
            className,
          )}
          style={mergedStyle}
          {...props}
        />
      );
    }

    // Render N siblings. Only attach the ref to the first; forwardRef contract
    // preserves single-ref semantics. Consumers needing per-item refs should
    // map over their own data.
    const items = Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        ref={i === 0 ? ref : undefined}
        aria-hidden="true"
        className={cn(
          "wui-skeleton",
          variant === "text" && "wui-skeleton--text",
          variant === "circle" && "wui-skeleton--circle",
          className,
        )}
        style={mergedStyle}
        {...props}
      />
    ));

    return <Fragment>{items}</Fragment>;
  },
);
Skeleton.displayName = "Skeleton";
