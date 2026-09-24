// spec: specs/test-plans/edit-bug.md
// seed: tests/seed.spec.ts
import { test, expect } from "../fixtures/pages.js";
import { getUser } from "../support/auth.js";
import {
  createBug,
  deleteBugIfExists,
  type Bug,
} from "../support/board-fixtures.js";

const user = getUser("buggy");

test.describe("Edit bug: saving an edited Title", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    bug = await createBug(request, {
      title: `Edit bug test scenario 2.1 ${new Date().toISOString()}`,
      description: "Saves an edited Title scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should save a new Title and reflect it on the board", async ({
    boardPage,
    editBugDialog,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    const newTitle = `${bug.title} (edited)`;

    // Act: change the Title and save.
    await editBugDialog.titleField.fill(newTitle);
    await expect(editBugDialog.saveButton).toBeEnabled(); // [09-AC9]
    await editBugDialog.saveButton.click();

    // Assert: the dialog closes and the board reflects the new title only. [09-AC5]
    await expect(editBugDialog.dialog).toBeHidden();
    await expect(boardPage.rowByTitle(newTitle)).toBeVisible();
    await expect(boardPage.rowByTitle(bug.title)).toBeHidden();

    bug.title = newTitle;
  });
});

test.describe("Edit bug: saving an edited Severity", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    bug = await createBug(request, {
      title: `Edit bug test scenario 2.2 ${new Date().toISOString()}`,
      description: "Saves an edited Severity scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should save a new Severity and reflect it on the board", async ({
    boardPage,
    editBugDialog,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    // Act: change Severity to HIGH and save.
    await editBugDialog.severityField.selectOption("high");
    await expect(editBugDialog.saveButton).toBeEnabled(); // [09-AC9]
    await editBugDialog.saveButton.click();

    // Assert: the dialog closes and the board shows a HIGH badge. [09-AC5]
    await expect(editBugDialog.dialog).toBeHidden();
    await expect(boardPage.severityBadgeByTitle(bug.title)).toHaveClass(
      /severity-badge-high/
    );
  });
});

test.describe("Edit bug: saving an edited Owner", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    bug = await createBug(request, {
      title: `Edit bug test scenario 2.3 ${new Date().toISOString()}`,
      description: "Saves an edited Owner scenario",
      severity: "LOW",
      owner: "original-owner",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should save a new Owner and reflect it on the board", async ({
    boardPage,
    editBugDialog,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    // Act: change the Owner and save.
    await editBugDialog.ownerField.fill("new-owner");
    await expect(editBugDialog.saveButton).toBeEnabled(); // [09-AC9]
    await editBugDialog.saveButton.click();

    // Assert: the dialog closes and the board row shows the new owner. [09-AC5]
    await expect(editBugDialog.dialog).toBeHidden();
    const row = boardPage.rowByTitle(bug.title).locator("xpath=ancestor::tr");
    await expect(row).toContainText("new-owner");
  });
});

test.describe("Edit bug: saving an edited Description", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    bug = await createBug(request, {
      title: `Edit bug test scenario 2.4 ${new Date().toISOString()}`,
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

  test("should save a new Description and show it when reopening the modal", async ({
    boardPage,
    editBugDialog,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    // Act: change the Description and save.
    await editBugDialog.descriptionField.fill("Updated description");
    await expect(editBugDialog.saveButton).toBeEnabled(); // [09-AC9]
    await editBugDialog.saveButton.click();
    await expect(editBugDialog.dialog).toBeHidden();

    // Assert: reopening the modal shows the new description. [09-AC5]
    await boardPage.openBugByTitle(bug.title);
    await expect(editBugDialog.descriptionField).toHaveValue(
      "Updated description"
    );
  });
});

test.describe("Edit bug: persistence after reload", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    bug = await createBug(request, {
      title: `Edit bug test scenario 2.5 ${new Date().toISOString()}`,
      description: "Saved changes persist after reload scenario",
      severity: "LOW",
      owner: "original-owner",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should keep an updated Owner after reloading the page", async ({
    page,
    boardPage,
    editBugDialog,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    // Act: change the Owner, save, then reload.
    await editBugDialog.ownerField.fill("reloaded-owner");
    await editBugDialog.saveButton.click();
    await expect(editBugDialog.dialog).toBeHidden();
    await page.reload();

    // Assert: the board row still shows the updated owner after reload. [09-AC5]
    const row = boardPage.rowByTitle(bug.title).locator("xpath=ancestor::tr");
    await expect(row).toContainText("reloaded-owner");
  });
});
