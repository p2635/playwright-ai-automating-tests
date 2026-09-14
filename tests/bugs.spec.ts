import { test, expect } from "@playwright/test";

test("creates a new bug", async ({ page }) => {
  const bugTitle = `Playwright bug ${Date.now()}`;

  await page.goto("/login");

  await page.getByLabel("Username").fill("buggy");
  await page.getByLabel("Password").fill("1970beetle");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/board$/);
  await expect(page.getByRole("cell", { name: "Loading…" })).toBeHidden();
  await page.getByRole("button", { name: "New Bug" }).click();

  const createBugDialog = page.getByRole("dialog", { name: "Create bug" });
  await createBugDialog.getByLabel("Title").fill(bugTitle);
  await createBugDialog.getByLabel("Severity").selectOption("high");
  await createBugDialog.getByLabel("Owner").fill("buggy");
  await createBugDialog
    .getByLabel("Description")
    .fill("This is dummy bug data for the happy path test.");
  await createBugDialog.getByRole("button", { name: "Save" }).click();

  await expect(page.getByRole("cell", { name: bugTitle, exact: true })).toBeVisible();
});
