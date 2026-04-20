import { test, expect } from "@playwright/test";

test("Cmd+K + type + Enter adds a component", async ({ page, browserName }) => {
  await page.goto("/composer");
  await page.waitForTimeout(1500);
  const mod = browserName === "firefox" ? "Control" : "Meta";
  await page.keyboard.press(`${mod}+k`);
  await page.keyboard.type("Add Card");
  await page.keyboard.press("Enter");
  await expect(
    page.locator(".wui-composer__stage .wui-card"),
  ).toHaveCount(1);
});
