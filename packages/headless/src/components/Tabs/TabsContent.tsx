import { type ReactNode, type HTMLAttributes } from "react";
import { useTabsContext } from "./TabsContext";

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

export function TabsContent({ value, children, ...props }: TabsContentProps) {
  const { activeValue, baseId } = useTabsContext();
  const isActive = activeValue === value;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-content-${value}`}
      aria-labelledby={`${baseId}-trigger-${value}`}
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
}
