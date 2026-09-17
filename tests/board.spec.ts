import { test, expect } from "@playwright/test";
import { getUser, loginAndOpenBoard } from "./support/auth.js";
import { seedBoardFixtures } from "./support/board-fixtures.js";

const user = getUser("buggy");

test.describe("Board search and state-filter workflows", () => {

  test.beforeEach(async ({ page, request }) => {
    // Arrange: reset backend data to the deterministic fixture set, then authenticate.
    await seedBoardFixtures(request);
    await loginAndOpenBoard(page, user);
  });

  test("shows all seeded Open bugs when the board loads with search blank", async ({
    page,
  }) => {
    // Arrange: board is loaded with the seed fixtures and search left blank (beforeEach).
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    // Act: no further action; observe the default board state.

    // Assert: Open is the default state, search is blank, and every seeded Open bug is shown.
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
  });

  test("filters bugs by title text and excludes nonmatching titles as the query narrows", async ({
    page,
  }) => {
    // Arrange: board loaded with default Open state (beforeEach).
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    // Act: type a partial title query.
    await searchbox.pressSequentially("login");

    // Assert: only titles containing "login" remain visible.
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

    // Act: refine the query further.
    await searchbox.fill("fails");

    // Assert: results narrow to the single matching title.
    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Issue with log-in", { exact: true })
    ).toBeHidden();
  });

  test("matches search case-insensitively and normalizes whitespace", async ({
    page,
  }) => {
    // Arrange: board loaded with default Open state (beforeEach).
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    // Act: enter an uppercase query.
    await searchbox.fill("LOGIN");

    // Assert: matching persists regardless of case.
    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Issue with log-in", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Payment button disabled", { exact: true })
    ).toBeHidden();

    // Act: enter a query with extra internal and surrounding whitespace.
    await searchbox.fill("  login   fails  ");

    // Assert: whitespace is trimmed and collapsed, narrowing the match.
    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Issue with log-in", { exact: true })
    ).toBeHidden();
  });

  test("normalizes punctuation so hyphenated and plain query forms match the same titles", async ({
    page,
  }) => {
    // Arrange: board loaded with default Open state (beforeEach).
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    // Act: enter the plain query form.
    await searchbox.fill("login");

    // Assert: both the plain and hyphenated titles match.
    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Issue with log-in", { exact: true })
    ).toBeVisible();

    // Act: enter the punctuated, whitespace-padded query form.
    await searchbox.fill(" log-in ");

    // Assert: results are unchanged and remain title-based only.
    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Issue with log-in", { exact: true })
    ).toBeVisible();
  });

  test("restricts search to title text and excludes matches found only in description, owner, or severity", async ({
    page,
  }) => {
    // Arrange: board loaded with default Open state (beforeEach); negative-control bugs are already seeded.
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    // Act: search for a term that only appears in a description or owner field.
    await searchbox.fill("login");

    // Assert: only title matches are shown; description/owner matches are excluded.
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

    // Act: search for a term that only appears in severity.
    await searchbox.fill("high");

    // Assert: a HIGH-severity bug whose title doesn't contain the term is excluded.
    await expect(
      bugsTable.getByText("Payment button disabled", { exact: true })
    ).toBeHidden();
  });

  test('shows the "No bugs matched." message when the query matches no titles', async ({
    page,
  }) => {
    // Arrange: board loaded with default Open state and bugs present (beforeEach).
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    // Act: enter a query guaranteed not to match any seeded title.
    await searchbox.fill("zzzz-no-title-match");

    // Assert: no bug rows are shown, and the no-match message (not the no-bugs message) is displayed.
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
    // Arrange: board loaded with default Open state (beforeEach).
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const clearButton = page.getByRole("button", { name: "Clear search" });
    const bugsTable = page.getByRole("table", { name: "Bugs" });

    // Act: enter a search query.
    await searchbox.fill("login");

    // Assert: the board is filtered and the clear control is available.
    await expect(clearButton).toBeEnabled();
    await expect(
      bugsTable.getByText("Search indexing delay", { exact: true })
    ).toBeHidden();

    // Act: click the clear search control.
    await clearButton.click();

    // Assert: the searchbox empties and all seeded Open bugs are restored, with Closed bugs still hidden.
    await expect(searchbox).toHaveValue("");
    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Search indexing delay", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Login fixed", { exact: true })
    ).toBeHidden();
    await expect(page.getByText("No bugs matched.")).toBeHidden();
  });

  test("preserves sort order and the aria-sort indicator while searching", async ({
    page,
  }) => {
    // Arrange: board loaded with default Open state (beforeEach).
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const titleSortButton = page.getByRole("button", { name: "Title" });
    const severitySortButton = page.getByRole("button", { name: "Severity" });
    const titleColumnHeader = page.getByRole("columnheader", {
      name: "Title",
    });
    const severityColumnHeader = page.getByRole("columnheader", {
      name: "Severity",
    });

    // Act: sort by Title ascending.
    await titleSortButton.click();

    // Assert: the Title column header reflects an active ascending sort.
    await expect(titleColumnHeader).toHaveAttribute("aria-sort", "ascending");

    // Act: apply a search query while the Title sort is active.
    await searchbox.fill("login");

    // Assert: the sort indicator remains unchanged by searching.
    await expect(titleColumnHeader).toHaveAttribute("aria-sort", "ascending");

    // Act: switch the active sort column, then broaden the query.
    await severitySortButton.click();
    await searchbox.fill("log");

    // Assert: the newly selected Severity sort indicator persists while the query changes.
    await expect(severityColumnHeader).toHaveAttribute(
      "aria-sort",
      /ascending|descending/
    );
  });

  test("combines Open and Closed state filtering with an active title search", async ({
    page,
  }) => {
    // Arrange: board loaded with default Open state and searchbox blank (beforeEach).
    const searchbox = page.getByRole("search", {
      name: "Search bugs by title",
    });
    const bugsTable = page.getByRole("table", { name: "Bugs" });
    const closedButton = page.getByRole("button", { name: "Closed" });
    const openButton = page.getByRole("button", { name: "Open" });

    // Act: switch to the Closed state filter.
    await closedButton.click();

    // Assert: only Closed bugs are shown.
    await expect(
      bugsTable.getByText("Login fixed", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Archive cleanup", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeHidden();

    // Act: search for "login" while Closed is selected.
    await searchbox.fill("login");

    // Assert: only the Closed match is shown; Open matches remain excluded.
    await expect(
      bugsTable.getByText("Login fixed", { exact: true })
    ).toBeVisible();
    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeHidden();
    await expect(
      bugsTable.getByText("Issue with log-in", { exact: true })
    ).toBeHidden();

    // Act: switch back to Open while keeping the same query.
    await openButton.click();

    // Assert: the query is preserved and reevaluated against the Open state.
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

    // Act: change to a query with no match in the current state, then toggle state again.
    await searchbox.fill("zzzz-no-title-match");
    await closedButton.click();

    // Assert: the no-match message is shown for the newly selected state, not rows from the other state.
    await expect(page.getByText("No bugs matched.")).toBeVisible();
    await expect(
      bugsTable.getByText("Login fixed", { exact: true })
    ).toBeHidden();
    await expect(
      bugsTable.getByText("Login fails", { exact: true })
    ).toBeHidden();
  });
});
