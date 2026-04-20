"use client";
import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Card,
  CardContent,
  CardHeader,
  Input,
  Stack,
  Text,
} from "@weiui/react";
import {
  PALETTE_ITEMS,
  PALETTE_CATEGORIES,
  type PaletteCategory,
  type PaletteItem,
} from "../lib/component-tree";
import { makeNode, type ComponentNode } from "../lib/tree";
import { TEMPLATES } from "../lib/templates";
import { usePointerDrag } from "../lib/pointer-drag";
import { useInteractionManager } from "../lib/interaction-manager";

interface Props {
  onAdd: (type: string) => void;
  onLoadTemplate?: (tree: ComponentNode[]) => void;
}

/** Categories expanded by default — high-signal, everything else collapsed. */
const DEFAULT_EXPANDED: PaletteCategory[] = ["Actions", "Form", "Layout"];
/** Accordion value for the pinned Templates section. */
const TEMPLATES_VALUE = "__templates";

function PaletteButton({
  item,
  onAdd,
  category,
}: {
  item: PaletteItem;
  onAdd: (type: string) => void;
  category: PaletteCategory;
}) {
  const im = useInteractionManager();
  const { onPointerDown } = usePointerDrag<HTMLButtonElement>({
    onDragStart: ({ x, y }) => {
      const node = makeNode(
        item.type,
        { ...(item.defaultProps ?? {}) },
        item.defaultChildren || undefined,
      );
      im.startDrag({ kind: "palette", payload: node, pointer: { x, y } });
    },
    onDragMove: (p) => im.updateDragPointer(p),
    onDragEnd: (p) => {
      // Commit at the release point FIRST (while state.drag is still live),
      // then clear the drag session. Race-free: the stage's commit handler
      // lives in a ref updated on every render.
      im.commitRef.current?.(p);
      im.endDrag();
    },
    onClick: () => onAdd(item.type),
  });
  return (
    <button
      type="button"
      className="wui-tool-palette__item"
      onPointerDown={onPointerDown}
    >
      <span
        className="wui-tool-palette__icon"
        data-category={category.toLowerCase()}
      >
        {item.label[0]}
      </span>
      <span className="wui-tool-palette__label">{item.label}</span>
    </button>
  );
}

export function ComponentPalette({ onAdd, onLoadTemplate }: Props) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string[]>([
    TEMPLATES_VALUE,
    ...DEFAULT_EXPANDED,
  ]);
  const q = query.trim().toLowerCase();
  const matches = (label: string) => q === "" || label.toLowerCase().includes(q);

  // Bucket palette items once per render so the Accordion can iterate cheaply.
  const grouped = useMemo(() => {
    const map = new Map<PaletteCategory, PaletteItem[]>();
    for (const cat of PALETTE_CATEGORIES) map.set(cat, []);
    for (const item of PALETTE_ITEMS) {
      if (!matches(item.label)) continue;
      map.get(item.category)!.push(item);
    }
    return map;
  }, [q]);

  const filteredTemplates = useMemo(
    () => (q === "" ? TEMPLATES : TEMPLATES.filter((t) => matches(t.label))),
    [q],
  );

  // When a query is active, force-open any category that has matches so the
  // user sees results without chasing disclosure triggers.
  const effectiveExpanded = useMemo(() => {
    if (q === "") return expanded;
    const matching: string[] = [];
    if (filteredTemplates.length > 0) matching.push(TEMPLATES_VALUE);
    for (const cat of PALETTE_CATEGORIES) {
      if ((grouped.get(cat) ?? []).length > 0) matching.push(cat);
    }
    return matching;
  }, [q, expanded, grouped, filteredTemplates.length]);

  const totalFiltered =
    filteredTemplates.length +
    PALETTE_CATEGORIES.reduce(
      (sum, cat) => sum + (grouped.get(cat)?.length ?? 0),
      0,
    );

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
        <Accordion
          type="multiple"
          value={effectiveExpanded}
          onValueChange={setExpanded}
          className="wui-tool-palette__accordion"
        >
          {onLoadTemplate && filteredTemplates.length > 0 ? (
            <AccordionItem
              value={TEMPLATES_VALUE}
              className="wui-tool-palette__section wui-tool-palette__section--templates"
            >
              <AccordionTrigger className="wui-tool-palette__trigger">
                <span className="wui-tool-palette__trigger-label">
                  <span className="wui-tool-palette__trigger-title">
                    Templates
                  </span>
                  <Badge variant="soft" size="sm">
                    {filteredTemplates.length}
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="wui-tool-palette__list">
                  {filteredTemplates.map((tpl) => (
                    <button
                      type="button"
                      key={tpl.id}
                      onClick={() => onLoadTemplate(tpl.tree)}
                      className="wui-tool-palette__item wui-tool-palette__item--template"
                      title={tpl.description}
                    >
                      <span className="wui-tool-palette__icon wui-tool-palette__icon--template">
                        {tpl.label[0]}
                      </span>
                      <span className="wui-tool-palette__label">
                        {tpl.label}
                      </span>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ) : null}
          {PALETTE_CATEGORIES.map((category) => {
            const items = grouped.get(category) ?? [];
            if (items.length === 0) return null;
            return (
              <AccordionItem
                key={category}
                value={category}
                className="wui-tool-palette__section"
                data-category={category.toLowerCase()}
              >
                <AccordionTrigger className="wui-tool-palette__trigger">
                  <span className="wui-tool-palette__trigger-label">
                    <span className="wui-tool-palette__trigger-title">
                      {category}
                    </span>
                    <Badge variant="soft" size="sm">
                      {items.length}
                    </Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="wui-tool-palette__list">
                    {items.map((item) => (
                      <PaletteButton
                        key={item.type}
                        item={item}
                        onAdd={onAdd}
                        category={category}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        {q !== "" && totalFiltered === 0 ? (
          <Text size="xs" color="muted">
            No matches for {"\u201C"}
            {query}
            {"\u201D"}.
          </Text>
        ) : null}
      </CardContent>
    </Card>
  );
}
