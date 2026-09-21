# Test automation patterns

How Playwright tests in this repo should be structured going forward: the Page Object Model
(POM), implemented via Playwright fixtures. This applies to **new tests** and to **existing
tests when they're refactored** — it is not a mandate to rewrite everything today.

## Why POM

Tests currently interact with locators and page actions directly (e.g. `page.getByRole("table",
{ name: "Bugs" })` inline in the test body, as in
[tests/delete-bug/1.1-edit-modal-shows-delete-button.spec.ts](../../tests/delete-bug/1.1-edit-modal-shows-delete-button.spec.ts)).
As the suite grows, duplicated locators and interaction logic across spec files become expensive
to maintain — a single UI change requires editing every test that touches that element. POM
centralizes locators and actions for a page/component into one class, so tests read as
business-level steps and UI changes are fixed in one place.

## File layout

Page objects live in `tests/pages/`, one file per page or major component:

```
tests/
  pages/
    login.page.ts
    board.page.ts
    edit-bug-dialog.page.ts
    fixtures.ts        # combines page objects into the Playwright `test` fixture
  support/             # existing non-UI helpers (auth, API fixtures) — unchanged
  delete-bug/
  board-search.spec.ts
```

- `support/` is for helpers that aren't page objects (API calls, seeded users, test data) — keep
  using it as-is. `pages/` is specifically for classes that wrap Playwright `Locator`s and page
  interactions.

## Page object conventions

- One class per page or reusable component (e.g. a modal dialog that appears on multiple pages
  gets its own page object).
- Constructor takes the Playwright `Page` and defines locators as readonly properties — resolve
  locators once, don't re-query them inline in methods.
- Methods express user-facing actions and assertions in domain language (`login()`,
  `openBugByTitle()`), not raw Playwright calls. Assertions that are intrinsic to an action (e.g.
  "login navigates to the board") can live in the page object; assertions specific to a test's
  expected outcome stay in the test.
- Name files `*.page.ts`, classes `XyzPage` (e.g. `LoginPage`, `BoardPage`).

Example:

```ts
// tests/pages/login.page.ts
import { expect, type Locator, type Page } from "@playwright/test";
import type { TestUser } from "../support/auth";

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByLabel("Username");
    this.passwordInput = page.getByLabel("Password");
    this.loginButton = page.getByRole("button", { name: "Login" });
  }

  async login(user: TestUser) {
    await this.page.goto("/login");
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.loginButton.click();
    await expect(this.page).toHaveURL(/\/board$/);
  }
}
```

## Fixtures: wiring page objects into tests

Don't instantiate page objects manually in each test. Extend Playwright's `test` via
`test.extend()` in `tests/pages/fixtures.ts` so page objects are injected as test parameters:

```ts
// tests/pages/fixtures.ts
import { test as base } from "@playwright/test";
import { LoginPage } from "./login.page";
import { BoardPage } from "./board.page";

type Pages = {
  loginPage: LoginPage;
  boardPage: BoardPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  boardPage: async ({ page }, use) => {
    await use(new BoardPage(page));
  },
});

export { expect } from "@playwright/test";
```

Spec files import `test`/`expect` from `tests/pages/fixtures.ts` instead of `@playwright/test`,
and receive page objects as fixture parameters:

```ts
import { test, expect } from "../pages/fixtures";
import { getUser } from "../support/auth";

test("edit modal shows a delete button", async ({ loginPage, boardPage }) => {
  await loginPage.login(getUser("buggy"));
  await boardPage.openBugByTitle("Some bug");
  // ...
});
```

Non-UI helpers (`support/auth.ts`, `support/board-fixtures.ts`) stay as plain imported functions
— fixtures are for page objects, not every helper.

## Migration candidates

Existing specs that talk to locators directly and are good candidates to refactor onto this
pattern next time they're touched:

- [tests/board-search.spec.ts](../../tests/board-search.spec.ts) — repeats board table locators
  (`getByRole("table", { name: "Bugs" })`) that a `BoardPage` object would centralize.
- [tests/delete-bug/*.spec.ts](../../tests/delete-bug/) (six files) — each re-derives the "open
  bug via table row" and "Edit bug dialog" locators inline; these map directly onto a `BoardPage`
  and an `EditBugDialogPage` object.
- [tests-vibed/login.spec.ts](../../tests-vibed/login.spec.ts) — duplicates the login flow that
  `support/auth.ts` already wraps for API-driven setup; the UI login path itself should move into
  a `LoginPage`.
- [tests-vibed/bugs.spec.ts](../../tests-vibed/bugs.spec.ts) — same board/bug locators as above.

Don't batch-migrate these in one PR. Refactor a spec onto POM when you're already changing it for
another reason, so the diff stays reviewable and tied to real work.
