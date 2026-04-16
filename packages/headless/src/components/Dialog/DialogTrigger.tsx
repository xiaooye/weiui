"use client";
import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { useDialogContext } from "./DialogContext";

export interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function DialogTrigger({ children, onClick, ...props }: DialogTriggerProps) {
  const { onOpen, isOpen, contentId, triggerId } = useDialogContext();

  return (
    <button
      id={triggerId}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={isOpen ? contentId : undefined}
      onClick={(e) => {
        onOpen();
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
