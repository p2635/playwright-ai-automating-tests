// spec: specs/test-plans/login.md
// seed: tests/seed.spec.ts
import { test, expect } from "../fixtures/pages.js";
import { getUser } from "../support/auth.js";

const user = getUser("buggy");

test.describe("Failed login", () => {
  test("should reject an invalid password with the same generic error", async ({
    page,
    loginPage,
  }) => {
    await page.goto("/login");
    await loginPage.usernameInput.fill(user.username);
    await loginPage.passwordInput.fill("wrong-password");
    await loginPage.loginButton.click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.errorAlert).toHaveText("Invalid username or password.");
  });
});
