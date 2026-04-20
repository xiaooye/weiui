import { useEffect } from "react";
import type { TreeAction, ComponentNode } from "./tree";
import { useInteractionManager } from "./interaction-manager";
import { nextSelection, keyToNavKey } from "./keyboard-nav";
import { findNode, findPath } from "./tree-path";

export interface UseComposerShortcutsArgs {
  tree: ComponentNode[];
  dispatch: (action: TreeAction) => void;
  onCopy: () => void;
  onPaste: () => void;
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

export function useComposerShortcuts({
  tree,
  dispatch,
  onCopy,
  onPaste,
}: UseComposerShortcutsArgs): void {
  const im = useInteractionManager();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const mod = e.ctrlKey || e.metaKey;

      if (e.key === "Escape") {
        if (im.state.commandPaletteOpen) im.closeCommandPalette();
        else im.clearSelection();
        return;
      }

      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        im.openShortcutHelp();
        return;
      }

      const navKey = keyToNavKey(e);
      if (navKey) {
        e.preventDefault();
        const next = nextSelection(tree, im.state.selection.primary, navKey);
        if (next) im.select(next, "replace");
        return;
      }

      const primary = im.state.selection.primary;
      if (primary && (e.key === "Delete" || e.key === "Backspace")) {
        e.preventDefault();
        for (const id of im.state.selection.all) {
          dispatch({ type: "DELETE", nodeId: id });
        }
        im.clearSelection();
        return;
      }

      if (mod && e.key.toLowerCase() === "d" && primary) {
        e.preventDefault();
        for (const id of im.state.selection.all) {
          dispatch({ type: "DUPLICATE", nodeId: id });
        }
        return;
      }
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "UNDO" });
        return;
      }
      if (
        (mod && e.shiftKey && e.key.toLowerCase() === "z") ||
        (mod && e.key.toLowerCase() === "y")
      ) {
        e.preventDefault();
        dispatch({ type: "REDO" });
        return;
      }
      if (mod && e.key.toLowerCase() === "c" && primary) {
        e.preventDefault();
        onCopy();
        return;
      }
      if (mod && e.key.toLowerCase() === "v") {
        e.preventDefault();
        onPaste();
        return;
      }
      if (mod && e.key.toLowerCase() === "p") {
        e.preventDefault();
        im.setPreviewMode(!im.state.previewMode);
        return;
      }
      if (mod && e.key.toLowerCase() === "a" && primary) {
        e.preventDefault();
        const path = findPath(tree, primary);
        if (path) {
          const siblings = path.parentId
            ? (findNode(tree, path.parentId)?.children ?? [])
            : tree;
          for (const s of siblings) im.select(s.id, "add");
        }
        return;
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [tree, dispatch, onCopy, onPaste, im]);
}
