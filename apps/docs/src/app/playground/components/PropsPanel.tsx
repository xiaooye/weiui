"use client";
import type { ComponentSchema } from "../../../lib/component-schema-loader";
import {
  ControlString,
  ControlNumber,
  ControlBool,
  ControlEnum,
  ControlColor,
  ControlObject,
  ControlReactNode,
} from "../../../components/prop-controls";
import { inferControl, extractEnumOptions } from "../../../components/prop-controls/infer-control";

export interface PropsPanelProps {
  schema: ComponentSchema;
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}

export function PropsPanel({ schema, values, onChange }: PropsPanelProps) {
  const setProp = (name: string, v: unknown) => onChange({ ...values, [name]: v });
  return (
    <div className="wui-playground__props">
      {schema.props.map((p) => {
        const kind = inferControl(p);
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
      })}
    </div>
  );
}
