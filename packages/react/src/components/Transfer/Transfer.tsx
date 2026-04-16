"use client";
import { forwardRef, useState } from "react";
import { cn } from "../../utils/cn";

export interface TransferItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TransferProps {
  sourceItems: TransferItem[];
  targetItems?: TransferItem[];
  onChange?: (source: TransferItem[], target: TransferItem[]) => void;
  sourceTitle?: string;
  targetTitle?: string;
  className?: string;
}

export const Transfer = forwardRef<HTMLDivElement, TransferProps>(
  (
    { sourceItems: initialSource, targetItems: initialTarget = [], onChange, sourceTitle = "Available", targetTitle = "Selected", className },
    ref,
  ) => {
    const [source, setSource] = useState(initialSource);
    const [target, setTarget] = useState(initialTarget);
    const [sourceSelected, setSourceSelected] = useState<Set<string>>(new Set());
    const [targetSelected, setTargetSelected] = useState<Set<string>>(new Set());

    const toggleSelection = (value: string, set: Set<string>, setter: (s: Set<string>) => void) => {
      const next = new Set(set);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      setter(next);
    };

    const moveRight = () => {
      const moving = source.filter((i) => sourceSelected.has(i.value) && !i.disabled);
      const newSource = source.filter((i) => !sourceSelected.has(i.value));
      const newTarget = [...target, ...moving];
      setSource(newSource);
      setTarget(newTarget);
      setSourceSelected(new Set());
      onChange?.(newSource, newTarget);
    };

    const moveLeft = () => {
      const moving = target.filter((i) => targetSelected.has(i.value) && !i.disabled);
      const newTarget = target.filter((i) => !targetSelected.has(i.value));
      const newSource = [...source, ...moving];
      setSource(newSource);
      setTarget(newTarget);
      setTargetSelected(new Set());
      onChange?.(newSource, newTarget);
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
