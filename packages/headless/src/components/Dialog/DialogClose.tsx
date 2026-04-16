"use client";
import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { useDialogContext } from "./DialogContext";

export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function DialogClose({ children, onClick, ...props }: DialogCloseProps) {
  const { onClose } = useDialogContext();
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
