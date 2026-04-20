"use client";
import { useCallback, useRef, type RefObject } from "react";

export interface UseVirtualAnchorResult {
  /** Ref to attach to a <MenuTrigger>/<PopoverTrigger> invisible button. */
  anchorRef: RefObject<HTMLButtonElement | null>;
  /** Position the anchor at (x, y) and open the associated floating element
   *  by programmatically clicking the trigger. */
  openAt: (x: number, y: number) => void;
}

/**
 * Imperative helper for cursor-positioned floating surfaces (Menu, Popover).
 *
 * Attach `anchorRef` to an otherwise invisible trigger button, then call
 * `openAt(x, y)` to place the anchor in viewport coordinates and synthesize
 * a click on the trigger — floating-ui picks up the new reference rect and
 * positions the floating element at the pointer.
 */
export function useVirtualAnchor(): UseVirtualAnchorResult {
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const openAt = useCallback((x: number, y: number) => {
    const el = anchorRef.current;
    if (!el) return;
    Object.assign(el.style, {
      position: "fixed",
      top: `${y}px`,
      left: `${x}px`,
      width: "0px",
      height: "0px",
      pointerEvents: "none",
      opacity: "0",
      visibility: "hidden",
    });
    // Delay one tick so the Menu picks up the new coords before positioning.
    queueMicrotask(() => el.click());
  }, []);

  return { anchorRef, openAt };
}
