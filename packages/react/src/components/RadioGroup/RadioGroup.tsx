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
  /** When true, every item inherits disabled unless it sets its own. */
  disabled?: boolean;
  /** When true, every item receives `aria-required="true"`. */
  required?: boolean;
  /** When true, every item receives `aria-invalid="true"`. */
  invalid?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext() {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) throw new Error("RadioGroupItem must be used within RadioGroup");
  return ctx;
}

export interface RadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Shared `name` attribute for every radio input in the group. Auto-generated when omitted. */
  name?: string;
  /** Controlled selected value. Pair with `onValueChange`. */
  value?: string;
  /** Uncontrolled initial selected value. */
  defaultValue?: string;
  /** Called when the selected value changes. */
  onValueChange?: (value: string) => void;
  /** `RadioGroupItem` children composing the options. */
  children: ReactNode;
  /** Layout direction of the items. @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** Visual size. Propagates to every item's radio + label. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Disables every item in the group; individual items may still disable themselves. */
  disabled?: boolean;
  /** Forwards `aria-required="true"` to every item. */
  required?: boolean;
  /** Forwards `aria-invalid="true"` to every item. */
  invalid?: boolean;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      value,
      defaultValue = "",
      onValueChange,
      children,
      className,
      orientation = "horizontal",
      size = "md",
      disabled,
      required,
      invalid,
      ...props
    },
    ref,
  ) => {
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
        if (nextValue == null) return;
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
        disabled,
        required,
        invalid,
      }),
      [groupName, currentValue, setCurrentValue, registerItem, onItemKeyDown, disabled, required, invalid],
    );

    const sizeClass = size === "sm" ? "wui-radio-group--sm" : size === "lg" ? "wui-radio-group--lg" : "";

    return (
      <RadioGroupContext.Provider value={ctxValue}>
        <div
          ref={ref}
          role="radiogroup"
          data-orientation={orientation}
          data-disabled={disabled || undefined}
          aria-invalid={invalid || undefined}
          className={cn(
            "wui-radio-group",
            orientation === "vertical" && "wui-radio-group--vertical",
            sizeClass,
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "name" | "checked" | "onChange" | "size"> {
  /** Value submitted/reported when this radio is selected. */
  value: string;
  /** Visible label rendered next to the radio. */
  label?: string;
  /** Optional helper text rendered beneath the label. Wired to `aria-describedby`. */
  description?: ReactNode;
}

export const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ value, label, description, className, id, onKeyDown, disabled, ...props }, ref) => {
    const {
      name,
      value: groupValue,
      onChange,
      registerItem,
      onItemKeyDown,
      disabled: groupDisabled,
      required: groupRequired,
      invalid: groupInvalid,
    } = useRadioGroupContext();
    const generatedId = useId("radio-item");
    const inputId = id || generatedId;
    const descId = `${inputId}-desc`;
    const hasDescription = description != null;

    const setRef = useCallback(
      (el: HTMLInputElement | null) => {
        registerItem(value, el);
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
      },
      [registerItem, value, ref],
    );

    const existingDescribedBy = props["aria-describedby"] as string | undefined;
    const describedBy =
      hasDescription ? [existingDescribedBy, descId].filter(Boolean).join(" ") : existingDescribedBy;

    const resolvedDisabled = disabled ?? groupDisabled;
    const resolvedInvalid = groupInvalid;
    const resolvedRequired = groupRequired;

    return (
      <div className={cn("wui-radio", className)}>
        <div className="wui-radio__row">
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
            aria-invalid={resolvedInvalid || undefined}
            aria-required={resolvedRequired || undefined}
            data-invalid={resolvedInvalid || undefined}
            {...props}
            disabled={resolvedDisabled}
            aria-describedby={describedBy}
          />
          {label && (
            <label htmlFor={inputId} className="wui-radio__label">
              {label}
            </label>
          )}
        </div>
        {hasDescription && (
          <p id={descId} className="wui-radio__description">
            {description}
          </p>
        )}
      </div>
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";
