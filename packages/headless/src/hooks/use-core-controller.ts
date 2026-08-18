import { useRef, useSyncExternalStore } from "react";
import type { Controller } from "@civaria/core";

type ControllerState<CoreController extends Controller<any>> = ReturnType<CoreController["getState"]>;

/** React binding for an observable framework-neutral Civaria controller. */
export function useCoreController<CoreController extends Controller<any>>(
  create: () => CoreController,
): readonly [CoreController, ControllerState<CoreController>] {
  const controllerRef = useRef<CoreController | null>(null);
  if (controllerRef.current === null) controllerRef.current = create();
  const controller = controllerRef.current;
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getState,
    controller.getState,
  ) as ControllerState<CoreController>;
  return [controller, state] as const;
}

export function useLatest<Value>(value: Value): { current: Value } {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
