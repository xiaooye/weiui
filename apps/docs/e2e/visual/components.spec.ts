import { test, expect } from "@playwright/test";

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
  test(`${page.name} page matches snapshot`, async ({ page: browserPage }) => {
    await browserPage.goto(page.path);
    await browserPage.waitForLoadState("networkidle");
    await expect(browserPage).toHaveScreenshot(`${page.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
}

test("playground page renders", async ({ page }) => {
  await page.goto("/playground");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("h1")).toContainText("Playground");
});
