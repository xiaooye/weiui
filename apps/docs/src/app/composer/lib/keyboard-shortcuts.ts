import { useEffect } from "react";
import type { TreeAction } from "./tree";

export interface ShortcutHandlers {
  selectedId: string | null;
  dispatch: (action: TreeAction) => void;
  onDeselect: () => void;
}

function isTypingInInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

export function useComposerShortcuts({
  selectedId,
  dispatch,
  onDeselect,
}: ShortcutHandlers): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingInInput(e.target)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (e.key === "Escape") {
        onDeselect();
        return;
      }
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "UNDO" });
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch({ type: "REDO" });
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        // Windows-style redo
        e.preventDefault();
        dispatch({ type: "REDO" });
        return;
      }
      if (!selectedId) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        dispatch({ type: "DELETE", nodeId: selectedId });
        onDeselect();
        return;
      }
      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        dispatch({ type: "DUPLICATE", nodeId: selectedId });
        return;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedId, dispatch, onDeselect]);
}
