"use client";
import { useState } from "react";
import { Container, Grid, Heading, Stack, Text } from "@weiui/react";
import { Header } from "../../components/chrome/Header";
import { type ComponentNode, createNode } from "./lib/component-tree";
import { generateJsx, generateHtml } from "./lib/code-gen";
import { Canvas } from "./components/Canvas";
import { ComponentPalette } from "./components/ComponentPalette";
import { PropsEditor } from "./components/PropsEditor";
import { CodeExport } from "./components/CodeExport";

export default function ComposerPage() {
  const [nodes, setNodes] = useState<ComponentNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [codeMode, setCodeMode] = useState<"jsx" | "html">("jsx");

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  const addNode = (type: string) => {
    const node = createNode(type);
    setNodes((prev) => [...prev, node]);
    setSelectedId(node.id);
  };

  const removeNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const moveNode = (id: string, direction: "up" | "down") => {
    setNodes((prev) => {
      const idx = prev.findIndex((n) => n.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[idx]!;
      copy[idx] = copy[newIdx]!;
      copy[newIdx] = temp;
      return copy;
    });
  };

  const updateNode = (id: string, updates: Partial<ComponentNode>) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    );
  };

  const code = codeMode === "jsx" ? generateJsx(nodes) : generateHtml(nodes);

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
              Drag components onto the canvas, edit their props, and export ready-to-ship JSX or HTML.
            </Text>
          </Stack>
          <Grid
            columns="180px minmax(0, 1fr) 240px"
            gap={4}
            className="wui-tool-shell__layout wui-tool-shell__layout--composer"
          >
            <ComponentPalette onAdd={addNode} />
            <Stack direction="column" gap={4}>
              <Canvas
                nodes={nodes}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onRemove={removeNode}
                onMove={moveNode}
              />
              <CodeExport code={code} codeMode={codeMode} onCodeModeChange={setCodeMode} />
            </Stack>
            <PropsEditor
              node={selectedNode}
              onUpdate={(updates) => selectedNode && updateNode(selectedNode.id, updates)}
            />
          </Grid>
        </Stack>
      </Container>
    </>
  );
}
