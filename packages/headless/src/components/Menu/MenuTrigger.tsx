"use client";
import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { useMenuContext } from "./MenuContext";

export interface MenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function MenuTrigger({ children, onClick, ...props }: MenuTriggerProps) {
  const { isOpen, onOpen, menuId, triggerId } = useMenuContext();

  return (
    <button
      id={triggerId}
      type="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-controls={isOpen ? menuId : undefined}
      onClick={(e) => {
        onOpen();
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
