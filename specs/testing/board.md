# BuggyBoard Board Search Test Plan

## Application Overview

BuggyBoard is a web-based bug tracker. An authenticated user reaches the board, which defaults to the Open state and displays the bugs in that selected active state. The title bar contains a live search field labeled "Search bugs by title" and a "Clear search" X control. The board exposes an accessible table named "Bugs", Open and Closed state-filter buttons, sortable ID/Severity/Title/Owner column buttons, and the empty-state messages "No bugs matched." and "No bugs.".

This plan covers end-to-end board searching through the UI. Search is title-only, case-insensitive, whitespace-collapsing, and punctuation-normalizing. State filtering is applied with search, and sorting must remain intact while search results are displayed. "All bugs" in this plan means all bugs in the currently selected active state; because the board defaults to Open, the initial all-bugs check means all Open bugs.

## Seed / Fixture Guidance

Use `tests/seed.spec.ts` as the Playwright seed for every workflow. It authenticates as the `buggy` user and verifies navigation to `/board`. Each scenario should start from a fresh or reset data state so scenarios remain independent.

Prepare deterministic bugs through the supported fixture/setup mechanism before visiting the board. Include at least these records, with unique IDs and descriptions where shown:

- Open: title `Login fails`, description `Authentication timeout`, severity `HIGH`, owner `buggy`.
- Open: title `Issue with log-in`, description `Login form validation`, severity `MID`, owner `qa-user`.
- Open: title `Search indexing delay`, description `The login owner cannot find results`, severity `LOW`, owner `qa-user`.
- Open: title `Payment button disabled`, description `Payment cannot be submitted`, severity `HIGH`, owner `login-owner`.
- Closed: title `Login fixed`, description `Closed authentication issue`, severity `LOW`, owner `qa-user`.
- Closed: title `Archive cleanup`, description `Old records`, severity `HIGH`, owner `buggy`.

The exact records may be created using the repository's established fixture strategy, but every scenario must know the expected titles, states, sort order, and IDs it asserts. Keep at least one Open and one Closed bug available for combined-filter checks. The two Open negative controls deliberately place `login` only in a description or owner, and `Payment button disabled` is a HIGH-severity negative control for a `high` query. For a true no-row state, use a query that matches no title while bugs still exist; this must produce `No bugs matched.`. `No bugs.` is reserved for a selected state with no bugs at all and should not be confused with a search miss.

## Locator Guidance

Prefer accessible Playwright locators: `getByRole('searchbox', { name: 'Search bugs by title' })`, `getByRole('button', { name: 'Clear search' })`, `getByRole('button', { name: 'Open' })`, `getByRole('button', { name: 'Closed' })`, `getByRole('table', { name: 'Bugs' })`, table rows, and column-header buttons named `ID`, `Severity`, `Title`, and `Owner`. Scope title and owner assertions to the `Bugs` table. Use row or cell text for bug identity, and use `aria-sort` on the relevant column header to verify the sort indicator rather than relying only on decorative arrow text.

## Verification Commands

- `npm test`
- `npx playwright test --grep-invert @seed`
- `npm run lint`

The plan is documentation only. It does not create automated test files.

## Test Scenarios

### 1. Board search and state-filter workflows

**Seed:** `tests/seed.spec.ts`

#### 1.1. Shows all visible bugs in the default active state when search is blank

**File:** `tests/board/board-search.spec.ts`

**Steps:**

  1. Authenticate with the seed and open the board with the search field left blank.
    - expect: The board page is visible.
    - expect: The `Search bugs by title` searchbox is empty.
    - expect: The `Open` state filter is selected by default.
    - expect: The `Bugs` table shows every seeded Open bug, including `Login fails`, `Issue with log-in`, `Search indexing delay`, and `Payment button disabled`.
    - expect: The Closed bug `Login fixed` is not shown while Open is active.
    - expect: The page does not show `No bugs matched.` or `No bugs.`.
  2. Read the visible rows from the `Bugs` table and compare them with the seeded Open fixture set.
    - expect: The table contains all and only the bugs in the selected active Open state.
    - expect: The test does not interpret the blank query as including Closed bugs; all bugs means all bugs in the selected state.

#### 1.2. Filters live by title text and excludes nonmatching titles

**File:** `tests/board/board-search.spec.ts`

**Steps:**

  1. Focus the `Search bugs by title` searchbox and type `login` one character at a time.
    - expect: Filtering updates while typing without a submit or navigation.
    - expect: The matching Open rows `Login fails` and `Issue with log-in` are visible.
    - expect: The Open rows `Search indexing delay` and `Payment button disabled` are not visible because their titles do not contain the query.
    - expect: The `Bugs` table remains visible and contains no nonmatching bug rows.
  2. Replace the query with `fails`.
    - expect: Only the Open row `Login fails` is visible.
    - expect: The row `Issue with log-in` is not visible.

#### 1.3. Matches case-insensitively and normalizes whitespace

**File:** `tests/board/board-search.spec.ts`

**Steps:**

  1. Enter `LOGIN` in the `Search bugs by title` searchbox.
    - expect: The title `Login fails` is visible, demonstrating case-insensitive matching.
    - expect: The title `Issue with log-in` is also visible when punctuation normalization applies.
    - expect: Nonmatching Open titles are absent.
  2. Replace the query with extra surrounding and internal whitespace, such as `login   fails`.
    - expect: The query is trimmed and repeated whitespace is collapsed.
    - expect: The `Login fails` row is visible despite the extra whitespace.
    - expect: The `Issue with log-in` row is not visible because the normalized query contains the additional word `fails`.

#### 1.4. Normalizes punctuation for the login examples

**File:** `tests/board/board-search.spec.ts`

**Steps:**

  1. Enter `login` in the `Search bugs by title` searchbox with Open selected.
    - expect: The row titled `Login fails` is visible.
    - expect: The row titled `Issue with log-in` is visible because `log-in` normalizes to a title-searchable form matching `login`.
    - expect: The result contains only titles whose normalized text includes the normalized query.
  2. Replace the query with punctuation and whitespace around the term, such as `log-in`.
    - expect: Punctuation and surrounding whitespace are normalized for the query.
    - expect: Both `Login fails` and `Issue with log-in` remain visible.
    - expect: The result is still title-based and does not broaden to description, owner, or severity fields.

#### 1.5. Keeps search scope to title, excluding description owner and severity matches

**File:** `tests/board/board-search.spec.ts`

**Steps:**

  1. Ensure the fixture includes `Search indexing delay` with `login` only in its description, `Payment button disabled` with `login` only in its owner, and `Payment button disabled` with severity `HIGH` while its title contains neither `login` nor `high`.
    - expect: The fixture provides separate negative controls where the query term appears outside the title.
    - expect: The negative-control titles themselves do not contain `login` or `high`.
  2. Enter `login` in the `Search bugs by title` searchbox.
    - expect: `Login fails` and `Issue with log-in` are visible because their titles match.
    - expect: `Search indexing delay` is not visible even though its description contains `login`.
    - expect: `Payment button disabled` is not visible solely because its owner contains `login`.
    - expect: No row is included based only on description or owner.
  3. Replace the query with `high`.
    - expect: `Payment button disabled` is not visible even though its severity is HIGH.
    - expect: No row is included based only on severity.
    - expect: The result is determined by title text only.

#### 1.6. Displays the no-match empty state with no bug rows

**File:** `tests/board/board-search.spec.ts`

**Steps:**

  1. With bugs present in the selected Open state, enter a unique query such as `zzzz-no-title-match` in the `Search bugs by title` searchbox.
    - expect: The visible table body contains no bug rows.
    - expect: The board displays the exact message `No bugs matched.`.
    - expect: The board does not display `No bugs.`.
    - expect: The `Bugs` table headers remain available unless the implementation intentionally replaces the table; no bug data row is present.

#### 1.7. Clears search with the X control and restores the active-state board

**File:** `tests/board/board-search.spec.ts`

**Steps:**

  1. Enter `login` in the `Search bugs by title` searchbox.
    - expect: The searchbox contains `login`.
    - expect: The `Clear search` control is visible and enabled.
    - expect: The board is filtered to matching Open titles.
  2. Click the `Clear search` control.
    - expect: The searchbox value is blank.
    - expect: The Open board is restored and all seeded Open bug rows are visible.
    - expect: The Closed rows remain hidden because Open is still selected.
    - expect: The page does not show `No bugs matched.`.

#### 1.8. Preserves sort order and sort indicator while searching

**File:** `tests/board/board-search.spec.ts`

**Steps:**

  1. Click the `Title` column button until the `Title` column has the intended ascending order, and record the visible order of the seeded rows.
    - expect: The matching column header exposes `aria-sort="ascending"`.
    - expect: The visible rows are ordered by title ascending.
    - expect: The ascending sort indicator remains associated with the Title header.
  2. Enter `login` in the `Search bugs by title` searchbox.
    - expect: Only the matching Open rows are visible.
    - expect: The matching rows remain in the same title-ascending order as the filtered subset.
    - expect: The Title header still exposes `aria-sort="ascending"` and its sort indicator is unchanged.
    - expect: Typing the search does not reset the selected sort column or direction.
  3. Click the `Severity` column button to establish a different sort, then enter a query that matches multiple rows.
    - expect: The filtered rows follow the selected Severity sort order.
    - expect: The Severity header retains its active `aria-sort` direction and indicator while the query changes.

#### 1.9. Combines Open and Closed state filtering with title search

**File:** `tests/board/board-search.spec.ts`

**Steps:**

  1. With the searchbox blank, click the `Closed` state button.
    - expect: The Closed state is selected.
    - expect: Only Closed rows such as `Login fixed` and `Archive cleanup` are visible.
    - expect: Open rows are not visible.
  2. Enter `login` in the `Search bugs by title` searchbox while Closed is selected.
    - expect: Only Closed bugs whose titles match `login` are visible, such as `Login fixed`.
    - expect: Open matches such as `Login fails` and `Issue with log-in` are not visible.
    - expect: The result is the intersection of the selected state and normalized title query.
  3. Click the `Open` state button while keeping `login` in the searchbox.
    - expect: Open is selected.
    - expect: Open matching rows such as `Login fails` and `Issue with log-in` are visible.
    - expect: The Closed row `Login fixed` is not visible.
    - expect: The search query is preserved when the state changes.
  4. Change the query to a term with no matching title in the selected state, then switch between Open and Closed.
    - expect: When the query has no match in the selected state, `No bugs matched.` is shown and there are no bug rows.
    - expect: Changing the state reevaluates the same query against the newly selected state.
    - expect: A state that has no matching title still shows `No bugs matched.` rather than rows from the other state.
