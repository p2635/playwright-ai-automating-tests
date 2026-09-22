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

const boardFixtures: BugFixture[] = [
  {
    title: "Login fails",
    description: "Authentication timeout",
    severity: "HIGH",
    owner: "buggy",
    state: "OPEN",
  },
  {
    title: "Issue with log-in",
    description: "Login form validation",
    severity: "MID",
    owner: "qa-user",
    state: "OPEN",
  },
  {
    title: "Search indexing delay",
    description: "The login owner cannot find results",
    severity: "LOW",
    owner: "qa-user",
    state: "OPEN",
  },
  {
    title: "Payment button disabled",
    description: "Payment cannot be submitted",
    severity: "HIGH",
    owner: "login-owner",
    state: "OPEN",
  },
  {
    title: "Login fixed",
    description: "Closed authentication issue",
    severity: "LOW",
    owner: "qa-user",
    state: "CLOSED",
  },
  {
    title: "Archive cleanup",
    description: "Old records",
    severity: "HIGH",
    owner: "buggy",
    state: "CLOSED",
  },
];

test.describe("Board search: UI controls and state-filter combination", () => {
  let bugs: Bug[];

  test.beforeEach(async ({ loginPage, request }) => {
    // Arrange: start from an empty board, then create the isolated fixture set for this scenario.
    await deleteAllBugs(request);
    bugs = [];
    for (const fixture of boardFixtures) {
      bugs.push(await createBug(request, fixture));
    }
    await loginPage.login(user);
  });

  test.afterEach(async ({ request }) => {
    for (const bug of bugs) {
      await deleteBugIfExists(request, bug.id);
    }
  });

  test("should clear the search with the X control and restore the active-state board", async ({
    boardPage,
  }) => {
    await boardPage.searchbox.fill("login");

    await expect(boardPage.clearSearchButton).toBeEnabled();
    await expect(boardPage.rowByTitle("Search indexing delay")).toBeHidden();

    await boardPage.clearSearchButton.click();

    await expect(boardPage.searchbox).toHaveValue("");
    await expect(boardPage.rowByTitle("Login fails")).toBeVisible();
    await expect(boardPage.rowByTitle("Issue with log-in")).toBeVisible();
    await expect(boardPage.rowByTitle("Search indexing delay")).toBeVisible();
    await expect(boardPage.rowByTitle("Payment button disabled")).toBeVisible();
    await expect(boardPage.rowByTitle("Login fixed")).toBeHidden();
    await expect(boardPage.noBugsMatchedMessage).toBeHidden();
  });

  test("should preserve sort order and the aria-sort indicator while searching", async ({
    boardPage,
  }) => {
    await boardPage.titleSortButton.click();

    await expect(boardPage.titleColumnHeader).toHaveAttribute(
      "aria-sort",
      "ascending"
    );
    expect(await boardPage.visibleTitles()).toEqual([
      "Issue with log-in",
      "Login fails",
      "Payment button disabled",
      "Search indexing delay",
    ]);

    await boardPage.searchbox.fill("login");

    await expect(boardPage.titleColumnHeader).toHaveAttribute(
      "aria-sort",
      "ascending"
    );
    expect(await boardPage.visibleTitles()).toEqual([
      "Issue with log-in",
      "Login fails",
    ]);

    await boardPage.severitySortButton.click();
    await boardPage.searchbox.fill("log");

    await expect(boardPage.severityColumnHeader).toHaveAttribute(
      "aria-sort",
      /ascending|descending/
    );
    // A fresh column click always starts ascending: LOW(0) < MID(1) < HIGH(2).
    // "log" matches Open titles "Issue with log-in" (MID) and "Login fails" (HIGH).
    expect(await boardPage.visibleSeverities()).toEqual(["MID", "HIGH"]);
  });

  test("should combine Open and Closed state filtering with an active title search", async ({
    boardPage,
  }) => {
    await boardPage.closedFilterButton.click();

    await expect(boardPage.rowByTitle("Login fixed")).toBeVisible();
    await expect(boardPage.rowByTitle("Archive cleanup")).toBeVisible();
    await expect(boardPage.rowByTitle("Login fails")).toBeHidden();

    await boardPage.searchbox.fill("login");

    await expect(boardPage.rowByTitle("Login fixed")).toBeVisible();
    await expect(boardPage.rowByTitle("Login fails")).toBeHidden();
    await expect(boardPage.rowByTitle("Issue with log-in")).toBeHidden();

    await boardPage.openFilterButton.click();

    await expect(boardPage.searchbox).toHaveValue("login");
    await expect(boardPage.rowByTitle("Login fails")).toBeVisible();
    await expect(boardPage.rowByTitle("Issue with log-in")).toBeVisible();
    await expect(boardPage.rowByTitle("Login fixed")).toBeHidden();

    await boardPage.searchbox.fill("zzzz-no-title-match");
    await boardPage.closedFilterButton.click();

    await expect(boardPage.noBugsMatchedMessage).toBeVisible();
    await expect(boardPage.rowByTitle("Login fixed")).toBeHidden();
    await expect(boardPage.rowByTitle("Login fails")).toBeHidden();
  });
});
