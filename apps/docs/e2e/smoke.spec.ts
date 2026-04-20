import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/docs/getting-started",
  "/docs/components",
  "/composer",
  "/playground",
  "/themes",
];

for (const route of ROUTES) {
  test(`smoke: ${route} loads without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => {
      errors.push(`pageerror: ${err.message}`);
    });
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      // Ignore Vercel Insights 404 and favicon 404 — environment noise.
      if (text.includes("_vercel/insights")) return;
      if (text.includes("favicon")) return;
      errors.push(`console.error: ${text}`);
    });

    await page.goto(route, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    expect(errors, `Errors on ${route}: ${errors.join("\n")}`).toEqual([]);
  });
}
