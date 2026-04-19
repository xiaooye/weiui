"use client";
import { useEffect, useState } from "react";
import { Button, Heading, Stack } from "@weiui/react";
import { fetchAllSchemas, type ComponentSchema } from "../../../lib/component-schema-client";

interface Props {
  selected: string;
  onSelect: (name: string) => void;
}

export function ComponentSelector({ selected, onSelect }: Props) {
  const [schemas, setSchemas] = useState<ComponentSchema[] | null>(null);

  useEffect(() => {
    fetchAllSchemas().then(setSchemas).catch(() => setSchemas([]));
  }, []);

  return (
    <Stack direction="column" gap={3}>
      <Heading level={3} className="wui-tool-side__title">
        Components
      </Heading>
      <Stack direction="column" gap={1}>
        {(schemas ?? []).map((schema) => (
          <Button
            key={schema.name}
            variant={selected === schema.name ? "soft" : "ghost"}
            size="sm"
            fullWidth
            onClick={() => onSelect(schema.name)}
            className="wui-tool-side__item"
          >
            {schema.name}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
