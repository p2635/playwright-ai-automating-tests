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

test.describe("Delete bug workflow: open bug", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: create an isolated Open bug for this scenario and log in.
    bug = await createBug(request, {
      title: `Delete bug test scenario 1.2 ${new Date().toISOString()}`,
      description: "Deletes an open bug and closes the modal scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should delete an open bug and close the modal", async ({
    boardPage,
    editBugDialog,
    request,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    // Act: click Delete.
    await editBugDialog.delete();

    // Assert: row disappears, Open filter stays selected, and the API confirms removal.
    await expect(boardPage.rowByTitle(bug.title)).toBeHidden();
    await expect(boardPage.openFilterButton).toHaveClass(/bg-primary/);

    const bugs = await getBugs(request);
    expect(bugs.some((b) => b.id === bug.id)).toBe(false);
  });
});

test.describe("Delete bug workflow: closed bug", () => {
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

  test("should delete a closed bug and close the modal", async ({
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

test.describe("Delete bug workflow: persistence after reload", () => {
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

  test("should not reappear after page reload", async ({
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

test.describe("Delete bug workflow: unaffected bugs", () => {
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

  test("should leave other bugs on the board when one is deleted", async ({
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
