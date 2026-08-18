"use client";
import { type ReactNode, type HTMLAttributes, useRef, useEffect } from "react";
import { useMenuContext } from "./MenuContext";
import { Keys } from "../../utils/keyboard";

export interface MenuItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  onSelect?: () => void;
  /** Internal: injected by MenuContent */
  _menuIndex?: number;
}

export function MenuItem({ children, onSelect, _menuIndex, onClick, onKeyDown, ...props }: MenuItemProps) {
  const { activeIndex, onClose, registerItem } = useMenuContext();
  const ref = useRef<HTMLDivElement>(null);
  const index = _menuIndex ?? 0;
  const isActive = activeIndex === index;

  useEffect(() => {
    if (ref.current) registerItem(index, ref.current);
  }, [index, registerItem]);

  function activate() {
    onSelect?.();
    onClose();
  }

  return (
    <div
      ref={ref}
      role="menuitem"
      tabIndex={isActive ? 0 : -1}
      data-civaria-component="menu"
      data-part="item"
      data-highlighted={isActive ? "" : undefined}
      onClick={(e) => {
        activate();
        onClick?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === Keys.Enter || e.key === Keys.Space) {
          e.preventDefault();
          activate();
        }
        onKeyDown?.(e);
      }}
      {...props}
    >
      {children}
    </div>
  );
}
