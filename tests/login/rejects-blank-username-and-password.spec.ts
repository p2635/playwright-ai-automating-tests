// spec: specs/test-plans/login.md
// seed: tests/seed.spec.ts
import { test, expect } from "../fixtures/pages.js";

test.describe("Failed login", () => {
  test("should reject blank username and password with a missing-credentials error", async ({
    page,
    loginPage,
  }) => {
    await page.goto("/login");
    await loginPage.loginButton.click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.errorAlert).toHaveText(
      "Please enter your username and password.",
    );
  });
});
