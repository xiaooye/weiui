"use client";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Card,
  CardContent,
  CardHeader,
  SearchInput,
  Stack,
  Text,
} from "@weiui/react";
import {
  fetchAllSchemas,
  type ComponentSchema,
} from "../../../lib/component-schema-client";

interface Props {
  selected: string;
  onSelect: (name: string) => void;
}

interface CategoryGroup {
  category: string;
  items: ComponentSchema[];
}

function groupByCategory(schemas: ComponentSchema[]): CategoryGroup[] {
  const map = new Map<string, ComponentSchema[]>();
  for (const s of schemas) {
    const cat = s.category || "Other";
    const bucket = map.get(cat);
    if (bucket) bucket.push(s);
    else map.set(cat, [s]);
  }
  const out: CategoryGroup[] = [];
  for (const [category, items] of map) {
    items.sort((a, b) => a.name.localeCompare(b.name));
    out.push({ category, items });
  }
  out.sort((a, b) => a.category.localeCompare(b.category));
  return out;
}

function matches(schema: ComponentSchema, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    schema.name.toLowerCase().includes(q) ||
    (schema.description ?? "").toLowerCase().includes(q)
  );
}

export function ComponentSelector({ selected, onSelect }: Props) {
  const [schemas, setSchemas] = useState<ComponentSchema[] | null>(null);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);
  const listsRef = useRef<Map<string, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    let cancelled = false;
    fetchAllSchemas()
      .then((s) => {
        if (cancelled) return;
        setSchemas(s);
      })
      .catch(() => {
        if (!cancelled) setSchemas([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => groupByCategory(schemas ?? []), [schemas]);

  const filteredGroups = useMemo(() => {
    if (!query) return groups;
    return groups
      .map((g) => ({
        category: g.category,
        items: g.items.filter((s) => matches(s, query)),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  // Auto-expand: if searching, open all non-empty groups; otherwise open the
  // group containing the selected component (or the first group by default).
  useEffect(() => {
    if (query) {
      setExpanded(filteredGroups.map((g) => g.category));
      return;
    }
    if (filteredGroups.length === 0) return;
    const owning = filteredGroups.find((g) =>
      g.items.some((i) => i.name === selected),
    );
    setExpanded([owning?.category ?? filteredGroups[0]!.category]);
  }, [query, filteredGroups, selected]);

  const handleItemKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    category: string,
    name: string,
  ) => {
    const list = listsRef.current.get(category);
    if (!list) return;
    const buttons = Array.from(
      list.querySelectorAll<HTMLButtonElement>(".wui-playground-selector__item"),
    );
    const idx = buttons.findIndex((b) => b === event.currentTarget);
    if (idx < 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      buttons[(idx + 1) % buttons.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      buttons[(idx - 1 + buttons.length) % buttons.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      buttons[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      buttons[buttons.length - 1]?.focus();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(name);
    }
  };

  const loading = schemas === null;
  const empty = !loading && filteredGroups.length === 0;
  const totalCount = (schemas ?? []).length;

  return (
    <Card className="wui-playground-selector">
      <CardHeader>
        <Stack direction="column" gap={2}>
          <Text as="span" size="sm" weight="semibold">
            Components {"\u00B7"} {totalCount}
          </Text>
          <SearchInput
            size="sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components"
            aria-label="Search components"
            className="wui-playground-selector__search"
          />
        </Stack>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Text size="sm" color="muted">
            Loading…
          </Text>
        ) : empty ? (
          <Text size="sm" color="muted">
            No components match.
          </Text>
        ) : (
          <Accordion
            type="multiple"
            value={expanded}
            onValueChange={setExpanded}
            className="wui-playground-selector__accordion"
          >
            {filteredGroups.map((group) => (
              <AccordionItem
                key={group.category}
                value={group.category}
                className="wui-playground-selector__section"
                data-category={group.category.toLowerCase()}
              >
                <AccordionTrigger className="wui-playground-selector__trigger">
                  <span className="wui-playground-selector__trigger-label">
                    <span className="wui-playground-selector__category">
                      {group.category}
                    </span>
                    <Badge variant="soft" size="sm">
                      {group.items.length}
                    </Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div
                    ref={(el) => {
                      listsRef.current.set(group.category, el);
                    }}
                    className="wui-playground-selector__list"
                  >
                    {group.items.map((schema) => {
                      const isSelected = schema.name === selected;
                      return (
                        <button
                          key={schema.name}
                          type="button"
                          className="wui-playground-selector__item"
                          data-selected={isSelected || undefined}
                          aria-current={isSelected ? "true" : undefined}
                          onClick={() => onSelect(schema.name)}
                          onKeyDown={(e) =>
                            handleItemKeyDown(e, group.category, schema.name)
                          }
                        >
                          <span
                            aria-hidden="true"
                            className="wui-playground-selector__icon"
                            data-category={group.category.toLowerCase()}
                          >
                            {schema.name[0]}
                          </span>
                          <span className="wui-playground-selector__label">
                            {schema.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
