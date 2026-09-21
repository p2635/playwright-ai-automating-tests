// spec: specs/testing/delete-bug.md
// seed: tests/seed.spec.ts
import { test, expect } from "@playwright/test";
import { getUser, loginAndOpenBoard } from "../support/auth.js";
import { createBug, deleteBugIfExists, getBugs, type Bug } from "../support/board-fixtures.js";

const user = getUser("buggy");

test.describe("Delete bug workflow", () => {
  let bug: Bug;

  test.beforeEach(async ({ page, request }) => {
    // Arrange: create an isolated Closed bug for this scenario, log in, and switch to the Closed filter.
    bug = await createBug(request, {
      title: `Delete bug test scenario 1.3 ${new Date().toISOString()}`,
      description: "Deletes a closed bug and closes the modal scenario",
      severity: "LOW",
      owner: "buggy",
      state: "CLOSED",
    });
    await loginAndOpenBoard(page, user);
    await page.getByRole("button", { name: "Closed" }).click();
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("deletes a closed bug and closes the modal", async ({ page, request }) => {
    const bugsTable = page.getByRole("table", { name: "Bugs" });
    await bugsTable.getByText(bug.title, { exact: true }).click();
    const dialog = page.getByRole("dialog", { name: /Edit bug/ });
    await expect(dialog).toBeVisible();

    // Act: click Delete.
    await dialog.getByRole("button", { name: "Delete" }).click();

    // Assert: modal closes, row disappears under Closed filter, filter stays selected, and the API confirms removal.
    await expect(dialog).toBeHidden();
    await expect(bugsTable.getByText(bug.title, { exact: true })).toBeHidden();
    await expect(page.getByRole("button", { name: "Closed" })).toHaveClass(/bg-primary/);

    const bugs = await getBugs(request);
    expect(bugs.some((b) => b.id === bug.id)).toBe(false);
  });
});
