"use client";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@weiui/react";
import { useEffect } from "react";
import { useInteractionManager } from "../lib/interaction-manager";
import { useVirtualAnchor } from "../../../lib/virtual-anchor";

export type WrapKind = "Stack-row" | "Stack-column" | "Card";

export interface ContextMenuProps {
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSelectParent: () => void;
  onWrap: (kind: WrapKind) => void;
}

export function ContextMenu({
  onCopy,
  onPaste,
  onDelete,
  onDuplicate,
  onSelectParent,
  onWrap,
}: ContextMenuProps) {
  const im = useInteractionManager();
  const cm = im.state.contextMenu;

  if (!cm) return null;

  // Remount the menu on every open so its internal useDisclosure resets.
  const key = `${cm.id}:${cm.x}:${cm.y}`;

  return (
    <ContextMenuInner
      key={key}
      x={cm.x}
      y={cm.y}
      onCopy={onCopy}
      onPaste={onPaste}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onSelectParent={onSelectParent}
      onWrap={onWrap}
      onClose={im.closeContextMenu}
    />
  );
}

interface ContextMenuInnerProps extends ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

function ContextMenuInner({
  x,
  y,
  onCopy,
  onPaste,
  onDelete,
  onDuplicate,
  onSelectParent,
  onWrap,
  onClose,
}: ContextMenuInnerProps) {
  const { anchorRef, openAt } = useVirtualAnchor();

  // Viewport-aware clamping so the menu doesn't clip off-screen near edges.
  const MENU_W = 240;
  const MENU_H = 320;
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1440;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 900;
  const clampedX = Math.min(x, viewportW - MENU_W);
  const clampedY = Math.min(y, viewportH - 80);
  const side: "top" | "bottom" = y > viewportH - MENU_H ? "top" : "bottom";

  // Position the invisible anchor at the pointer and open the Menu.
  useEffect(() => {
    openAt(clampedX, clampedY);
  }, [clampedX, clampedY, openAt]);

  // Close our context-menu state on outside pointerdown or Escape, matching
  // the internal lifecycle of <Menu> so both stay in sync.
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node | null;
      if (!target) return;
      // Ignore clicks inside the menu portal (role="menu")
      const menuEl = document.querySelector<HTMLElement>('[role="menu"]');
      if (menuEl && menuEl.contains(target)) return;
      // Ignore clicks on our invisible trigger itself
      if (anchorRef.current && anchorRef.current.contains(target)) return;
      onClose();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, anchorRef]);

  const select = (fn: () => void) => () => {
    fn();
    onClose();
  };

  return (
    <Menu side={side} align="start">
      <MenuTrigger ref={anchorRef} aria-hidden="true" tabIndex={-1}>
        <span />
      </MenuTrigger>
      <MenuContent>
        <MenuItem shortcut="⌘D" onSelect={select(onDuplicate)}>
          Duplicate
        </MenuItem>
        <MenuItem shortcut="⌫" onSelect={select(onDelete)}>
          Delete
        </MenuItem>
        <MenuSeparator />
        <MenuItem onSelect={select(() => onWrap("Stack-row"))}>
          Wrap in Stack (row)
        </MenuItem>
        <MenuItem onSelect={select(() => onWrap("Stack-column"))}>
          Wrap in Stack (column)
        </MenuItem>
        <MenuItem onSelect={select(() => onWrap("Card"))}>
          Wrap in Card
        </MenuItem>
        <MenuSeparator />
        <MenuItem shortcut="⌘C" onSelect={select(onCopy)}>
          Copy
        </MenuItem>
        <MenuItem shortcut="⌘V" onSelect={select(onPaste)}>
          Paste
        </MenuItem>
        <MenuSeparator />
        <MenuItem shortcut="⌥↑" onSelect={select(onSelectParent)}>
          Select parent
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
