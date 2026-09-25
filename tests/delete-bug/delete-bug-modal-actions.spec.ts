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

test.describe("Delete bug workflow: opens confirmation dialog", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: create an isolated Open bug for this scenario and log in.
    bug = await createBug(request, {
      title: `Delete bug test scenario 1.2 ${new Date().toISOString()}`,
      description: "Clicking delete opens a confirmation dialog scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should open a confirmation dialog without deleting the bug", async ({
    boardPage,
    editBugDialog,
    confirmDeleteBugDialog,
    request,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    // Act: click Delete on the Edit modal.
    await editBugDialog.clickDelete();

    // Assert: the confirmation dialog appears with its own Delete/Cancel buttons,
    // the Edit modal stays open behind it, and the bug is not yet deleted.
    await confirmDeleteBugDialog.expectVisible();
    await expect(confirmDeleteBugDialog.deleteButton).toBeVisible();
    await expect(confirmDeleteBugDialog.cancelButton).toBeVisible();
    await expect(editBugDialog.dialog).toBeVisible();

    const bugs = await getBugs(request);
    expect(bugs.some((b) => b.id === bug.id)).toBe(true);
  });
});

test.describe("Delete bug workflow: edit modal cancel", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: create an isolated Open bug for this scenario and log in.
    bug = await createBug(request, {
      title: `Delete bug test scenario 1.6 ${new Date().toISOString()}`,
      description: "Edit modal cancel does not delete the bug scenario",
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

test.describe("Delete bug workflow: cancel the confirmation dialog", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: create an isolated Open bug for this scenario and log in.
    bug = await createBug(request, {
      title: `Delete bug test scenario 1.7 ${new Date().toISOString()}`,
      description: "Cancelling the confirmation dialog keeps the bug scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should keep the bug and return to the edit modal when cancel is clicked", async ({
    boardPage,
    editBugDialog,
    confirmDeleteBugDialog,
    request,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();
    await editBugDialog.clickDelete();
    await confirmDeleteBugDialog.expectVisible();

    // Act: click Cancel in the confirmation dialog.
    await confirmDeleteBugDialog.cancel();

    // Assert: only the confirmation dialog closes; the Edit modal stays open with the same bug.
    await expect(editBugDialog.dialog).toBeVisible();
    await expect(editBugDialog.titleField).toHaveValue(bug.title);

    const bugs = await getBugs(request);
    expect(bugs.some((b) => b.id === bug.id)).toBe(true);

    // Assert: the bug is still on the board after closing the Edit modal.
    await editBugDialog.cancel();
    await expect(boardPage.rowByTitle(bug.title)).toBeVisible();
  });
});

test.describe("Delete bug workflow: close the confirmation dialog via X", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: create an isolated Open bug for this scenario and log in.
    bug = await createBug(request, {
      title: `Delete bug test scenario 1.8 ${new Date().toISOString()}`,
      description: "Closing the confirmation dialog via X keeps the bug scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should keep the bug and return to the edit modal when the confirmation dialog is closed via X", async ({
    boardPage,
    editBugDialog,
    confirmDeleteBugDialog,
    request,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();
    await editBugDialog.clickDelete();
    await confirmDeleteBugDialog.expectVisible();

    // Act: click the X close control on the confirmation dialog.
    await confirmDeleteBugDialog.closeViaX();

    // Assert: only the confirmation dialog closes; the Edit modal stays open, and the bug remains.
    await expect(editBugDialog.dialog).toBeVisible();

    const bugs = await getBugs(request);
    expect(bugs.some((b) => b.id === bug.id)).toBe(true);
  });
});

test.describe("Delete bug workflow: escape closes only the confirmation dialog", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: create an isolated Open bug for this scenario and log in.
    bug = await createBug(request, {
      title: `Delete bug test scenario 1.9 ${new Date().toISOString()}`,
      description: "Escape closes only the confirmation dialog scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should close only the confirmation dialog and keep the bug when escape is pressed", async ({
    page,
    boardPage,
    editBugDialog,
    confirmDeleteBugDialog,
    request,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();
    await editBugDialog.clickDelete();
    await confirmDeleteBugDialog.expectVisible();

    // Act: press Escape once.
    await page.keyboard.press("Escape");

    // Assert: only the confirmation dialog closes; the Edit modal stays open, and the bug remains.
    await expect(confirmDeleteBugDialog.dialog).toBeHidden();
    await expect(editBugDialog.dialog).toBeVisible();

    const bugs = await getBugs(request);
    expect(bugs.some((b) => b.id === bug.id)).toBe(true);

    // Act: press Escape again.
    await page.keyboard.press("Escape");

    // Assert: the Edit modal now closes too.
    await expect(editBugDialog.dialog).toBeHidden();
  });
});
