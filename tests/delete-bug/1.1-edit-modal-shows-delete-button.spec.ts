// spec: specs/testing/delete-bug.md
// seed: tests/seed.spec.ts
import { test, expect } from "@playwright/test";
import { getUser, loginAndOpenBoard } from "../support/auth.js";
import { createBug, deleteBugIfExists, type Bug } from "../support/board-fixtures.js";

const user = getUser("buggy");

test.describe("Delete bug workflow", () => {
  let bug: Bug;

  test.beforeEach(async ({ page, request }) => {
    // Arrange: create an isolated Open bug for this scenario and log in.
    bug = await createBug(request, {
      title: `Delete bug test scenario 1.1 ${new Date().toISOString()}`,
      description: "Edit modal delete button visibility scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginAndOpenBoard(page, user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("edit modal shows a delete button", async ({ page }) => {
    // Act: open the Edit modal for the newly created bug.
    const bugsTable = page.getByRole("table", { name: "Bugs" });
    await bugsTable.getByText(bug.title, { exact: true }).click();

    // Assert: the dialog and its action buttons are visible.
    const dialog = page.getByRole("dialog", { name: /Edit bug/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Delete" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Save" })).toBeVisible();
  });
});
