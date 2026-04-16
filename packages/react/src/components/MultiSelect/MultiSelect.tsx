"use client";
import { forwardRef, useState, useRef, useId } from "react";
import { cn } from "../../utils/cn";
import { useOutsideClick } from "@weiui/headless";

export interface MultiSelectProps {
  options: { value: string; label: string }[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      options,
      value: controlled,
      defaultValue = [],
      onChange,
      placeholder = "Select...",
      disabled,
      className,
      label,
    },
    ref,
  ) => {
    const [internal, setInternal] = useState(defaultValue);
    const selected = controlled ?? internal;
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

    useOutsideClick(containerRef, () => setIsOpen(false), isOpen);

    const setSelected = (next: string[]) => {
      if (controlled === undefined) setInternal(next);
      onChange?.(next);
    };

    const toggle = (val: string) => {
      setSelected(
        selected.includes(val)
          ? selected.filter((v) => v !== val)
          : [...selected, val],
      );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(0);
          } else {
            setHighlightedIndex((p) => Math.min(p + 1, options.length - 1));
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((p) => Math.max(p - 1, 0));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0 && options[highlightedIndex]) {
            toggle(options[highlightedIndex].value);
          } else if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(0);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    };

    const activeDescendant =
      isOpen && highlightedIndex >= 0 && options[highlightedIndex]
        ? `${listboxId}-opt-${highlightedIndex}`
        : undefined;

    return (
      <div
        ref={ref}
        className={cn("wui-multi-select", className)}
        data-disabled={disabled || undefined}
      >
        <div ref={containerRef}>
          <div
            className="wui-multi-select__trigger"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={activeDescendant}
            aria-label={label}
            tabIndex={disabled ? -1 : 0}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
          >
            {selected.length > 0 ? (
              selected.map((val) => {
                const opt = options.find((o) => o.value === val);
                return (
                  <span key={val} className="wui-multi-select__tag">
                    {opt?.label ?? val}
                    <button
                      type="button"
                      className="wui-multi-select__tag-remove"
                      aria-label={`Remove ${opt?.label ?? val}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(selected.filter((v) => v !== val));
                      }}
                      tabIndex={-1}
                    >
                      &times;
                    </button>
                  </span>
                );
              })
            ) : (
              <span className="wui-multi-select__placeholder">{placeholder}</span>
            )}
          </div>
          {isOpen && (
            <div
              className="wui-multi-select__dropdown"
              role="listbox"
              id={listboxId}
              aria-multiselectable="true"
            >
              {options.map((opt, i) => (
                <div
                  key={opt.value}
                  id={`${listboxId}-opt-${i}`}
                  className="wui-multi-select__option"
                  role="option"
                  aria-selected={selected.includes(opt.value)}
                  data-selected={selected.includes(opt.value) || undefined}
                  data-highlighted={highlightedIndex === i || undefined}
                  onClick={() => toggle(opt.value)}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);
MultiSelect.displayName = "MultiSelect";
