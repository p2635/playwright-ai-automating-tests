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

test.describe("Edit bug: opening the modal from a board row", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: create a fully-populated bug and log in.
    bug = await createBug(request, {
      title: `Edit bug test scenario 1.1 ${new Date().toISOString()}`,
      description: "Opens edit-bug modal pre-populated scenario",
      severity: "MID",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should open the modal with the bug's fields pre-populated and the ID read-only", async ({
    boardPage,
    editBugDialog,
  }) => {
    // Act: click the board row for the bug.
    await boardPage.openBugByTitle(bug.title);

    // Assert: the dialog title interpolates the bug's actual ID. [09-AC1]
    await expect(
      editBugDialog.dialog.getByRole("heading", { name: `Edit bug #${bug.id}` })
    ).toBeVisible();

    // Assert: all fields and both action buttons are present. [09-AC1]
    await expect(editBugDialog.idField).toBeVisible();
    await expect(editBugDialog.titleField).toBeVisible();
    await expect(editBugDialog.severityField).toBeVisible();
    await expect(editBugDialog.ownerField).toBeVisible();
    await expect(editBugDialog.descriptionField).toBeVisible();
    await expect(editBugDialog.saveButton).toBeVisible();
    await expect(editBugDialog.cancelButton).toBeVisible();

    // Assert: the ID field is read-only. [09-AC2]
    await expect(editBugDialog.idField).toHaveAttribute("aria-readonly", "true");
    await expect(editBugDialog.idField).toHaveValue(String(bug.id));

    // Assert: the remaining fields show the bug's existing values and are editable. [09-AC2]
    await expect(editBugDialog.titleField).toHaveValue(bug.title);
    await expect(editBugDialog.severityField).toHaveValue("mid");
    await expect(editBugDialog.ownerField).toHaveValue(bug.owner);
    await expect(editBugDialog.descriptionField).toHaveValue(bug.description);
    await expect(editBugDialog.titleField).toBeEditable();
    await expect(editBugDialog.severityField).toBeEnabled();
    await expect(editBugDialog.ownerField).toBeEditable();
    await expect(editBugDialog.descriptionField).toBeEditable();
  });
});

test.describe("Edit bug: severity dropdown color coding", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: create a HIGH-severity bug and log in.
    bug = await createBug(request, {
      title: `Edit bug test scenario 1.2 ${new Date().toISOString()}`,
      description: "Severity dropdown color coding scenario",
      severity: "HIGH",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should offer HIGH/MID/LOW options and carry a matching severity-select class", async ({
    boardPage,
    editBugDialog,
  }) => {
    // Act: open the edit-bug modal.
    await boardPage.openBugByTitle(bug.title);

    // Assert: the Severity field is a dropdown with the three options. [09-AC3]
    await expect(
      editBugDialog.severityField.locator("option")
    ).toHaveText(["HIGH", "MID", "LOW"]);

    // Assert: the dropdown carries a severity-specific class matching the selected value. [09-AC3]
    await expect(editBugDialog.severityField).toHaveClass(/severity-select-high/);
  });
});

test.describe("Edit bug: Save button disabled states", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: create a bug and log in.
    bug = await createBug(request, {
      title: `Edit bug test scenario 2.6 ${new Date().toISOString()}`,
      description: "Save button disabled state scenarios",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should disable Save immediately after opening, before any change", async ({
    boardPage,
    editBugDialog,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    // Assert: Save is disabled with no changes yet. [09-AC10]
    await expect(editBugDialog.saveButton).toBeDisabled();
  });

  test("should disable Save while the required Title field is blank", async ({
    boardPage,
    editBugDialog,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    // Act: clear the Title field.
    await editBugDialog.titleField.fill("");

    // Assert: Save stays disabled while Title is blank. [09-AC11]
    await expect(editBugDialog.saveButton).toBeDisabled();
  });
});
