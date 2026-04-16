import { type ReactNode, type HTMLAttributes, type KeyboardEvent } from "react";

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function TabsList({ children, onKeyDown, ...props }: TabsListProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const navKeys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (navKeys.includes(e.key)) {
      const tabs = Array.from(
        e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])'),
      );
      if (tabs.length === 0) return;
      const current = tabs.indexOf(document.activeElement as HTMLElement);
      if (current === -1) return;
      e.preventDefault();
      let next = current;
      if (e.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
      else if (e.key === "ArrowRight") next = (current + 1) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      const target = tabs[next];
      if (target) {
        target.focus();
        target.click();
      }
    }
    onKeyDown?.(e);
  };

  return (
    <div role="tablist" onKeyDown={handleKeyDown} {...props}>
      {children}
    </div>
  );
}
