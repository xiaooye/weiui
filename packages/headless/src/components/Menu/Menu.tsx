"use client";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { createMenuController } from "@weiui/core";
import { useCoreController } from "../../hooks/use-core-controller";
import { useId } from "../../hooks/use-id";
import { MenuContext } from "./MenuContext";

export interface MenuProps { children: ReactNode; }

export function Menu({ children }: MenuProps) {
  const baseId = useId("menu");
  const [controller, state] = useCoreController(() => createMenuController({ id: baseId }));
  const [itemCount, setItemCount] = useState(0);
  const itemsRef = useRef<Map<number, HTMLElement>>(new Map());
  const registerItem = useCallback((index: number, ref: HTMLElement) => { itemsRef.current.set(index, ref); }, []);
  const handleClose = useCallback(() => controller.close(), [controller]);
  return (
    <MenuContext.Provider value={{
      isOpen: state.open,
      onOpen: controller.open,
      onClose: handleClose,
      activeIndex: state.highlightedIndex,
      setActiveIndex: controller.highlight,
      menuId: `${baseId}-menu`,
      triggerId: `${baseId}-trigger`,
      registerItem,
      itemCount,
      setItemCount,
    }}>
      {children}
    </MenuContext.Provider>
  );
}
