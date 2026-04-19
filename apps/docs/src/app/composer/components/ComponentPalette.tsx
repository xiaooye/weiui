"use client";
import { useMemo, useState, type DragEvent } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Input,
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

function setDragPreview(e: DragEvent<HTMLElement>, label: string) {
  if (!e.dataTransfer) return;
  const ghost = document.createElement("div");
  ghost.textContent = label;
  Object.assign(ghost.style, {
    padding: "6px 10px",
    background: "var(--wui-color-primary)",
    color: "var(--wui-color-primary-foreground)",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    position: "absolute",
    top: "-1000px",
    pointerEvents: "none",
    boxShadow: "var(--wui-shadow-md)",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(ghost);
  e.dataTransfer.setDragImage(ghost, 0, 0);
  window.setTimeout(() => {
    if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
  }, 0);
}

export function ComponentPalette({ onAdd, onLoadTemplate }: Props) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = (label: string) => q === "" || label.toLowerCase().includes(q);

  const filteredTemplates = useMemo(
    () => (q === "" ? TEMPLATES : TEMPLATES.filter((t) => matches(t.label))),
    [q],
  );

  const onDragStart = (e: DragEvent<HTMLButtonElement>, type: string) => {
    if (!e.dataTransfer) return;
    const item = PALETTE_ITEMS.find((i) => i.type === type);
    const node = makeNode(
      type,
      { ...(item?.defaultProps ?? {}) },
      item?.defaultChildren || undefined,
    );
    e.dataTransfer.setData("application/x-weiui-node", JSON.stringify(node));
    e.dataTransfer.effectAllowed = "copy";
    setDragPreview(e, item?.label ?? type);
  };

  return (
    <Card className="wui-tool-palette">
      <CardHeader>
        <Stack direction="column" gap={2}>
          <Text as="span" size="sm" weight="semibold">
            Components {"\u00B7"} {PALETTE_ITEMS.length}
          </Text>
          <Input
            type="search"
            size="sm"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder="Search..."
            aria-label="Filter components"
            className="wui-tool-palette__search"
          />
        </Stack>
      </CardHeader>
      <CardContent>
        <Stack direction="column" gap={3}>
          {onLoadTemplate && filteredTemplates.length > 0 ? (
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
              {filteredTemplates.map((tpl) => (
                <button
                  type="button"
                  key={tpl.id}
                  onClick={() => onLoadTemplate(tpl.tree)}
                  className="wui-tool-palette__item"
                  title={tpl.description}
                >
                  {tpl.label}
                </button>
              ))}
            </Stack>
          ) : null}
          {PALETTE_CATEGORIES.map((category) => {
            const items = PALETTE_ITEMS.filter(
              (i) => i.category === category && matches(i.label),
            );
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
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => onAdd(item.type)}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.type)}
                    className="wui-tool-palette__item"
                  >
                    {item.label}
                  </button>
                ))}
              </Stack>
            );
          })}
          {q !== "" &&
          filteredTemplates.length === 0 &&
          PALETTE_ITEMS.filter((i) => matches(i.label)).length === 0 ? (
            <Text size="xs" color="muted">
              No matches for {"\u201C"}
              {query}
              {"\u201D"}.
            </Text>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
