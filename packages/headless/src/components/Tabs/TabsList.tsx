import { type ReactNode, type HTMLAttributes } from "react";

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function TabsList({ children, ...props }: TabsListProps) {
  return (
    <div role="tablist" {...props}>
      {children}
    </div>
  );
}
