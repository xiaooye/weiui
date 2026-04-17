"use client";
import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";

interface ToggleGroupContextValue {
  selected: string[];
  toggle: (value: string) => void;
  disabled?: boolean;
  registerItem: (value: string, el: HTMLButtonElement | null) => void;
  onItemKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  tabStopValue: string | null;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

export interface ToggleGroupProps {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  label?: string;
}

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ type = "single", value: controlled, defaultValue, onChange, disabled, className, children, label }, ref) => {
    const [internal, setInternal] = useState<string[]>(() => {
      const def = defaultValue ?? (type === "multiple" ? [] : "");
      return Array.isArray(def) ? def : def ? [def] : [];
    });

    const selected = controlled !== undefined
      ? (Array.isArray(controlled) ? controlled : controlled ? [controlled] : [])
      : internal;

    const toggle = (val: string) => {
      if (disabled) return;
      let next: string[];
      if (type === "single") {
        next = selected.includes(val) ? [] : [val];
      } else {
        next = selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val];
      }
      if (controlled === undefined) setInternal(next);
      onChange?.(type === "single" ? (next[0] ?? "") : next);
    };

    // Roving tabindex: track ref + ordered list of item values.
    const itemsRef = useRef(new Map<string, HTMLButtonElement>());
    const orderRef = useRef<string[]>([]);

    const registerItem = useCallback((itemValue: string, el: HTMLButtonElement | null) => {
      const map = itemsRef.current;
      const order = orderRef.current;
      if (el) {
        map.set(itemValue, el);
        if (!order.includes(itemValue)) order.push(itemValue);
      } else {
        map.delete(itemValue);
        const idx = order.indexOf(itemValue);
        if (idx >= 0) order.splice(idx, 1);
      }
    }, []);

    const onItemKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
      const order = orderRef.current;
      const map = itemsRef.current;
      if (order.length === 0) return;
      const currentEl = event.currentTarget;
      const currentValue = [...map.entries()].find(([, el]) => el === currentEl)?.[0];
      if (!currentValue) return;
      const idx = order.indexOf(currentValue);
      let nextIdx = -1;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          nextIdx = (idx + 1) % order.length;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          nextIdx = (idx - 1 + order.length) % order.length;
          break;
        case "Home":
          nextIdx = 0;
          break;
        case "End":
          nextIdx = order.length - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      map.get(order[nextIdx])?.focus();
    }, []);

    // Determine tab-stop value: first selected item if any, otherwise the first child Item's value.
    // We compute it by walking React children so it's stable from first render (SSR-safe).
    const firstChildValue = useMemo(() => {
      let v: string | null = null;
      Children.forEach(children, (child) => {
        if (v != null) return;
        if (!isValidElement(child)) return;
        const props = (child as ReactElement<{ value?: string }>).props;
        if (typeof props?.value === "string") v = props.value;
      });
      return v;
    }, [children]);

    const tabStopValue = selected[0] ?? firstChildValue;

    const ctxValue = useMemo(
      () => ({
        selected,
        toggle,
        disabled,
        registerItem,
        onItemKeyDown,
        tabStopValue,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [selected.join(","), disabled, registerItem, onItemKeyDown, tabStopValue],
    );

    return (
      <ToggleGroupContext.Provider value={ctxValue}>
        <div
          ref={ref}
          className={cn("wui-toggle-group", className)}
          role="group"
          aria-label={label}
          data-disabled={disabled || undefined}
        >
          {children}
        </div>
      </ToggleGroupContext.Provider>
    );
  },
);
ToggleGroup.displayName = "ToggleGroup";

export interface ToggleGroupItemProps {
  value: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ value, disabled: itemDisabled, className, children, ...props }, ref) => {
    const ctx = useContext(ToggleGroupContext);
    const isActive = ctx?.selected.includes(value) ?? false;
    const isDisabled = itemDisabled || ctx?.disabled;
    const isTabStop = ctx?.tabStopValue === value;

    const setRef = useCallback(
      (el: HTMLButtonElement | null) => {
        ctx?.registerItem(value, el);
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
      },
      [ctx, value, ref],
    );

    return (
      <button
        ref={setRef}
        type="button"
        className={cn("wui-toggle-group__item", className)}
        data-active={isActive || undefined}
        data-disabled={isDisabled || undefined}
        aria-pressed={isActive}
        disabled={isDisabled}
        tabIndex={isTabStop ? 0 : -1}
        onClick={() => ctx?.toggle(value)}
        onKeyDown={(e) => ctx?.onItemKeyDown(e)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
ToggleGroupItem.displayName = "ToggleGroupItem";
