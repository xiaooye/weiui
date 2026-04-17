"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  forwardRef,
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactElement,
  type CSSProperties,
  type MutableRefObject,
} from "react";
import { useDisclosure, useId, useOutsideClick, useFloatingMenu, Keys } from "@weiui/headless";
import { Portal } from "../Portal";

interface MenuContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  menuId: string;
  triggerId: string;
  refs: ReturnType<typeof useFloatingMenu>["refs"];
  floatingStyles: CSSProperties;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("Menu components must be used within <Menu>");
  return ctx;
}

type MenuSide = "top" | "right" | "bottom" | "left";
type MenuAlign = "start" | "center" | "end";
type FloatingPlacement =
  | "top" | "right" | "bottom" | "left"
  | "top-start" | "top-end"
  | "right-start" | "right-end"
  | "bottom-start" | "bottom-end"
  | "left-start" | "left-end";

function toPlacement(side: MenuSide, align: MenuAlign): FloatingPlacement {
  if (align === "center") return side;
  return `${side}-${align}` as FloatingPlacement;
}

export interface MenuProps {
  children: ReactNode;
  side?: MenuSide;
  align?: MenuAlign;
}

export function Menu({ children, side = "bottom", align = "start" }: MenuProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const baseId = useId("menu");
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleClose = useCallback(() => {
    setActiveIndex(-1);
    onClose();
  }, [onClose]);

  const { refs, floatingStyles } = useFloatingMenu({
    open: isOpen,
    placement: toPlacement(side, align),
    offsetPx: 4,
    collisionPadding: 8,
  });

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
        refs,
        floatingStyles,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}
Menu.displayName = "Menu";

export interface MenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const MenuTrigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(
  ({ children, onClick, ...props }, ref) => {
    const { isOpen, onOpen, menuId, triggerId, refs } = useMenuContext();
    const setRef = (el: HTMLButtonElement | null) => {
      refs.setReference(el);
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as MutableRefObject<HTMLButtonElement | null>).current = el;
    };
    return (
      <button
        id={triggerId}
        ref={setRef}
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
  },
);
MenuTrigger.displayName = "MenuTrigger";

// Find next enabled item index in direction (+1 / -1), wrapping around.
function findNextEnabled(
  start: number,
  direction: 1 | -1,
  disabled: boolean[],
): number {
  const n = disabled.length;
  if (n === 0) return -1;
  let idx = start;
  for (let i = 0; i < n; i++) {
    idx = ((idx + direction) % n + n) % n;
    if (!disabled[idx]) return idx;
  }
  return -1;
}

export interface MenuContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function MenuContent({ children, className, style, onKeyDown, ...props }: MenuContentProps) {
  const { isOpen, onClose, menuId, triggerId, activeIndex, setActiveIndex, refs, floatingStyles } =
    useMenuContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const typeaheadBufferRef = useRef("");
  const typeaheadTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const setRefs = (el: HTMLDivElement | null) => {
    (contentRef as MutableRefObject<HTMLDivElement | null>).current = el;
    refs.setFloating(el);
  };

  useOutsideClick(contentRef, onClose, isOpen);

  function isSeparator(child: ReactElement): boolean {
    return typeof child.type === "function" &&
      (child.type as { isSeparator?: boolean }).isSeparator === true;
  }

  // Assign sequential indices to menu items, skip separators
  let itemIndex = 0;
  const disabledList: boolean[] = [];
  const indexedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    if (isSeparator(child as ReactElement)) return child;
    const index = itemIndex++;
    const props = (child as ReactElement<{ disabled?: boolean }>).props || {};
    disabledList.push(Boolean(props.disabled));
    return cloneElement(child as ReactElement<{ _menuIndex?: number }>, { _menuIndex: index });
  });

  const totalItems = itemIndex;

  // Store trigger ref and focus first enabled item on open
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.getElementById(triggerId) as HTMLElement | null;
      const firstEnabled = disabledList.findIndex((d) => !d);
      setActiveIndex(firstEnabled === -1 ? 0 : firstEnabled);
    } else {
      if (triggerRef.current) triggerRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, triggerId, setActiveIndex]);

  // Focus the active item when activeIndex changes
  useEffect(() => {
    if (!isOpen || activeIndex < 0 || !contentRef.current) return;
    const items = contentRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]');
    const item = items[activeIndex];
    if (item) item.focus();
  }, [isOpen, activeIndex]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        ref={setRefs}
        id={menuId}
        role="menu"
        aria-labelledby={triggerId}
        className={className}
        style={{ ...floatingStyles, ...style }}
        onKeyDown={(e) => {
          switch (e.key) {
            case Keys.Escape:
              e.preventDefault();
              onClose();
              break;
            case Keys.ArrowDown: {
              e.preventDefault();
              const next = findNextEnabled(activeIndex, 1, disabledList);
              if (next !== -1) setActiveIndex(next);
              break;
            }
            case Keys.ArrowUp: {
              e.preventDefault();
              const prev = findNextEnabled(activeIndex, -1, disabledList);
              if (prev !== -1) setActiveIndex(prev);
              break;
            }
            case Keys.Home: {
              e.preventDefault();
              const first = disabledList.findIndex((d) => !d);
              if (first !== -1) setActiveIndex(first);
              break;
            }
            case Keys.End: {
              e.preventDefault();
              for (let i = disabledList.length - 1; i >= 0; i--) {
                if (!disabledList[i]) { setActiveIndex(i); break; }
              }
              break;
            }
            default: {
              // Type-ahead: printable single chars
              if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && totalItems > 0) {
                e.preventDefault();
                clearTimeout(typeaheadTimeoutRef.current);
                typeaheadBufferRef.current = (typeaheadBufferRef.current + e.key).toLowerCase();
                typeaheadTimeoutRef.current = setTimeout(() => {
                  typeaheadBufferRef.current = "";
                }, 500);

                const items = contentRef.current
                  ? Array.from(contentRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'))
                  : [];
                const buffer = typeaheadBufferRef.current;
                for (let i = 0; i < items.length; i++) {
                  const item = items[i];
                  if (!item) continue;
                  const text = (item.textContent || "").trim().toLowerCase();
                  if (!disabledList[i] && text.startsWith(buffer)) {
                    setActiveIndex(i);
                    break;
                  }
                }
              }
              break;
            }
          }
          onKeyDown?.(e);
        }}
        {...props}
      >
        {indexedChildren}
      </div>
    </Portal>
  );
}
MenuContent.displayName = "MenuContent";

export interface MenuItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  /** Internal: injected by MenuContent */
  _menuIndex?: number;
}

export function MenuItem({
  children,
  onSelect,
  disabled = false,
  _menuIndex,
  onClick,
  onKeyDown,
  ...props
}: MenuItemProps) {
  const { activeIndex, onClose } = useMenuContext();
  const index = _menuIndex ?? 0;
  const isActive = activeIndex === index;

  function activate() {
    if (disabled) return;
    onSelect?.();
    onClose();
  }

  return (
    <div
      role="menuitem"
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? "" : undefined}
      tabIndex={isActive && !disabled ? 0 : -1}
      onClick={(e) => {
        activate();
        onClick?.(e);
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === Keys.Enter || e.key === Keys.Space)) {
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
MenuItem.displayName = "MenuItem";

export interface MenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

export function MenuSeparator({ ...props }: MenuSeparatorProps) {
  return <div role="separator" {...props} />;
}
MenuSeparator.displayName = "MenuSeparator";

MenuSeparator.isSeparator = true;
