"use client";
import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from "react";
import type { ComponentNode } from "./tree";

export type CommitHandler = (pointer: { x: number; y: number }) => void;

export type SelectMode = "replace" | "add" | "toggle";
export type ZoomLevel = 50 | 75 | 100 | 125 | 150;
export type ViewportPreset = "375" | "768" | "1024" | "1280" | "full";

export interface Selection {
  primary: string | null;
  all: Set<string>;
}

export interface DragSession {
  kind: "palette" | "reorder";
  payload: ComponentNode | string[];
  pointer: { x: number; y: number };
}

export interface ContextMenuState {
  id: string;
  x: number;
  y: number;
}

export interface InteractionState {
  selection: Selection;
  clipboard: ComponentNode[];
  drag: DragSession | null;
  commandPaletteOpen: boolean;
  shortcutHelpOpen: boolean;
  contextMenu: ContextMenuState | null;
  previewMode: boolean;
  zoom: ZoomLevel;
  viewport: ViewportPreset;
  theme: "auto" | "light" | "dark";
  rulers: boolean;
}

type Action =
  | { type: "select"; id: string; mode: SelectMode }
  | { type: "clear-selection" }
  | { type: "start-drag"; session: DragSession }
  | { type: "update-drag-pointer"; pointer: { x: number; y: number } }
  | { type: "end-drag" }
  | { type: "set-clipboard"; nodes: ComponentNode[] }
  | { type: "open-command-palette" }
  | { type: "close-command-palette" }
  | { type: "open-shortcut-help" }
  | { type: "close-shortcut-help" }
  | { type: "open-context-menu"; menu: ContextMenuState }
  | { type: "close-context-menu" }
  | { type: "set-preview-mode"; value: boolean }
  | { type: "set-zoom"; value: ZoomLevel }
  | { type: "set-viewport"; value: ViewportPreset }
  | { type: "set-theme"; value: "auto" | "light" | "dark" }
  | { type: "set-rulers"; value: boolean };

const initialState: InteractionState = {
  selection: { primary: null, all: new Set() },
  clipboard: [],
  drag: null,
  commandPaletteOpen: false,
  shortcutHelpOpen: false,
  contextMenu: null,
  previewMode: false,
  zoom: 100,
  viewport: "full",
  theme: "auto",
  rulers: false,
};

function reduceSelection(prev: Selection, id: string, mode: SelectMode): Selection {
  if (mode === "replace") {
    return { primary: id, all: new Set([id]) };
  }
  if (mode === "add") {
    const next = new Set(prev.all);
    next.add(id);
    return { primary: id, all: next };
  }
  // toggle
  const next = new Set(prev.all);
  if (next.has(id)) {
    next.delete(id);
    const primary = id === prev.primary ? (next.size ? [...next][next.size - 1]! : null) : prev.primary;
    return { primary, all: next };
  }
  next.add(id);
  return { primary: id, all: next };
}

function reducer(state: InteractionState, action: Action): InteractionState {
  switch (action.type) {
    case "select":
      return { ...state, selection: reduceSelection(state.selection, action.id, action.mode) };
    case "clear-selection":
      return { ...state, selection: { primary: null, all: new Set() } };
    case "start-drag":
      return { ...state, drag: action.session };
    case "update-drag-pointer":
      return state.drag ? { ...state, drag: { ...state.drag, pointer: action.pointer } } : state;
    case "end-drag":
      return { ...state, drag: null };
    case "set-clipboard":
      return { ...state, clipboard: action.nodes };
    case "open-command-palette":
      return { ...state, commandPaletteOpen: true };
    case "close-command-palette":
      return { ...state, commandPaletteOpen: false };
    case "open-shortcut-help":
      return { ...state, shortcutHelpOpen: true };
    case "close-shortcut-help":
      return { ...state, shortcutHelpOpen: false };
    case "open-context-menu":
      return { ...state, contextMenu: action.menu };
    case "close-context-menu":
      return { ...state, contextMenu: null };
    case "set-preview-mode":
      return { ...state, previewMode: action.value };
    case "set-zoom":
      return { ...state, zoom: action.value };
    case "set-viewport":
      return { ...state, viewport: action.value };
    case "set-theme":
      return { ...state, theme: action.value };
    case "set-rulers":
      return { ...state, rulers: action.value };
  }
}

interface InteractionApi {
  state: InteractionState;
  /** Ref holding the stage's drop-commit callback. Palette's pointerup calls
   *  `commitRef.current?.(pointer)` before `endDrag()`. Using a ref avoids
   *  re-render churn and race conditions between palette and stage effects. */
  commitRef: MutableRefObject<CommitHandler | null>;
  select(id: string, mode: SelectMode): void;
  clearSelection(): void;
  startDrag(session: DragSession): void;
  updateDragPointer(pointer: { x: number; y: number }): void;
  endDrag(): void;
  setClipboard(nodes: ComponentNode[]): void;
  openCommandPalette(): void;
  closeCommandPalette(): void;
  openShortcutHelp(): void;
  closeShortcutHelp(): void;
  openContextMenu(menu: ContextMenuState): void;
  closeContextMenu(): void;
  setPreviewMode(value: boolean): void;
  setZoom(value: ZoomLevel): void;
  setViewport(value: ViewportPreset): void;
  setTheme(value: "auto" | "light" | "dark"): void;
  setRulers(value: boolean): void;
}

const Context = createContext<InteractionApi | null>(null);

export function InteractionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const commitRef = useRef<CommitHandler | null>(null);

  const api = useMemo<InteractionApi>(
    () => ({
      state,
      commitRef,
      select: (id, mode) => dispatch({ type: "select", id, mode }),
      clearSelection: () => dispatch({ type: "clear-selection" }),
      startDrag: (session) => dispatch({ type: "start-drag", session }),
      updateDragPointer: (pointer) => dispatch({ type: "update-drag-pointer", pointer }),
      endDrag: () => dispatch({ type: "end-drag" }),
      setClipboard: (nodes) => dispatch({ type: "set-clipboard", nodes }),
      openCommandPalette: () => dispatch({ type: "open-command-palette" }),
      closeCommandPalette: () => dispatch({ type: "close-command-palette" }),
      openShortcutHelp: () => dispatch({ type: "open-shortcut-help" }),
      closeShortcutHelp: () => dispatch({ type: "close-shortcut-help" }),
      openContextMenu: (menu) => dispatch({ type: "open-context-menu", menu }),
      closeContextMenu: () => dispatch({ type: "close-context-menu" }),
      setPreviewMode: (value) => dispatch({ type: "set-preview-mode", value }),
      setZoom: (value) => dispatch({ type: "set-zoom", value }),
      setViewport: (value) => dispatch({ type: "set-viewport", value }),
      setTheme: (value) => dispatch({ type: "set-theme", value }),
      setRulers: (value) => dispatch({ type: "set-rulers", value }),
    }),
    [state],
  );

  return <Context.Provider value={api}>{children}</Context.Provider>;
}

export function useInteractionManager(): InteractionApi {
  const api = useContext(Context);
  if (!api) throw new Error("useInteractionManager must be used inside <InteractionProvider>");
  return api;
}
