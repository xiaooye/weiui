import { PALETTE_ITEMS } from "./component-tree";
import { TEMPLATES } from "./templates";
import type { ComponentNode } from "./tree";
import type { Selection } from "./interaction-manager";

const RECENTS_KEY = "wui-composer-command-recents";
const MAX_RECENTS = 5;

function readRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === "string").slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
}

export function noteCommandUsed(id: string): void {
  if (typeof window === "undefined") return;
  const prev = readRecents().filter((x) => x !== id);
  const next = [id, ...prev].slice(0, MAX_RECENTS);
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export interface BuildCommandsDispatch {
  insertAtRoot: (type: string) => void;
  deleteSelected: () => void;
  duplicate: () => void;
  wrap: (type: "Stack-row" | "Stack-column" | "Card") => void;
  loadTemplate: (tree: ComponentNode[]) => void;
  selectParent: () => void;
  setPreview: (value: boolean) => void;
  copy: () => void;
  paste: () => void;
}

export interface Command {
  id: string;
  label: string;
  group: "Recent" | "Add" | "Template" | "Edit" | "View";
  shortcut?: string;
  run: () => void;
}

export interface BuildCommandsArgs {
  tree: ComponentNode[];
  selection: Selection;
  dispatch: BuildCommandsDispatch;
  previewMode?: boolean;
}

export function buildCommands({
  tree: _tree,
  selection,
  dispatch,
  previewMode,
}: BuildCommandsArgs): Command[] {
  const out: Command[] = [];
  const hasSelection = selection.primary != null;

  for (const item of PALETTE_ITEMS) {
    out.push({
      id: `add-${item.type}`,
      label: `Add ${item.label}`,
      group: "Add",
      run: () => dispatch.insertAtRoot(item.type),
    });
  }

  for (const t of TEMPLATES) {
    out.push({
      id: `tpl-${t.id}`,
      label: `Load template: ${t.label}`,
      group: "Template",
      run: () => dispatch.loadTemplate(t.tree),
    });
  }

  if (hasSelection) {
    out.push(
      { id: "delete", label: "Delete selection", group: "Edit", shortcut: "⌫", run: dispatch.deleteSelected },
      { id: "duplicate", label: "Duplicate selection", group: "Edit", shortcut: "⌘D", run: dispatch.duplicate },
      { id: "copy", label: "Copy", group: "Edit", shortcut: "⌘C", run: dispatch.copy },
      { id: "paste", label: "Paste", group: "Edit", shortcut: "⌘V", run: dispatch.paste },
      { id: "wrap-stack-row", label: "Wrap in Stack (row)", group: "Edit", run: () => dispatch.wrap("Stack-row") },
      { id: "wrap-stack-col", label: "Wrap in Stack (column)", group: "Edit", run: () => dispatch.wrap("Stack-column") },
      { id: "wrap-card", label: "Wrap in Card", group: "Edit", run: () => dispatch.wrap("Card") },
      { id: "parent", label: "Select parent", group: "Edit", shortcut: "⌥↑", run: dispatch.selectParent },
    );
  }

  out.push({
    id: "toggle-preview",
    label: previewMode ? "Exit preview" : "Toggle preview mode",
    group: "View",
    shortcut: "⌘P",
    run: () => dispatch.setPreview(!previewMode),
  });

  const recents = readRecents();
  if (recents.length === 0) return out;
  const byId = new Map(out.map((c) => [c.id, c] as const));
  const recentIds = new Set(recents);
  const recentCmds: Command[] = recents
    .map((id) => byId.get(id))
    .filter((c): c is Command => c != null)
    .map((c) => ({ ...c, group: "Recent" as const }));
  const rest = out.filter((c) => !recentIds.has(c.id));
  return [...recentCmds, ...rest];
}
