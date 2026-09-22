// spec: specs/test-plans/login.md
// seed: tests/seed.spec.ts
import { test, expect } from "../fixtures/pages.js";

test.describe("Failed login", () => {
  test("should reject an invalid username with a generic error", async ({
    page,
    loginPage,
  }) => {
    await page.goto("/login");
    await loginPage.usernameInput.fill("baduser");
    await loginPage.passwordInput.fill("whatever");
    await loginPage.loginButton.click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.errorAlert).toHaveText("Invalid username or password.");
  });
});
