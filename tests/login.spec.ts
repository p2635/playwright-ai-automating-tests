import { test, expect } from "@playwright/test";

test("logs in to BuggyBoard", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Username").fill("buggy");
  await page.getByLabel("Password").fill("1970beetle");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/board$/);
  await expect(page.getByRole("heading", { name: "BuggyBoard" })).toBeVisible();
});