"use client";
import { forwardRef, useState, useMemo } from "react";
import { cn } from "../../utils/cn";

export interface TransferItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TransferProps {
  sourceItems: TransferItem[];
  /** Initial items on the target side (uncontrolled only). */
  targetItems?: TransferItem[];
  /** Controlled list of values currently on the target side. */
  targetValues?: string[];
  /** Called with the updated list of target values (both controlled + uncontrolled). */
  onTargetValuesChange?: (values: string[]) => void;
  onChange?: (source: TransferItem[], target: TransferItem[]) => void;
  sourceTitle?: string;
  targetTitle?: string;
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
      className,
    },
    ref,
  ) => {
    const isControlled = targetValues !== undefined;
    const [uncontrolledTargetValues, setUncontrolledTargetValues] = useState<string[]>(
      initialTarget.map((i) => i.value),
    );
    const activeTargetValues = isControlled ? targetValues : uncontrolledTargetValues;

    // Build a single flat item pool (by value) from sourceItems + initialTarget,
    // so we can split it into source/target based on activeTargetValues.
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

    const renderList = (
      items: TransferItem[],
      selected: Set<string>,
      setter: (s: Set<string>) => void,
      title: string,
      listLabel: string,
    ) => (
      <div className="wui-transfer__list">
        <div className="wui-transfer__header">
          <span>{title}</span>
          <span style={{ fontSize: "var(--wui-font-size-xs)", color: "var(--wui-color-muted-foreground)" }}>
            {selected.size}/{items.length}
          </span>
        </div>
        <div className="wui-transfer__items" role="listbox" aria-label={listLabel} aria-multiselectable="true">
          {items.map((item) => (
            <div
              key={item.value}
              className="wui-transfer__item"
              role="option"
              aria-selected={selected.has(item.value)}
              data-selected={selected.has(item.value) || undefined}
              data-disabled={item.disabled || undefined}
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

    return (
      <div ref={ref} className={cn("wui-transfer", className)} role="group" aria-label="Transfer list">
        {renderList(source, sourceSelected, setSourceSelected, sourceTitle, "Available items")}
        <div className="wui-transfer__actions">
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
        </div>
        {renderList(target, targetSelected, setTargetSelected, targetTitle, "Selected items")}
      </div>
    );
  },
);
Transfer.displayName = "Transfer";
