import { test, expect } from "@playwright/test";

test.describe("Composer", () => {
  test("click-add Card then Button, export contains both", async ({ page }) => {
    await page.goto("/composer");
    await page.waitForLoadState("networkidle");

    // Palette uses "+ Card" / "+ Button" labels.
    await page.getByRole("button", { name: /^\+\s*Card$/ }).click();
    await page.getByRole("button", { name: /^\+\s*Button$/ }).click();

    const codeBlock = page.locator("pre").first();
    await expect(codeBlock).toContainText("<Card");
    await expect(codeBlock).toContainText("<Button");
  });

  test("TSX output wraps code in a component", async ({ page }) => {
    await page.goto("/composer");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /^\+\s*Card$/ }).click();
    // Switch the output format to TSX.
    await page.getByRole("button", { name: /^tsx$/i }).click();

    const codeBlock = page.locator("pre").first();
    await expect(codeBlock).toContainText("export default function Composition");
    await expect(codeBlock).toContainText("<Card");
  });

  test("Open in CodeSandbox button is visible after adding a component", async ({ page }) => {
    await page.goto("/composer");
    await page.waitForLoadState("networkidle");

    const csbButton = page.getByRole("button", { name: /open in codesandbox/i });
    await expect(csbButton).toBeVisible();
    // Before any component is added the button is disabled.
    await expect(csbButton).toBeDisabled();

    await page.getByRole("button", { name: /^\+\s*Card$/ }).click();
    await expect(csbButton).toBeEnabled();
  });
});
