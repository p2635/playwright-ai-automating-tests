// spec: specs/test-plans/login.md
// seed: tests/seed.spec.ts
import { test, expect } from "../fixtures/pages.js";
import { getUser } from "../support/auth.js";

const user = getUser("buggy");

test.describe("Authenticated session behavior", () => {
  test("should remain authenticated after refreshing the board page", async ({
    page,
    loginPage,
    boardPage,
  }) => {
    await loginPage.login(user);

    await page.reload();

    await expect(page).toHaveURL(/\/board$/);
    await expect(boardPage.heading).toBeVisible();
  });
});
