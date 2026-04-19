"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Grid,
  Heading,
  Stack,
  Text,
  ToggleGroup,
  ToggleGroupItem,
  toast,
} from "@weiui/react";
import { Header } from "../../components/chrome/Header";
import {
  useSyncPlaygroundState,
  type PlaygroundState,
} from "./lib/playground-state";
import { fetchSchema } from "../../lib/component-schema-client";
import type { ComponentSchema } from "../../lib/component-schema-loader";
import { PlaygroundPreview } from "./components/PlaygroundPreview";
import { PropsPanel } from "./components/PropsPanel";
import { CodeOutput } from "./components/CodeOutput";
import { ComponentSelector } from "./components/ComponentSelector";

const VIEWPORT_SIZES: Record<PlaygroundState["viewport"], string> = {
  mobile: "375px",
  tablet: "768px",
  desktop: "1280px",
  full: "100%",
};

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

  const onThemeChange = (v: string | string[]) => {
    const value = Array.isArray(v) ? v[0] : v;
    if (value === "light" || value === "dark" || value === "auto") {
      setState({ theme: value });
    }
  };

  const onViewportChange = (v: string | string[]) => {
    const value = Array.isArray(v) ? v[0] : v;
    if (
      value === "mobile" ||
      value === "tablet" ||
      value === "desktop" ||
      value === "full"
    ) {
      setState({ viewport: value });
    }
  };

  const stageStyle = {
    "--wui-playground-viewport-max": VIEWPORT_SIZES[state.viewport],
  } as React.CSSProperties;

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
            columns="220px minmax(0, 1fr) 280px"
            gap={6}
            className="wui-tool-shell__layout wui-tool-shell__layout--playground"
          >
            <ComponentSelector
              selected={state.component}
              onSelect={(c) => setState({ component: c, props: {} })}
            />
            <Stack direction="column" gap={4} className="wui-playground__main">
              <Stack
                direction="row"
                gap={3}
                className="wui-playground__toolbar"
              >
                <Stack direction="column" gap={1}>
                  <Text size="xs" color="muted" as="span">
                    Theme
                  </Text>
                  <ToggleGroup
                    type="single"
                    size="sm"
                    value={state.theme}
                    onChange={onThemeChange}
                    label="Preview theme"
                  >
                    <ToggleGroupItem value="auto">Auto</ToggleGroupItem>
                    <ToggleGroupItem value="light">Light</ToggleGroupItem>
                    <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
                  </ToggleGroup>
                </Stack>
                <Stack direction="column" gap={1}>
                  <Text size="xs" color="muted" as="span">
                    Viewport
                  </Text>
                  <ToggleGroup
                    type="single"
                    size="sm"
                    value={state.viewport}
                    onChange={onViewportChange}
                    label="Preview viewport"
                  >
                    <ToggleGroupItem value="mobile">375</ToggleGroupItem>
                    <ToggleGroupItem value="tablet">768</ToggleGroupItem>
                    <ToggleGroupItem value="desktop">1280</ToggleGroupItem>
                    <ToggleGroupItem value="full">Full</ToggleGroupItem>
                  </ToggleGroup>
                </Stack>
              </Stack>
              <div
                className={
                  state.theme === "dark"
                    ? "wui-playground__preview-stage dark"
                    : "wui-playground__preview-stage"
                }
                data-theme={state.theme === "auto" ? undefined : state.theme}
                data-viewport={state.viewport}
                style={stageStyle}
              >
                {schema ? (
                  <PlaygroundPreview
                    component={schema.name}
                    props={state.props}
                  />
                ) : (
                  <Text>Loading component…</Text>
                )}
              </div>
              {schema ? (
                <CodeOutput schema={schema} props={state.props} />
              ) : null}
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
