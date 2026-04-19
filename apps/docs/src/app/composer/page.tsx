"use client";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
  Container,
  Grid,
  Heading,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  ToggleGroup,
  ToggleGroupItem,
} from "@weiui/react";
import { Header } from "../../components/chrome/Header";
import { PALETTE_ITEMS } from "./lib/component-tree";
import {
  INITIAL_TREE,
  makeNode,
  treeReducer,
  type ComponentNode,
  type TreeAction,
} from "./lib/tree";
import { useComposerShortcuts } from "./lib/keyboard-shortcuts";
import { Canvas } from "./components/Canvas";
import { ComponentPalette } from "./components/ComponentPalette";
import { PropsEditor } from "./components/PropsEditor";
import { CodeExport, type CodeMode } from "./components/CodeExport";
import { WysiwygCanvas, type ViewportPreset } from "./components/WysiwygCanvas";
import { fetchAllSchemas, fetchSchema } from "../../lib/component-schema-client";
import type { ComponentSchema } from "../../lib/component-schema-loader";

export default function ComposerPage() {
  const [state, dispatch] = useReducer(treeReducer, INITIAL_TREE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [codeMode, setCodeMode] = useState<CodeMode>("jsx");
  const [viewport, setViewport] = useState<ViewportPreset>("full");
  const [view, setView] = useState<"design" | "outline">("design");
  const [selectedSchema, setSelectedSchema] = useState<ComponentSchema | null>(null);
  const [schemas, setSchemas] = useState<ComponentSchema[]>([]);

  const selectedNode = findNode(state.tree, selectedId);

  useEffect(() => {
    let cancelled = false;
    fetchAllSchemas()
      .then((list) => {
        if (!cancelled) setSchemas(list);
      })
      .catch(() => {
        if (!cancelled) setSchemas([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedNode) {
      setSelectedSchema(null);
      return;
    }
    let cancelled = false;
    fetchSchema(selectedNode.type)
      .then((s) => {
        if (!cancelled) setSelectedSchema(s);
      })
      .catch(() => {
        if (!cancelled) setSelectedSchema(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedNode?.type]);

  const onDeselect = useCallback(() => setSelectedId(null), []);

  useComposerShortcuts({ selectedId, dispatch, onDeselect });

  const addNode = (type: string) => {
    const item = PALETTE_ITEMS.find((i) => i.type === type);
    const node = makeNode(
      type,
      { ...(item?.defaultProps ?? {}) },
      item?.defaultChildren ?? undefined,
    );
    dispatch({
      type: "INSERT",
      parentId: null,
      index: state.tree.length,
      node,
    });
    setSelectedId(node.id);
  };

  const deleteNode = (id: string) => {
    dispatch({ type: "DELETE", nodeId: id });
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateNode = (id: string) => {
    dispatch({ type: "DUPLICATE", nodeId: id });
  };

  const moveNode = (id: string, direction: "up" | "down") => {
    const path = findPath(state.tree, id);
    if (!path) return;
    const siblings = getSiblings(state.tree, path.parentId);
    const newIndex = direction === "up" ? path.index - 1 : path.index + 1;
    if (newIndex < 0 || newIndex >= siblings.length) return;
    dispatch({
      type: "MOVE",
      nodeId: id,
      newParentId: path.parentId,
      newIndex,
    });
  };

  const applyDropActions = (actions: TreeAction[]) => {
    for (const action of actions) {
      dispatch(action);
    }
    // Select the dropped node so the props panel updates immediately.
    const first = actions[0];
    if (first?.type === "INSERT") {
      setSelectedId(first.node.id);
    } else if (first?.type === "WRAP_WITH") {
      setSelectedId(first.siblingNode.id);
    }
  };

  const updateNodeProps = (id: string, props: Record<string, unknown>) => {
    dispatch({ type: "UPDATE_PROPS", nodeId: id, props });
  };

  const updateNodeText = (id: string, text: string) => {
    dispatch({ type: "UPDATE_TEXT", nodeId: id, text });
  };

  const loadTemplate = (tree: ComponentNode[]) => {
    dispatch({ type: "LOAD", tree });
    setSelectedId(null);
  };

  return (
    <>
      <Header />
      <Container maxWidth="80rem" className="wui-tool-shell">
        <Stack direction="column" gap={6}>
          <Stack direction="column" gap={2} className="wui-tool-shell__header">
            <Heading level={1} className="wui-tool-shell__title">
              Component Composer
            </Heading>
            <Text size="base" color="muted" className="wui-tool-shell__sub">
              Drag components onto the canvas, edit their props, and export ready-to-ship JSX, TSX or HTML.
            </Text>
          </Stack>
          <Grid
            columns="220px minmax(0, 1fr) 300px"
            gap={4}
            className="wui-tool-shell__layout wui-tool-shell__layout--composer"
          >
            <ComponentPalette onAdd={addNode} onLoadTemplate={loadTemplate} />
            <Stack direction="column" gap={4}>
              <Tabs
                value={view}
                onValueChange={(v) => setView(v as "design" | "outline")}
              >
                <Stack
                  direction="row"
                  gap={3}
                  className="wui-composer__viewport-bar"
                >
                  <TabsList aria-label="Canvas view">
                    <TabsTrigger value="design">Design</TabsTrigger>
                    <TabsTrigger value="outline">Outline</TabsTrigger>
                  </TabsList>
                  {view === "design" ? (
                    <ToggleGroup
                      type="single"
                      value={viewport}
                      onChange={(v) => setViewport((v as ViewportPreset) || "full")}
                      label="Viewport width"
                      size="sm"
                    >
                      <ToggleGroupItem value="375">375</ToggleGroupItem>
                      <ToggleGroupItem value="768">768</ToggleGroupItem>
                      <ToggleGroupItem value="1024">1024</ToggleGroupItem>
                      <ToggleGroupItem value="1280">1280</ToggleGroupItem>
                      <ToggleGroupItem value="full">Full</ToggleGroupItem>
                    </ToggleGroup>
                  ) : null}
                </Stack>
                <TabsContent value="design">
                  <WysiwygCanvas
                    tree={state.tree}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    viewport={viewport}
                    onDropActions={applyDropActions}
                    onUpdateProps={updateNodeProps}
                  />
                </TabsContent>
                <TabsContent value="outline">
                  <Canvas
                    tree={state.tree}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onDelete={deleteNode}
                    onDuplicate={duplicateNode}
                    onMove={moveNode}
                  />
                </TabsContent>
              </Tabs>
              <CodeExport
                tree={state.tree}
                schemas={schemas}
                codeMode={codeMode}
                onCodeModeChange={setCodeMode}
              />
            </Stack>
            <PropsEditor
              schema={selectedSchema}
              node={selectedNode}
              ancestors={findAncestors(state.tree, selectedId)}
              onSelect={setSelectedId}
              onUpdateProps={(props) =>
                selectedNode && updateNodeProps(selectedNode.id, props)
              }
              onUpdateText={(text) =>
                selectedNode && updateNodeText(selectedNode.id, text)
              }
            />
          </Grid>
        </Stack>
      </Container>
    </>
  );
}

function findNode(tree: ComponentNode[], id: string | null): ComponentNode | null {
  if (!id) return null;
  for (const n of tree) {
    if (n.id === id) return n;
    const inner = findNode(n.children, id);
    if (inner) return inner;
  }
  return null;
}

function findPath(
  tree: ComponentNode[],
  id: string,
  parentId: string | null = null,
): { parentId: string | null; index: number } | null {
  for (let i = 0; i < tree.length; i++) {
    const n = tree[i]!;
    if (n.id === id) return { parentId, index: i };
    const inner = findPath(n.children, id, n.id);
    if (inner) return inner;
  }
  return null;
}

function getSiblings(tree: ComponentNode[], parentId: string | null): ComponentNode[] {
  if (parentId === null) return tree;
  const parent = findNode(tree, parentId);
  return parent ? parent.children : [];
}

/** Root-to-node path (inclusive). Empty when id not found. */
function findAncestors(
  tree: ComponentNode[],
  id: string | null,
): ComponentNode[] {
  if (!id) return [];
  const walk = (list: ComponentNode[], trail: ComponentNode[]): ComponentNode[] | null => {
    for (const n of list) {
      const next = [...trail, n];
      if (n.id === id) return next;
      const inner = walk(n.children, next);
      if (inner) return inner;
    }
    return null;
  };
  return walk(tree, []) ?? [];
}
