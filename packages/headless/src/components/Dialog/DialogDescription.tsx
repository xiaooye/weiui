import { type ReactNode, type HTMLAttributes } from "react";
import { useDialogContext } from "./DialogContext";

export interface DialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function DialogDescription({ children, ...props }: DialogDescriptionProps) {
  const { descriptionId } = useDialogContext();
  return <p id={descriptionId} data-civaria-component="dialog" data-part="description" {...props}>{children}</p>;
}
