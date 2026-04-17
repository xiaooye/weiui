import { useEffect } from "react";

/**
 * Invoke `handler` when a mousedown fires outside `ref`. An optional `ignoreRef`
 * whitelists additional regions (e.g. a trigger button when the content is portaled).
 */
export function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
  active: boolean,
  ignoreRef?: React.RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!active) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (ref.current && ref.current.contains(target)) return;
      if (ignoreRef?.current && ignoreRef.current.contains(target)) return;
      handler();
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, handler, active, ignoreRef]);
}
