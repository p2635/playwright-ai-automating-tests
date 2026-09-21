# BuggyBoard Board Search Test Plan v1

## Application Overview

BuggyBoard is a web-based bug tracker. An authenticated user reaches the board, which defaults to the Open state and displays the bugs in that selected active state. The title bar contains a live search field labeled "Search bugs by title" and a "Clear search" X control. The board exposes an accessible table named "Bugs", Open and Closed state-filter buttons, sortable ID/Severity/Title/Owner column buttons, and the empty-state messages "No bugs matched." and "No bugs.".

This plan covers end-to-end board searching through the UI. Search is title-only, case-insensitive, whitespace-collapsing, and punctuation-normalizing. State filtering is applied with search, and sorting must remain intact while search results are displayed. "All bugs" in this plan means all bugs in the currently selected active state; because the board defaults to Open, the initial all-bugs check means all Open bugs.

## Seed / Fixture Guidance

Use `tests/seed.spec.ts` as the Playwright seed for every workflow. It authenticates as the `buggy` user and verifies navigation to `/board`. Each scenario should start from a fresh or reset data state so scenarios remain independent.

Following the `beforeEach`/`afterEach` pattern used by the delete-bug tests, each scenario's `beforeEach` must first clear the board via the `deleteAllBugs` helper (`tests/support/board-fixtures.ts`), then create the fixture set below individually via `createBug`, matching the `BugFixture` shape over the backend REST API. The matching `afterEach` must delete each created bug via `deleteBugIfExists`, so setup and teardown stay symmetric with the delete-bug tests rather than relying on a bulk seed/reset helper. Include at least these records, with unique IDs and descriptions where shown:

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

## Spec Traceability Legend

Each `expect` below cites one or more codes from this legend in square brackets, e.g. `[11-AC2]`. `[plan-only]` marks an expectation that documents a test-plan decision (fixture design, message-text distinctions) with no directly corresponding acceptance criterion.

| Code | File | Acceptance Criteria / Section |
| ------ | ------ | -------------------------------- |
| 07-AC1 | `specs/features/07-bug-board.md` | Board page displays a bugs table with the correct columns |
| 07-AC2 | `specs/features/07-bug-board.md` | Board page shows all bugs from the database |
| 07-AC3 | `specs/features/07-bug-board.md` | Board page shows an empty table when there are no bugs |
| 10-AC2 | `specs/features/10-sort-board-columns.md` | User can sort by a column by clicking its header |
| 10-AC4 | `specs/features/10-sort-board-columns.md` | Only one column is the active sort at a time |
| 11-AC1 | `specs/features/11-search-board.md` | Board shows all bugs when search field is blank |
| 11-AC2 | `specs/features/11-search-board.md` | Typing in the search field filters bugs by title |
| 11-AC3 | `specs/features/11-search-board.md` | Search matching is case insensitive and normalizes whitespace and punctuation |
| 11-AC4 | `specs/features/11-search-board.md` | Clearing the search with the X control resets the board |
| 11-AC5 | `specs/features/11-search-board.md` | Sorting is preserved when searching |
| 11-AC6 | `specs/features/11-search-board.md` | No results message when search matches no bugs |
| 11-OOS | `specs/features/11-search-board.md` | Out of Scope: search by description, owner, and severity are excluded |
| 13-AC3 | `specs/features/13-bug-status.md` | Board state filter defaults to Open |
| 13-AC4 | `specs/features/13-bug-status.md` | Selecting Closed in the state filter shows only closed bugs |
| 13-AC5 | `specs/features/13-bug-status.md` | Sorting works when a state filter is applied |
| 13-AC6 | `specs/features/13-bug-status.md` | Search and state filter apply together |
| 13-AC7 | `specs/features/13-bug-status.md` | No bugs matched message when selected state has no bugs |

## Test Scenarios

### 1. Board search and state-filter workflows

**Seed:** `tests/seed.spec.ts`

#### 1.1. Shows all visible bugs in the default active state when search is blank

Log in and create the necessary test data for board.md test to be carried out. For more information, see the section "Seed / Fixture Guidance". Then confirm the board defaults to Open and lists every seeded Open bug with no search applied.

**File:** `tests/board/board-search.spec.ts`

**Steps:**

1. Authenticate with the seed and open the board with the search field left blank.
   - expect: The board page is visible. [07-AC1]
   - expect: The `Search bugs by title` searchbox is empty. [11-AC1]
   - expect: The `Open` state filter is selected by default. [13-AC3]
   - expect: The `Bugs` table shows every seeded Open bug, including `Login fails`, `Issue with log-in`, `Search indexing delay`, and `Payment button disabled`. [07-AC2, 13-AC3]
   - expect: The Closed bug `Login fixed` is not shown while Open is active. [13-AC4]
   - expect: The page does not show `No bugs matched.` or `No bugs.`. [11-AC1]
2. Read the visible rows from the `Bugs` table and compare them with the seeded Open fixture set.
   - expect: The table contains all and only the bugs in the selected active Open state. [13-AC3, 13-AC4]
   - expect: The test does not interpret the blank query as including Closed bugs; all bugs means all bugs in the selected state. [13-AC3]

#### 1.2. Filter bugs by title text and exclude nonmatching titles

Type a partial title into the search box and verify the board filters live to matching titles only, then refine the query further and confirm results narrow accordingly.

**File:** `tests/board/board-search.spec.ts`

**Steps:**

1. Focus the `Search bugs by title` searchbox and type `login` one character at a time.
   - expect: Filtering updates while typing without a submit or navigation. [11-AC2]
   - expect: The matching Open rows `Login fails` and `Issue with log-in` are visible. [11-AC2]
   - expect: The Open rows `Search indexing delay` and `Payment button disabled` are not visible because their titles do not contain the query. [11-AC2]
   - expect: The `Bugs` table remains visible and contains no nonmatching bug rows. [11-AC2]
2. Replace the query with `fails`.
   - expect: Only the Open row `Login fails` is visible. [11-AC2]
   - expect: The row `Issue with log-in` is not visible. [11-AC2]

#### 1.3. Matches case-insensitively and normalizes whitespace

Enter a query in mixed case and with extra whitespace to confirm search matching ignores case and collapses whitespace when comparing against titles.

**File:** `tests/board/board-search.spec.ts`

**Steps:**

1. Enter `LOGIN` in the `Search bugs by title` searchbox.
   - expect: The title `Login fails` is visible, demonstrating case-insensitive matching. [11-AC3]
   - expect: The title `Issue with log-in` is also visible when punctuation normalization applies. [11-AC3]
   - expect: Nonmatching Open titles are absent. [11-AC2]
2. Replace the query with extra surrounding and internal whitespace, such as `login   fails`.
   - expect: The query is trimmed and repeated whitespace is collapsed. [11-AC3]
   - expect: The `Login fails` row is visible despite the extra whitespace. [11-AC3]
   - expect: The `Issue with log-in` row is not visible because the normalized query contains the additional word `fails`. [11-AC2, 11-AC3]

#### 1.4. Normalize punctuation so hyphenated and plain terms match the same titles

Enter queries with and without punctuation to confirm the search normalizes punctuation so that hyphenated and plain forms of the same term match the same titles.

**File:** `tests/board/board-search.spec.ts`

**Steps:**

1. Enter `login` in the `Search bugs by title` searchbox with Open selected.
   - expect: The row titled `Login fails` is visible. [11-AC3]
   - expect: The row titled `Issue with log-in` is visible because `log-in` normalizes to a title-searchable form matching `login`. [11-AC3]
   - expect: The result contains only titles whose normalized text includes the normalized query. [11-AC3]
2. Replace the query with punctuation and whitespace around the term, such as `log-in`.
   - expect: Punctuation and surrounding whitespace are normalized for the query. [11-AC3]
   - expect: Both `Login fails` and `Issue with log-in` remain visible. [11-AC3]
   - expect: The result is still title-based and does not broaden to description, owner, or severity fields. [11-OOS]

#### 1.5. Restrict search to title text only, excluding matches in description, owner, or severity

Search for terms that only appear in a bug's description, owner, or severity fields and confirm those bugs are excluded because search is title-only.

**File:** `tests/board/board-search.spec.ts`

**Steps:**

1. Ensure the fixture includes `Search indexing delay` with `login` only in its description, `Payment button disabled` with `login` only in its owner, and `Payment button disabled` with severity `HIGH` while its title contains neither `login` nor `high`.
   - expect: The fixture provides separate negative controls where the query term appears outside the title. [plan-only]
   - expect: The negative-control titles themselves do not contain `login` or `high`. [plan-only]
2. Enter `login` in the `Search bugs by title` searchbox.
   - expect: `Login fails` and `Issue with log-in` are visible because their titles match. [11-AC2]
   - expect: `Search indexing delay` is not visible even though its description contains `login`. [11-OOS]
   - expect: `Payment button disabled` is not visible solely because its owner contains `login`. [11-OOS]
   - expect: No row is included based only on description or owner. [11-OOS]
3. Replace the query with `high`.
   - expect: `Payment button disabled` is not visible even though its severity is HIGH. [11-OOS]
   - expect: No row is included based only on severity. [11-OOS]
   - expect: The result is determined by title text only. [11-OOS]

#### 1.6. Show the "No bugs matched." message when no titles match the query

Enter a query that matches no titles while bugs still exist and confirm the board shows the `No bugs matched.` empty-state message rather than any bug rows.

**File:** `tests/board/board-search.spec.ts`

**Steps:**

1. With bugs present in the selected Open state, enter a unique query such as `zzzz-no-title-match` in the `Search bugs by title` searchbox.
   - expect: The visible table body contains no bug rows. [11-AC6]
   - expect: The board displays the exact message `No bugs matched.`. [11-AC6]
   - expect: The board does not display `No bugs.`. [plan-only]
   - expect: The `Bugs` table headers remain available unless the implementation intentionally replaces the table; no bug data row is present. [07-AC3]

#### 1.7. Clears search with the X control and restores the active-state board

Enter a search query, then click the `Clear search` control and confirm the searchbox empties and the full set of bugs for the active state is restored.

**File:** `tests/board/board-search.spec.ts`

**Steps:**

1. Enter `login` in the `Search bugs by title` searchbox.
   - expect: The searchbox contains `login`. [11-AC2]
   - expect: The `Clear search` control is visible and enabled. [11-AC4]
   - expect: The board is filtered to matching Open titles. [11-AC2]
2. Click the `Clear search` control.
   - expect: The searchbox value is blank. [11-AC4]
   - expect: The Open board is restored and all seeded Open bug rows are visible. [11-AC4, 13-AC3]
   - expect: The Closed rows remain hidden because Open is still selected. [13-AC4]
   - expect: The page does not show `No bugs matched.`. [11-AC4]

#### 1.8. Preserves sort order and sort indicator while searching

Sort the table by a column, then apply and change search queries, and confirm the sort order and `aria-sort` indicator remain intact throughout.

**File:** `tests/board/board-search.spec.ts`

**Steps:**

1. Click the `Title` column button until the `Title` column has the intended ascending order, and record the visible order of the seeded rows.
   - expect: The matching column header exposes `aria-sort="ascending"`. [10-AC2]
   - expect: The visible rows are ordered by title ascending. [10-AC2]
   - expect: The ascending sort indicator remains associated with the Title header. [10-AC2]
2. Enter `login` in the `Search bugs by title` searchbox.
   - expect: Only the matching Open rows are visible. [11-AC2]
   - expect: The matching rows remain in the same title-ascending order as the filtered subset. [11-AC5]
   - expect: The Title header still exposes `aria-sort="ascending"` and its sort indicator is unchanged. [11-AC5]
   - expect: Typing the search does not reset the selected sort column or direction. [11-AC5]
3. Click the `Severity` column button to establish a different sort, then enter a query that matches multiple rows.
   - expect: The filtered rows follow the selected Severity sort order. [11-AC5, 13-AC5]
   - expect: The Severity header retains its active `aria-sort` direction and indicator while the query changes. [10-AC4, 11-AC5]

#### 1.9. Combines Open and Closed state filtering with title search

Switch between the Open and Closed state filters while a search query is active and confirm results always reflect the intersection of the selected state and the title query.

**File:** `tests/board/board-search.spec.ts`

**Steps:**

1. With the searchbox blank, click the `Closed` state button.
   - expect: The Closed state is selected. [13-AC4]
   - expect: Only Closed rows such as `Login fixed` and `Archive cleanup` are visible. [13-AC4]
   - expect: Open rows are not visible. [13-AC4]
2. Enter `login` in the `Search bugs by title` searchbox while Closed is selected.
   - expect: Only Closed bugs whose titles match `login` are visible, such as `Login fixed`. [13-AC6]
   - expect: Open matches such as `Login fails` and `Issue with log-in` are not visible. [13-AC4, 13-AC6]
   - expect: The result is the intersection of the selected state and normalized title query. [13-AC6]
3. Click the `Open` state button while keeping `login` in the searchbox.
   - expect: Open is selected. [13-AC3]
   - expect: Open matching rows such as `Login fails` and `Issue with log-in` are visible. [13-AC6]
   - expect: The Closed row `Login fixed` is not visible. [13-AC4]
   - expect: The search query is preserved when the state changes. [13-AC6]
4. Change the query to a term with no matching title in the selected state, then switch between Open and Closed.
   - expect: When the query has no match in the selected state, `No bugs matched.` is shown and there are no bug rows. [13-AC7]
   - expect: Changing the state reevaluates the same query against the newly selected state. [13-AC6]
   - expect: A state that has no matching title still shows `No bugs matched.` rather than rows from the other state. [13-AC7]
