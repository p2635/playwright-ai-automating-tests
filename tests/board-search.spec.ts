import { test, expect, type Locator } from "@playwright/test";
import { getUser, loginAndOpenBoard } from "./support/auth.js";
import { seedBoardFixtures } from "./support/board-fixtures.js";

const user = getUser("buggy");

function visibleTitles(bugsTable: Locator) {
  return bugsTable.locator("tbody tr td:nth-child(3)").allInnerTexts();
}

function visibleSeverities(bugsTable: Locator) {
  return bugsTable.locator("tbody tr td:nth-child(2)").allInnerTexts();
}

test.describe("Board search and state-filter workflows", () => {
  test.beforeEach(async ({ page, request }) => {
    await seedBoardFixtures(request);
    await loginAndOpenBoard(page, user);
  });

  test("shows all seeded Open bugs when the board loads with search blank", async ({
    page,
  }) => {
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    await expect(searchbox).toHaveValue("");
    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Issue with log-in", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Search indexing delay", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Payment button disabled", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Login fixed", { exact: true })
    ).toBeHidden();
    await expect(page.getByText("No bugs matched.")).toBeHidden();
    await expect(page.getByText("No bugs.")).toBeHidden();

    const titles = await visibleTitles(bugsTable);
    expect(titles.sort()).toEqual(
      [
        "Login fails",
        "Issue with log-in",
        "Search indexing delay",
        "Payment button disabled",
      ].sort()
    );
  });

  test("filters bugs by title text for a partial match on 'login'", async ({
    page,
  }) => {
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    await searchbox.pressSequentially("login");

    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Issue with log-in", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Search indexing delay", { exact: true })
    ).toBeHidden();
    await expect(
      bugsTable.getByText("Payment button disabled", { exact: true })
    ).toBeHidden();
  });

  test("narrows results further as the query changes to 'fails'", async ({
    page,
  }) => {
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    await searchbox.fill("fails");

    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Issue with log-in", { exact: true })
    ).toBeHidden();
  });

  test("matches search case-insensitively for an uppercase query", async ({
    page,
  }) => {
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    await searchbox.fill("LOGIN");

    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Issue with log-in", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Payment button disabled", { exact: true })
    ).toBeHidden();
  });

  test("normalizes leading, trailing, and repeated whitespace in the query", async ({
    page,
  }) => {
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    await searchbox.fill("  login   fails  ");

    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Issue with log-in", { exact: true })
    ).toBeHidden();
  });

  test("matches a plain query against a hyphenated title", async ({
    page,
  }) => {
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    await searchbox.fill("login");

    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Issue with log-in", { exact: true })
    ).toBeVisible();
  });

  test("matches a hyphenated query form against the same titles as the plain form", async ({
    page,
  }) => {
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    await searchbox.fill(" log-in ");

    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Issue with log-in", { exact: true })
    ).toBeVisible();
  });

  test("restricts search to title text and excludes titles absent from the query", async ({
    page,
  }) => {
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    await searchbox.fill("login");

    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Issue with log-in", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Search indexing delay", { exact: true })
    ).toBeHidden();
    await expect(
      bugsTable.getByText("Payment button disabled", { exact: true })
    ).toBeHidden();
  });

  test("excludes matches found only in description, owner, or severity rather than the title", async ({
    page,
  }) => {
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    await searchbox.fill("high");

    await expect(
      bugsTable.getByText("Payment button disabled", { exact: true })
    ).toBeHidden();
  });

  test('shows the "No bugs matched." message when the query matches no titles', async ({
    page,
  }) => {
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    await searchbox.fill("zzzz-no-title-match");

    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeHidden();
    await expect(
      bugsTable.getByText("Payment button disabled", { exact: true })
    ).toBeHidden();
    await expect(page.getByText("No bugs matched.")).toBeVisible();
    await expect(page.getByText("No bugs.", { exact: true })).toBeHidden();
  });

  test("clears the search with the X control and restores the active-state board", async ({
    page,
  }) => {
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const clearButton = page.getByRole("button", { name: "Clear search" });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    await searchbox.fill("login");

    await expect(clearButton).toBeEnabled();
    await expect(
      bugsTable.getByText("Search indexing delay", { exact: true })
    ).toBeHidden();

    await clearButton.click();

    await expect(searchbox).toHaveValue("");
    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Issue with log-in", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Search indexing delay", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Payment button disabled", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Login fixed", { exact: true })
    ).toBeHidden();
    await expect(page.getByText("No bugs matched.")).toBeHidden();
  });

  test("preserves sort order and the aria-sort indicator while searching", async ({
    page,
  }) => {
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });
    const titleSortButton = page.getByRole("button", { name: "Title" });
    const severitySortButton = page.getByRole("button", { name: "Severity" });
    const titleColumnHeader = page.getByRole("columnheader", {
      name: "Title",
    });
    const severityColumnHeader = page.getByRole("columnheader", {
      name: "Severity",
    });

    await titleSortButton.click();

    await expect(titleColumnHeader).toHaveAttribute("aria-sort", "ascending");
    expect(await visibleTitles(bugsTable)).toEqual([
      "Issue with log-in",
      "Login fails",
      "Payment button disabled",
      "Search indexing delay",
    ]);

    await searchbox.fill("login");

    await expect(titleColumnHeader).toHaveAttribute("aria-sort", "ascending");
    expect(await visibleTitles(bugsTable)).toEqual([
      "Issue with log-in",
      "Login fails",
    ]);

    await severitySortButton.click();
    await searchbox.fill("log");

    await expect(severityColumnHeader).toHaveAttribute(
      "aria-sort",
      /ascending|descending/
    );
    // A fresh column click always starts ascending: LOW(0) < MID(1) < HIGH(2).
    // "log" matches Open titles "Issue with log-in" (MID) and "Login fails" (HIGH).
    expect(await visibleSeverities(bugsTable)).toEqual(["MID", "HIGH"]);
  });

  test("combines Open and Closed state filtering with an active title search", async ({
    page,
  }) => {
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });
    const closedButton = page.getByRole("button", { name: "Closed" });
    const openButton = page.getByRole("button", { name: "Open" });

    await closedButton.click();

    await expect(
      bugsTable.getByText("Login fixed", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Archive cleanup", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeHidden();

    await searchbox.fill("login");

    await expect(
      bugsTable.getByText("Login fixed", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeHidden();
    await expect(
      bugsTable.getByText("Issue with log-in", { exact: true })
    ).toBeHidden();

    await openButton.click();

    await expect(searchbox).toHaveValue("login");
    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Issue with log-in", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Login fixed", { exact: true })
    ).toBeHidden();

    await searchbox.fill("zzzz-no-title-match");
    await closedButton.click();

    await expect(page.getByText("No bugs matched.")).toBeVisible();
    await expect(
      bugsTable.getByText("Login fixed", { exact: true })
    ).toBeHidden();
    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeHidden();
  });
});
