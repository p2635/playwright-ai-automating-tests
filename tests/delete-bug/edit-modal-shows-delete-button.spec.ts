// spec: specs/testing/delete-bug.md
// seed: tests/seed.spec.ts
import { test, expect } from "../fixtures/pages.js";
import { getUser } from "../support/auth.js";
import {
  createBug,
  deleteBugIfExists,
  type Bug,
} from "../support/board-fixtures.js";

const user = getUser("buggy");

test.describe("Delete bug workflow", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: create an isolated Open bug for this scenario and log in.
    bug = await createBug(request, {
      title: `Delete bug test scenario 1.1 ${new Date().toISOString()}`,
      description: "Edit modal delete button visibility scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should show a delete button in the edit modal", async ({
    boardPage,
    editBugDialog,
  }) => {
    // Act: open the Edit modal for the newly created bug.
    await expect(boardPage.bugsTable).toBeVisible();
    await expect(boardPage.rowByTitle(bug.title)).toBeVisible();
    await boardPage.openBugByTitle(bug.title);

    // Assert: the dialog and its action buttons are visible.
    await editBugDialog.expectVisible();
    await expect(editBugDialog.deleteButton).toBeVisible();
    await expect(editBugDialog.cancelButton).toBeVisible();
    await expect(editBugDialog.saveButton).toBeVisible();
  });
});
