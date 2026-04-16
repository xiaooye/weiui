import { useSelectContext } from "./SelectContext";

export interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder = "Select..." }: SelectValueProps) {
  const { selectedLabel } = useSelectContext();
  return <span>{selectedLabel || placeholder}</span>;
}
