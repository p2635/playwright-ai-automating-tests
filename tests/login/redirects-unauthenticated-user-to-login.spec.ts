// spec: specs/test-plans/login.md
// seed: tests/seed.spec.ts
import { test, expect } from "../fixtures/pages.js";

test.describe("Route protection", () => {
  test("should redirect an unauthenticated user from the board page to login", async ({
    page,
  }) => {
    await page.goto("/board");

    await expect(page).toHaveURL(/\/login$/);
  });
});
