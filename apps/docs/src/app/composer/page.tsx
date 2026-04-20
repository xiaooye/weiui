"use client";
import { useEffect, useReducer, useState } from "react";
import {
  CommandPalette,
  Container,
  Heading,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  ToggleGroup,
  ToggleGroupItem,
  Toaster,
  toast,
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
import {
  InteractionProvider,
  useInteractionManager,
  type ViewportPreset,
} from "./lib/interaction-manager";
import { findNode, findAncestors, findPath } from "./lib/tree-path";
import { useComposerShortcuts } from "./lib/keyboard-shortcuts";
import { buildCommands, noteCommandUsed } from "./lib/commands";
import { remapIds, serialiseNodes, deserialiseNodes } from "./lib/clipboard";
import { OutlineTree } from "./components/OutlineTree";
import { ComponentPalette } from "./components/ComponentPalette";
import { PropsEditor } from "./components/PropsEditor";
import { CodeExport, type CodeMode } from "./components/CodeExport";
import { WysiwygCanvas } from "./components/WysiwygCanvas";
import { DragGhost } from "./components/DragGhost";
import { ContextMenu } from "./components/ContextMenu";
import { ResizableShell } from "./components/ResizableShell";
import { ComposerAppBar } from "./components/ComposerAppBar";
import { ShortcutHelp } from "./components/ShortcutHelp";
import { fetchAllSchemas, fetchSchema } from "../../lib/component-schema-client";
import type { ComponentSchema } from "../../lib/component-schema-loader";

export default function ComposerPage() {
  return (
    <InteractionProvider>
      <ComposerShell />
    </InteractionProvider>
  );
}

function ComposerShell() {
  const [state, dispatch] = useReducer(treeReducer, INITIAL_TREE);
  const im = useInteractionManager();
  const selectedId = im.state.selection.primary;
  const [codeMode, setCodeMode] = useState<CodeMode>("jsx");
  const [view, setView] = useState<"design" | "outline">("design");
  const [selectedSchema, setSelectedSchema] = useState<ComponentSchema | null>(
    null,
  );
  const [schemas, setSchemas] = useState<ComponentSchema[]>([]);

  const selectedNode = findNode(state.tree, selectedId ?? "");

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

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;
  const onUndo = () => dispatch({ type: "UNDO" });
  const onRedo = () => dispatch({ type: "REDO" });

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
    im.select(node.id, "replace");
  };

  const applyDropActions = (actions: TreeAction[]) => {
    for (const action of actions) {
      dispatch(action);
    }
    const first = actions[0];
    if (first?.type === "INSERT") {
      im.select(first.node.id, "replace");
    } else if (first?.type === "WRAP_WITH") {
      im.select(first.siblingNode.id, "replace");
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
    im.clearSelection();
  };

  const deleteSelected = () => {
    for (const id of im.state.selection.all) {
      dispatch({ type: "DELETE", nodeId: id });
    }
    im.clearSelection();
  };

  const duplicateSelected = () => {
    for (const id of im.state.selection.all) {
      dispatch({ type: "DUPLICATE", nodeId: id });
    }
  };

  const wrap = (kind: "Stack-row" | "Stack-column" | "Card") => {
    const primary = im.state.selection.primary;
    if (!primary) return;
    const path = findPath(state.tree, primary);
    const node = findNode(state.tree, primary);
    if (!path || !node) return;
    const wrapperType = kind === "Card" ? "Card" : "Stack";
    const wrapperProps =
      kind === "Stack-row"
        ? { direction: "row", gap: 3 }
        : kind === "Stack-column"
          ? { direction: "column", gap: 3 }
          : {};
    dispatch({
      type: "WRAP_SINGLE",
      nodeId: primary,
      wrapperType,
      wrapperProps,
    });
  };

  const selectParent = () => {
    const primary = im.state.selection.primary;
    if (!primary) return;
    const path = findPath(state.tree, primary);
    if (path?.parentId) im.select(path.parentId, "replace");
  };

  const copy = async () => {
    const nodes = [...im.state.selection.all]
      .map((id) => findNode(state.tree, id))
      .filter((n): n is ComponentNode => n != null);
    if (!nodes.length) return;
    im.setClipboard(nodes);
    try {
      await navigator.clipboard.writeText(serialiseNodes(nodes));
    } catch {
      /* clipboard blocked; in-memory is enough */
    }
    toast.success(
      `Copied ${nodes.length} node${nodes.length === 1 ? "" : "s"}`,
    );
  };

  const paste = async () => {
    let payload: ComponentNode[] = im.state.clipboard;
    if (!payload.length) {
      try {
        const json = await navigator.clipboard.readText();
        payload = deserialiseNodes(json);
      } catch {
        /* ignore */
      }
    }
    if (!payload.length) return;
    const fresh = remapIds(payload);
    const primary = im.state.selection.primary;
    if (primary) {
      const path = findPath(state.tree, primary);
      if (path) {
        let idx = path.index + 1;
        for (const n of fresh) {
          dispatch({
            type: "INSERT",
            parentId: path.parentId,
            index: idx++,
            node: n,
          });
        }
      }
    } else {
      for (const n of fresh) {
        dispatch({
          type: "INSERT",
          parentId: null,
          index: state.tree.length,
          node: n,
        });
      }
    }
    toast.success(
      `Pasted ${fresh.length} node${fresh.length === 1 ? "" : "s"}`,
    );
  };

  useComposerShortcuts({
    tree: state.tree,
    dispatch,
    onCopy: () => {
      void copy();
    },
    onPaste: () => {
      void paste();
    },
  });

  const commands = buildCommands({
    tree: state.tree,
    selection: im.state.selection,
    previewMode: im.state.previewMode,
    dispatch: {
      insertAtRoot: addNode,
      deleteSelected,
      duplicate: duplicateSelected,
      wrap,
      loadTemplate,
      selectParent,
      setPreview: im.setPreviewMode,
      copy,
      paste,
    },
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        im.openCommandPalette();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [im]);

  return (
    <>
      <Header />
      <Toaster />
      <DragGhost />
      <CommandPalette
        id="composer-commands"
        items={commands.map((c) => ({
          id: c.id,
          label: c.label,
          group: c.group,
          shortcut: c.shortcut,
          onSelect: () => {
            noteCommandUsed(c.id);
            c.run();
          },
        }))}
        open={im.state.commandPaletteOpen}
        onOpenChange={(o) =>
          o ? im.openCommandPalette() : im.closeCommandPalette()
        }
        placeholder="Type a command or search for a component"
      />
      <ContextMenu
        onCopy={copy}
        onPaste={paste}
        onDelete={deleteSelected}
        onDuplicate={duplicateSelected}
        onSelectParent={selectParent}
        onWrap={wrap}
      />
      <ShortcutHelp
        open={im.state.shortcutHelpOpen}
        onOpenChange={(o) => (o ? im.openShortcutHelp() : im.closeShortcutHelp())}
      />
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
          <ResizableShell
            palette={
              <ComponentPalette onAdd={addNode} onLoadTemplate={loadTemplate} />
            }
            canvas={
              <Stack direction="column" gap={4}>
                <ComposerAppBar
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onUndo={onUndo}
                  onRedo={onRedo}
                  onOpenPalette={im.openCommandPalette}
                />
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
                        value={im.state.viewport}
                        onChange={(v) =>
                          im.setViewport((v as ViewportPreset) || "full")
                        }
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
                      onDropActions={applyDropActions}
                      onUpdateProps={updateNodeProps}
                    />
                  </TabsContent>
                  <TabsContent value="outline">
                    <OutlineTree tree={state.tree} />
                  </TabsContent>
                </Tabs>
                <CodeExport
                  tree={state.tree}
                  schemas={schemas}
                  codeMode={codeMode}
                  onCodeModeChange={setCodeMode}
                />
              </Stack>
            }
            props={
              <PropsEditor
                schema={selectedSchema}
                node={selectedNode}
                ancestors={findAncestors(state.tree, selectedId ?? "")}
                onSelect={(id) =>
                  id ? im.select(id, "replace") : im.clearSelection()
                }
                onUpdateProps={(p) =>
                  selectedNode && updateNodeProps(selectedNode.id, p)
                }
                onUpdateText={(text) =>
                  selectedNode && updateNodeText(selectedNode.id, text)
                }
              />
            }
          />
        </Stack>
      </Container>
    </>
  );
}
