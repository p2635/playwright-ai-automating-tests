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

test.describe("Delete bug workflow", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, boardPage, request }) => {
    // Arrange: create an isolated Closed bug for this scenario, log in, and switch to the Closed filter.
    bug = await createBug(request, {
      title: `Delete bug test scenario 1.3 ${new Date().toISOString()}`,
      description: "Deletes a closed bug and closes the modal scenario",
      severity: "LOW",
      owner: "buggy",
      state: "CLOSED",
    });
    await loginPage.login(user);
    await boardPage.closedFilterButton.click();
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("deletes a closed bug and closes the modal", async ({
    boardPage,
    editBugDialog,
    request,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    // Act: click Delete.
    await editBugDialog.delete();

    // Assert: row disappears under Closed filter, filter stays selected, and the API confirms removal.
    await expect(boardPage.rowByTitle(bug.title)).toBeHidden();
    await expect(boardPage.closedFilterButton).toHaveClass(/bg-primary/);

    const bugs = await getBugs(request);
    expect(bugs.some((b) => b.id === bug.id)).toBe(false);
  });
});
