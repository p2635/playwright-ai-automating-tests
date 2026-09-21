// spec: specs/testing/delete-bug.md
// seed: tests/seed.spec.ts
import { test, expect } from "@playwright/test";
import { getUser, loginAndOpenBoard } from "../support/auth.js";
import { createBug, deleteBugIfExists, getBugs, type Bug } from "../support/board-fixtures.js";

const user = getUser("buggy");

test.describe("Delete bug workflow", () => {
  let bug: Bug;

  test.beforeEach(async ({ page, request }) => {
    // Arrange: create an isolated Open bug for this scenario and log in.
    bug = await createBug(request, {
      title: `Delete bug test scenario 1.2 ${new Date().toISOString()}`,
      description: "Deletes an open bug and closes the modal scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginAndOpenBoard(page, user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("deletes an open bug and closes the modal", async ({ page, request }) => {
    const bugsTable = page.getByRole("table", { name: "Bugs" });
    await bugsTable.getByText(bug.title, { exact: true }).click();
    const dialog = page.getByRole("dialog", { name: /Edit bug/ });
    await expect(dialog).toBeVisible();

    // Act: click Delete.
    await dialog.getByRole("button", { name: "Delete" }).click();

    // Assert: modal closes, row disappears, Open filter stays selected, and the API confirms removal.
    await expect(dialog).toBeHidden();
    await expect(bugsTable.getByText(bug.title, { exact: true })).toBeHidden();
    await expect(page.getByRole("button", { name: "Open" })).toHaveClass(/bg-primary/);

    const bugs = await getBugs(request);
    expect(bugs.some((b) => b.id === bug.id)).toBe(false);
  });
});
