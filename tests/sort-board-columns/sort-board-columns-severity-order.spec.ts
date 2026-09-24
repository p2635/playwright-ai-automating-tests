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
    title: "Sort priority-order test HIGH bug",
    description: "Severity sort order scenario",
    severity: "HIGH",
    owner: "buggy",
    state: "OPEN",
  },
  {
    title: "Sort priority-order test MID bug",
    description: "Severity sort order scenario",
    severity: "MID",
    owner: "buggy",
    state: "OPEN",
  },
  {
    title: "Sort priority-order test LOW bug",
    description: "Severity sort order scenario",
    severity: "LOW",
    owner: "buggy",
    state: "OPEN",
  },
];

test.describe("Sort board columns: Severity sort order", () => {
  let bugs: Bug[];

  test.beforeEach(async ({ loginPage, request }) => {
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

  test("should order LOW, MID, HIGH when sorted ascending", async ({
    boardPage,
  }) => {
    // Act: click the Severity column header once (board defaults to descending, so this sorts ascending).
    await boardPage.severitySortButton.click();

    // Assert: ascending indicator and LOW, MID, HIGH order. [10-AC5]
    await expect(boardPage.severityColumnHeader).toHaveAttribute(
      "aria-sort",
      "ascending"
    );
    expect(await boardPage.visibleSeverities()).toEqual(["LOW", "MID", "HIGH"]);
  });

  test("should order HIGH, MID, LOW when sorted descending", async ({
    boardPage,
  }) => {
    await boardPage.severitySortButton.click();
    await expect(boardPage.severityColumnHeader).toHaveAttribute(
      "aria-sort",
      "ascending"
    );

    // Act: click the Severity column header again.
    await boardPage.severitySortButton.click();

    // Assert: descending indicator and HIGH, MID, LOW order. [10-AC6]
    await expect(boardPage.severityColumnHeader).toHaveAttribute(
      "aria-sort",
      "descending"
    );
    expect(await boardPage.visibleSeverities()).toEqual(["HIGH", "MID", "LOW"]);
  });
});

test.describe("Sort board columns: sort state across reload [PENDING PRODUCT DECISION]", () => {
  let bugs: Bug[];

  test.beforeEach(async ({ loginPage, request }) => {
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

  // Regression test capturing current (undecided) behavior; see
  // specs/product/product-questions.md ("Sort state across page reload").
  // Rewrite if product decides sort should persist across reload.
  test("should reset to the default Severity-descending sort after reload", async ({
    page,
    boardPage,
  }) => {
    await boardPage.titleSortButton.click();
    await expect(boardPage.titleColumnHeader).toHaveAttribute(
      "aria-sort",
      "ascending"
    );

    // Act: reload the page.
    await page.reload();

    // Assert: sort resets to the default Severity descending. [plan-only, pending product decision]
    expect(await boardPage.visibleSeverities()).toEqual(["HIGH", "MID", "LOW"]);
    await expect(boardPage.severityColumnHeader).toHaveAttribute(
      "aria-sort",
      "descending"
    );
    await expect(boardPage.titleColumnHeader).not.toHaveAttribute("aria-sort");
  });
});
