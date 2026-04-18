import { useControllable } from "./use-controllable";
import { useCallback } from "react";

export interface UseToggleProps {
  /** Initial pressed state for uncontrolled mode. @default false */
  defaultPressed?: boolean;
  /** Controlled pressed state. Pair with onPressedChange. */
  pressed?: boolean;
  /** Called when the pressed state changes. */
  onPressedChange?: (pressed: boolean) => void;
}

export function useToggle(props: UseToggleProps = {}): {
  isPressed: boolean;
  onToggle: () => void;
  getToggleProps: () => { "aria-pressed": boolean; role: "switch" };
} {
  const { defaultPressed = false, pressed, onPressedChange } = props;

  const [isPressed, setIsPressed] = useControllable({
    value: pressed,
    defaultValue: defaultPressed,
    onChange: onPressedChange,
  });

  const onToggle = useCallback(() => setIsPressed(!isPressed), [setIsPressed, isPressed]);

  const getToggleProps = useCallback(
    () => ({ "aria-pressed": isPressed, role: "switch" as const }),
    [isPressed],
  );

  return { isPressed, onToggle, getToggleProps };
}
