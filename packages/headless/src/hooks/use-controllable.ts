import { useState, useCallback } from "react";

export function useControllable<T>(props: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (next: T) => void] {
  const { value: controlledValue, defaultValue, onChange } = props;
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);

  const value = isControlled ? controlledValue : internalValue;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [value, setValue];
}
