// spec: specs/testing/delete-bug.md
// seed: tests/seed.spec.ts
import { test, expect } from "../pages/fixtures.js";
import { getUser } from "../support/auth.js";
import { createBug, deleteBugIfExists, getBugs, type Bug } from "../support/board-fixtures.js";

const user = getUser("buggy");

test.describe("Delete bug workflow", () => {
  let bugA: Bug;
  let bugB: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: create two isolated Open bugs for this scenario and log in.
    const timestamp = new Date().toISOString();
    bugA = await createBug(request, {
      title: `Delete bug test scenario 1.6a ${timestamp}`,
      description: "Deleting one bug leaves other bugs scenario (bug A)",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    bugB = await createBug(request, {
      title: `Delete bug test scenario 1.6b ${timestamp}`,
      description: "Deleting one bug leaves other bugs scenario (bug B)",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bugA.id);
    await deleteBugIfExists(request, bugB.id);
  });

  test("deleting one bug leaves other bugs on the board", async ({
    boardPage,
    editBugDialog,
    request,
  }) => {
    await boardPage.openBugByTitle(bugA.title);
    await editBugDialog.expectVisible();

    // Act: delete the first bug only.
    await editBugDialog.delete();

    // Assert: only the first bug's row disappears, and the API reflects only its removal.
    await expect(boardPage.rowByTitle(bugA.title)).toBeHidden();
    await expect(boardPage.rowByTitle(bugB.title)).toBeVisible();

    const bugs = await getBugs(request);
    expect(bugs.some((b) => b.id === bugA.id)).toBe(false);
    expect(bugs.some((b) => b.id === bugB.id)).toBe(true);
  });
});
