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

test.describe("Board search: text normalization", () => {
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

  test("should match search case-insensitively for an uppercase query", async ({
    boardPage,
  }) => {
    await boardPage.searchbox.fill("LOGIN");

    await expect(boardPage.rowByTitle("Login fails")).toBeVisible();
    await expect(boardPage.rowByTitle("Issue with log-in")).toBeVisible();
    await expect(boardPage.rowByTitle("Payment button disabled")).toBeHidden();
  });

  test("should normalize leading, trailing, and repeated whitespace in the query", async ({
    boardPage,
  }) => {
    await boardPage.searchbox.fill("  login   fails  ");

    await expect(boardPage.rowByTitle("Login fails")).toBeVisible();
    await expect(boardPage.rowByTitle("Issue with log-in")).toBeHidden();
  });

  test("should match a plain query against a hyphenated title", async ({
    boardPage,
  }) => {
    await boardPage.searchbox.fill("login");

    await expect(boardPage.rowByTitle("Login fails")).toBeVisible();
    await expect(boardPage.rowByTitle("Issue with log-in")).toBeVisible();
  });

  test("should match a hyphenated query form against the same titles as the plain form", async ({
    boardPage,
  }) => {
    await boardPage.searchbox.fill(" log-in ");

    await expect(boardPage.rowByTitle("Login fails")).toBeVisible();
    await expect(boardPage.rowByTitle("Issue with log-in")).toBeVisible();
  });
});
