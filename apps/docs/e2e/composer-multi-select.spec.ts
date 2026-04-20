import { test, expect } from "@playwright/test";

test("Shift+Click selects two, Delete removes both", async ({ page }) => {
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
  await page
    .locator(".wui-composer__stage")
    .getByText("Pro", { exact: true })
    .click({ modifiers: ["Shift"] });
  await page.keyboard.press("Delete");
  await expect(
    page.locator(".wui-composer__stage").getByText("Starter"),
  ).toHaveCount(0);
  await expect(
    page.locator(".wui-composer__stage").getByText("Pro", { exact: true }),
  ).toHaveCount(0);
});
