"use client";
import { forwardRef, useState, useRef, useId } from "react";
import { cn } from "../../utils/cn";
import { useOutsideClick } from "@weiui/headless";

export interface AutoCompleteProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  onInputChange?: (input: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  emptyText?: string;
  label?: string;
}

export const AutoComplete = forwardRef<HTMLDivElement, AutoCompleteProps>(
  (
    {
      options,
      value,
      onChange,
      onInputChange,
      placeholder,
      disabled,
      className,
      emptyText = "No results",
      label,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(
      () => options.find((o) => o.value === value)?.label ?? "",
    );
    const [selectedValue, setSelectedValue] = useState(value ?? "");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

    useOutsideClick(containerRef, () => setIsOpen(false), isOpen);

    const filtered = options.filter((o) =>
      o.label.toLowerCase().includes(inputValue.toLowerCase()),
    );

    const handleSelect = (opt: { value: string; label: string }) => {
      setSelectedValue(opt.value);
      setInputValue(opt.label);
      setIsOpen(false);
      setHighlightedIndex(-1);
      onChange?.(opt.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(0);
          } else {
            setHighlightedIndex((prev) =>
              Math.min(prev + 1, filtered.length - 1),
            );
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0 && filtered[highlightedIndex]) {
            handleSelect(filtered[highlightedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    };

    const activeDescendant =
      isOpen && highlightedIndex >= 0 && filtered[highlightedIndex]
        ? `${listboxId}-opt-${highlightedIndex}`
        : undefined;

    return (
      <div
        ref={ref}
        className={cn("wui-autocomplete", className)}
        data-disabled={disabled || undefined}
      >
        <div ref={containerRef}>
          <input
            className="wui-autocomplete__input"
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={activeDescendant}
            aria-label={label}
            onChange={(e) => {
              setInputValue(e.target.value);
              onInputChange?.(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {isOpen && (
            <div className="wui-autocomplete__list" role="listbox" id={listboxId}>
              {filtered.length > 0 ? (
                filtered.map((opt, i) => (
                  <div
                    key={opt.value}
                    id={`${listboxId}-opt-${i}`}
                    className="wui-autocomplete__item"
                    role="option"
                    aria-selected={selectedValue === opt.value}
                    data-selected={selectedValue === opt.value || undefined}
                    data-highlighted={highlightedIndex === i || undefined}
                    onClick={() => handleSelect(opt)}
                  >
                    {opt.label}
                  </div>
                ))
              ) : (
                <div className="wui-autocomplete__empty">{emptyText}</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);
AutoComplete.displayName = "AutoComplete";
