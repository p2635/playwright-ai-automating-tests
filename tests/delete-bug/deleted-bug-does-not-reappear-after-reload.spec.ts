// spec: specs/testing/delete-bug.md
// seed: tests/seed.spec.ts
import { test, expect } from "../pages/fixtures.js";
import { getUser } from "../support/auth.js";
import { createBug, deleteBugIfExists, type Bug } from "../support/board-fixtures.js";

const user = getUser("buggy");

test.describe("Delete bug workflow", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: create an isolated Open bug for this scenario and log in.
    bug = await createBug(request, {
      title: `Delete bug test scenario 1.4 ${new Date().toISOString()}`,
      description: "Deleted bug does not reappear after reload scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("deleted bug does not reappear after reload", async ({
    page,
    boardPage,
    editBugDialog,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    // Act: delete the bug, then reload the page.
    await editBugDialog.delete();
    await expect(boardPage.rowByTitle(bug.title)).toBeHidden();
    await page.reload();

    // Assert: the bug is still absent from the board after reload.
    await expect(boardPage.bugsTable).toBeVisible();
    await expect(boardPage.rowByTitle(bug.title)).toBeHidden();
  });
});
