"use client";
import {
  Badge,
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
import type {
  ComponentSchema,
  PropSchema,
} from "../../../lib/component-schema-loader";
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
  type ControlKind,
} from "../../../components/prop-controls/infer-control";
import type { ComponentNode } from "../lib/tree";

export interface PropsEditorProps {
  schema: ComponentSchema | null;
  node: ComponentNode | null;
  onUpdateProps: (props: Record<string, unknown>) => void;
  onUpdateText: (text: string) => void;
}

type PropGroup = "appearance" | "behavior" | "advanced";

/** Prop-name heuristics for "Appearance" — visual/style axes. */
const APPEARANCE_PROPS = new Set([
  "variant",
  "color",
  "size",
  "tone",
  "shape",
  "radius",
  "density",
  "align",
  "justify",
  "direction",
  "orientation",
  "elevation",
  "placement",
  "side",
  "position",
]);

/** Prop-name heuristics for "Behavior" — interaction/state axes. */
const BEHAVIOR_PROPS = new Set([
  "disabled",
  "loading",
  "readOnly",
  "required",
  "autoFocus",
  "defaultOpen",
  "open",
  "defaultChecked",
  "checked",
  "selected",
  "expanded",
  "collapsed",
  "active",
  "persistent",
  "modal",
  "dismissible",
  "closeOnEscape",
  "closeOnOverlay",
]);

function classifyProp(prop: PropSchema, kind: ControlKind): PropGroup {
  if (APPEARANCE_PROPS.has(prop.name) || kind === "enum" || kind === "color") {
    return "appearance";
  }
  if (BEHAVIOR_PROPS.has(prop.name) || kind === "bool") {
    return "behavior";
  }
  return "advanced";
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

  // Group props into Appearance / Behavior / Advanced. Render each group with
  // a section header so dense panels get visual hierarchy.
  const grouped = {
    appearance: [] as Array<{ prop: PropSchema; kind: ControlKind }>,
    behavior: [] as Array<{ prop: PropSchema; kind: ControlKind }>,
    advanced: [] as Array<{ prop: PropSchema; kind: ControlKind }>,
  };
  for (const p of editableProps) {
    const kind = inferControl(p);
    grouped[classifyProp(p, kind)].push({ prop: p, kind });
  }

  const renderControl = (prop: PropSchema, kind: ControlKind) => {
    const common = { label: prop.name, description: prop.description };
    const raw = node.props[prop.name];
    if (kind === "enum") {
      const opts = extractEnumOptions(prop.type);
      const fallback = prop.default?.replace(/"/g, "") ?? opts[0] ?? "";
      return (
        <ControlEnum
          key={prop.name}
          {...common}
          value={typeof raw === "string" ? raw : fallback}
          options={opts}
          onChange={(v) => setProp(prop.name, v)}
        />
      );
    }
    if (kind === "number") {
      return (
        <ControlNumber
          key={prop.name}
          {...common}
          value={Number(raw ?? 0)}
          onChange={(v) => setProp(prop.name, v)}
        />
      );
    }
    if (kind === "bool") {
      return (
        <ControlBool
          key={prop.name}
          {...common}
          value={Boolean(raw)}
          onChange={(v) => setProp(prop.name, v)}
        />
      );
    }
    if (kind === "color") {
      return (
        <ControlColor
          key={prop.name}
          {...common}
          value={typeof raw === "string" ? raw : ""}
          onChange={(v) => setProp(prop.name, v)}
        />
      );
    }
    if (kind === "object") {
      return (
        <ControlObject
          key={prop.name}
          {...common}
          value={raw}
          onChange={(v) => setProp(prop.name, v)}
        />
      );
    }
    if (kind === "reactnode") {
      return (
        <ControlReactNode
          key={prop.name}
          {...common}
          value={typeof raw === "string" ? raw : ""}
          onChange={(v) => setProp(prop.name, v)}
        />
      );
    }
    return (
      <ControlString
        key={prop.name}
        {...common}
        value={typeof raw === "string" ? raw : ""}
        onChange={(v) => setProp(prop.name, v)}
      />
    );
  };

  return (
    <Card className="wui-composer__props">
      <CardHeader>
        <Stack direction="column" gap={1}>
          <div className="wui-composer__props-heading">
            <Text as="span" size="sm" weight="semibold">
              {node.type} Props
            </Text>
            <Badge variant="soft" size="sm">
              {node.id.slice(0, 8)}
            </Badge>
          </div>
          {schema?.category ? (
            <Text size="xs" color="muted">
              {schema.category}
            </Text>
          ) : null}
        </Stack>
      </CardHeader>
      <CardContent>
        <Stack direction="column" gap={4}>
          <section
            className="wui-composer__props-section"
            aria-label="Content"
          >
            <Text
              as="span"
              size="xs"
              weight="semibold"
              color="muted"
              className="wui-composer__props-section-title"
            >
              Content
            </Text>
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
            </Stack>
          </section>
          {schema ? (
            <>
              {grouped.appearance.length > 0 ? (
                <section
                  className="wui-composer__props-section"
                  aria-label="Appearance"
                >
                  <Text
                    as="span"
                    size="xs"
                    weight="semibold"
                    color="muted"
                    className="wui-composer__props-section-title"
                  >
                    Appearance
                  </Text>
                  <Stack direction="column" gap={3}>
                    {grouped.appearance.map(({ prop, kind }) =>
                      renderControl(prop, kind),
                    )}
                  </Stack>
                </section>
              ) : null}
              {grouped.behavior.length > 0 ? (
                <section
                  className="wui-composer__props-section"
                  aria-label="Behavior"
                >
                  <Text
                    as="span"
                    size="xs"
                    weight="semibold"
                    color="muted"
                    className="wui-composer__props-section-title"
                  >
                    Behavior
                  </Text>
                  <Stack direction="column" gap={3}>
                    {grouped.behavior.map(({ prop, kind }) =>
                      renderControl(prop, kind),
                    )}
                  </Stack>
                </section>
              ) : null}
              {grouped.advanced.length > 0 ? (
                <section
                  className="wui-composer__props-section"
                  aria-label="Advanced"
                >
                  <Text
                    as="span"
                    size="xs"
                    weight="semibold"
                    color="muted"
                    className="wui-composer__props-section-title"
                  >
                    Advanced
                  </Text>
                  <Stack direction="column" gap={3}>
                    {grouped.advanced.map(({ prop, kind }) =>
                      renderControl(prop, kind),
                    )}
                  </Stack>
                </section>
              ) : null}
            </>
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
