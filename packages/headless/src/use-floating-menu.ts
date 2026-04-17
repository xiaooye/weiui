"use client";

import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  type Placement,
  type UseFloatingReturn,
} from "@floating-ui/react";

export interface UseFloatingMenuOptions {
  open: boolean;
  placement?: Placement;
  offsetPx?: number;
  collisionPadding?: number;
}

export function useFloatingMenu(options: UseFloatingMenuOptions): UseFloatingReturn {
  const { open, placement = "bottom-start", offsetPx = 4, collisionPadding = 8 } = options;
  return useFloating({
    open,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(offsetPx), flip({ padding: collisionPadding }), shift({ padding: collisionPadding })],
  });
}
