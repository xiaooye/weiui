"use client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  Stack,
  Text,
} from "@weiui/react";
import type { ComponentNode } from "../lib/tree";

interface Props {
  tree: ComponentNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}

export function Canvas({
  tree,
  selectedId,
  onSelect,
  onDelete,
  onDuplicate,
  onMove,
}: Props) {
  return (
    <Card className="wui-tool-canvas">
      <CardHeader>
        <Text as="span" size="sm" weight="semibold">
          Outline
        </Text>
      </CardHeader>
      <CardContent className="wui-tool-canvas__content">
        {tree.length === 0 ? (
          <EmptyState
            className="wui-tool-canvas__empty"
            title="Empty canvas"
            description="Click components on the left to add them here."
          />
        ) : (
          <Stack direction="column" gap={1} role="tree" aria-label="Component outline">
            {tree.map((node, i) => (
              <OutlineRow
                key={node.id}
                node={node}
                depth={0}
                index={i}
                siblingCount={tree.length}
                selectedId={selectedId}
                onSelect={onSelect}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onMove={onMove}
              />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

interface RowProps {
  node: ComponentNode;
  depth: number;
  index: number;
  siblingCount: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}

function OutlineRow({
  node,
  depth,
  index,
  siblingCount,
  selectedId,
  onSelect,
  onDelete,
  onDuplicate,
  onMove,
}: RowProps) {
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;
  const textPreview = node.text ? truncate(node.text, 40) : "";

  return (
    <>
      <div
        role="treeitem"
        aria-selected={isSelected}
        aria-level={depth + 1}
        tabIndex={0}
        onClick={() => onSelect(node.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(node.id);
          }
        }}
        className="wui-tool-canvas__node"
        data-selected={isSelected || undefined}
        style={{ paddingInlineStart: `${depth * 16}px` }}
      >
        <Stack direction="row" gap={2} className="wui-tool-canvas__node-body">
          <span aria-hidden="true" className="wui-tool-canvas__chevron">
            {hasChildren ? "\u25BE" : "\u00B7"}
          </span>
          <Text as="span" size="sm" weight="medium">
            {node.type}
          </Text>
          {textPreview ? (
            <Text as="span" size="sm" color="muted">
              {textPreview}
            </Text>
          ) : null}
        </Stack>
        <Stack direction="row" gap={1}>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Duplicate"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(node.id);
            }}
          >
            <span aria-hidden="true">{"\u29C9"}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Move up"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation();
              onMove(node.id, "up");
            }}
          >
            <span aria-hidden="true">{"\u2191"}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Move down"
            disabled={index === siblingCount - 1}
            onClick={(e) => {
              e.stopPropagation();
              onMove(node.id, "down");
            }}
          >
            <span aria-hidden="true">{"\u2193"}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            color="destructive"
            aria-label="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
          >
            <span aria-hidden="true">{"\u00D7"}</span>
          </Button>
        </Stack>
      </div>
      {hasChildren
        ? node.children.map((child, childIndex) => (
            <OutlineRow
              key={child.id}
              node={child}
              depth={depth + 1}
              index={childIndex}
              siblingCount={node.children.length}
              selectedId={selectedId}
              onSelect={onSelect}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onMove={onMove}
            />
          ))
        : null}
    </>
  );
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1)}\u2026`;
}
