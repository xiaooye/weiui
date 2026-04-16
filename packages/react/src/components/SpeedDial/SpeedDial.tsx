"use client";
import { forwardRef, useState, type ReactNode } from "react";
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

    return (
      <div ref={ref} className={cn("wui-speed-dial", className)} role="group" aria-label={label}>
        <button
          type="button"
          className="wui-speed-dial__trigger"
          data-open={isOpen || undefined}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close actions" : "Open actions"}
          onClick={() => setIsOpen(!isOpen)}
        >
          {icon}
        </button>
        {isOpen &&
          actions.map((action) => (
            <button
              key={action.id}
              type="button"
              className="wui-speed-dial__action"
              aria-label={action.label}
              onClick={() => {
                action.onClick?.();
                setIsOpen(false);
              }}
            >
              {action.icon}
            </button>
          ))}
      </div>
    );
  },
);
SpeedDial.displayName = "SpeedDial";
