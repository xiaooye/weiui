"use client";
import { useEffect, useMemo, useState } from "react";
import { Container, Grid, Heading, Stack, Text } from "@weiui/react";
import { Header } from "../../components/chrome/Header";
import { PlaygroundPreview } from "./components/PlaygroundPreview";
import { PropsPanel, type ComponentDef, type PropDef } from "./components/PropsPanel";
import { CodeOutput } from "./components/CodeOutput";
import { ComponentSelector } from "./components/ComponentSelector";
import {
  fetchAllSchemas,
  type ComponentSchema,
  type PropSchema,
} from "../../lib/component-schema-client";
import { inferControl, extractEnumOptions } from "../../components/prop-controls/infer-control";

/** Turn a schema's prop into the legacy `PropDef` shape that the existing
 *  PropsPanel understands. Task 3 rewrites PropsPanel to be schema-native. */
function toPropDef(p: PropSchema): PropDef | null {
  const kind = inferControl(p);
  switch (kind) {
    case "enum": {
      const options = extractEnumOptions(p.type);
      if (options.length === 0) return null;
      return {
        name: p.name,
        type: "select",
        options,
        defaultValue: options[0]!,
      };
    }
    case "bool":
      return { name: p.name, type: "boolean", defaultValue: false };
    case "string":
      return { name: p.name, type: "text", defaultValue: "" };
    default:
      return null; // number / color / object / reactnode not supported by legacy panel
  }
}

function schemaToDef(schema: ComponentSchema): ComponentDef {
  const props = schema.props.map(toPropDef).filter((p): p is PropDef => p !== null);
  return {
    name: schema.name,
    category: schema.category,
    props,
    defaultChildren: schema.name,
  };
}

export default function PlaygroundPage() {
  const [schemas, setSchemas] = useState<ComponentSchema[] | null>(null);
  const [selectedName, setSelectedName] = useState<string>("Button");
  const [propValues, setPropValues] = useState<Record<string, string | boolean>>({});
  const [children, setChildren] = useState<string>("Click me");

  useEffect(() => {
    fetchAllSchemas().then(setSchemas);
  }, []);

  const selectedSchema = useMemo(
    () => schemas?.find((s) => s.name === selectedName) ?? null,
    [schemas, selectedName],
  );

  const components: ComponentDef[] = useMemo(
    () => (schemas ? schemas.map(schemaToDef) : []),
    [schemas],
  );

  const selectedDef: ComponentDef | null = useMemo(
    () => selectedSchema ? schemaToDef(selectedSchema) : null,
    [selectedSchema],
  );

  // When the selected component changes, reset prop values to defaults.
  useEffect(() => {
    if (!selectedDef) return;
    setPropValues(Object.fromEntries(selectedDef.props.map((p) => [p.name, p.defaultValue])));
    setChildren(selectedDef.defaultChildren);
  }, [selectedDef]);

  const handleComponentChange = (comp: ComponentDef) => {
    setSelectedName(comp.name);
  };

  // Build the live props record passed to renderComponent + generateCode.
  // Includes children (as string) when non-empty.
  const livePropsForRender: Record<string, unknown> = useMemo(() => {
    const entries = Object.entries(propValues).filter(
      ([, v]) => v !== "" && v !== undefined && v !== null && v !== false,
    );
    const out: Record<string, unknown> = Object.fromEntries(entries);
    if (children) out.children = children;
    return out;
  }, [propValues, children]);

  return (
    <>
      <Header />
      <Container maxWidth="80rem" className="wui-tool-shell">
        <Stack direction="column" gap={6}>
          <Stack direction="column" gap={2} className="wui-tool-shell__header">
            <Heading level={1} className="wui-tool-shell__title">
              Component Playground
            </Heading>
            <Text size="base" color="muted" className="wui-tool-shell__sub">
              Tweak props interactively and copy the generated code. Explore every variant of
              every WeiUI component.
            </Text>
          </Stack>
          {!selectedSchema || !selectedDef ? (
            <Text>Loading components…</Text>
          ) : (
            <Grid
              columns="200px minmax(0, 1fr) 280px"
              gap={6}
              className="wui-tool-shell__layout wui-tool-shell__layout--playground"
            >
              <ComponentSelector
                components={components}
                selected={selectedDef}
                onSelect={handleComponentChange}
              />
              <Stack direction="column" gap={4}>
                <PlaygroundPreview
                  componentName={selectedSchema.name}
                  props={livePropsForRender}
                />
                <CodeOutput
                  componentName={selectedSchema.name}
                  importPath={selectedSchema.importPath}
                  subpathImport={selectedSchema.subpathImport}
                  props={livePropsForRender}
                />
              </Stack>
              <PropsPanel
                component={selectedDef}
                propValues={propValues}
                onPropChange={(name, value) =>
                  setPropValues((prev) => ({ ...prev, [name]: value }))
                }
                children={children}
                onChildrenChange={setChildren}
              />
            </Grid>
          )}
        </Stack>
      </Container>
    </>
  );
}
