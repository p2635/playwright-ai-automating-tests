// spec: specs/test-plans/login.md
// seed: tests/seed.spec.ts
import { test, expect } from "../fixtures/pages.js";

test.describe("Failed login", () => {
  test("should reject a blank username with a blank-username error", async ({
    page,
    loginPage,
  }) => {
    await page.goto("/login");
    await loginPage.passwordInput.fill("something");
    await loginPage.loginButton.click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.errorAlert).toHaveText("Username cannot be blank.");
  });
});
