"use client";
import {
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  Field,
  Input,
  Label,
  Stack,
  Text,
} from "@weiui/react";
import type { ComponentSchema } from "../../../lib/component-schema-loader";
import {
  ControlBool,
  ControlColor,
  ControlEnum,
  ControlNumber,
  ControlObject,
  ControlReactNode,
  ControlString,
} from "../../../components/prop-controls";
import {
  extractEnumOptions,
  inferControl,
} from "../../../components/prop-controls/infer-control";
import type { ComponentNode } from "../lib/tree";

export interface PropsEditorProps {
  schema: ComponentSchema | null;
  node: ComponentNode | null;
  onUpdateProps: (props: Record<string, unknown>) => void;
  onUpdateText: (text: string) => void;
}

export function PropsEditor({
  schema,
  node,
  onUpdateProps,
  onUpdateText,
}: PropsEditorProps) {
  if (!node) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            size="sm"
            title="No selection"
            description="Select a component to edit its props."
          />
        </CardContent>
      </Card>
    );
  }

  const setProp = (name: string, value: unknown) => {
    onUpdateProps({ ...node.props, [name]: value });
  };

  // The "children" prop in schemas is handled by the dedicated text editor
  // below; skip it in the main prop list to avoid duplication.
  const editableProps = schema?.props.filter((p) => p.name !== "children") ?? [];

  return (
    <Card>
      <CardHeader>
        <Text as="span" size="sm" weight="semibold">
          {node.type} Props
        </Text>
      </CardHeader>
      <CardContent>
        <Stack direction="column" gap={3}>
          <Field>
            <Label htmlFor={`composer-${node.id}-text`}>text</Label>
            <Input
              id={`composer-${node.id}-text`}
              size="sm"
              value={node.text ?? ""}
              onChange={(e) => onUpdateText(e.currentTarget.value)}
            />
          </Field>
          {schema ? (
            editableProps.map((p) => {
              const kind = inferControl(p);
              const common = { label: p.name, description: p.description };
              const raw = node.props[p.name];
              if (kind === "enum") {
                const opts = extractEnumOptions(p.type);
                const fallback = p.default?.replace(/"/g, "") ?? opts[0] ?? "";
                return (
                  <ControlEnum
                    key={p.name}
                    {...common}
                    value={typeof raw === "string" ? raw : fallback}
                    options={opts}
                    onChange={(v) => setProp(p.name, v)}
                  />
                );
              }
              if (kind === "number") {
                return (
                  <ControlNumber
                    key={p.name}
                    {...common}
                    value={Number(raw ?? 0)}
                    onChange={(v) => setProp(p.name, v)}
                  />
                );
              }
              if (kind === "bool") {
                return (
                  <ControlBool
                    key={p.name}
                    {...common}
                    value={Boolean(raw)}
                    onChange={(v) => setProp(p.name, v)}
                  />
                );
              }
              if (kind === "color") {
                return (
                  <ControlColor
                    key={p.name}
                    {...common}
                    value={typeof raw === "string" ? raw : ""}
                    onChange={(v) => setProp(p.name, v)}
                  />
                );
              }
              if (kind === "object") {
                return (
                  <ControlObject
                    key={p.name}
                    {...common}
                    value={raw}
                    onChange={(v) => setProp(p.name, v)}
                  />
                );
              }
              if (kind === "reactnode") {
                return (
                  <ControlReactNode
                    key={p.name}
                    {...common}
                    value={typeof raw === "string" ? raw : ""}
                    onChange={(v) => setProp(p.name, v)}
                  />
                );
              }
              return (
                <ControlString
                  key={p.name}
                  {...common}
                  value={typeof raw === "string" ? raw : ""}
                  onChange={(v) => setProp(p.name, v)}
                />
              );
            })
          ) : (
            <Text size="xs" color="muted">
              Loading schema…
            </Text>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
