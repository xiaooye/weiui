"use client";
import { forwardRef, useState, useRef, useEffect, useId, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface CommandItem {
  id: string;
  label: string;
  group?: string;
  shortcut?: string;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface CommandPaletteProps {
  items: CommandItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  label?: string;
}

export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
  (
    {
      items,
      open: controlledOpen,
      onOpenChange,
      placeholder = "Type a command or search...",
      emptyText = "No results found.",
      className,
      label,
    },
    ref,
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
    const inputRef = useRef<HTMLInputElement>(null);
    const listboxId = useId();

    const filtered = items.filter(
      (item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.group?.toLowerCase().includes(query.toLowerCase()),
    );

    // Group items
    const groups = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const group = item.group || "";
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(item);
    }

    // Flatten for keyboard nav indexing
    const flatItems = filtered;

    useEffect(() => {
      if (isOpen) {
        setQuery("");
        setHighlightedIndex(0);
        inputRef.current?.focus();
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
            flatItems[highlightedIndex]?.onSelect?.();
            setOpen(false);
          }
          break;
        case "Escape":
          setOpen(false);
          break;
      }
    };

    if (!isOpen) return null;

    const activeDescendant =
      flatItems[highlightedIndex]
        ? `${listboxId}-item-${flatItems[highlightedIndex].id}`
        : undefined;

    return (
      <div
        className="wui-command-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
        role="presentation"
      >
        <div
          ref={ref}
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
            {flatItems.length > 0 ? (
              Array.from(groups.entries()).map(([groupName, groupItems]) => (
                <div key={groupName} role="group" aria-label={groupName || undefined}>
                  {groupName && (
                    <div className="wui-command__group-label">{groupName}</div>
                  )}
                  {groupItems.map((item) => {
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
                          if (!item.disabled) {
                            item.onSelect?.();
                            setOpen(false);
                          }
                        }}
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span className="wui-command__item-shortcut">{item.shortcut}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="wui-command__empty">{emptyText}</div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
CommandPalette.displayName = "CommandPalette";
