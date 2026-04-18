import { useControllable } from "./use-controllable";
import { useCallback } from "react";

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

  const [isOpen, setIsOpen] = useControllable({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const onOpen = useCallback(() => setIsOpen(true), [setIsOpen]);
  const onClose = useCallback(() => setIsOpen(false), [setIsOpen]);
  const onToggle = useCallback(() => setIsOpen(!isOpen), [setIsOpen, isOpen]);

  const getDisclosureProps = useCallback(
    () => ({ "aria-expanded": isOpen }),
    [isOpen],
  );

  const getContentProps = useCallback(
    () => ({ hidden: !isOpen }),
    [isOpen],
  );

  return { isOpen, onOpen, onClose, onToggle, getDisclosureProps, getContentProps };
}
