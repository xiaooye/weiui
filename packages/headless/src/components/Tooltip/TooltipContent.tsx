"use client";
import { type ReactNode, type HTMLAttributes } from "react";
import { useTooltipContext } from "./TooltipContext";

export interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function TooltipContent({ children, onKeyDown, ...props }: TooltipContentProps) {
  const { isOpen, tooltipId, refs, floatingStyles } = useTooltipContext();

  if (!isOpen) return null;

  return (
    <div
      ref={refs.setFloating}
      id={tooltipId}
      role="tooltip"
      style={floatingStyles}
      {...props}
    >
      {children}
    </div>
  );
}
