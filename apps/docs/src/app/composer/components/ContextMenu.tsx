"use client";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@weiui/react";
import { useEffect, useRef } from "react";
import { useInteractionManager } from "../lib/interaction-manager";

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
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Programmatically click the invisible trigger on mount to open the Menu.
  useEffect(() => {
    triggerRef.current?.click();
  }, []);

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
      if (triggerRef.current && triggerRef.current.contains(target)) return;
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
  }, [onClose]);

  const select = (fn: () => void) => () => {
    fn();
    onClose();
  };

  // The trigger is an invisible fixed-position button so the floating-ui
  // anchor lives at the pointer.
  const triggerStyle: React.CSSProperties = {
    position: "fixed",
    top: `${y}px`,
    left: `${x}px`,
    width: 0,
    height: 0,
    padding: 0,
    margin: 0,
    border: 0,
    background: "transparent",
    pointerEvents: "none",
    opacity: 0,
  };

  return (
    <Menu side="bottom" align="start">
      <MenuTrigger
        ref={triggerRef}
        aria-hidden="true"
        tabIndex={-1}
        style={triggerStyle}
      >
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
