"use client";
import { type ReactNode } from "react";
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/react";
import { useDisclosure } from "../../hooks/use-disclosure";
import { useId } from "../../hooks/use-id";
import { PopoverContext } from "./PopoverContext";

export interface PopoverProps {
  children: ReactNode;
}

export function Popover({ children }: PopoverProps) {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const baseId = useId("popover");
  const popoverId = `${baseId}-content`;
  const triggerId = `${baseId}-trigger`;

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: (open) => (open ? onOpen() : onClose()),
    placement: "bottom-start",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  return (
    <PopoverContext.Provider
      value={{ isOpen, onOpen, onClose, onToggle, popoverId, triggerId, refs, floatingStyles }}
    >
      {children}
    </PopoverContext.Provider>
  );
}
