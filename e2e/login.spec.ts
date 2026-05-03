import { expect, test } from "@playwright/test";

test.describe("public pages", () => {
  test("login page loads (auth form or Supabase setup)", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByText("Welcome back").or(page.getByText("Configure Supabase"))
    ).toBeVisible({ timeout: 15_000 });
  });
});
