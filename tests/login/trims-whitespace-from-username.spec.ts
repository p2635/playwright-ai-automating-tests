// spec: specs/test-plans/login.md
// seed: tests/seed.spec.ts
import { test, expect } from "../fixtures/pages.js";
import { getUser } from "../support/auth.js";

const user = getUser("buggy");

test.describe("Successful login", () => {
  test("should trim leading and trailing whitespace from the username", async ({
    page,
    loginPage,
  }) => {
    await page.goto("/login");
    await loginPage.usernameInput.fill(`  ${user.username}  `);
    await loginPage.passwordInput.fill(user.password);
    await loginPage.loginButton.click();

    await expect(page).toHaveURL(/\/board$/);
  });
});
