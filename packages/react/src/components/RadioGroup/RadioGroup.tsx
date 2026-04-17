"use client";
import {
  createContext,
  useCallback,
  useContext,
  forwardRef,
  useRef,
  useMemo,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useControllable, useId } from "@weiui/headless";
import { cn } from "../../utils/cn";

interface RadioGroupContextValue {
  name: string;
  value: string;
  onChange: (value: string) => void;
  registerItem: (value: string, el: HTMLInputElement | null) => void;
  onItemKeyDown: (event: KeyboardEvent<HTMLInputElement>, itemValue: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext() {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) throw new Error("RadioGroupItem must be used within RadioGroup");
  return ctx;
}

export interface RadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ name, value, defaultValue = "", onValueChange, children, className, ...props }, ref) => {
    const generatedName = useId("radio");
    const groupName = name || generatedName;
    const [currentValue, setCurrentValue] = useControllable({
      value,
      defaultValue,
      onChange: onValueChange,
    });

    // Preserve insertion order of registered items for arrow-key nav.
    const itemsRef = useRef(new Map<string, HTMLInputElement>());
    const orderRef = useRef<string[]>([]);

    const registerItem = useCallback((itemValue: string, el: HTMLInputElement | null) => {
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

    const onItemKeyDown = useCallback(
      (event: KeyboardEvent<HTMLInputElement>, itemValue: string) => {
        const order = orderRef.current;
        const map = itemsRef.current;
        if (order.length === 0) return;
        const idx = order.indexOf(itemValue);
        if (idx < 0) return;
        let nextIdx = -1;
        switch (event.key) {
          case "ArrowDown":
          case "ArrowRight":
            nextIdx = (idx + 1) % order.length;
            break;
          case "ArrowUp":
          case "ArrowLeft":
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
        const nextValue = order[nextIdx];
        setCurrentValue(nextValue);
        const nextEl = map.get(nextValue);
        nextEl?.focus();
      },
      [setCurrentValue],
    );

    const ctxValue = useMemo(
      () => ({
        name: groupName,
        value: currentValue,
        onChange: setCurrentValue,
        registerItem,
        onItemKeyDown,
      }),
      [groupName, currentValue, setCurrentValue, registerItem, onItemKeyDown],
    );

    return (
      <RadioGroupContext.Provider value={ctxValue}>
        <div ref={ref} role="radiogroup" className={className} {...props}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "name" | "checked" | "onChange" | "size"> {
  value: string;
  label?: string;
}

export const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ value, label, className, id, onKeyDown, ...props }, ref) => {
    const { name, value: groupValue, onChange, registerItem, onItemKeyDown } = useRadioGroupContext();
    const generatedId = useId("radio-item");
    const inputId = id || generatedId;

    const setRef = useCallback(
      (el: HTMLInputElement | null) => {
        registerItem(value, el);
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
      },
      [registerItem, value, ref],
    );

    return (
      <div className={cn("wui-radio", className)}>
        <input
          ref={setRef}
          type="radio"
          id={inputId}
          name={name}
          value={value}
          className="wui-radio__input"
          checked={groupValue === value}
          onChange={() => onChange(value)}
          onKeyDown={(e) => {
            onItemKeyDown(e, value);
            onKeyDown?.(e);
          }}
          {...props}
        />
        {label && (
          <label htmlFor={inputId} className="wui-radio__label">
            {label}
          </label>
        )}
      </div>
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";
