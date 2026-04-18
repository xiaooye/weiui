"use client";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Heading,
  Stack,
  Text,
} from "@weiui/react";

interface Prop {
  title: string;
  body: string;
  glyph: string;
}

const PROPS: Prop[] = [
  {
    title: "Three Layers",
    glyph: "\u25CE",
    body: "CSS-only primitives, accessible headless hooks, or fully styled React components. Pick your integration depth.",
  },
  {
    title: "WCAG AAA",
    glyph: "\u2713",
    body: "7:1 contrast for content text. 44\u00D744 touch targets. Keyboard patterns validated at build time, not in review.",
  },
  {
    title: "OKLCH Tokens",
    glyph: "\u25D0",
    body: "W3C Design Tokens in JSON. Perceptually-uniform color space. Automatic light/dark via relative color functions.",
  },
  {
    title: "Designer-Friendly",
    glyph: "\u270E",
    body: "Tokens live in JSON, Figma variables, and CSS vars — one source of truth. Designers edit without touching component code.",
  },
  {
    title: "Zero-JS tier",
    glyph: "\u2205",
    body: "Drop the CSS package into any framework — Vue, Svelte, plain HTML — and get accessible primitives without a bundler.",
  },
  {
    title: "Ownership, not lock-in",
    glyph: "\u2398",
    body: "shadcn-style CLI copy-paste for components. Own the code, modify anything, no version-bump fear.",
  },
];

export function ValueProps() {
  return (
    <Container maxWidth="72rem" className="wui-home-section wui-home-values">
      <Stack direction="column" gap={8}>
        <Stack direction="column" gap={3} className="wui-home-section__header">
          <Badge variant="soft" size="sm" className="wui-home-section__eyebrow">
            Why WeiUI
          </Badge>
          <Heading level={2} className="wui-home-section__title">
            Built for teams that ship serious UI.
          </Heading>
          <Text size="lg" color="muted" className="wui-home-section__sub">
            Every decision is graded against real production pain: drift, accessibility debt,
            designer{"\u2013"}developer friction.
          </Text>
        </Stack>
        <Grid columns="repeat(auto-fit, minmax(260px, 1fr))" gap={4}>
          {PROPS.map((p) => (
            <Card key={p.title} variant="outlined" className="wui-home-values__card">
              <CardHeader>
                <Text
                  as="span"
                  size="xl"
                  className="wui-home-values__glyph"
                  aria-hidden="true"
                >
                  {p.glyph}
                </Text>
                <Heading level={3} className="wui-home-values__title">
                  {p.title}
                </Heading>
              </CardHeader>
              <CardContent>
                <Text size="sm" color="muted" className="wui-home-values__body">
                  {p.body}
                </Text>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}
