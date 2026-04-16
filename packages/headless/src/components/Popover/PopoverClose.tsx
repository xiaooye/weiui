"use client";
import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { usePopoverContext } from "./PopoverContext";

export interface PopoverCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function PopoverClose({ children, onClick, ...props }: PopoverCloseProps) {
  const { onClose } = usePopoverContext();
  return (
    <button
      type="button"
      onClick={(e) => {
        onClose();
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
