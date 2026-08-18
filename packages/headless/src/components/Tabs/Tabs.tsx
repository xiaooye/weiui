"use client";
import { type ReactNode, type HTMLAttributes, useEffect } from "react";
import { createTabsController } from "@weiui/core";
import { useCoreController, useLatest } from "../../hooks/use-core-controller";
import { useId } from "../../hooks/use-id";
import { TabsContext } from "./TabsContext";

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({ children, defaultValue = "", value, onValueChange, ...rest }: TabsProps) {
  const baseId = useId("tabs");
  const callbackRef = useLatest(onValueChange);
  const [controller, state] = useCoreController(() =>
    createTabsController({ id: baseId, defaultValue, onValueChange: (next) => callbackRef.current?.(next) }),
  );
  useEffect(() => {
    if (value !== undefined && state.value !== value) controller.store.setState({ value });
  }, [controller, state.value, value]);
  const activeValue = value ?? state.value;
  return (
    <TabsContext.Provider value={{ activeValue, onValueChange: controller.select, baseId }}>
      <div data-wui-component="tabs" data-part="root" {...rest}>{children}</div>
    </TabsContext.Provider>
  );
}
