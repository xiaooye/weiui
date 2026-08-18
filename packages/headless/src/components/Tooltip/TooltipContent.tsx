"use client";
import { type ReactNode, type HTMLAttributes } from "react";
import { useTooltipContext } from "./TooltipContext";

export interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function TooltipContent({ children, ...props }: TooltipContentProps) {
  const { isOpen, tooltipId, refs, floatingStyles } = useTooltipContext();

  if (!isOpen) return null;

  return (
    <div
      ref={refs.setFloating}
      id={tooltipId}
      role="tooltip"
      style={floatingStyles}
      data-wui-component="tooltip"
      data-part="content"
      data-state="open"
      {...props}
    >
      {children}
    </div>
  );
}
