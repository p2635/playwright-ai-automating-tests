// spec: specs/testing/delete-bug.md
// seed: tests/seed.spec.ts
import { test, expect } from "../fixtures/pages.js";
import { getUser } from "../support/auth.js";
import {
  createBug,
  deleteBugIfExists,
  getBugs,
  type Bug,
} from "../support/board-fixtures.js";

const user = getUser("buggy");

test.describe("Delete bug workflow: edit modal delete button", () => {
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

test.describe("Delete bug workflow: cancel", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: create an isolated Open bug for this scenario and log in.
    bug = await createBug(request, {
      title: `Delete bug test scenario 1.5 ${new Date().toISOString()}`,
      description: "Cancel does not delete the bug scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should not delete the bug when cancel is clicked", async ({
    boardPage,
    editBugDialog,
    request,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    // Act: click Cancel without clicking Delete.
    await editBugDialog.cancel();

    // Assert: the bug's row remains, and the bug still exists via the API.
    await expect(boardPage.rowByTitle(bug.title)).toBeVisible();

    const bugs = await getBugs(request);
    expect(bugs.some((b) => b.id === bug.id)).toBe(true);
  });
});
