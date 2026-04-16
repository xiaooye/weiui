"use client";
import { type ReactNode, useState, useCallback, useRef } from "react";
import { useDisclosure } from "../../hooks/use-disclosure";
import { useId } from "../../hooks/use-id";
import { MenuContext } from "./MenuContext";

export interface MenuProps {
  children: ReactNode;
}

export function Menu({ children }: MenuProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const baseId = useId("menu");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [itemCount, setItemCount] = useState(0);
  const itemsRef = useRef<Map<number, HTMLElement>>(new Map());

  const registerItem = useCallback((index: number, ref: HTMLElement) => {
    itemsRef.current.set(index, ref);
  }, []);

  const handleClose = useCallback(() => {
    setActiveIndex(-1);
    onClose();
  }, [onClose]);

  return (
    <MenuContext.Provider
      value={{
        isOpen,
        onOpen,
        onClose: handleClose,
        activeIndex,
        setActiveIndex,
        menuId: `${baseId}-menu`,
        triggerId: `${baseId}-trigger`,
        registerItem,
        itemCount,
        setItemCount,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}
