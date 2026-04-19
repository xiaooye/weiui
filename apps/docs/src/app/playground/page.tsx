"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Grid,
  Heading,
  Stack,
  Text,
  toast,
} from "@weiui/react";
import { Header } from "../../components/chrome/Header";
import { useSyncPlaygroundState } from "./lib/playground-state";
import { fetchSchema } from "../../lib/component-schema-client";
import type { ComponentSchema } from "../../lib/component-schema-loader";
import { PlaygroundPreview } from "./components/PlaygroundPreview";
import { PropsPanel } from "./components/PropsPanel";
import { CodeOutput } from "./components/CodeOutput";
import { ComponentSelector } from "./components/ComponentSelector";

export default function PlaygroundPage() {
  const [state, setState] = useSyncPlaygroundState();
  const [schema, setSchema] = useState<ComponentSchema | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSchema(state.component)
      .then((s) => {
        if (!cancelled) setSchema(s);
      })
      .catch(() => {
        if (!cancelled) setSchema(null);
      });
    return () => {
      cancelled = true;
    };
  }, [state.component]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Share link copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="80rem" className="wui-tool-shell wui-playground">
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
              selected={state.component}
              onSelect={(c) => setState({ component: c, props: {} })}
            />
            <Stack direction="column" gap={4} className="wui-playground__main">
              {schema ? (
                <>
                  <PlaygroundPreview component={schema.name} props={state.props} />
                  <CodeOutput schema={schema} props={state.props} />
                </>
              ) : (
                <Text>Loading component…</Text>
              )}
              <Button variant="ghost" size="sm" onClick={share}>
                Copy share link
              </Button>
            </Stack>
            {schema ? (
              <PropsPanel
                schema={schema}
                values={state.props}
                onChange={(p) => setState({ props: p })}
              />
            ) : (
              <div />
            )}
          </Grid>
        </Stack>
      </Container>
    </>
  );
}
