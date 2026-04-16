import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns?: number | string;
  gap?: number;
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ children, columns, gap, className, style, ...props }, ref) => {
    const gridStyle: React.CSSProperties = { ...style };
    if (columns) {
      gridStyle.gridTemplateColumns = typeof columns === "number"
        ? `repeat(${columns}, 1fr)`
        : columns;
    }
    if (gap !== undefined) {
      gridStyle.gap = `var(--wui-spacing-${gap})`;
    }

    return (
      <div ref={ref} className={cn("wui-grid", className)} style={gridStyle} {...props}>
        {children}
      </div>
    );
  },
);
Grid.displayName = "Grid";
