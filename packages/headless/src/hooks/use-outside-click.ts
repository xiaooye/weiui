import { useEffect, useRef } from "react";

export function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
  active: boolean,
): void {
  // Keep the latest handler in a ref so callers can pass inline functions
  // without causing the document listener to be re-attached every render.
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!active) return;

    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handlerRef.current();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, active]);
}
