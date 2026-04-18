"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Card, Grid, Stack, Text } from "@weiui/react";
import { siteConfig, type SidebarItem } from "../../lib/site-config";

export function DocsPager() {
  const pathname = usePathname();
  const allItems: readonly SidebarItem[] = siteConfig.sidebarGroups.flatMap(
    (g) => g.items as readonly SidebarItem[],
  );
  const idx = allItems.findIndex((item) => item.href === pathname);
  if (idx === -1) return null;
  const prev = allItems[idx - 1];
  const next = allItems[idx + 1];

  return (
    <Grid
      columns={2}
      gap={4}
      role="navigation"
      aria-label="Pager"
      className="wui-docs-pager"
    >
      {prev ? (
        <Card variant="outlined" asChild className="wui-docs-pager__card">
          <NextLink href={prev.href}>
            <Stack direction="column" gap={1}>
              <Text size="xs" color="muted">
                {"\u2190"} Previous
              </Text>
              <Text size="base" weight="medium">
                {prev.label}
              </Text>
            </Stack>
          </NextLink>
        </Card>
      ) : (
        <span />
      )}
      {next ? (
        <Card variant="outlined" asChild className="wui-docs-pager__card wui-docs-pager__card--next">
          <NextLink href={next.href}>
            <Stack direction="column" gap={1}>
              <Text size="xs" color="muted">
                Next {"\u2192"}
              </Text>
              <Text size="base" weight="medium">
                {next.label}
              </Text>
            </Stack>
          </NextLink>
        </Card>
      ) : (
        <span />
      )}
    </Grid>
  );
}
