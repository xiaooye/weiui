"use client";
import { type ReactNode, useReducer, useCallback, useEffect } from "react";
import { useId } from "../../hooks/use-id";
import { ComboboxContext } from "./ComboboxContext";

interface State {
  isOpen: boolean;
  inputValue: string;
  selectedValue: string;
  selectedLabel: string;
  highlightedIndex: number;
}

type Action =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "SET_INPUT"; value: string }
  | { type: "SELECT"; value: string; label: string }
  | { type: "SET_HIGHLIGHT"; index: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPEN":
      return { ...state, isOpen: true, highlightedIndex: -1 };
    case "CLOSE":
      return { ...state, isOpen: false, highlightedIndex: -1 };
    case "SET_INPUT":
      return { ...state, inputValue: action.value, isOpen: true, highlightedIndex: -1 };
    case "SELECT":
      return {
        ...state,
        selectedValue: action.value,
        selectedLabel: action.label,
        inputValue: action.label,
        isOpen: false,
        highlightedIndex: -1,
      };
    case "SET_HIGHLIGHT":
      return { ...state, highlightedIndex: action.index };
  }
}

export interface ComboboxProps {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Combobox({ children, defaultValue = "", value, onValueChange }: ComboboxProps) {
  const [state, dispatch] = useReducer(reducer, {
    isOpen: false,
    inputValue: "",
    selectedValue: value ?? defaultValue,
    selectedLabel: "",
    highlightedIndex: -1,
  });

  const baseId = useId("combobox");

  useEffect(() => {
    if (value !== undefined && value !== state.selectedValue) {
      dispatch({ type: "SELECT", value, label: state.selectedLabel });
    }
  }, [value, state.selectedValue, state.selectedLabel]);

  const onSelect = useCallback(
    (val: string, label: string) => {
      dispatch({ type: "SELECT", value: val, label });
      onValueChange?.(val);
    },
    [onValueChange],
  );

  return (
    <ComboboxContext.Provider
      value={{
        isOpen: state.isOpen,
        inputValue: state.inputValue,
        setInputValue: (v) => dispatch({ type: "SET_INPUT", value: v }),
        selectedValue: state.selectedValue,
        selectedLabel: state.selectedLabel,
        onSelect,
        highlightedIndex: state.highlightedIndex,
        setHighlightedIndex: (i) => dispatch({ type: "SET_HIGHLIGHT", index: i }),
        onOpen: () => dispatch({ type: "OPEN" }),
        onClose: () => dispatch({ type: "CLOSE" }),
        baseId,
        inputId: `${baseId}-input`,
        listboxId: `${baseId}-listbox`,
      }}
    >
      {children}
    </ComboboxContext.Provider>
  );
}
