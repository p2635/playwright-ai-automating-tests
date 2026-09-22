// spec: specs/test-plans/login.md
// seed: tests/seed.spec.ts
import { test, expect } from "../fixtures/pages.js";
import { getUser } from "../support/auth.js";

const user = getUser("buggy");

test.describe("Successful login", () => {
  test("should log in with valid credentials and navigate to the board", async ({
    page,
    loginPage,
    boardPage,
  }) => {
    await page.goto("/login");
    await loginPage.usernameInput.fill(user.username);
    await loginPage.passwordInput.fill(user.password);
    await loginPage.loginButton.click();

    await expect(page).toHaveURL(/\/board$/);
    await expect(boardPage.heading).toBeVisible();
  });

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

test.describe("Submit login on Enter", () => {
  test("should submit the login form when Enter is pressed in the username field", async ({
    page,
    loginPage,
  }) => {
    await page.goto("/login");
    await loginPage.usernameInput.fill(user.username);
    await loginPage.passwordInput.fill(user.password);
    await loginPage.usernameInput.press("Enter");

    await expect(page).toHaveURL(/\/board$/);
  });

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
