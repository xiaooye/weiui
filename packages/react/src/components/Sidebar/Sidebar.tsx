"use client";
import {
  createContext,
  useContext,
  forwardRef,
  isValidElement,
  cloneElement,
  Children,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type ReactElement,
  type ButtonHTMLAttributes,
} from "react";
import { useDisclosure, type UseDisclosureProps } from "@weiui/headless";
import { cn } from "../../utils/cn";

interface SidebarContextValue {
  isCollapsed: boolean;
  onToggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebarContext(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("Sidebar compound components must be used within <Sidebar>");
  return ctx;
}

export interface SidebarProps extends HTMLAttributes<HTMLElement>, UseDisclosureProps {
  /** Sidebar content — typically SidebarHeader, SidebarContent, and SidebarFooter. */
  children: ReactNode;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ children, className, defaultOpen, open, onOpenChange, ...props }, ref) => {
    const { isOpen: isCollapsed, onToggle } = useDisclosure({ defaultOpen, open, onOpenChange });

    return (
      <SidebarContext.Provider value={{ isCollapsed, onToggle }}>
        <aside
          ref={ref}
          className={cn("wui-sidebar", className)}
          data-collapsed={isCollapsed ? "" : undefined}
          {...props}
        >
          {children}
        </aside>
      </SidebarContext.Provider>
    );
  },
);
Sidebar.displayName = "Sidebar";

export const SidebarHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("wui-sidebar__header", className)} {...props} />
  ),
);
SidebarHeader.displayName = "SidebarHeader";

export const SidebarContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("wui-sidebar__content", className)} {...props} />
  ),
);
SidebarContent.displayName = "SidebarContent";

export const SidebarFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("wui-sidebar__footer", className)} {...props} />
  ),
);
SidebarFooter.displayName = "SidebarFooter";

export interface SidebarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Marks the item as the current page. Applies active styling and sets aria-current. */
  active?: boolean;
  /** Optional icon node — rendered before the label; always visible even in collapsed mode. */
  icon?: ReactNode;
  /** Tooltip text shown when sidebar is collapsed (icon-only mode). Falls back to `children` string. */
  tooltip?: string;
  /** When true, clone the single child element (e.g. a router Link) and forward sidebar item props. */
  asChild?: boolean;
  /** Item content — typically the label text. */
  children: ReactNode;
}

export const SidebarItem = forwardRef<HTMLButtonElement, SidebarItemProps>(
  ({ active, icon, tooltip, asChild = false, className, children, ...props }, ref) => {
    const ctx = useContext(SidebarContext);
    const isCollapsed = ctx?.isCollapsed ?? false;
    const tipText = tooltip ?? (typeof children === "string" ? children : undefined);

    const content = (
      <>
        {icon && (
          <span className="wui-sidebar__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="wui-sidebar__label">
          {asChild && isValidElement(children)
            ? (children as ReactElement<{ children?: ReactNode }>).props.children
            : children}
        </span>
      </>
    );

    if (asChild && isValidElement(children)) {
      const child = Children.only(children) as ReactElement<Record<string, unknown>>;
      const childProps = (child.props ?? {}) as { className?: string };
      return cloneElement(child, {
        ...props,
        ref,
        className: cn("wui-sidebar__item", childProps.className, className),
        "data-active": active ? "" : undefined,
        "aria-current": active ? "page" : undefined,
        title: isCollapsed && tipText ? tipText : undefined,
        children: content,
      } as Record<string, unknown>);
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn("wui-sidebar__item", className)}
        data-active={active ? "" : undefined}
        aria-current={active ? "page" : undefined}
        title={isCollapsed && tipText ? tipText : undefined}
        {...props}
      >
        {content}
      </button>
    );
  },
);
SidebarItem.displayName = "SidebarItem";

export interface SidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name for the toggle button. Default: "Toggle sidebar". */
  "aria-label"?: string;
}

export const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ className, onClick, "aria-label": ariaLabel = "Toggle sidebar", children, ...props }, ref) => {
    const ctx = useSidebarContext();
    return (
      <button
        ref={ref}
        type="button"
        className={cn("wui-sidebar__trigger", className)}
        aria-label={ariaLabel}
        aria-expanded={!ctx.isCollapsed}
        aria-controls="wui-sidebar-content"
        onClick={(e) => {
          ctx.onToggle();
          onClick?.(e);
        }}
        {...props}
      >
        {children ?? (
          <span aria-hidden="true" className="wui-sidebar__trigger-icon">
            {ctx.isCollapsed ? "\u2630" : "\u2190"}
          </span>
        )}
      </button>
    );
  },
);
SidebarTrigger.displayName = "SidebarTrigger";

export interface SidebarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Group content — typically a SidebarGroupLabel followed by SidebarItem(s). */
  children: ReactNode;
}

export const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} role="group" className={cn("wui-sidebar__group", className)} {...props}>
      {children}
    </div>
  ),
);
SidebarGroup.displayName = "SidebarGroup";

export interface SidebarGroupLabelProps extends HTMLAttributes<HTMLDivElement> {}

export const SidebarGroupLabel = forwardRef<HTMLDivElement, SidebarGroupLabelProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("wui-sidebar__group-label", className)} {...props} />
  ),
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export interface SidebarSubMenuProps extends HTMLAttributes<HTMLDivElement> {
  /** Label rendered as the parent trigger. */
  label: ReactNode;
  /** Optional icon for the trigger. */
  icon?: ReactNode;
  /** When true, submenu is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Called when the trigger toggles. */
  onOpenChange?: (open: boolean) => void;
  /** Submenu items — typically nested SidebarItem(s). */
  children: ReactNode;
}

export const SidebarSubMenu = forwardRef<HTMLDivElement, SidebarSubMenuProps>(
  (
    { label, icon, defaultOpen, open, onOpenChange, className, children, ...props },
    ref,
  ) => {
    const isControlled = open !== undefined;
    const [uncontrolled, setUncontrolled] = useState(defaultOpen ?? false);
    const isOpen = isControlled ? open : uncontrolled;
    const toggle = () => {
      const next = !isOpen;
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    };
    return (
      <div ref={ref} className={cn("wui-sidebar__submenu", className)} {...props}>
        <button
          type="button"
          className="wui-sidebar__item wui-sidebar__submenu-trigger"
          aria-expanded={isOpen}
          data-open={isOpen || undefined}
          onClick={toggle}
        >
          {icon && (
            <span className="wui-sidebar__icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="wui-sidebar__label">{label}</span>
          <span className="wui-sidebar__submenu-chevron" aria-hidden="true" data-open={isOpen || undefined}>
            {"\u25B8"}
          </span>
        </button>
        {isOpen && (
          <div className="wui-sidebar__submenu-children" role="group">
            {children}
          </div>
        )}
      </div>
    );
  },
);
SidebarSubMenu.displayName = "SidebarSubMenu";

export { useSidebarContext };
