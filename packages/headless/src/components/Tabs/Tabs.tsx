"use client";
import { type ReactNode, type HTMLAttributes } from "react";
import { useControllable } from "../../hooks/use-controllable";
import { useId } from "../../hooks/use-id";
import { TabsContext } from "./TabsContext";

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({ children, defaultValue = "", value, onValueChange, ...rest }: TabsProps) {
  const [activeValue, setActiveValue] = useControllable({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const baseId = useId("tabs");

  return (
    <TabsContext.Provider value={{ activeValue, onValueChange: setActiveValue, baseId }}>
      <div {...rest}>{children}</div>
    </TabsContext.Provider>
  );
}
