"use client";
import { type ReactNode, type HTMLAttributes, useRef, useEffect } from "react";
import { useSelectContext } from "./SelectContext";
import { useOutsideClick } from "../../hooks/use-outside-click";
import { Keys } from "../../utils/keyboard";

export interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function SelectContent({ children, onKeyDown, ...props }: SelectContentProps) {
  const { isOpen, onClose, listboxId, triggerId } = useSelectContext();
  const contentRef = useRef<HTMLDivElement>(null);

  useOutsideClick(contentRef, onClose, isOpen);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={contentRef}
      id={listboxId}
      role="listbox"
      aria-labelledby={triggerId}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === Keys.Escape) {
          e.preventDefault();
          onClose();
        }
        onKeyDown?.(e);
      }}
      {...props}
    >
      {children}
    </div>
  );
}
