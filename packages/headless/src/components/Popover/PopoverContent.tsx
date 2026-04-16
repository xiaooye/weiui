"use client";
import { type ReactNode, type HTMLAttributes, useRef, useEffect } from "react";
import { usePopoverContext } from "./PopoverContext";
import { useFocusTrap } from "../../hooks/use-focus-trap";
import { useOutsideClick } from "../../hooks/use-outside-click";
import { getFirstFocusable } from "../../utils/focus";

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function PopoverContent({ children, onKeyDown, ...props }: PopoverContentProps) {
  const { isOpen, onClose, popoverId, refs, floatingStyles } = usePopoverContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Sync floating-ui ref with our local ref
  const setRefs = (el: HTMLDivElement | null) => {
    (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    refs.setFloating(el);
  };

  useFocusTrap(contentRef, isOpen);
  useOutsideClick(contentRef, onClose, isOpen);

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

  if (!isOpen) return null;

  return (
    <div
      ref={setRefs}
      id={popoverId}
      style={floatingStyles}
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
