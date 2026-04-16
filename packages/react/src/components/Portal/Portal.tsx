"use client";
import { type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface PortalProps {
  children: ReactNode;
  container?: HTMLElement;
}

export function Portal({ children, container }: PortalProps) {
  if (typeof document === "undefined") return null;
  return createPortal(children, container || document.body);
}
