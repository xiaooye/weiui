import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  { name: "landing", path: "/" },
  { name: "getting-started", path: "/docs/getting-started" },
  { name: "components-overview", path: "/docs/components" },
  { name: "button", path: "/docs/components/button" },
  { name: "input", path: "/docs/components/input" },
  { name: "data-display", path: "/docs/components/data-display" },
  { name: "layout", path: "/docs/components/layout" },
  { name: "feedback", path: "/docs/components/feedback" },
  { name: "navigation", path: "/docs/components/navigation" },
  { name: "typography", path: "/docs/components/typography" },
  { name: "overlays", path: "/docs/components/overlays" },
  { name: "form", path: "/docs/components/form" },
];

for (const page of pages) {
  test(`${page.name} page passes accessibility audit`, async ({ page: browserPage }) => {
    await browserPage.goto(page.path);
    await browserPage.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page: browserPage })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}
