import { type ReactNode } from "react";

export interface ComboboxEmptyProps {
  children: ReactNode;
}

export function ComboboxEmpty({ children }: ComboboxEmptyProps) {
  return <div role="presentation">{children}</div>;
}
