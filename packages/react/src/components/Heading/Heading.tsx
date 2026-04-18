import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  children: ReactNode;
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 2, children, className, ...props }, ref) => {
    const Tag = `h${level}` as const;
    return (
      <Tag
        ref={ref}
        className={cn("wui-heading", `wui-heading--${level}`, className)}
        {...props}
      >
        {children}
      </Tag>
    );
  },
);
Heading.displayName = "Heading";
