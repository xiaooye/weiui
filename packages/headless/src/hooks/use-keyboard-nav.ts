import { useState, useCallback } from "react";
import { Keys } from "../utils/keyboard";

export interface UseKeyboardNavProps {
  itemCount: number;
  orientation?: "horizontal" | "vertical";
  loop?: boolean;
  onSelect?: (index: number) => void;
}

export interface UseKeyboardNavReturn {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  getItemProps: (index: number) => {
    tabIndex: number;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
}

export function useKeyboardNav(props: UseKeyboardNavProps): UseKeyboardNavReturn {
  const { itemCount, orientation = "vertical", loop = true, onSelect } = props;
  const [activeIndex, setActiveIndex] = useState(0);

  const next = orientation === "vertical" ? Keys.ArrowDown : Keys.ArrowRight;
  const prev = orientation === "vertical" ? Keys.ArrowUp : Keys.ArrowLeft;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newIndex = activeIndex;

      switch (e.key) {
        case next:
          e.preventDefault();
          newIndex = activeIndex + 1;
          if (newIndex >= itemCount) newIndex = loop ? 0 : itemCount - 1;
          break;
        case prev:
          e.preventDefault();
          newIndex = activeIndex - 1;
          if (newIndex < 0) newIndex = loop ? itemCount - 1 : 0;
          break;
        case Keys.Home:
          e.preventDefault();
          newIndex = 0;
          break;
        case Keys.End:
          e.preventDefault();
          newIndex = itemCount - 1;
          break;
        case Keys.Enter:
        case Keys.Space:
          e.preventDefault();
          onSelect?.(activeIndex);
          return;
        default:
          return;
      }

      setActiveIndex(newIndex);
    },
    [activeIndex, itemCount, loop, next, prev, onSelect],
  );

  const getItemProps = useCallback(
    (index: number) => ({
      tabIndex: index === activeIndex ? 0 : -1,
      onKeyDown: handleKeyDown,
    }),
    [activeIndex, handleKeyDown],
  );

  return { activeIndex, setActiveIndex, getItemProps };
}
