"use client";
import { type ReactNode, cloneElement, isValidElement } from "react";
import { useTooltipContext } from "./TooltipContext";

export interface TooltipTriggerProps {
  children: ReactNode;
}

export function TooltipTrigger({ children }: TooltipTriggerProps) {
  const { open, close, isOpen, tooltipId, refs } = useTooltipContext();

  if (isValidElement(children)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return cloneElement(children as React.ReactElement<any>, {
      ref: refs.setReference,
      onMouseEnter: open,
      onMouseLeave: close,
      onFocus: open,
      onBlur: close,
      "aria-describedby": isOpen ? tooltipId : undefined,
    });
  }

  return (
    <span
      ref={refs.setReference as React.Ref<HTMLSpanElement>}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
      aria-describedby={isOpen ? tooltipId : undefined}
    >
      {children}
    </span>
  );
}
