"use client";
import NextLink from "next/link";
import { Button, Heading, Stack, Text } from "@weiui/react";
import { Header } from "../components/chrome/Header";
import { Footer } from "../components/landing/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="wui-not-found">
        <Stack direction="column" gap={6} className="wui-not-found__stack">
          <Text
            as="span"
            aria-hidden="true"
            size="xl"
            color="muted"
            className="wui-not-found__code"
          >
            404
          </Text>
          <Stack direction="column" gap={3} className="wui-not-found__body">
            <Heading level={1} className="wui-not-found__title">
              Page not found.
            </Heading>
            <Text size="lg" color="muted">
              The page you were looking for doesn&apos;t exist, or has moved. Try the docs
              index or one of the featured components below.
            </Text>
          </Stack>
          <Stack direction="row" gap={3} wrap className="wui-not-found__actions">
            <Button asChild variant="solid" size="lg">
              <NextLink href="/">Back to home</NextLink>
            </Button>
            <Button asChild variant="outline" size="lg">
              <NextLink href="/docs/getting-started">Getting started</NextLink>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <NextLink href="/docs/components">Components</NextLink>
            </Button>
          </Stack>
        </Stack>
      </main>
      <Footer />
    </>
  );
}
