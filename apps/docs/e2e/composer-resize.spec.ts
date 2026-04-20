import { test, expect } from "@playwright/test";

test("Splitter handle drag changes palette width", async ({ page }) => {
  await page.goto("/composer");
  await page.waitForTimeout(1500);
  const palette = page.locator(".wui-tool-palette").first();
  const initial = (await palette.boundingBox())!.width;
  const handle = page.locator('[role="separator"]').first();
  const h = (await handle.boundingBox())!;
  await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
  await page.mouse.down();
  await page.mouse.move(h.x + 100, h.y + h.height / 2, { steps: 10 });
  await page.mouse.up();
  const after = (await palette.boundingBox())!.width;
  expect(after).toBeGreaterThan(initial + 40);
});
