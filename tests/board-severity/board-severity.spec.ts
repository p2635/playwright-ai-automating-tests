// spec: specs/test-plans/board-severity.md
// seed: tests/seed.spec.ts
import { test, expect } from "../fixtures/pages.js";
import { getUser } from "../support/auth.js";
import {
  createBug,
  deleteBugIfExists,
  type Bug,
} from "../support/board-fixtures.js";

const user = getUser("buggy");

test.describe("Board severity color-coding: badge classes per severity", () => {
  let highBug: Bug;
  let midBug: Bug;
  let lowBug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: create one bug per severity with unique titles, then log in.
    const timestamp = new Date().toISOString();
    highBug = await createBug(request, {
      title: `Board severity test scenario 1.1 HIGH ${timestamp}`,
      description: "Severity badge color-coding scenario (HIGH)",
      severity: "HIGH",
      owner: "buggy",
      state: "OPEN",
    });
    midBug = await createBug(request, {
      title: `Board severity test scenario 1.1 MID ${timestamp}`,
      description: "Severity badge color-coding scenario (MID)",
      severity: "MID",
      owner: "buggy",
      state: "OPEN",
    });
    lowBug = await createBug(request, {
      title: `Board severity test scenario 1.1 LOW ${timestamp}`,
      description: "Severity badge color-coding scenario (LOW)",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, highBug.id);
    await deleteBugIfExists(request, midBug.id);
    await deleteBugIfExists(request, lowBug.id);
  });

  test("should render a distinct badge class and data-severity for each severity level", async ({
    boardPage,
  }) => {
    // Act: locate each bug's severity badge on the board.
    const highBadge = boardPage.severityBadgeByTitle(highBug.title);
    const midBadge = boardPage.severityBadgeByTitle(midBug.title);
    const lowBadge = boardPage.severityBadgeByTitle(lowBug.title);

    // Assert: each badge carries its own class and data-severity attribute. [08-AC1, 08-AC2]
    await expect(highBadge).toHaveClass(/severity-badge-high/);
    await expect(highBadge).toHaveAttribute("data-severity", "HIGH");

    await expect(midBadge).toHaveClass(/severity-badge-mid/);
    await expect(midBadge).toHaveAttribute("data-severity", "MID");

    await expect(lowBadge).toHaveClass(/severity-badge-low/);
    await expect(lowBadge).toHaveAttribute("data-severity", "LOW");

    // Assert: the three badge classes are mutually distinct. [08-AC3]
    const [highClass, midClass, lowClass] = await Promise.all([
      highBadge.getAttribute("class"),
      midBadge.getAttribute("class"),
      lowBadge.getAttribute("class"),
    ]);
    expect(new Set([highClass, midClass, lowClass]).size).toBe(3);
  });
});

test.describe("Board severity color-coding: badge updates after edit", () => {
  let bug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: create an isolated LOW-severity bug and log in.
    bug = await createBug(request, {
      title: `Board severity test scenario 1.2 ${new Date().toISOString()}`,
      description: "Severity badge updates on edit scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bug.id);
  });

  test("should update the board badge class after editing severity to HIGH", async ({
    boardPage,
    editBugDialog,
  }) => {
    await boardPage.openBugByTitle(bug.title);
    await editBugDialog.expectVisible();

    // Act: change severity to HIGH and save.
    await editBugDialog.severityField.selectOption("high");
    await editBugDialog.saveButton.click();
    await expect(editBugDialog.dialog).toBeHidden();

    // Assert: the board badge now reflects HIGH and no longer reflects LOW. [08-AC1]
    const badge = boardPage.severityBadgeByTitle(bug.title);
    await expect(badge).toHaveClass(/severity-badge-high/);
    await expect(badge).toHaveAttribute("data-severity", "HIGH");
    await expect(badge).not.toHaveClass(/severity-badge-low/);
  });
});
