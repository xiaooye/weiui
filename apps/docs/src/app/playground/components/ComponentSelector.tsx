"use client";
import { Button, Heading, Stack } from "@weiui/react";
import type { ComponentDef } from "./PropsPanel";

interface Props {
  components: ComponentDef[];
  selected: ComponentDef;
  onSelect: (comp: ComponentDef) => void;
}

export function ComponentSelector({ components, selected, onSelect }: Props) {
  return (
    <Stack direction="column" gap={3}>
      <Heading level={3} className="wui-tool-side__title">
        Components
      </Heading>
      <Stack direction="column" gap={1}>
        {components.map((comp) => (
          <Button
            key={comp.name}
            variant={selected.name === comp.name ? "soft" : "ghost"}
            size="sm"
            fullWidth
            onClick={() => onSelect(comp)}
            className="wui-tool-side__item"
          >
            {comp.name}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
