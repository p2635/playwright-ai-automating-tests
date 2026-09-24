// spec: specs/test-plans/edit-bug.md
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

test.describe("Edit bug: cancel discards changes", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    bug = await createBug(request, {
      title: `Edit bug test scenario 3.1 ${new Date().toISOString()}`,
      description: "Cancels without saving scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should discard the Title change when Cancel is clicked", async ({
    boardPage,
    editBugDialog,
    request,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    const changedTitle = `${bug.title} (changed)`;

    // Act: change the Title, then cancel.
    await editBugDialog.titleField.fill(changedTitle);
    await expect(editBugDialog.titleField).toHaveValue(changedTitle);
    await editBugDialog.cancelButton.click();

    // Assert: the dialog closes and the board keeps the original title. [09-AC6]
    await expect(editBugDialog.dialog).toBeHidden();
    await expect(boardPage.rowByTitle(bug.title)).toBeVisible();
    await expect(boardPage.rowByTitle(changedTitle)).toBeHidden();

    const bugs = await getBugs(request);
    expect(bugs.find((b) => b.id === bug.id)?.title).toBe(bug.title);
  });
});

test.describe("Edit bug: close (X) button discards changes", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    bug = await createBug(request, {
      title: `Edit bug test scenario 3.2 ${new Date().toISOString()}`,
      description: "Closes with the X button without saving scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should discard the Title change when the Close button is clicked", async ({
    boardPage,
    editBugDialog,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    // Act: change the Title, then click the Close (X) button.
    await editBugDialog.titleField.fill(`${bug.title} (changed)`);
    await editBugDialog.closeButton.click();

    // Assert: the dialog closes and the board keeps the original title. [09-AC7]
    await expect(editBugDialog.dialog).toBeHidden();
    await expect(boardPage.rowByTitle(bug.title)).toBeVisible();
  });
});

test.describe("Edit bug: Escape discards changes", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    bug = await createBug(request, {
      title: `Edit bug test scenario 3.3 ${new Date().toISOString()}`,
      description: "Closes with Escape without saving scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should discard the Title change when Escape is pressed", async ({
    page,
    boardPage,
    editBugDialog,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    // Act: change the Title, then press Escape.
    await editBugDialog.titleField.fill(`${bug.title} (changed)`);
    await page.keyboard.press("Escape");

    // Assert: the dialog closes and the board keeps the original title. [09-AC8]
    await expect(editBugDialog.dialog).toBeHidden();
    await expect(boardPage.rowByTitle(bug.title)).toBeVisible();
  });
});

test.describe("Edit bug: backdrop click keeps the modal open", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    bug = await createBug(request, {
      title: `Edit bug test scenario 3.4 ${new Date().toISOString()}`,
      description: "Original description",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should keep entered Title and Description values when the backdrop is clicked", async ({
    boardPage,
    editBugDialog,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    const changedTitle = `${bug.title} (changed)`;
    const changedDescription = "Changed description";

    // Act: change Title and Description, then click the backdrop outside the panel.
    await editBugDialog.titleField.fill(changedTitle);
    await editBugDialog.descriptionField.fill(changedDescription);
    await expect(editBugDialog.titleField).toHaveValue(changedTitle);
    await expect(editBugDialog.descriptionField).toHaveValue(changedDescription);
    await editBugDialog.clickBackdrop();

    // Assert: the dialog stays open with the entered values preserved. [09-AC4]
    await expect(editBugDialog.dialog).toBeVisible();
    await expect(editBugDialog.titleField).toHaveValue(changedTitle);
    await expect(editBugDialog.descriptionField).toHaveValue(changedDescription);
  });
});
