// spec: specs/test-plans/login.md
// seed: tests/seed.spec.ts
import { test, expect } from "../fixtures/pages.js";
import { getUser } from "../support/auth.js";

const user = getUser("buggy");

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

  test("should reject a blank password with a blank-password error", async ({
    page,
    loginPage,
  }) => {
    await page.goto("/login");
    await loginPage.usernameInput.fill(user.username);
    await loginPage.loginButton.click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.errorAlert).toHaveText("Password cannot be blank.");
  });

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
