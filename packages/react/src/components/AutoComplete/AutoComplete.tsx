"use client";
import { forwardRef, useRef, useId, useState, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { useControllable, useOutsideClick, useFloatingMenu } from "@weiui/headless";

export interface AutoCompleteOption {
  value: string;
  label: string;
}

export interface AutoCompleteProps {
  /** Options shown in the suggestion list. */
  options: AutoCompleteOption[];
  /** Controlled selected value. Pair with onChange. */
  value?: string;
  /** Initial selected value for uncontrolled mode. */
  defaultValue?: string;
  /** Called when the selected value changes. */
  onChange?: (value: string) => void;
  /** Controlled input text. */
  inputValue?: string;
  /** Uncontrolled default input text. */
  defaultInputValue?: string;
  /** Called when the input text changes. */
  onInputChange?: (input: string) => void;
  /** Controlled open state of the suggestion list. */
  open?: boolean;
  /** Fires when the open state should change. */
  onOpenChange?: (open: boolean) => void;
  /** Custom predicate replacing the default substring filter. */
  filter?: (query: string, option: AutoCompleteOption) => boolean;
  /** Custom rendering per option. */
  renderOption?: (option: AutoCompleteOption) => ReactNode;
  /** Replaces the default empty message. */
  emptyState?: ReactNode;
  /** Shows an inline clear button when the input has content. */
  clearable?: boolean;
  /** Allows the combobox to accept values not in the option list. */
  allowsCustomValue?: boolean;
  /** Placeholder text shown when empty. */
  placeholder?: string;
  /** Disables interaction and applies the disabled styling. */
  disabled?: boolean;
  /** Additional CSS classes merged onto the root element. */
  className?: string;
  /** Text displayed when no options match. */
  emptyText?: string;
  /** Accessible label for the combobox. */
  label?: string;
  /** Shows a loading indicator in the suggestion list. */
  loading?: boolean;
}

export const AutoComplete = forwardRef<HTMLDivElement, AutoCompleteProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      inputValue,
      defaultInputValue,
      onInputChange,
      open,
      onOpenChange,
      filter,
      renderOption,
      emptyState,
      clearable,
      allowsCustomValue,
      placeholder,
      disabled,
      className,
      emptyText = "No results",
      label,
      loading,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useControllable<boolean>({
      value: open,
      defaultValue: false,
      onChange: onOpenChange,
    });
    const [textValue, setTextValue] = useControllable<string>({
      value: inputValue,
      defaultValue: defaultInputValue ?? options.find((o) => o.value === (value ?? defaultValue))?.label ?? "",
      onChange: onInputChange,
    });
    const [selectedValue, setSelectedValue] = useControllable<string>({
      value,
      defaultValue: defaultValue ?? "",
      onChange,
    });
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

    const { refs, floatingStyles } = useFloatingMenu({ open: isOpen });

    useOutsideClick(containerRef, () => setIsOpen(false), isOpen);

    const defaultFilter = (q: string, opt: AutoCompleteOption) =>
      opt.label.toLowerCase().includes(q.toLowerCase());
    const predicate = filter ?? defaultFilter;
    const filtered = options.filter((o) => predicate(textValue ?? "", o));

    const handleSelect = (opt: AutoCompleteOption) => {
      setSelectedValue(opt.value);
      setTextValue(opt.label);
      setIsOpen(false);
      setHighlightedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(0);
          } else {
            setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
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
          } else if (allowsCustomValue && textValue && textValue.length > 0) {
            setSelectedValue(textValue);
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    };

    const handleClear = () => {
      setTextValue("");
      setSelectedValue("");
    };

    const currentText = textValue ?? "";
    const showClear = clearable && currentText.length > 0 && !disabled;

    const activeDescendant =
      isOpen && highlightedIndex >= 0 && filtered[highlightedIndex]
        ? `${listboxId}-opt-${highlightedIndex}`
        : undefined;

    const renderEmpty = () => emptyState ?? <div className="wui-autocomplete__empty">{emptyText}</div>;

    return (
      <div ref={ref} className={cn("wui-autocomplete", className)} data-disabled={disabled || undefined}>
        <div ref={containerRef} className="wui-autocomplete__wrapper">
          <input
            ref={refs.setReference}
            className="wui-autocomplete__input"
            value={currentText}
            placeholder={placeholder}
            disabled={disabled}
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={activeDescendant}
            aria-label={label}
            onChange={(e) => {
              setTextValue(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {showClear && (
            <button
              type="button"
              aria-label="Clear"
              className="wui-autocomplete__clear"
              onClick={handleClear}
              tabIndex={-1}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
          {isOpen && (
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className="wui-autocomplete__list"
              role="listbox"
              id={listboxId}
            >
              {loading && (
                <div role="status" aria-live="polite" className="wui-autocomplete__loading">
                  Loading…
                </div>
              )}
              {!loading && filtered.length > 0 ? (
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
                    {renderOption ? renderOption(opt) : opt.label}
                  </div>
                ))
              ) : !loading ? (
                renderEmpty()
              ) : null}
            </div>
          )}
        </div>
      </div>
    );
  },
);
AutoComplete.displayName = "AutoComplete";
