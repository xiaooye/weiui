"use client";
import {
  createContext,
  useContext,
  forwardRef,
  useRef,
  useEffect,
  type ReactNode,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
} from "react";
import { useDisclosure, useFocusTrap, useOutsideClick, useId, getFirstFocusable, type UseDisclosureProps } from "@weiui/headless";
import { Portal } from "../Portal";
import { cn } from "../../utils/cn";

interface DialogContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  titleId: string;
  descriptionId: string;
  contentId: string;
  triggerId: string;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("Dialog compound components must be used within <Dialog>");
  return ctx;
}

export interface DialogProps extends UseDisclosureProps {
  children: ReactNode;
}

export function Dialog({ children, ...disclosureProps }: DialogProps) {
  const { isOpen, onOpen, onClose } = useDisclosure(disclosureProps);
  const baseId = useId("dialog");

  return (
    <DialogContext.Provider
      value={{
        isOpen,
        onOpen,
        onClose,
        titleId: `${baseId}-title`,
        descriptionId: `${baseId}-desc`,
        contentId: `${baseId}-content`,
        triggerId: `${baseId}-trigger`,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ children, onClick, ...props }, ref) => {
    const { onOpen, isOpen, contentId, triggerId } = useDialogContext();

    return (
      <button
        ref={ref}
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
  },
);
DialogTrigger.displayName = "DialogTrigger";

export interface DialogOverlayProps extends HTMLAttributes<HTMLDivElement> {}

export const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("wui-dialog__overlay", className)} aria-hidden="true" {...props} />
  ),
);
DialogOverlay.displayName = "DialogOverlay";

export type DialogSize = "sm" | "md" | "lg" | "full";

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: DialogSize;
}

export function DialogContent({ children, className, onKeyDown, size = "md", ...props }: DialogContentProps) {
  const { isOpen, onClose, contentId, titleId, descriptionId } = useDialogContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useFocusTrap(contentRef, isOpen);
  useOutsideClick(contentRef, onClose, isOpen);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const firstFocusable = contentRef.current && getFirstFocusable(contentRef.current);
      if (firstFocusable) firstFocusable.focus();
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = original; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      <DialogOverlay />
      <div
        ref={contentRef}
        id={contentId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn("wui-dialog__content", `wui-dialog__content--${size}`, className)}
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
    </Portal>
  );
}

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function DialogTitle({ children, ...props }: DialogTitleProps) {
  const { titleId } = useDialogContext();
  return <h2 id={titleId} {...props}>{children}</h2>;
}

export interface DialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function DialogDescription({ children, ...props }: DialogDescriptionProps) {
  const { descriptionId } = useDialogContext();
  return <p id={descriptionId} {...props}>{children}</p>;
}

export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ children, onClick, ...props }, ref) => {
    const { onClose } = useDialogContext();
    return (
      <button
        ref={ref}
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
  },
);
DialogClose.displayName = "DialogClose";
