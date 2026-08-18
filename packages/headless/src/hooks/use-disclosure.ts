import { useCallback, useEffect } from "react";
import { createDisclosureController } from "@weiui/core";
import { useId } from "./use-id";
import { useCoreController, useLatest } from "./use-core-controller";

export interface UseDisclosureProps {
  /** Initial open state for uncontrolled mode. @default false */
  defaultOpen?: boolean;
  /** Controlled open state. Pair with onOpenChange. */
  open?: boolean;
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void;
}

export interface UseDisclosureReturn {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  getDisclosureProps: () => { "aria-expanded": boolean };
  getContentProps: () => { hidden: boolean };
}

export function useDisclosure(props: UseDisclosureProps = {}): UseDisclosureReturn {
  const { defaultOpen = false, open, onOpenChange } = props;
  const baseId = useId("disclosure");
  const callbackRef = useLatest(onOpenChange);
  const [controller, state] = useCoreController(() =>
    createDisclosureController({
      id: baseId,
      component: "disclosure",
      defaultOpen,
      onOpenChange: (next) => callbackRef.current?.(next),
    }),
  );

  useEffect(() => {
    if (open !== undefined && state.open !== open) controller.store.setState({ open });
  }, [controller, open, state.open]);

  const isOpen = open ?? state.open;
  const onOpen = useCallback(() => controller.setOpen(true), [controller]);
  const onClose = useCallback(() => controller.setOpen(false), [controller]);
  const onToggle = useCallback(() => controller.setOpen(!isOpen), [controller, isOpen]);
  const getDisclosureProps = useCallback(() => ({ "aria-expanded": isOpen }), [isOpen]);
  const getContentProps = useCallback(() => ({ hidden: !isOpen }), [isOpen]);
  return { isOpen, onOpen, onClose, onToggle, getDisclosureProps, getContentProps };
}
