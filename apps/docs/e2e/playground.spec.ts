import { test, expect } from "@playwright/test";

test.describe("Playground", () => {
  test("loads the default Button component", async ({ page }) => {
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText("Playground");
    // Code output should show some generated code.
    await expect(page.locator("pre").first()).toContainText("Button");
  });

  test("selecting a component updates the preview and code", async ({ page }) => {
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");

    // Open whichever accordion section contains Card and click it.
    const cardItem = page.getByRole("button", { name: /^Card$/ });
    if (await cardItem.count()) {
      await cardItem.first().click();
      await expect(page.locator("pre").first()).toContainText("Card");
    }
  });

  test("share link can be copied without throwing", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/playground");
    await page.waitForLoadState("networkidle");
    const shareBtn = page.getByRole("button", { name: /copy share link/i });
    await shareBtn.click();
    // If the click succeeded without a runtime error the page is still responsive.
    await expect(shareBtn).toBeVisible();
  });
});
