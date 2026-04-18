"use client";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  EmptyState,
  Input,
  Stack,
  Text,
} from "@weiui/react";
import type { ComponentNode } from "../lib/component-tree";

interface Props {
  nodes: ComponentNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}

export function Canvas({ nodes, selectedId, onSelect, onRemove, onMove }: Props) {
  return (
    <Card className="wui-tool-canvas">
      <CardHeader>
        <Text as="span" size="sm" weight="semibold">
          Canvas
        </Text>
      </CardHeader>
      <CardContent className="wui-tool-canvas__content">
        {nodes.length === 0 ? (
          <EmptyState
            className="wui-tool-canvas__empty"
            title="Empty canvas"
            description="Click components on the left to add them here."
          />
        ) : (
          <Stack direction="column" gap={2}>
            {nodes.map((node, i) => (
              <div
                key={node.id}
                role="button"
                tabIndex={0}
                aria-pressed={selectedId === node.id}
                aria-label={`Select ${node.type}`}
                onClick={() => onSelect(node.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(node.id);
                  }
                }}
                className="wui-tool-canvas__node"
                data-selected={selectedId === node.id || undefined}
              >
                <Stack direction="row" gap={2} className="wui-tool-canvas__node-body">
                  {renderPreview(node)}
                </Stack>
                <Stack direction="row" gap={1}>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label="Move up"
                    disabled={i === 0}
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
                    disabled={i === nodes.length - 1}
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
                    aria-label="Remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(node.id);
                    }}
                  >
                    <span aria-hidden="true">{"\u00D7"}</span>
                  </Button>
                </Stack>
              </div>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function renderPreview(node: ComponentNode) {
  switch (node.type) {
    case "Button":
      return (
        <Button
          variant={
            (node.props.variant as "solid" | "outline" | "ghost" | "soft" | "link") ?? "solid"
          }
          size="sm"
        >
          {node.children}
        </Button>
      );
    case "Input":
      return (
        <Input
          size="sm"
          placeholder={String(node.props.placeholder || "")}
          aria-label="Composer Input preview"
          readOnly
          className="wui-tool-canvas__node-input"
        />
      );
    case "Badge":
      return (
        <Badge variant={(node.props.variant as "solid" | "soft" | "outline") ?? "solid"}>
          {node.children}
        </Badge>
      );
    case "Card":
      return (
        <Text as="span" size="sm">
          Card: {node.children}
        </Text>
      );
    case "Avatar":
      return (
        <Avatar size="sm">
          <AvatarFallback>{node.children}</AvatarFallback>
        </Avatar>
      );
    case "Alert":
      return (
        <Text as="span" size="sm">
          Alert: {node.children}
        </Text>
      );
    case "Divider":
      return <Divider className="wui-tool-canvas__node-divider" />;
    case "Heading":
      return (
        <Text as="span" size="sm" weight="semibold">
          {node.children}
        </Text>
      );
    case "Text":
      return (
        <Text as="span" size="sm" color="muted">
          {node.children}
        </Text>
      );
    default:
      return <Text as="span">{node.type}</Text>;
  }
}
