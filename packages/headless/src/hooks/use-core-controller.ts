import { useRef, useSyncExternalStore } from "react";
import type { Controller } from "@weiui/core";

/** React binding for an observable framework-neutral WeiUI controller. */
export function useCoreController<State, CoreController extends Controller<State>>(
  create: () => CoreController,
): readonly [CoreController, Readonly<State>] {
  const controllerRef = useRef<CoreController | null>(null);
  if (controllerRef.current === null) controllerRef.current = create();
  const controller = controllerRef.current;
  const state = useSyncExternalStore(controller.subscribe, controller.getState, controller.getState);
  return [controller, state] as const;
}

export function useLatest<Value>(value: Value): { current: Value } {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
