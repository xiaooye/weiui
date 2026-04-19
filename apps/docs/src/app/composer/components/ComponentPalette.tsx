"use client";
import type { DragEvent } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Text,
} from "@weiui/react";
import { PALETTE_ITEMS, PALETTE_CATEGORIES } from "../lib/component-tree";
import { makeNode, type ComponentNode } from "../lib/tree";
import { TEMPLATES } from "../lib/templates";

interface Props {
  onAdd: (type: string) => void;
  onLoadTemplate?: (tree: ComponentNode[]) => void;
}

export function ComponentPalette({ onAdd, onLoadTemplate }: Props) {
  const onDragStart = (e: DragEvent<HTMLButtonElement>, type: string) => {
    const item = PALETTE_ITEMS.find((i) => i.type === type);
    const node = makeNode(
      type,
      { ...(item?.defaultProps ?? {}) },
      item?.defaultChildren || undefined,
    );
    e.dataTransfer.setData("application/x-weiui-node", JSON.stringify(node));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <Card className="wui-tool-palette">
      <CardHeader>
        <Text as="span" size="sm" weight="semibold">
          Components {"\u00B7"} {PALETTE_ITEMS.length}
        </Text>
      </CardHeader>
      <CardContent>
        <Stack direction="column" gap={3}>
          {onLoadTemplate ? (
            <Stack direction="column" gap={1}>
              <Text
                as="span"
                size="xs"
                weight="semibold"
                color="muted"
                className="wui-tool-palette__category"
              >
                Templates
              </Text>
              {TEMPLATES.map((tpl) => (
                <Button
                  key={tpl.id}
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => onLoadTemplate(tpl.tree)}
                  className="wui-tool-palette__item"
                  title={tpl.description}
                >
                  {tpl.label}
                </Button>
              ))}
            </Stack>
          ) : null}
          {PALETTE_CATEGORIES.map((category) => {
            const items = PALETTE_ITEMS.filter((i) => i.category === category);
            if (items.length === 0) return null;
            return (
              <Stack key={category} direction="column" gap={1}>
                <Text
                  as="span"
                  size="xs"
                  weight="semibold"
                  color="muted"
                  className="wui-tool-palette__category"
                >
                  {category}
                </Text>
                {items.map((item) => (
                  <Button
                    key={item.type}
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => onAdd(item.type)}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.type)}
                    className="wui-tool-palette__item"
                  >
                    + {item.label}
                  </Button>
                ))}
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
