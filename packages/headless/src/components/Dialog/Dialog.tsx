"use client";
import { type ReactNode } from "react";
import { useDisclosure, type UseDisclosureProps } from "../../hooks/use-disclosure";
import { useId } from "../../hooks/use-id";
import { DialogContext } from "./DialogContext";

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
