"use client";
import { type ReactNode, type HTMLAttributes, useRef, useEffect } from "react";
import { useDialogContext } from "./DialogContext";
import { useFocusTrap } from "../../hooks/use-focus-trap";
import { useOutsideClick } from "../../hooks/use-outside-click";
import { getFirstFocusable } from "../../utils/focus";

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function DialogContent({ children, onKeyDown, ...props }: DialogContentProps) {
  const { isOpen, onClose, contentId, titleId, descriptionId } = useDialogContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useFocusTrap(contentRef, isOpen);
  useOutsideClick(contentRef, onClose, isOpen);

  // Focus management: focus first focusable on open, return focus on close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const firstFocusable = contentRef.current && getFirstFocusable(contentRef.current);
      if (firstFocusable) {
        firstFocusable.focus();
      }
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = original; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={contentRef}
      id={contentId}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
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
