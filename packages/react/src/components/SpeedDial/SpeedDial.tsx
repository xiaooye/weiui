"use client";
import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";

export interface SpeedDialAction {
  id: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

export interface SpeedDialProps {
  actions: SpeedDialAction[];
  icon?: ReactNode;
  className?: string;
  label?: string;
}

export const SpeedDial = forwardRef<HTMLDivElement, SpeedDialProps>(
  ({ actions, icon = "+", className, label = "Speed dial" }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const actionRefs = useRef<Array<HTMLButtonElement | null>>([]);
    // Track whether we should move focus into the menu after opening via keyboard.
    const focusFirstRef = useRef(false);

    const focusAction = (i: number) => {
      const n = actions.length;
      if (n === 0) return;
      const idx = ((i % n) + n) % n;
      actionRefs.current[idx]?.focus();
    };

    useEffect(() => {
      if (isOpen && focusFirstRef.current) {
        focusFirstRef.current = false;
        // The action elements have mounted after this render; focus the first.
        actionRefs.current[0]?.focus();
      }
    }, [isOpen]);

    const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen) {
          focusFirstRef.current = true;
          setIsOpen(true);
        } else {
          focusAction(0);
        }
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleActionKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          focusAction(idx + 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          focusAction(idx - 1);
          break;
        case "Home":
          e.preventDefault();
          focusAction(0);
          break;
        case "End":
          e.preventDefault();
          focusAction(actions.length - 1);
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
      }
    };

    return (
      <div
        ref={ref}
        className={cn("wui-speed-dial", className)}
        role="group"
        aria-label={label}
      >
        <button
          ref={triggerRef}
          type="button"
          className="wui-speed-dial__trigger"
          data-open={isOpen || undefined}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close actions" : "Open actions"}
          onClick={() => setIsOpen((o) => !o)}
          onKeyDown={handleTriggerKeyDown}
        >
          {icon}
        </button>
        {isOpen && (
          <div role="menu" aria-label={label} className="wui-speed-dial__menu">
            {actions.map((action, i) => (
              <button
                key={action.id}
                ref={(el) => {
                  actionRefs.current[i] = el;
                }}
                type="button"
                role="menuitem"
                className="wui-speed-dial__action"
                aria-label={action.label}
                onClick={() => {
                  action.onClick?.();
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                onKeyDown={(e) => handleActionKeyDown(e, i)}
              >
                {action.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);
SpeedDial.displayName = "SpeedDial";
