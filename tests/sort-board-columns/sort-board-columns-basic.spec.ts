// spec: specs/test-plans/sort-board-columns.md
// seed: tests/seed.spec.ts
import { test, expect } from "../fixtures/pages.js";
import { getUser } from "../support/auth.js";
import {
  createBug,
  deleteAllBugs,
  deleteBugIfExists,
  type Bug,
  type BugFixture,
} from "../support/board-fixtures.js";

const user = getUser("buggy");

const threeSeverityFixtures: BugFixture[] = [
  {
    title: "Sort columns test HIGH bug",
    description: "Default sort scenario",
    severity: "HIGH",
    owner: "buggy",
    state: "OPEN",
  },
  {
    title: "Sort columns test MID bug",
    description: "Default sort scenario",
    severity: "MID",
    owner: "qa-user",
    state: "OPEN",
  },
  {
    title: "Sort columns test LOW bug",
    description: "Default sort scenario",
    severity: "LOW",
    owner: "login-owner",
    state: "OPEN",
  },
];

test.describe("Sort board columns: default sort", () => {
  let bugs: Bug[];

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: start from an empty board with one bug per severity, then log in.
    await deleteAllBugs(request);
    bugs = [];
    for (const fixture of threeSeverityFixtures) {
      bugs.push(await createBug(request, fixture));
    }
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    for (const bug of bugs) {
      await deleteBugIfExists(request, bug.id);
    }
  });

  test("should load sorted by Severity descending with only that column marked", async ({
    boardPage,
  }) => {
    // Assert: rows are ordered HIGH, MID, LOW. [10-AC1]
    expect(await boardPage.visibleSeverities()).toEqual(["HIGH", "MID", "LOW"]);

    // Assert: only the Severity header carries aria-sort. [10-AC1]
    await expect(boardPage.severityColumnHeader).toHaveAttribute(
      "aria-sort",
      "descending"
    );
    await expect(boardPage.idColumnHeader).not.toHaveAttribute("aria-sort");
    await expect(boardPage.titleColumnHeader).not.toHaveAttribute("aria-sort");
    await expect(boardPage.ownerColumnHeader).not.toHaveAttribute("aria-sort");
  });
});

test.describe("Sort board columns: sorting by a column", () => {
  let bugA: Bug;
  let bugB: Bug;

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: two bugs with distinct titles and owners.
    await deleteAllBugs(request);
    const timestamp = new Date().toISOString();
    bugA = await createBug(request, {
      title: `Alpha sort test ${timestamp}`,
      description: "Sorting by a column scenario (A)",
      severity: "HIGH",
      owner: `Alice-${timestamp}`,
      state: "OPEN",
    });
    bugB = await createBug(request, {
      title: `Zulu sort test ${timestamp}`,
      description: "Sorting by a column scenario (B)",
      severity: "LOW",
      owner: `Zack-${timestamp}`,
      state: "OPEN",
    });
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    await deleteBugIfExists(request, bugA.id);
    await deleteBugIfExists(request, bugB.id);
  });

  test("should sort ascending by Title on first click", async ({
    boardPage,
  }) => {
    // Act: click the Title column header.
    await boardPage.titleSortButton.click();

    // Assert: ascending indicator and order. [10-AC2]
    await expect(boardPage.titleColumnHeader).toHaveAttribute(
      "aria-sort",
      "ascending"
    );
    expect(await boardPage.visibleTitles()).toEqual([bugA.title, bugB.title]);
    await expect(boardPage.idColumnHeader).not.toHaveAttribute("aria-sort");
    await expect(boardPage.severityColumnHeader).not.toHaveAttribute(
      "aria-sort"
    );
    await expect(boardPage.ownerColumnHeader).not.toHaveAttribute("aria-sort");
  });

  test("should toggle to descending on a second Title click", async ({
    boardPage,
  }) => {
    await boardPage.titleSortButton.click();

    // Act: click the Title column header again.
    await boardPage.titleSortButton.click();

    // Assert: descending indicator and order. [10-AC3]
    await expect(boardPage.titleColumnHeader).toHaveAttribute(
      "aria-sort",
      "descending"
    );
    expect(await boardPage.visibleTitles()).toEqual([bugB.title, bugA.title]);
  });

  test("should clear the previous column's indicator when sorting a new column", async ({
    boardPage,
  }) => {
    await boardPage.ownerSortButton.click();
    await expect(boardPage.ownerColumnHeader).toHaveAttribute("aria-sort", /.+/);

    // Act: click the Severity column header.
    await boardPage.severitySortButton.click();

    // Assert: Severity now carries the indicator, Owner no longer does. [10-AC4]
    await expect(boardPage.severityColumnHeader).toHaveAttribute(
      "aria-sort",
      /.+/
    );
    await expect(boardPage.ownerColumnHeader).not.toHaveAttribute("aria-sort");
    expect(await boardPage.visibleSeverities()).toEqual(["LOW", "HIGH"]);
  });

  test("should sort by ID when the ID column header is clicked", async ({
    boardPage,
  }) => {
    // Act: click the ID column header.
    await boardPage.idSortButton.click();

    // Assert: ID header carries aria-sort and rows are ordered by ID. [10-AC7]
    await expect(boardPage.idColumnHeader).toHaveAttribute("aria-sort", /.+/);
    expect(await boardPage.visibleIds()).toEqual([
      String(bugA.id),
      String(bugB.id),
    ]);
  });

  test("should sort by Owner when the Owner column header is clicked", async ({
    boardPage,
  }) => {
    // Act: click the Owner column header.
    await boardPage.ownerSortButton.click();

    // Assert: Owner header carries aria-sort and rows are ordered by owner. [10-AC7]
    await expect(boardPage.ownerColumnHeader).toHaveAttribute("aria-sort", /.+/);
    expect(await boardPage.visibleOwners()).toEqual([bugA.owner, bugB.owner]);
  });
});
