import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  children: ReactNode;
}

const sizeMap: Record<HeadingLevel, string> = {
  1: "text-4xl font-bold tracking-tight",
  2: "text-3xl font-semibold tracking-tight",
  3: "text-2xl font-semibold",
  4: "text-xl font-semibold",
  5: "text-lg font-semibold",
  6: "text-base font-semibold",
};

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 2, children, className, ...props }, ref) => {
    const Tag = `h${level}` as const;
    return (
      <Tag ref={ref} className={cn(sizeMap[level], className)} {...props}>
        {children}
      </Tag>
    );
  },
);
Heading.displayName = "Heading";
