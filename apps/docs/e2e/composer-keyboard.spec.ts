import { test, expect } from "@playwright/test";

test("arrows navigate siblings + Delete removes", async ({ page }) => {
  await page.goto("/composer");
  await page.waitForTimeout(1500);
  await page
    .locator(".wui-tool-palette")
    .getByRole("button", { name: /Pricing grid/i })
    .click();
  await page.waitForTimeout(1000);
  await page
    .locator(".wui-composer__stage")
    .getByText("Starter", { exact: true })
    .click();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(".wui-composer__props-heading")).not.toContainText(
    "Heading",
  );
  await page.keyboard.press("Delete");
  await expect(
    page.locator(".wui-composer__stage").getByText("Starter", { exact: true }),
  ).toHaveCount(0);
});
