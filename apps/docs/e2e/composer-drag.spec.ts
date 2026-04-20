import { test, expect } from "@playwright/test";

test("pointer-drag palette Button to empty stage", async ({ page }) => {
  await page.goto("/composer");
  await page.waitForTimeout(1500);
  const btn = page
    .locator(".wui-tool-palette")
    .getByRole("button", { name: /^Button$/ });
  const stage = page.locator(".wui-composer__stage");
  const a = (await btn.boundingBox())!;
  const s = (await stage.boundingBox())!;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + 20, a.y + 20, { steps: 5 });
  await page.mouse.move(s.x + s.width / 2, s.y + s.height / 2, { steps: 15 });
  await page.mouse.up();
  await expect(
    page.locator(".wui-composer__stage .wui-button"),
  ).toHaveCount(1);
});
