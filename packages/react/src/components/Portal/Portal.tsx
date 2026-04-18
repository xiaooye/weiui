"use client";

import { type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface PortalProps {
  /** Content rendered into the portal target. */
  children: ReactNode;
  /** Portal target element. @default document.body */
  container?: Element | null;
}

export function Portal({ children, container }: PortalProps) {
  const target = container ?? (typeof document !== "undefined" ? document.body : null);
  if (!target) return null;
  return createPortal(children, target);
}
Portal.displayName = "Portal";
