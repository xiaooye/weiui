import { test, expect } from "@playwright/test";

test("selection outline aligns with component at 50% zoom", async ({ page }) => {
  await page.goto("/composer");
  await page.waitForTimeout(1500);
  // Click the "Dashboard card" template — it's in the pinned Templates
  // section (always expanded) and its root node is a Card. Simple onClick,
  // no pointer-drag machine, so Playwright .click() works reliably.
  await page
    .locator(".wui-tool-palette__item--template", { hasText: /Dashboard card/ })
    .first()
    .click();
  await page.waitForTimeout(500);
  // Set zoom to 50%
  await page.getByRole("button", { name: /^50%$/ }).click();
  await page.waitForTimeout(400);
  // Click the rendered Card's top-left corner so the click resolves to the
  // outermost [data-composer-id] wrapper, not a deeper child element.
  const card = page.locator(".wui-composer__stage .wui-card").first();
  const cardBox = await card.boundingBox();
  expect(cardBox, "card must render on stage").not.toBeNull();
  await page.mouse.click(cardBox!.x + 2, cardBox!.y + 2);
  await page.waitForTimeout(200);
  const outline = page.locator(".wui-composer__selection-outline");
  const outlineBox = await outline.boundingBox();
  expect(outlineBox, "outline must render").not.toBeNull();
  expect(Math.abs(outlineBox!.x - cardBox!.x)).toBeLessThan(4);
  expect(Math.abs(outlineBox!.y - cardBox!.y)).toBeLessThan(4);
});
