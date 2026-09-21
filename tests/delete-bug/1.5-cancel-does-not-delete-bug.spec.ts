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
      title: `Delete bug test scenario 1.5 ${new Date().toISOString()}`,
      description: "Cancel does not delete the bug scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginAndOpenBoard(page, user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("cancel does not delete the bug", async ({ page, request }) => {
    const bugsTable = page.getByRole("table", { name: "Bugs" });
    await bugsTable.getByText(bug.title, { exact: true }).click();
    const dialog = page.getByRole("dialog", { name: /Edit bug/ });
    await expect(dialog).toBeVisible();

    // Act: click Cancel without clicking Delete.
    await dialog.getByRole("button", { name: "Cancel" }).click();

    // Assert: modal closes, the bug's row remains, and the bug still exists via the API.
    await expect(dialog).toBeHidden();
    await expect(bugsTable.getByText(bug.title, { exact: true })).toBeVisible();

    const bugs = await getBugs(request);
    expect(bugs.some((b) => b.id === bug.id)).toBe(true);
  });
});
