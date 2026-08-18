import { type ReactNode, type HTMLAttributes } from "react";
import { useDialogContext } from "./DialogContext";

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function DialogTitle({ children, ...props }: DialogTitleProps) {
  const { titleId } = useDialogContext();
  return <h2 id={titleId} data-wui-component="dialog" data-part="title" {...props}>{children}</h2>;
}
