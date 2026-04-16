"use client";
import { type HTMLAttributes } from "react";

export interface MenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

export function MenuSeparator({ ...props }: MenuSeparatorProps) {
  return <div role="separator" {...props} />;
}

MenuSeparator.isSeparator = true;
