// spec: specs/test-plans/login.md
// seed: tests/seed.spec.ts
import { test, expect } from "../fixtures/pages.js";
import { getUser } from "../support/auth.js";

const user = getUser("buggy");

test.describe("Submit login on Enter", () => {
  test("should submit the login form when Enter is pressed in the password field", async ({
    page,
    loginPage,
  }) => {
    await page.goto("/login");
    await loginPage.usernameInput.fill(user.username);
    await loginPage.passwordInput.fill(user.password);
    await loginPage.passwordInput.press("Enter");

    await expect(page).toHaveURL(/\/board$/);
  });
});
