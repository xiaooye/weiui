"use client";
import {
  type ReactNode,
  type HTMLAttributes,
  useRef,
  useEffect,
  Children,
  isValidElement,
  cloneElement,
  type ReactElement,
} from "react";
import { useMenuContext } from "./MenuContext";
import { useOutsideClick } from "../../hooks/use-outside-click";
import { Keys } from "../../utils/keyboard";

export interface MenuContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function MenuContent({ children, onKeyDown, ...props }: MenuContentProps) {
  const { isOpen, onClose, menuId, triggerId, activeIndex, setActiveIndex, setItemCount } =
    useMenuContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useOutsideClick(contentRef, onClose, isOpen);

  function isSeparator(child: ReactElement): boolean {
    return typeof child.type === "function" &&
      (child.type as { isSeparator?: boolean }).isSeparator === true;
  }

  // Assign sequential indices to menu items, skip separators
  let itemIndex = 0;
  const indexedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    if (isSeparator(child as ReactElement)) return child;
    const index = itemIndex++;
    return cloneElement(child as ReactElement<{ _menuIndex?: number }>, { _menuIndex: index });
  });

  const totalItems = itemIndex;

  useEffect(() => {
    setItemCount(totalItems);
  }, [totalItems, setItemCount]);

  // Store trigger ref and focus first item on open
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.getElementById(triggerId) as HTMLElement | null;
      // Focus the first menu item
      setActiveIndex(0);
    } else {
      // Return focus to trigger on close
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    }
  }, [isOpen, triggerId, setActiveIndex]);

  // Focus the active item when activeIndex changes
  useEffect(() => {
    if (!isOpen || activeIndex < 0 || !contentRef.current) return;
    const items = contentRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]');
    const item = items[activeIndex];
    if (item) {
      item.focus();
    }
  }, [isOpen, activeIndex]);

  if (!isOpen) return null;

  return (
    <div
      ref={contentRef}
      id={menuId}
      role="menu"
      aria-labelledby={triggerId}
      onKeyDown={(e) => {
        const items = contentRef.current
          ? Array.from(contentRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'))
          : [];
        const count = items.length;

        switch (e.key) {
          case Keys.Escape:
            e.preventDefault();
            onClose();
            break;
          case Keys.ArrowDown:
            e.preventDefault();
            setActiveIndex(activeIndex + 1 >= count ? 0 : activeIndex + 1);
            break;
          case Keys.ArrowUp:
            e.preventDefault();
            setActiveIndex(activeIndex - 1 < 0 ? count - 1 : activeIndex - 1);
            break;
          case Keys.Home:
            e.preventDefault();
            setActiveIndex(0);
            break;
          case Keys.End:
            e.preventDefault();
            setActiveIndex(count - 1);
            break;
          default:
            break;
        }

        onKeyDown?.(e);
      }}
      {...props}
    >
      {indexedChildren}
    </div>
  );
}
