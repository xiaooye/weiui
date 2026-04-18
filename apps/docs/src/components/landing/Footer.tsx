"use client";
import NextLink from "next/link";
import {
  Container,
  Divider,
  Heading,
  Link,
  Stack,
  Text,
} from "@weiui/react";
import { siteConfig } from "../../lib/site-config";

interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}

const DOCS_LINKS: FooterLink[] = [
  { href: "/docs/getting-started", label: "Installation" },
  { href: "/docs/components", label: "Components" },
  { href: "/docs/typography", label: "Typography" },
  { href: "/docs/colors", label: "Colors" },
];

const TOOL_LINKS: FooterLink[] = [
  { href: "/playground", label: "Playground" },
  { href: "/composer", label: "Composer" },
  { href: "/themes", label: "Theme Builder" },
];

const PROJECT_LINKS: FooterLink[] = [
  { href: siteConfig.githubUrl, label: "GitHub", external: true },
  { href: "/docs/changelog", label: "Changelog" },
  { href: "/docs/migration", label: "Migration" },
];

function LinkColumn({
  title,
  links,
  id,
}: {
  title: string;
  links: FooterLink[];
  id: string;
}) {
  return (
    <Stack direction="column" gap={3} aria-labelledby={id}>
      <Heading level={4} id={id} className="wui-home-footer__col-title">
        {title}
      </Heading>
      <Stack direction="column" gap={2}>
        {links.map((link) =>
          link.external ? (
            <Link
              key={link.href}
              href={link.href}
              underline="hover"
              showExternalIcon={false}
            >
              {link.label}
            </Link>
          ) : (
            <Link key={link.href} asChild underline="hover">
              <NextLink href={link.href}>{link.label}</NextLink>
            </Link>
          ),
        )}
      </Stack>
    </Stack>
  );
}

export function Footer() {
  return (
    <footer className="wui-home-footer">
      <Container maxWidth="72rem" className="wui-home-footer__inner">
        <Stack direction="column" gap={8}>
          <Stack direction="row" gap={8} wrap className="wui-home-footer__cols">
            <Stack direction="column" gap={3} className="wui-home-footer__brand">
              <Stack direction="row" gap={2}>
                <Text
                  as="span"
                  size="xl"
                  color="primary"
                  aria-hidden="true"
                >
                  {"\u25D0"}
                </Text>
                <Text as="span" size="lg" weight="semibold">
                  {siteConfig.name}
                </Text>
                <Text as="span" size="sm" color="muted">
                  v{siteConfig.version}
                </Text>
              </Stack>
              <Text size="sm" color="muted">
                {siteConfig.description}
              </Text>
            </Stack>
            <LinkColumn title="Docs" links={DOCS_LINKS} id="wui-footer-docs-heading" />
            <LinkColumn title="Tools" links={TOOL_LINKS} id="wui-footer-tools-heading" />
            <LinkColumn title="Project" links={PROJECT_LINKS} id="wui-footer-project-heading" />
          </Stack>
          <Divider />
          <Stack direction="row" gap={4} wrap className="wui-home-footer__bottom">
            <Text size="sm" color="muted">
              {"\u00A9"} 2026 WeiUI. MIT License.
            </Text>
            <Text size="sm" color="muted">
              Made with WeiUI.
            </Text>
          </Stack>
        </Stack>
      </Container>
    </footer>
  );
}
