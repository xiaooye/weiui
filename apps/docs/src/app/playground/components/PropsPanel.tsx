"use client";
import { Stack, Text } from "@weiui/react";
import type {
  ComponentSchema,
  PropSchema,
} from "../../../lib/component-schema-loader";
import {
  ControlString,
  ControlNumber,
  ControlBool,
  ControlEnum,
  ControlColor,
  ControlObject,
  ControlReactNode,
} from "../../../components/prop-controls";
import {
  inferControl,
  extractEnumOptions,
  type ControlKind,
} from "../../../components/prop-controls/infer-control";

export interface PropsPanelProps {
  schema: ComponentSchema;
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
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

export function PropsPanel({ schema, values, onChange }: PropsPanelProps) {
  const setProp = (name: string, v: unknown) =>
    onChange({ ...values, [name]: v });

  const grouped = {
    appearance: [] as Array<{ prop: PropSchema; kind: ControlKind }>,
    behavior: [] as Array<{ prop: PropSchema; kind: ControlKind }>,
    advanced: [] as Array<{ prop: PropSchema; kind: ControlKind }>,
  };
  for (const p of schema.props) {
    const kind = inferControl(p);
    grouped[classifyProp(p, kind)].push({ prop: p, kind });
  }

  const renderControl = (p: PropSchema, kind: ControlKind) => {
    const common = { label: p.name, description: p.description };
    if (kind === "enum") {
      const opts = extractEnumOptions(p.type);
      return (
        <ControlEnum
          key={p.name}
          {...common}
          value={(values[p.name] as string) ?? p.default?.replace(/"/g, "") ?? opts[0] ?? ""}
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
          value={Number(values[p.name] ?? 0)}
          onChange={(v) => setProp(p.name, v)}
        />
      );
    }
    if (kind === "bool") {
      return (
        <ControlBool
          key={p.name}
          {...common}
          value={Boolean(values[p.name])}
          onChange={(v) => setProp(p.name, v)}
        />
      );
    }
    if (kind === "color") {
      return (
        <ControlColor
          key={p.name}
          {...common}
          value={(values[p.name] as string) ?? ""}
          onChange={(v) => setProp(p.name, v)}
        />
      );
    }
    if (kind === "object") {
      return (
        <ControlObject
          key={p.name}
          {...common}
          value={values[p.name]}
          onChange={(v) => setProp(p.name, v)}
        />
      );
    }
    if (kind === "reactnode") {
      return (
        <ControlReactNode
          key={p.name}
          {...common}
          value={(values[p.name] as string) ?? ""}
          onChange={(v) => setProp(p.name, v)}
        />
      );
    }
    return (
      <ControlString
        key={p.name}
        {...common}
        value={(values[p.name] as string) ?? ""}
        onChange={(v) => setProp(p.name, v)}
      />
    );
  };

  return (
    <div className="wui-playground__props">
      <Stack direction="column" gap={4}>
        {grouped.appearance.length > 0 ? (
          <section
            className="wui-playground__props-section"
            aria-label="Appearance"
          >
            <Text
              as="span"
              size="xs"
              weight="semibold"
              color="muted"
              className="wui-playground__props-section-title"
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
            className="wui-playground__props-section"
            aria-label="Behavior"
          >
            <Text
              as="span"
              size="xs"
              weight="semibold"
              color="muted"
              className="wui-playground__props-section-title"
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
            className="wui-playground__props-section"
            aria-label="Advanced"
          >
            <Text
              as="span"
              size="xs"
              weight="semibold"
              color="muted"
              className="wui-playground__props-section-title"
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
      </Stack>
    </div>
  );
}
