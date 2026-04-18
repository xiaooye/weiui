"use client";
import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  type ReactNode,
} from "react";
import { useFocusTrap } from "@weiui/headless";
import { Portal } from "../Portal";
import { cn } from "../../utils/cn";

export interface CommandItem {
  id: string;
  label: string;
  group?: string;
  shortcut?: string;
  disabled?: boolean;
  icon?: ReactNode;
  onSelect?: () => void;
}

export interface CommandPaletteProps {
  items: CommandItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  emptyText?: string;
  emptyState?: ReactNode;
  className?: string;
  label?: string;
  /** Persistent identifier for recent-items storage. */
  id?: string;
}

function readRecent(storageKey: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeRecent(storageKey: string, ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(ids.slice(0, 5)));
  } catch {
    // no-op
  }
}

export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
  (
    {
      items,
      open: controlledOpen,
      onOpenChange,
      placeholder = "Type a command or search...",
      emptyText = "No results found.",
      emptyState,
      className,
      label,
      id: paletteId,
    },
    _ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = controlledOpen ?? internalOpen;
    const setOpen = useCallback(
      (v: boolean) => {
        if (controlledOpen === undefined) setInternalOpen(v);
        onOpenChange?.(v);
      },
      [controlledOpen, onOpenChange],
    );

    const [query, setQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [recentIds, setRecentIds] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const listboxId = useId();

    const storageKey = paletteId ? `wui-cp-recent-${paletteId}` : null;

    // Focus trap keeps Tab inside the dialog
    useFocusTrap(dialogRef, isOpen);

    // Load recent IDs when opened
    useEffect(() => {
      if (isOpen && storageKey) {
        setRecentIds(readRecent(storageKey));
      }
    }, [isOpen, storageKey]);

    const filtered = items.filter(
      (item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.group?.toLowerCase().includes(query.toLowerCase()),
    );

    // Build recent items list (only when input is empty)
    const isInputEmpty = query.trim() === "";
    const recentItems = isInputEmpty && recentIds.length > 0
      ? (recentIds
          .map((id) => items.find((it) => it.id === id))
          .filter((it): it is CommandItem => Boolean(it)))
      : [];

    // Flatten for keyboard nav: recents first (if shown), then rest of filtered
    // (deduped against recents).
    const recentSet = new Set(recentItems.map((it) => it.id));
    const restItems = filtered.filter((it) => !recentSet.has(it.id));
    const flatItems = [...recentItems, ...restItems];

    // Group the non-recent items
    const groups = new Map<string, CommandItem[]>();
    for (const item of restItems) {
      const group = item.group || "";
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(item);
    }

    useEffect(() => {
      if (isOpen) {
        previousFocusRef.current = document.activeElement as HTMLElement;
        setQuery("");
        setHighlightedIndex(0);
        requestAnimationFrame(() => inputRef.current?.focus());
      } else if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }, [isOpen]);

    useEffect(() => {
      const handleGlobalKey = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          setOpen(!isOpen);
        }
      };
      document.addEventListener("keydown", handleGlobalKey);
      return () => document.removeEventListener("keydown", handleGlobalKey);
    }, [isOpen, setOpen]);

    const selectItem = useCallback(
      (item: CommandItem) => {
        if (item.disabled) return;
        item.onSelect?.();
        if (storageKey) {
          const next = [item.id, ...recentIds.filter((x) => x !== item.id)].slice(0, 5);
          setRecentIds(next);
          writeRecent(storageKey, next);
        }
        setOpen(false);
      },
      [recentIds, setOpen, storageKey],
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((p) => {
            let next = p + 1;
            while (next < flatItems.length && flatItems[next]?.disabled) next++;
            return next < flatItems.length ? next : p;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((p) => {
            let next = p - 1;
            while (next >= 0 && flatItems[next]?.disabled) next--;
            return next >= 0 ? next : p;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (flatItems[highlightedIndex] && !flatItems[highlightedIndex]?.disabled) {
            selectItem(flatItems[highlightedIndex]!);
          }
          break;
        case "Escape":
          setOpen(false);
          break;
      }
    };

    if (!isOpen) return null;

    const activeDescendant = flatItems[highlightedIndex]
      ? `${listboxId}-item-${flatItems[highlightedIndex].id}`
      : undefined;

    const hasAnyResults = flatItems.length > 0;

    function renderItem(item: CommandItem) {
      const flatIdx = flatItems.indexOf(item);
      return (
        <div
          key={item.id}
          id={`${listboxId}-item-${item.id}`}
          className="wui-command__item"
          role="option"
          aria-selected={flatIdx === highlightedIndex}
          aria-disabled={item.disabled || undefined}
          data-highlighted={flatIdx === highlightedIndex || undefined}
          data-disabled={item.disabled || undefined}
          onClick={() => {
            if (!item.disabled) selectItem(item);
          }}
        >
          {item.icon && (
            <span className="wui-command__item-icon" aria-hidden="true">
              {item.icon}
            </span>
          )}
          <span className="wui-command__item-label">{item.label}</span>
          {item.shortcut && <span className="wui-command__item-shortcut">{item.shortcut}</span>}
        </div>
      );
    }

    return (
      <Portal>
        <div
          className="wui-command-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          role="presentation"
        >
          <div
            ref={dialogRef}
            className={cn("wui-command", className)}
            role="dialog"
            aria-label={label || "Command palette"}
            aria-modal="true"
          >
            <div className="wui-command__input-wrapper">
              <span className="wui-command__icon" aria-hidden="true">
                &#x2315;
              </span>
              <input
                ref={inputRef}
                className="wui-command__input"
                placeholder={placeholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                role="combobox"
                aria-expanded={true}
                aria-controls={listboxId}
                aria-activedescendant={activeDescendant}
                aria-autocomplete="list"
              />
            </div>
            <div className="wui-command__list" role="listbox" id={listboxId}>
              {hasAnyResults ? (
                <>
                  {recentItems.length > 0 && (
                    <div role="group" aria-label="Recent">
                      <div className="wui-command__group-label">Recent</div>
                      {recentItems.map((item) => renderItem(item))}
                    </div>
                  )}
                  {Array.from(groups.entries()).map(([groupName, groupItems]) => (
                    <div key={groupName} role="group" aria-label={groupName || undefined}>
                      {groupName && <div className="wui-command__group-label">{groupName}</div>}
                      {groupItems.map((item) => renderItem(item))}
                    </div>
                  ))}
                </>
              ) : emptyState ? (
                emptyState
              ) : (
                <div className="wui-command__empty">{emptyText}</div>
              )}
            </div>
          </div>
        </div>
      </Portal>
    );
  },
);
CommandPalette.displayName = "CommandPalette";
