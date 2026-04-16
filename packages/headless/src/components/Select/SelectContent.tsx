"use client";
import {
  type ReactNode,
  type HTMLAttributes,
  type ReactElement,
  useRef,
  useEffect,
  Children,
  isValidElement,
  cloneElement,
} from "react";
import { useSelectContext } from "./SelectContext";
import { useOutsideClick } from "../../hooks/use-outside-click";
import { Keys } from "../../utils/keyboard";

export interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function SelectContent({ children, onKeyDown, ...props }: SelectContentProps) {
  const {
    isOpen,
    onClose,
    listboxId,
    triggerId,
    baseId,
    highlightedIndex,
    setHighlightedIndex,
  } = useSelectContext();
  const contentRef = useRef<HTMLDivElement>(null);

  useOutsideClick(contentRef, onClose, isOpen);

  let itemIndex = 0;
  const indexedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const index = itemIndex++;
    return cloneElement(child as ReactElement<{ _selectIndex?: number }>, {
      _selectIndex: index,
    });
  });
  const itemCount = itemIndex;

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus();
      setHighlightedIndex(0);
    }
  }, [isOpen, setHighlightedIndex]);

  if (!isOpen) return null;

  const activeDescendant =
    highlightedIndex >= 0 ? `${baseId}-item-${highlightedIndex}` : undefined;

  return (
    <div
      ref={contentRef}
      id={listboxId}
      role="listbox"
      aria-labelledby={triggerId}
      aria-activedescendant={activeDescendant}
      tabIndex={-1}
      onKeyDown={(e) => {
        switch (e.key) {
          case Keys.Escape:
            e.preventDefault();
            onClose();
            break;
          case Keys.ArrowDown:
            e.preventDefault();
            setHighlightedIndex(itemCount === 0 ? 0 : (highlightedIndex + 1) % itemCount);
            break;
          case Keys.ArrowUp:
            e.preventDefault();
            setHighlightedIndex(
              itemCount === 0 ? 0 : (highlightedIndex - 1 + itemCount) % itemCount,
            );
            break;
          case Keys.Home:
            e.preventDefault();
            setHighlightedIndex(0);
            break;
          case Keys.End:
            e.preventDefault();
            setHighlightedIndex(itemCount - 1);
            break;
          case Keys.Enter:
          case Keys.Space: {
            e.preventDefault();
            const item = contentRef.current?.querySelector<HTMLElement>(
              `[data-select-index="${highlightedIndex}"]`,
            );
            item?.click();
            break;
          }
          default:
            break;
        }
        onKeyDown?.(e);
      }}
      {...props}
    >
      {indexedChildren}
    </div>
  );
}
