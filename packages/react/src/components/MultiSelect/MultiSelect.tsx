"use client";
import { Fragment, forwardRef, useState, useRef, useId } from "react";
import { cn } from "../../utils/cn";
import { useOutsideClick, useFloatingMenu } from "@weiui/headless";
import { Spinner } from "../Spinner/Spinner";

export interface MultiSelectOption {
  value: string;
  label: string;
  /** Group name — pair with `grouped` prop on the root to render group headings. */
  group?: string;
  /** When true, the option is not selectable and is skipped during keyboard navigation. */
  disabled?: boolean;
}

export interface MultiSelectProps {
  /** Options shown in the dropdown list. */
  options: MultiSelectOption[];
  /** Controlled selected values. Pair with onChange. */
  value?: string[];
  /** Initial selected values for uncontrolled mode. */
  defaultValue?: string[];
  /** Called when the selection changes. */
  onChange?: (value: string[]) => void;
  /** Placeholder text shown when empty. */
  placeholder?: string;
  /** Disables interaction and applies the disabled styling. */
  disabled?: boolean;
  /** Additional CSS classes merged onto the root element. */
  className?: string;
  /** Accessible label for the select. */
  label?: string;
  /** Maximum number of values that may be selected. */
  max?: number;
  /** Allow typing a value that isn't in `options` and creating it on Enter. */
  creatable?: boolean;
  /** Fires when a value typed into search is submitted via Enter (creatable mode). */
  onCreate?: (value: string) => void;
  /** Render a "Select all" row at the top of the dropdown. */
  selectAll?: boolean;
  /** Render group headings based on `option.group`. */
  grouped?: boolean;
  /**
   * Shows a loading state inside the dropdown (spinner + "Loading…" live
   * region) in place of options. The search input stays enabled so the
   * consumer can keep typing while data is fetched.
   */
  loading?: boolean;
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
      max,
      creatable,
      onCreate,
      selectAll,
      grouped,
      loading,
    },
    ref,
  ) => {
    const [internal, setInternal] = useState(defaultValue);
    const selected = controlled ?? internal;
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [filter, setFilter] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

    const { refs, floatingStyles } = useFloatingMenu({ open: isOpen });

    useOutsideClick(containerRef, () => setIsOpen(false), isOpen);

    const setSelected = (next: string[]) => {
      if (controlled === undefined) setInternal(next);
      onChange?.(next);
    };

    const toggle = (val: string) => {
      const opt = options.find((o) => o.value === val);
      if (opt?.disabled) return;
      if (selected.includes(val)) {
        setSelected(selected.filter((v) => v !== val));
      } else {
        if (max !== undefined && selected.length >= max) return;
        setSelected([...selected, val]);
      }
    };

    const handleSelectAll = () => {
      const allValues = options.map((o) => o.value);
      const allSelected = allValues.every((v) => selected.includes(v));
      if (allSelected) {
        setSelected([]);
      } else {
        const capped = max !== undefined ? allValues.slice(0, max) : allValues;
        setSelected(capped);
      }
    };

    const filtered = options.filter((o) =>
      o.label.toLowerCase().includes(filter.toLowerCase()),
    );

    // Build grouped rendering buckets if enabled.
    const groupedOptions: Array<{ group?: string; items: MultiSelectOption[] }> = [];
    if (grouped) {
      const map = new Map<string | undefined, MultiSelectOption[]>();
      for (const opt of filtered) {
        const key = opt.group;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(opt);
      }
      for (const [group, items] of map) groupedOptions.push({ group, items });
    }

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && filter.length === 0 && selected.length > 0) {
        e.preventDefault();
        setSelected(selected.slice(0, -1));
        return;
      }
      if (e.key === "Enter") {
        if (creatable && filter.trim().length > 0 && filtered.length === 0) {
          e.preventDefault();
          onCreate?.(filter.trim());
          setFilter("");
          return;
        }
      }
      handleKeyDown(e);
    };

    /** Returns the next non-disabled index in `dir` direction, or -1 if none. */
    const stepHighlighted = (from: number, dir: 1 | -1) => {
      let i = from + dir;
      while (i >= 0 && i < filtered.length) {
        if (!filtered[i]?.disabled) return i;
        i += dir;
      }
      // No movable target — stay put if the current cursor is non-disabled,
      // else fall back to the first non-disabled index.
      if (from >= 0 && from < filtered.length && !filtered[from]?.disabled) return from;
      const firstEnabled = filtered.findIndex((o) => !o.disabled);
      return firstEnabled;
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(stepHighlighted(-1, 1));
          } else {
            setHighlightedIndex((p) => {
              const next = stepHighlighted(p, 1);
              return next === -1 ? p : next;
            });
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((p) => {
            const prev = stepHighlighted(p, -1);
            return prev === -1 ? p : prev;
          });
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0 && filtered[highlightedIndex]) {
            toggle(filtered[highlightedIndex].value);
          } else if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(stepHighlighted(-1, 1));
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

    const allOptionValues = options.map((o) => o.value);
    const allSelected =
      allOptionValues.length > 0 && allOptionValues.every((v) => selected.includes(v));

    const renderOption = (opt: MultiSelectOption, i: number) => (
      <div
        key={opt.value}
        id={`${listboxId}-opt-${i}`}
        className="wui-multi-select__option"
        role="option"
        aria-selected={selected.includes(opt.value)}
        aria-disabled={opt.disabled || undefined}
        data-selected={selected.includes(opt.value) || undefined}
        data-highlighted={highlightedIndex === i || undefined}
        data-disabled={opt.disabled || undefined}
        onClick={() => toggle(opt.value)}
      >
        {opt.label}
      </div>
    );

    return (
      <div
        ref={ref}
        className={cn("wui-multi-select", className)}
        data-disabled={disabled || undefined}
      >
        <div ref={containerRef}>
          <div
            ref={refs.setReference}
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
              ref={refs.setFloating}
              style={floatingStyles}
              className="wui-multi-select__dropdown"
              role="listbox"
              id={listboxId}
              aria-multiselectable="true"
            >
              <input
                type="text"
                className="wui-multi-select__search"
                placeholder="Search…"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                onClick={(e) => e.stopPropagation()}
              />
              {loading ? (
                <div className="wui-multi-select__loading" role="status" aria-live="polite">
                  <Spinner size="sm" label="" aria-hidden="true" />
                  <span>Loading…</span>
                </div>
              ) : (
                <>
                  {selectAll && (
                    <div
                      className="wui-multi-select__option wui-multi-select__option--all"
                      role="option"
                      aria-selected={allSelected}
                      data-selected={allSelected || undefined}
                      onClick={handleSelectAll}
                    >
                      {allSelected ? "Deselect all" : "Select all"}
                    </div>
                  )}
                  {grouped
                    ? groupedOptions.map((bucket) => (
                        <Fragment key={bucket.group ?? "__ungrouped"}>
                          {bucket.group && (
                            <div className="wui-multi-select__group" role="presentation">
                              {bucket.group}
                            </div>
                          )}
                          {bucket.items.map((opt) => {
                            const i = filtered.indexOf(opt);
                            return renderOption(opt, i);
                          })}
                        </Fragment>
                      ))
                    : filtered.map((opt, i) => renderOption(opt, i))}
                  {creatable && filter.trim().length > 0 && filtered.length === 0 && (
                    <div
                      className="wui-multi-select__option wui-multi-select__option--create"
                      role="option"
                      aria-selected={false}
                      onClick={() => {
                        onCreate?.(filter.trim());
                        setFilter("");
                      }}
                    >
                      Create "{filter.trim()}"
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);
MultiSelect.displayName = "MultiSelect";
