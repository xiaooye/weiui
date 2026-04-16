"use client";
import { type ReactNode, type HTMLAttributes, useRef } from "react";
import { useComboboxContext } from "./ComboboxContext";
import { useOutsideClick } from "../../hooks/use-outside-click";

export interface ComboboxContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ComboboxContent({ children, ...props }: ComboboxContentProps) {
  const { isOpen, onClose, listboxId, inputId } = useComboboxContext();
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick(ref, onClose, isOpen);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      id={listboxId}
      role="listbox"
      aria-labelledby={inputId}
      {...props}
    >
      {children}
    </div>
  );
}
