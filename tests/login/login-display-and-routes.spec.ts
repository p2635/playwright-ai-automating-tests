// spec: specs/test-plans/login.md
// seed: tests/seed.spec.ts
import { test, expect } from "../fixtures/pages.js";

test.describe("Login page display", () => {
  test("should display the login page with username, password, and login button", async ({
    page,
    loginPage,
  }) => {
    await page.goto("/login");

    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
    await expect(loginPage.loginButton).toBeVisible();
  });
});

test.describe("Route protection", () => {
  test("should redirect an unauthenticated user from the board page to login", async ({
    page,
  }) => {
    await page.goto("/board");

    await expect(page).toHaveURL(/\/login$/);
  });
});
