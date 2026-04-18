"use client";
import { useState } from "react";
import { Container, Grid, Heading, Stack, Text } from "@weiui/react";
import { Header } from "../../components/chrome/Header";
import { COMPONENTS, type ComponentDef } from "./lib/component-registry";
import { PlaygroundPreview } from "./components/PlaygroundPreview";
import { PropsPanel } from "./components/PropsPanel";
import { CodeOutput } from "./components/CodeOutput";
import { ComponentSelector } from "./components/ComponentSelector";

export default function PlaygroundPage() {
  const [selectedComponent, setSelectedComponent] = useState<ComponentDef>(COMPONENTS[0]!);
  const [propValues, setPropValues] = useState<Record<string, string | boolean>>(() =>
    Object.fromEntries(selectedComponent.props.map((p) => [p.name, p.defaultValue])),
  );
  const [children, setChildren] = useState(selectedComponent.defaultChildren);

  const handleComponentChange = (comp: ComponentDef) => {
    setSelectedComponent(comp);
    setPropValues(Object.fromEntries(comp.props.map((p) => [p.name, p.defaultValue])));
    setChildren(comp.defaultChildren);
  };

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
          <Grid
            columns="200px minmax(0, 1fr) 280px"
            gap={6}
            className="wui-tool-shell__layout wui-tool-shell__layout--playground"
          >
            <ComponentSelector
              components={COMPONENTS}
              selected={selectedComponent}
              onSelect={handleComponentChange}
            />
            <Stack direction="column" gap={4}>
              <PlaygroundPreview
                component={selectedComponent}
                propValues={propValues}
                children={children}
              />
              <CodeOutput
                component={selectedComponent}
                propValues={propValues}
                children={children}
              />
            </Stack>
            <PropsPanel
              component={selectedComponent}
              propValues={propValues}
              onPropChange={(name, value) =>
                setPropValues((prev) => ({ ...prev, [name]: value }))
              }
              children={children}
              onChildrenChange={setChildren}
            />
          </Grid>
        </Stack>
      </Container>
    </>
  );
}
