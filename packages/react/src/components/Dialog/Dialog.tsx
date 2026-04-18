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
import {
  useDisclosure,
  useFocusTrap,
  useId,
  getFirstFocusable,
  type UseDisclosureProps,
} from "@weiui/headless";
import { Portal } from "../Portal";
import { cn } from "../../utils/cn";

const DialogStackContext = createContext<number>(0);

interface DialogContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  titleId: string;
  descriptionId: string;
  contentId: string;
  triggerId: string;
  modal: boolean;
  depth: number;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("Dialog compound components must be used within <Dialog>");
  return ctx;
}

export interface DialogProps extends UseDisclosureProps {
  /** DialogTrigger / DialogContent / DialogOverlay sub-components. */
  children: ReactNode;
  /** When true, renders a modal overlay and traps focus inside the dialog. @default true */
  modal?: boolean;
}

export function Dialog({ children, modal = true, ...disclosureProps }: DialogProps) {
  const { isOpen, onOpen, onClose } = useDisclosure(disclosureProps);
  const baseId = useId("dialog");
  const parentDepth = useContext(DialogStackContext);
  const depth = parentDepth + 1;

  return (
    <DialogStackContext.Provider value={depth}>
      <DialogContext.Provider
        value={{
          isOpen,
          onOpen,
          onClose,
          titleId: `${baseId}-title`,
          descriptionId: `${baseId}-desc`,
          contentId: `${baseId}-content`,
          triggerId: `${baseId}-trigger`,
          modal,
          depth,
        }}
      >
        {children}
      </DialogContext.Provider>
    </DialogStackContext.Provider>
  );
}

export interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Trigger content (typically a `<Button>`). */
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
  ({ className, style, ...props }, ref) => {
    const ctx = useContext(DialogContext);
    const depth = ctx?.depth ?? 1;
    return (
      <div
        ref={ref}
        className={cn("wui-dialog__overlay", className)}
        style={{ zIndex: 50 + depth * 10, ...style }}
        aria-hidden="true"
        {...props}
      />
    );
  },
);
DialogOverlay.displayName = "DialogOverlay";

export type DialogSize = "sm" | "md" | "lg" | "full";

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Dialog body — typically includes `DialogTitle`, `DialogDescription`, and `DialogClose`. */
  children: ReactNode;
  /** Width preset for the dialog panel. @default "md" */
  size?: DialogSize;
  /** Called when a pointerdown fires outside the dialog content. Call `event.preventDefault()` to keep it open. */
  onInteractOutside?: (event: MouseEvent) => void;
  /** Called when Escape is pressed. Call `event.preventDefault()` to keep the dialog open. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

export function DialogContent({
  children,
  className,
  onKeyDown,
  size = "md",
  onInteractOutside,
  onEscapeKeyDown,
  style,
  ...props
}: DialogContentProps) {
  const { isOpen, onClose, contentId, titleId, descriptionId, modal, depth } = useDialogContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useFocusTrap(contentRef, isOpen && modal);

  // Custom outside-click with onInteractOutside preventable
  useEffect(() => {
    if (!isOpen) return;
    function handler(e: MouseEvent) {
      if (!contentRef.current) return;
      if (contentRef.current.contains(e.target as Node)) return;
      const ev = new Event("interactoutside", { cancelable: true });
      Object.defineProperty(ev, "target", { value: e.target });
      onInteractOutside?.(ev as unknown as MouseEvent);
      if (!ev.defaultPrevented) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose, onInteractOutside]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const firstFocusable = contentRef.current && getFirstFocusable(contentRef.current);
      if (firstFocusable) {
        firstFocusable.focus();
      } else if (contentRef.current) {
        // Fallback: focus the dialog itself so Escape/keydown reaches it
        contentRef.current.focus();
      }
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && modal) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen, modal]);

  if (!isOpen) return null;

  return (
    <Portal>
      {modal && <DialogOverlay />}
      <div
        ref={contentRef}
        id={contentId}
        role="dialog"
        aria-modal={modal || undefined}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn("wui-dialog__content", `wui-dialog__content--${size}`, className)}
        style={{ zIndex: 51 + depth * 10, ...style }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            const ev = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
            onEscapeKeyDown?.(ev);
            if (!ev.defaultPrevented) {
              e.stopPropagation();
              onClose();
            }
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
  /** Title text. Rendered in an `<h2>` wired to the dialog's `aria-labelledby`. */
  children: ReactNode;
}

export function DialogTitle({ children, ...props }: DialogTitleProps) {
  const { titleId } = useDialogContext();
  return <h2 id={titleId} {...props}>{children}</h2>;
}

export interface DialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Description text. Rendered in a `<p>` wired to the dialog's `aria-describedby`. */
  children: ReactNode;
}

export function DialogDescription({ children, ...props }: DialogDescriptionProps) {
  const { descriptionId } = useDialogContext();
  return <p id={descriptionId} {...props}>{children}</p>;
}

export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button content (text or icon). */
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
