// spec: specs/test-plans/bug-status.md
// seed: tests/seed.spec.ts
import { test, expect } from "../fixtures/pages.js";
import { getUser } from "../support/auth.js";
import {
  createBug,
  deleteAllBugs,
  deleteBugIfExists,
  type Bug,
} from "../support/board-fixtures.js";

const user = getUser("buggy");

test.describe("Bug status: board filter defaults and toggling", () => {
  let openBug: Bug;
  let closedBug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: start from an empty board with one Open and one Closed bug, then log in.
    await deleteAllBugs(request);
    const timestamp = new Date().toISOString();
    openBug = await createBug(request, {
      title: `Bug status test scenario 3 alpha ${timestamp}`,
      description: "Board filter defaults and toggling scenario (open)",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    closedBug = await createBug(request, {
      title: `Bug status test scenario 3 beta ${timestamp}`,
      description: "Board filter defaults and toggling scenario (closed)",
      severity: "LOW",
      owner: "buggy",
      state: "CLOSED",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, openBug.id);
    await deleteBugIfExists(request, closedBug.id);
  });

  test("should default to the Open filter and show only open bugs", async ({
    boardPage,
  }) => {
    // Assert: the Open filter is visually selected and scoped correctly. [13-AC3]
    await expect(boardPage.openFilterButton).toHaveClass(/bg-primary/);
    await expect(boardPage.rowByTitle(openBug.title)).toBeVisible();
    await expect(boardPage.rowByTitle(closedBug.title)).toBeHidden();
  });

  test("should show only closed bugs when the Closed filter is selected", async ({
    boardPage,
  }) => {
    // Act: click the Closed filter button.
    await boardPage.closedFilterButton.click();

    // Assert: only the closed bug is shown. [13-AC4]
    await expect(boardPage.rowByTitle(closedBug.title)).toBeVisible();
    await expect(boardPage.rowByTitle(openBug.title)).toBeHidden();
  });
});

test.describe("Bug status: sorting scoped to the active filter", () => {
  let firstOpenBug: Bug;
  let secondOpenBug: Bug;
  let closedBug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: two open bugs and a closed bug whose title sorts between them.
    await deleteAllBugs(request);
    const timestamp = new Date().toISOString();
    firstOpenBug = await createBug(request, {
      title: `Bug status sort test A ${timestamp}`,
      description: "Sorting scoped to Open filter scenario (A)",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    closedBug = await createBug(request, {
      title: `Bug status sort test B beta ${timestamp}`,
      description: "Sorting scoped to Open filter scenario (closed)",
      severity: "LOW",
      owner: "buggy",
      state: "CLOSED",
    });
    secondOpenBug = await createBug(request, {
      title: `Bug status sort test C ${timestamp}`,
      description: "Sorting scoped to Open filter scenario (C)",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, firstOpenBug.id);
    await deleteBugIfExists(request, secondOpenBug.id);
    await deleteBugIfExists(request, closedBug.id);
  });

  test("should only sort within the Open filter's bugs", async ({
    boardPage,
  }) => {
    // Act: sort by Title while the Open filter is active.
    await boardPage.titleSortButton.click();

    // Assert: only open bug titles are shown, in ascending order. [13-AC5]
    expect(await boardPage.visibleTitles()).toEqual([
      firstOpenBug.title,
      secondOpenBug.title,
    ]);
  });
});

test.describe("Bug status: search combined with the active filter", () => {
  let matchingOpenBug: Bug;
  let matchingClosedBug: Bug;
  let nonMatchingOpenBug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: an open and closed bug sharing a keyword, plus a non-matching open bug.
    await deleteAllBugs(request);
    const timestamp = new Date().toISOString();
    matchingOpenBug = await createBug(request, {
      title: `Widget crash ${timestamp}`,
      description: "Search and state filter scenario (matching open)",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    matchingClosedBug = await createBug(request, {
      title: `Widget fixed ${timestamp}`,
      description: "Search and state filter scenario (matching closed)",
      severity: "LOW",
      owner: "buggy",
      state: "CLOSED",
    });
    nonMatchingOpenBug = await createBug(request, {
      title: `Other issue ${timestamp}`,
      description: "Search and state filter scenario (non-matching open)",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, matchingOpenBug.id);
    await deleteBugIfExists(request, matchingClosedBug.id);
    await deleteBugIfExists(request, nonMatchingOpenBug.id);
  });

  test("should show only bugs matching both the Open filter and the search keyword", async ({
    boardPage,
  }) => {
    // Act: keep the Open filter selected and search for the shared keyword.
    await boardPage.searchbox.fill("Widget");

    // Assert: only the open bug matching the keyword is shown. [13-AC6]
    await expect(boardPage.rowByTitle(matchingOpenBug.title)).toBeVisible();
    await expect(boardPage.rowByTitle(matchingClosedBug.title)).toBeHidden();
    await expect(boardPage.rowByTitle(nonMatchingOpenBug.title)).toBeHidden();
  });
});

test.describe("Bug status: no bugs matched message", () => {
  let openBug: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: the database contains only Open bugs.
    await deleteAllBugs(request);
    openBug = await createBug(request, {
      title: `Bug status test scenario 5.1 ${new Date().toISOString()}`,
      description: "No bugs matched message scenario",
      severity: "LOW",
      owner: "buggy",
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, openBug.id);
  });

  test("should show a no-bugs-matched message when the Closed filter has no bugs", async ({
    boardPage,
  }) => {
    // Act: select the Closed filter.
    await boardPage.closedFilterButton.click();

    // Assert: the no-bugs-matched message is shown and no rows are visible. [13-AC7]
    await expect(boardPage.noBugsMatchedMessage).toBeVisible();
    await expect(boardPage.rowByTitle(openBug.title)).toBeHidden();
  });
});
