"use client";
import { forwardRef, useState, useMemo, type KeyboardEvent } from "react";
import { cn } from "../../utils/cn";

export interface TransferItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TransferProps {
  /** Full item set (source + target). Items appearing in `targetValues` move to the target pane. */
  sourceItems: TransferItem[];
  /** Initial items on the target side (uncontrolled only). */
  targetItems?: TransferItem[];
  /** Controlled list of values currently on the target side. */
  targetValues?: string[];
  /** Called with the updated list of target values (both controlled + uncontrolled). */
  onTargetValuesChange?: (values: string[]) => void;
  /** Called with the current source/target item lists after any move. */
  onChange?: (source: TransferItem[], target: TransferItem[]) => void;
  /** Heading for the source pane. */
  sourceTitle?: string;
  /** Heading for the target pane. */
  targetTitle?: string;
  /** Enable per-pane search input. */
  searchable?: boolean;
  /** Search placeholder shown in each pane's input. */
  searchPlaceholder?: string;
  /** Additional CSS classes merged onto the root. */
  className?: string;
}

export const Transfer = forwardRef<HTMLDivElement, TransferProps>(
  (
    {
      sourceItems,
      targetItems: initialTarget = [],
      targetValues,
      onTargetValuesChange,
      onChange,
      sourceTitle = "Available",
      targetTitle = "Selected",
      searchable = false,
      searchPlaceholder = "Search...",
      className,
    },
    ref,
  ) => {
    const isControlled = targetValues !== undefined;
    const [uncontrolledTargetValues, setUncontrolledTargetValues] = useState<string[]>(
      initialTarget.map((i) => i.value),
    );
    const activeTargetValues = isControlled ? targetValues : uncontrolledTargetValues;

    const itemPool = useMemo(() => {
      const map = new Map<string, TransferItem>();
      for (const i of sourceItems) map.set(i.value, i);
      for (const i of initialTarget) if (!map.has(i.value)) map.set(i.value, i);
      return map;
    }, [sourceItems, initialTarget]);

    const targetSet = useMemo(() => new Set(activeTargetValues), [activeTargetValues]);
    const source = useMemo(
      () => Array.from(itemPool.values()).filter((i) => !targetSet.has(i.value)),
      [itemPool, targetSet],
    );
    const target = useMemo(
      () =>
        activeTargetValues
          .map((v) => itemPool.get(v))
          .filter((i): i is TransferItem => i !== undefined),
      [itemPool, activeTargetValues],
    );

    const [sourceSelected, setSourceSelected] = useState<Set<string>>(new Set());
    const [targetSelected, setTargetSelected] = useState<Set<string>>(new Set());
    const [sourceSearch, setSourceSearch] = useState("");
    const [targetSearch, setTargetSearch] = useState("");
    const [sourceFocusedIdx, setSourceFocusedIdx] = useState(0);
    const [targetFocusedIdx, setTargetFocusedIdx] = useState(0);

    const filteredSource = useMemo(
      () =>
        source.filter((i) =>
          sourceSearch ? i.label.toLowerCase().includes(sourceSearch.toLowerCase()) : true,
        ),
      [source, sourceSearch],
    );
    const filteredTarget = useMemo(
      () =>
        target.filter((i) =>
          targetSearch ? i.label.toLowerCase().includes(targetSearch.toLowerCase()) : true,
        ),
      [target, targetSearch],
    );

    const updateTargetValues = (next: string[]) => {
      if (!isControlled) setUncontrolledTargetValues(next);
      onTargetValuesChange?.(next);
      const nextTarget = next.map((v) => itemPool.get(v)).filter((i): i is TransferItem => i !== undefined);
      const nextSource = Array.from(itemPool.values()).filter((i) => !next.includes(i.value));
      onChange?.(nextSource, nextTarget);
    };

    const toggleSelection = (value: string, set: Set<string>, setter: (s: Set<string>) => void) => {
      const next = new Set(set);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      setter(next);
    };

    const moveRight = () => {
      const movingValues = source
        .filter((i) => sourceSelected.has(i.value) && !i.disabled)
        .map((i) => i.value);
      if (movingValues.length === 0) return;
      updateTargetValues([...activeTargetValues, ...movingValues]);
      setSourceSelected(new Set());
    };

    const moveLeft = () => {
      const movingValues = target
        .filter((i) => targetSelected.has(i.value) && !i.disabled)
        .map((i) => i.value);
      if (movingValues.length === 0) return;
      updateTargetValues(activeTargetValues.filter((v) => !movingValues.includes(v)));
      setTargetSelected(new Set());
    };

    const moveAllRight = () => {
      const movingValues = source.filter((i) => !i.disabled).map((i) => i.value);
      if (movingValues.length === 0) return;
      updateTargetValues([...activeTargetValues, ...movingValues]);
      setSourceSelected(new Set());
    };

    const moveAllLeft = () => {
      const stayingValues = target.filter((i) => i.disabled).map((i) => i.value);
      updateTargetValues(stayingValues);
      setTargetSelected(new Set());
    };

    const renderList = (
      items: TransferItem[],
      selected: Set<string>,
      setter: (s: Set<string>) => void,
      title: string,
      listLabel: string,
      isSource: boolean,
      search: string,
      setSearch: (s: string) => void,
      focusedIdx: number,
      setFocusedIdx: (i: number) => void,
    ) => {
      const allItems = isSource ? source : target;
      const allEnabled = allItems.filter((i) => !i.disabled);
      const allSelected =
        allEnabled.length > 0 && allEnabled.every((i) => selected.has(i.value));
      const someSelected = allEnabled.some((i) => selected.has(i.value));

      const toggleAll = (checked: boolean) => {
        const next = new Set(selected);
        if (checked) {
          for (const i of allEnabled) next.add(i.value);
        } else {
          for (const i of allEnabled) next.delete(i.value);
        }
        setter(next);
      };

      const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (items.length === 0) return;
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setFocusedIdx(Math.min(items.length - 1, focusedIdx + 1));
            break;
          case "ArrowUp":
            e.preventDefault();
            setFocusedIdx(Math.max(0, focusedIdx - 1));
            break;
          case "Home":
            e.preventDefault();
            setFocusedIdx(0);
            break;
          case "End":
            e.preventDefault();
            setFocusedIdx(items.length - 1);
            break;
          case " ":
          case "Enter": {
            e.preventDefault();
            const item = items[focusedIdx];
            if (item && !item.disabled) toggleSelection(item.value, selected, setter);
            break;
          }
        }
      };

      return (
        <div className="wui-transfer__list">
          <div className="wui-transfer__header">
            <label className="wui-transfer__header-label">
              <input
                type="checkbox"
                className="wui-transfer__select-all"
                aria-label={`Select all ${title.toLowerCase()}`}
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = !allSelected && someSelected;
                }}
                onChange={(e) => toggleAll(e.target.checked)}
                disabled={allEnabled.length === 0}
              />
              <span>{title}</span>
            </label>
            <span
              style={{
                fontSize: "var(--wui-font-size-xs)",
                color: "var(--wui-color-muted-foreground)",
              }}
            >
              {selected.size}/{items.length}
            </span>
          </div>
          {searchable && (
            <div className="wui-transfer__search-wrap">
              <input
                type="text"
                className="wui-transfer__search"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label={`Search ${title.toLowerCase()}`}
              />
            </div>
          )}
          <div
            className="wui-transfer__items"
            role="listbox"
            aria-label={listLabel}
            aria-multiselectable="true"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            {items.map((item, idx) => (
              <div
                key={item.value}
                className="wui-transfer__item"
                role="option"
                aria-selected={selected.has(item.value)}
                data-selected={selected.has(item.value) || undefined}
                data-disabled={item.disabled || undefined}
                data-focused={idx === focusedIdx || undefined}
                onClick={() => !item.disabled && toggleSelection(item.value, selected, setter)}
              >
                <input
                  type="checkbox"
                  checked={selected.has(item.value)}
                  disabled={item.disabled}
                  onChange={() => toggleSelection(item.value, selected, setter)}
                  tabIndex={-1}
                  aria-hidden="true"
                />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div ref={ref} className={cn("wui-transfer", className)} role="group" aria-label="Transfer list">
        {renderList(
          filteredSource,
          sourceSelected,
          setSourceSelected,
          sourceTitle,
          "Available items",
          true,
          sourceSearch,
          setSourceSearch,
          sourceFocusedIdx,
          setSourceFocusedIdx,
        )}
        <div className="wui-transfer__actions">
          <button
            type="button"
            className="wui-transfer__move-btn"
            onClick={moveAllRight}
            disabled={source.filter((i) => !i.disabled).length === 0}
            data-disabled={source.filter((i) => !i.disabled).length === 0 || undefined}
            aria-label="Move all to target"
          >
            {"\u00BB"}
          </button>
          <button
            type="button"
            className="wui-transfer__move-btn"
            onClick={moveRight}
            disabled={sourceSelected.size === 0}
            data-disabled={sourceSelected.size === 0 || undefined}
            aria-label="Move selected to target"
          >
            &rsaquo;
          </button>
          <button
            type="button"
            className="wui-transfer__move-btn"
            onClick={moveLeft}
            disabled={targetSelected.size === 0}
            data-disabled={targetSelected.size === 0 || undefined}
            aria-label="Move selected to source"
          >
            &lsaquo;
          </button>
          <button
            type="button"
            className="wui-transfer__move-btn"
            onClick={moveAllLeft}
            disabled={target.filter((i) => !i.disabled).length === 0}
            data-disabled={target.filter((i) => !i.disabled).length === 0 || undefined}
            aria-label="Move all to source"
          >
            {"\u00AB"}
          </button>
        </div>
        {renderList(
          filteredTarget,
          targetSelected,
          setTargetSelected,
          targetTitle,
          "Selected items",
          false,
          targetSearch,
          setTargetSearch,
          targetFocusedIdx,
          setTargetFocusedIdx,
        )}
      </div>
    );
  },
);
Transfer.displayName = "Transfer";
