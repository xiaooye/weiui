import { createContext, useContext } from "react";

export interface MenuContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  menuId: string;
  triggerId: string;
  registerItem: (index: number, ref: HTMLElement) => void;
  itemCount: number;
  setItemCount: (count: number) => void;
}

export const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenuContext(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("Menu components must be used within <Menu>");
  return ctx;
}
