"use client";
import NextLink from "next/link";
import {
  Badge,
  Button,
  Container,
  Divider,
  Grid,
  Heading,
  Stack,
  Text,
} from "@weiui/react";
import { siteConfig } from "../../lib/site-config";

const METRICS: Array<{ value: string; label: string }> = [
  { value: "65+", label: "Components" },
  { value: "AAA", label: "Contrast" },
  { value: "3", label: "Layers" },
  { value: "0", label: "JS required" },
];

export function Hero() {
  return (
    <section className="wui-landing-hero">
      <div className="wui-hero-ambient" aria-hidden="true" />
      <Container maxWidth="72rem" className="wui-landing-hero__inner">
        <Stack direction="column" gap={6} className="wui-landing-hero__content">
          <Badge variant="soft" size="sm" className="wui-landing-hero__badge">
            v{siteConfig.version} {"\u00B7"} Pre-release
          </Badge>
          <Heading level={1} className="wui-landing-hero__title">
            The design system that ships everything.
          </Heading>
          <Text size="lg" color="muted" className="wui-landing-hero__sub">
            Tokens {"\u00B7"} CSS {"\u00B7"} Headless {"\u00B7"} React {"\u00B7"} WCAG AAA {"\u00B7"} Batteries included.
          </Text>
          <Stack direction="row" gap={3} wrap className="wui-landing-hero__cta">
            <Button asChild variant="solid" size="lg">
              <NextLink href="/docs/getting-started">Get Started</NextLink>
            </Button>
            <Button asChild variant="outline" size="lg">
              <NextLink href="/docs/components">Components</NextLink>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <a href={siteConfig.githubUrl} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </Button>
          </Stack>
          <Divider className="wui-landing-hero__metrics-divider" />
          <Grid columns={4} gap={6} className="wui-landing-hero__metrics">
            {METRICS.map((m) => (
              <Stack key={m.label} direction="column" gap={1} className="wui-landing-hero__metric">
                <Text
                  as="span"
                  size="xl"
                  weight="semibold"
                  className="wui-landing-hero__metric-value"
                >
                  {m.value}
                </Text>
                <Text as="span" size="xs" color="muted" className="wui-landing-hero__metric-label">
                  {m.label}
                </Text>
              </Stack>
            ))}
          </Grid>
        </Stack>
      </Container>
    </section>
  );
}
