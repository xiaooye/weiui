"use client";
import {
  createContext,
  useContext,
  forwardRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { useControllable } from "@weiui/headless";
import { useId } from "@weiui/headless";
import { cn } from "../../utils/cn";

interface RadioGroupContextValue {
  name: string;
  value: string;
  onChange: (value: string) => void;
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

    return (
      <RadioGroupContext.Provider value={{ name: groupName, value: currentValue, onChange: setCurrentValue }}>
        <div ref={ref} role="radiogroup" className={className} {...props}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "name" | "checked" | "onChange"> {
  value: string;
  label?: string;
}

export const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ value, label, className, id, ...props }, ref) => {
    const { name, value: groupValue, onChange } = useRadioGroupContext();
    const generatedId = useId("radio-item");
    const inputId = id || generatedId;

    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <input
          ref={ref}
          type="radio"
          id={inputId}
          name={name}
          value={value}
          checked={groupValue === value}
          onChange={() => onChange(value)}
          {...props}
        />
        {label && <label htmlFor={inputId}>{label}</label>}
      </div>
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";
