// spec: specs/test-plans/bug-status.md
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

test.describe("Bug status: new bugs default to Open", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.login(user);
  });

  test("should create a new bug as Open and show it under the Open filter", async ({
    boardPage,
    createBugDialog,
    request,
  }) => {
    const title = `Bug status test scenario 1.1 ${new Date().toISOString()}`;

    try {
      // Act: create a new bug via the New Bug modal while the Open filter is active.
      await expect(boardPage.openFilterButton).toHaveClass(/bg-primary/);
      await boardPage.newBugButton.click();
      await createBugDialog.fillAndSave({
        title,
        severity: "mid",
        owner: "buggy",
        description: "New bug defaults to Open scenario",
      });

      // Assert: the new bug appears under the Open filter. [13-AC1]
      await expect(boardPage.rowByTitle(title)).toBeVisible();
    } finally {
      const bugs = await getBugs(request);
      const created = bugs.find((b) => b.title === title);
      if (created) {
        await deleteBugIfExists(request, created.id);
      }
    }
  });
});

test.describe("Bug status: closing a bug via the edit modal", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: create an isolated Open bug and log in with the Open filter active.
    bug = await createBug(request, {
      title: `Bug status test scenario 2.1 ${new Date().toISOString()}`,
      description: "Changing state to Closed via edit modal scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should close an Open bug and move it to the Closed filter", async ({
    boardPage,
    editBugDialog,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    // Assert: the State field starts as Open and Save is disabled. [13-AC2]
    await expect(editBugDialog.stateField).toHaveValue("open");
    await expect(editBugDialog.saveButton).toBeDisabled();

    // Act: change state to Closed and save.
    await editBugDialog.stateField.selectOption("closed");
    await expect(editBugDialog.saveButton).toBeEnabled();
    await editBugDialog.saveButton.click();
    await expect(editBugDialog.dialog).toBeHidden();

    // Assert: the bug leaves the Open filter and appears under Closed. [13-AC2]
    await expect(boardPage.rowByTitle(bug.title)).toBeHidden();
    await boardPage.closedFilterButton.click();
    await expect(boardPage.rowByTitle(bug.title)).toBeVisible();
  });
});

test.describe("Bug status: reopening a bug via the edit modal", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, boardPage, request }) => {
    // Arrange: create an isolated Closed bug, log in, and switch to the Closed filter.
    bug = await createBug(request, {
      title: `Bug status test scenario 2.2 ${new Date().toISOString()}`,
      description: "Changing state to Open via edit modal scenario",
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

  test("should reopen a Closed bug and move it to the Open filter", async ({
    boardPage,
    editBugDialog,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    // Assert: the State field starts as Closed. [13-AC2]
    await expect(editBugDialog.stateField).toHaveValue("closed");

    // Act: change state to Open and save.
    await editBugDialog.stateField.selectOption("open");
    await editBugDialog.saveButton.click();
    await expect(editBugDialog.dialog).toBeHidden();

    // Assert: the bug leaves the Closed filter and appears under Open. [13-AC2]
    await expect(boardPage.rowByTitle(bug.title)).toBeHidden();
    await boardPage.openFilterButton.click();
    await expect(boardPage.rowByTitle(bug.title)).toBeVisible();
  });
});

test.describe("Bug status: persistence after reload", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: create an isolated Open bug and log in.
    bug = await createBug(request, {
      title: `Bug status test scenario 2.3 ${new Date().toISOString()}`,
      description: "Closing a bug persists after reload scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should keep a closed bug closed after reloading the page", async ({
    page,
    boardPage,
    editBugDialog,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    // Act: close the bug, then reload the page.
    await editBugDialog.stateField.selectOption("closed");
    await editBugDialog.saveButton.click();
    await expect(editBugDialog.dialog).toBeHidden();
    await page.reload();

    // Assert: the bug appears under Closed and not under Open after reload. [13-AC2]
    await boardPage.closedFilterButton.click();
    await expect(boardPage.rowByTitle(bug.title)).toBeVisible();
    await boardPage.openFilterButton.click();
    await expect(boardPage.rowByTitle(bug.title)).toBeHidden();
  });
});
