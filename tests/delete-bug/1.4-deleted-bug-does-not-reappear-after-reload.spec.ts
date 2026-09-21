// spec: specs/testing/delete-bug.md
// seed: tests/seed.spec.ts
import { test, expect } from "@playwright/test";
import { getUser, loginAndOpenBoard } from "../support/auth.js";
import { createBug, deleteBugIfExists, type Bug } from "../support/board-fixtures.js";

const user = getUser("buggy");

test.describe("Delete bug workflow", () => {
  let bug: Bug;

  test.beforeEach(async ({ page, request }) => {
    // Arrange: create an isolated Open bug for this scenario and log in.
    bug = await createBug(request, {
      title: `Delete bug test scenario 1.4 ${new Date().toISOString()}`,
      description: "Deleted bug does not reappear after reload scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginAndOpenBoard(page, user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("deleted bug does not reappear after reload", async ({ page }) => {
    const bugsTable = page.getByRole("table", { name: "Bugs" });
    await bugsTable.getByText(bug.title, { exact: true }).click();
    const dialog = page.getByRole("dialog", { name: /Edit bug/ });
    await expect(dialog).toBeVisible();

    // Act: delete the bug, then reload the page.
    await dialog.getByRole("button", { name: "Delete" }).click();
    await expect(dialog).toBeHidden();
    await expect(bugsTable.getByText(bug.title, { exact: true })).toBeHidden();
    await page.reload();

    // Assert: the bug is still absent from the board after reload.
    await expect(page.getByRole("table", { name: "Bugs" })).toBeVisible();
    await expect(
      page.getByRole("table", { name: "Bugs" }).getByText(bug.title, { exact: true })
    ).toBeHidden();
  });
});
