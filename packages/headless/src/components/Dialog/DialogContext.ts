import { createContext, useContext } from "react";

export interface DialogContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  titleId: string;
  descriptionId: string;
  contentId: string;
  triggerId: string;
}

export const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialogContext(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("Dialog compound components must be used within <Dialog>");
  return ctx;
}
