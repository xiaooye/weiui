"use client";
import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../Tooltip";

export interface SpeedDialAction {
  id: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

export type SpeedDialDirection = "up" | "down" | "left" | "right";
export type SpeedDialTrigger = "click" | "hover";

export interface SpeedDialProps {
  /** Action items revealed when the speed dial is opened. */
  actions: SpeedDialAction[];
  /** Icon shown on the trigger button. @default "+" */
  icon?: ReactNode;
  /** Additional CSS classes merged onto the root element. */
  className?: string;
  /** Accessible label for the trigger. @default "Speed dial" */
  label?: string;
  /** Side that actions fly out. @default "up" */
  direction?: SpeedDialDirection;
  /** Whether to open on click or hover. @default "click" */
  trigger?: SpeedDialTrigger;
}

const HOVER_CLOSE_DELAY_MS = 200;

const OPPOSITE_SIDE: Record<SpeedDialDirection, "top" | "right" | "bottom" | "left"> = {
  up: "left",
  down: "left",
  left: "top",
  right: "top",
};

export const SpeedDial = forwardRef<HTMLDivElement, SpeedDialProps>(
  (
    {
      actions,
      icon = "+",
      className,
      label = "Speed dial",
      direction = "up",
      trigger = "click",
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const actionRefs = useRef<Array<HTMLButtonElement | null>>([]);
    // Track whether we should move focus into the menu after opening via keyboard.
    const focusFirstRef = useRef(false);
    const hoverCloseTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const setRootRef = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref],
    );

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

    // Outside-click close: while open, a pointerdown outside the root closes the dial.
    useEffect(() => {
      if (!isOpen) return;
      function onPointerDown(e: Event) {
        const target = e.target as Node | null;
        if (target && rootRef.current && !rootRef.current.contains(target)) {
          setIsOpen(false);
        }
      }
      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("mousedown", onPointerDown);
      return () => {
        document.removeEventListener("pointerdown", onPointerDown);
        document.removeEventListener("mousedown", onPointerDown);
      };
    }, [isOpen]);

    // Clean up hover-close timer on unmount.
    useEffect(() => {
      return () => {
        if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current);
      };
    }, []);

    const clearHoverCloseTimer = () => {
      if (hoverCloseTimerRef.current) {
        clearTimeout(hoverCloseTimerRef.current);
        hoverCloseTimerRef.current = undefined;
      }
    };

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

    const handleRootPointerEnter = (_e: PointerEvent<HTMLDivElement>) => {
      if (trigger !== "hover") return;
      clearHoverCloseTimer();
      if (!isOpen) setIsOpen(true);
    };

    const handleRootPointerLeave = (_e: PointerEvent<HTMLDivElement>) => {
      if (trigger !== "hover") return;
      clearHoverCloseTimer();
      hoverCloseTimerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, HOVER_CLOSE_DELAY_MS);
    };

    const tooltipSide = OPPOSITE_SIDE[direction];

    return (
      <TooltipProvider delayDuration={0}>
        <div
          ref={setRootRef}
          className={cn(
            "wui-speed-dial",
            `wui-speed-dial--${direction}`,
            className,
          )}
          data-direction={direction}
          data-trigger={trigger}
          data-state={isOpen ? "open" : "closed"}
          role="group"
          aria-label={label}
          onPointerEnter={handleRootPointerEnter}
          onPointerLeave={handleRootPointerLeave}
        >
          <button
            ref={triggerRef}
            type="button"
            className="wui-speed-dial__trigger"
            data-open={isOpen || undefined}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close actions" : "Open actions"}
            onClick={() => {
              if (trigger === "click") setIsOpen((o) => !o);
            }}
            onKeyDown={handleTriggerKeyDown}
          >
            {icon}
          </button>
          {isOpen && (
            <div role="menu" aria-label={label} className="wui-speed-dial__menu">
              {actions.map((action, i) => (
                <Tooltip key={action.id} side={tooltipSide}>
                  {/* Wrap the button in a span so TooltipTrigger's cloneElement
                   * takes the span's ref (not the button's). This preserves our
                   * button ref for keyboard focus management while still giving
                   * the Tooltip a valid reference element. */}
                  <TooltipTrigger>
                    <span className="wui-speed-dial__action-wrap">
                      <button
                        ref={(el) => {
                          actionRefs.current[i] = el;
                        }}
                        type="button"
                        role="menuitem"
                        className="wui-speed-dial__action"
                        aria-label={action.label}
                        data-tooltip={action.label}
                        data-index={i}
                        style={
                          {
                            "--wui-speed-dial-index": i,
                          } as React.CSSProperties
                        }
                        onClick={() => {
                          action.onClick?.();
                          setIsOpen(false);
                          triggerRef.current?.focus();
                        }}
                        onKeyDown={(e) => handleActionKeyDown(e, i)}
                      >
                        {action.icon}
                      </button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="wui-speed-dial__tooltip">
                    {action.label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
        </div>
      </TooltipProvider>
    );
  },
);
SpeedDial.displayName = "SpeedDial";
