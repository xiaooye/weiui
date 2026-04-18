"use client";

import type { MutableRefObject } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
  type Placement,
  type UseFloatingReturn,
} from "@floating-ui/react";

export interface UseFloatingMenuOptions {
  open: boolean;
  placement?: Placement;
  offsetPx?: number;
  collisionPadding?: number;
  /** Optional ref to an arrow element; if provided, arrow middleware is enabled. */
  arrowRef?: MutableRefObject<HTMLElement | null>;
}

export function useFloatingMenu(options: UseFloatingMenuOptions): UseFloatingReturn {
  const { open, placement = "bottom-start", offsetPx = 4, collisionPadding = 8, arrowRef } = options;
  const middleware = [
    offset(offsetPx),
    flip({ padding: collisionPadding }),
    shift({ padding: collisionPadding }),
  ];
  if (arrowRef) {
    middleware.push(arrow({ element: arrowRef }));
  }
  return useFloating({
    open,
    placement,
    whileElementsMounted: autoUpdate,
    middleware,
  });
}
