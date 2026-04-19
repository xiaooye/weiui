export interface ComponentNode {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children: ComponentNode[];
  text?: string;
}

export type TreeAction =
  | { type: "INSERT"; parentId: string | null; index: number; node: ComponentNode }
  | { type: "MOVE"; nodeId: string; newParentId: string | null; newIndex: number }
  | { type: "DELETE"; nodeId: string }
  | { type: "UPDATE_PROPS"; nodeId: string; props: Record<string, unknown> }
  | { type: "UPDATE_TEXT"; nodeId: string; text: string }
  | { type: "DUPLICATE"; nodeId: string }
  | {
      type: "WRAP_WITH";
      nodeId: string;
      wrapperType: string;
      wrapperProps: Record<string, unknown>;
      siblingNode: ComponentNode;
      siblingBefore: boolean;
    }
  | { type: "LOAD"; tree: ComponentNode[] }
  | { type: "UNDO" }
  | { type: "REDO" };

export interface TreeState {
  tree: ComponentNode[];
  past: ComponentNode[][];
  future: ComponentNode[][];
}

export const INITIAL_TREE: TreeState = { tree: [], past: [], future: [] };

function newId(): string {
  return `n${Math.random().toString(36).slice(2, 10)}`;
}

function insertAt(
  tree: ComponentNode[],
  parentId: string | null,
  index: number,
  node: ComponentNode,
): ComponentNode[] {
  if (parentId === null) {
    const next = [...tree];
    next.splice(index, 0, node);
    return next;
  }
  return tree.map((n) => {
    if (n.id === parentId) {
      const children = [...n.children];
      children.splice(index, 0, node);
      return { ...n, children };
    }
    return { ...n, children: insertAt(n.children, parentId, index, node) };
  });
}

function removeById(
  tree: ComponentNode[],
  id: string,
): { next: ComponentNode[]; removed: ComponentNode | null } {
  let removed: ComponentNode | null = null;
  const walk = (list: ComponentNode[]): ComponentNode[] =>
    list.flatMap((n) => {
      if (n.id === id) {
        removed = n;
        return [];
      }
      return [{ ...n, children: walk(n.children) }];
    });
  return { next: walk(tree), removed };
}

function findPath(
  list: ComponentNode[],
  id: string,
  parentId: string | null = null,
): { parentId: string | null; index: number } | null {
  for (let i = 0; i < list.length; i++) {
    const n = list[i]!;
    if (n.id === id) return { parentId, index: i };
    const inner = findPath(n.children, id, n.id);
    if (inner) return inner;
  }
  return null;
}

function cloneWithNewIds(n: ComponentNode): ComponentNode {
  return {
    ...n,
    id: newId(),
    children: n.children.map(cloneWithNewIds),
  };
}

export function treeReducer(state: TreeState, action: TreeAction): TreeState {
  const pushPast = (next: ComponentNode[]): TreeState => ({
    tree: next,
    past: [...state.past.slice(-49), state.tree],
    future: [],
  });
  switch (action.type) {
    case "INSERT":
      return pushPast(insertAt(state.tree, action.parentId, action.index, action.node));
    case "DELETE": {
      const { next } = removeById(state.tree, action.nodeId);
      return pushPast(next);
    }
    case "MOVE": {
      const { next: detached, removed } = removeById(state.tree, action.nodeId);
      if (!removed) return state;
      return pushPast(insertAt(detached, action.newParentId, action.newIndex, removed));
    }
    case "UPDATE_PROPS": {
      const walk = (list: ComponentNode[]): ComponentNode[] =>
        list.map((n) =>
          n.id === action.nodeId
            ? { ...n, props: action.props }
            : { ...n, children: walk(n.children) },
        );
      return pushPast(walk(state.tree));
    }
    case "UPDATE_TEXT": {
      const walk = (list: ComponentNode[]): ComponentNode[] =>
        list.map((n) =>
          n.id === action.nodeId
            ? { ...n, text: action.text }
            : { ...n, children: walk(n.children) },
        );
      return pushPast(walk(state.tree));
    }
    case "DUPLICATE": {
      const { next: without, removed } = removeById(state.tree, action.nodeId);
      if (!removed) return state;
      const path = findPath(state.tree, action.nodeId);
      if (!path) return state;
      const withOriginal = insertAt(without, path.parentId, path.index, removed);
      const withClone = insertAt(
        withOriginal,
        path.parentId,
        path.index + 1,
        cloneWithNewIds(removed),
      );
      return pushPast(withClone);
    }
    case "WRAP_WITH": {
      const path = findPath(state.tree, action.nodeId);
      if (!path) return state;
      const { next: without, removed } = removeById(state.tree, action.nodeId);
      if (!removed) return state;
      const wrapper: ComponentNode = {
        id: newId(),
        type: action.wrapperType,
        props: action.wrapperProps,
        children: action.siblingBefore
          ? [action.siblingNode, removed]
          : [removed, action.siblingNode],
      };
      return pushPast(insertAt(without, path.parentId, path.index, wrapper));
    }
    case "LOAD":
      return pushPast(action.tree);
    case "UNDO": {
      const prev = state.past[state.past.length - 1];
      if (!prev) return state;
      return {
        tree: prev,
        past: state.past.slice(0, -1),
        future: [state.tree, ...state.future],
      };
    }
    case "REDO": {
      const next = state.future[0];
      if (!next) return state;
      return {
        tree: next,
        past: [...state.past, state.tree],
        future: state.future.slice(1),
      };
    }
  }
}

export function makeNode(
  type: string,
  props: Record<string, unknown> = {},
  text?: string,
): ComponentNode {
  return { id: newId(), type, props, children: [], text };
}
