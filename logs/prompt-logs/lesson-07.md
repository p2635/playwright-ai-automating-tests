# Prompt Logs for Lesson 4 - Expanding Test Coverage

## Session: Generating and reviewing new BuggyBoard test plans

**Summary:** Explored the BuggyBoard app and specs to find untested features (Edit Bug, Bug Status, Sort Board Columns, Board Severity), then wrote four new test plans under `specs/test-plans/` following the existing plan format and the `.agents/skills/playwright-cli` Plan workflow — no `.spec.ts` files were generated, per the request to pause for review. The plans were then refined through an adversarial self-review (vagueness, low-value tests, duplicates, missing coverage) and follow-up user feedback, resulting in a new `specs/product/product-questions.md` doc, added "Testability" sections, deduplicated sort scenarios, and several newly added edge-case scenarios (state round-trip, reload persistence, a pending-product-decision regression test).

> **User:** I want you to explore the BuggyBoard app for any areas where we have no test coverage. Please use the playwright CLI with skills (do not use Playwright MCP) as outlined in `.agents/skills/playwright-cli`. The end result should be newly-generated test plans within specs/test-plans. Do not create any actual spec files at this point, because I need the review the new test plans.
>
> **Assistant (plan mode):** Launched two parallel Explore agents — one to read the constitution, product vision, tech stack, coding standards, development process, `PROGRESS.md`, all `specs/features/*.md` summaries, and the `.agents/skills/playwright-cli` skill's exact Plan → Generate → Heal workflow; the other to map every existing Playwright spec file under `tests/` against the app's actual routes/components (`BoardPage`, `EditBugModal`, `CreateBugModal`, `TitleBar`, backend API) to find coverage gaps.
>
> Findings: all 13 features were implementation-complete per `PROGRESS.md`, but only Login, Delete Bug, and Search Bug had official test coverage (plus an existing but not-yet-implemented `create-bug.md` test plan). Identified four real gaps: Edit Bug (09), Bug Status open/closed (13), Sort Board Columns (10), and Board Severity color-coding (08). Read the four feature specs in full, the existing `create-bug.md` and `template-test-plan.md` to match format/conventions exactly, and the real source (`EditBugModal.tsx`, `BoardPage.tsx`) plus existing Page Object Models and fixtures (`tests/pages/*.page.ts`, `tests/support/board-fixtures.ts`) to ground locator/class-name guidance in actual code rather than guesses — this let me skip a live `playwright-cli` browser exploration session since the POMs and fixtures already gave verified ground truth.
>
> Wrote a plan file (context, approach, and the four new test-plan files to create) and called `ExitPlanMode`. User approved.
>
> Wrote four new test plans, each following the constitution's required plan structure (Feature Overview → Test Scenarios with Preconditions/Steps/Expected Results tagged with spec-traceability codes → Out of Scope → Technical Information with Seed/Fixture Guidance, Locator Guidance, Spec Traceability Legend):
> - `specs/test-plans/edit-bug.md`
> - `specs/test-plans/sort-board-columns.md`
> - `specs/test-plans/bug-status.md`
> - `specs/test-plans/board-severity.md`
>
> Confirmed via `git status` that only these four files were created and nothing was added under `tests/`.

> **User (Haiku session, IDE selection on `edit-bug.md`):** How is this point something you can assert? It seems vague — flagging the line "No request is made to persist the change while Save remains disabled. [plan-only]".
>
> **Assistant:** Agreed it was unassertable without spying on network calls (an implementation detail, not user-visible behavior), and offered to remove it or reframe it as an observable UI outcome.

> **User (back on Sonnet):** This test plan only has a happy path for editing the unique title, but doesn't have tests for other fields. Can you add them in?
>
> **Assistant:** Re-read the current `edit-bug.md`, added dedicated save scenarios for Severity, Owner, and Description (mirroring the existing Title scenario), renumbered the trailing scenarios accordingly, and removed the vague "no request made" assertion flagged earlier as part of the same edit pass.

> **User:** * Test 2.1's name should be specifically for sorting the Title column header. Same for 2.2. * Test 4.1 appears to be testing for multiple sorts and can be split into individual tests...
>
> **Assistant:** Re-read `sort-board-columns.md`, renamed 2.1/2.2 to explicitly say "Title column header", and split the composite 4.1 (which chained ID → Severity → Title → Owner clicks in one scenario) into four independent single-column scenarios (4.1 ID, 4.2 Severity, 4.3 Title, 4.4 Owner) — noting that the "previous column's indicator clears" behavior stayed solely in scenario 2.3 to avoid duplicating that assertion.

> **User:** As a testing expert, please review the newly generated test plans from an adversarial perspective. 1. What tests are unclear or too vague to implement? 2. Are there any tests that do not have a clear benefit to the end user? 3. Is each test unique?... 4. What else could be missing from the test plans?
>
> **Assistant:** Re-read all four full test plan files fresh. Reasoned through each question systematically:
> - **Vagueness:** `bug-status.md` 3.1's "visually selected (active styling)" has no accessible attribute to assert against (checked `BoardPage.tsx` — filter buttons use only a conditional CSS class, no `aria-pressed`); `edit-bug.md` 3.4's "click the dimmed backdrop" has no concrete locator; `board-severity.md` 1.1's step 1 ("Locate the severity badge...") wasn't actually a user action.
> - **Low end-user benefit:** `edit-bug.md` 2.6 (save disabled with no changes) is a thin implementation-nicety test but still AC-linked; `bug-status.md` 2.1 (edit modal displays state) is a single-assertion setup step for 2.2.
> - **Duplicates:** Caught that my own section-4 split in the previous turn had created real duplicates — 4.3 (Title) was nearly identical to 2.1, and 4.2 (Severity) was subsumed by 3.1's assertions — while 4.1 (ID) and 4.4 (Owner) were the only ones adding genuinely new coverage.
> - **Missing coverage:** Compared the final files against my own approved plan file and caught that a Closed→Open round-trip scenario and a state-persists-after-reload scenario had been dropped from `bug-status.md`; also flagged missing reload-behavior coverage for sort state, missing keyboard-accessibility scenarios across all four plans (the app's row/button markup explicitly supports keyboard interaction), and missing severity-coloring-under-sort/filter/search coverage.
>
> Presented all findings organized by the four questions, then asked whether to apply the section-4 dedup fix and the two missing `bug-status.md` scenarios immediately, or wait on the accessibility question.

> **User:** Point 1.1 - ... identify a relevant spec file... If you cannot find one, let's create a new document under product/product-questions.md. Point 1.2 - ... add a section on 'testability'... Point 1.3 - ... change the step name to 'Navigate to the board page and observe the severity badges'. [Low-benefit] 2.1 - leave it. 2.2 - fold it in. [Duplicates] ... prefer to keep section 2 rather than section 4. Please move 4.1 and 4.4 into there and remove the duplicates 4.2 and 4.3. [Missing] Please give me time to review this and get back to you.
>
> **Assistant:** Checked `specs/product/` — no existing file fit, so created `specs/product/product-questions.md` (and linked it from `specs/product/README.md`) logging the filter accessible-state gap as an open, unresolved product question. Added a new "Testability" section to `edit-bug.md`'s Technical Information documenting the backdrop-locator ambiguity. Reworded the `board-severity.md` step. Folded `bug-status.md` 2.1 into 2.2 as a leading expected result, and cross-referenced 3.1's assertion to the new Testability section and product question. In `sort-board-columns.md`, moved ID (now 2.4) and Owner (now 2.5) sortability checks into section 2, deleted the duplicate Severity/Title checks, and removed the now-empty section 4 header.

> **User:** "bug-status.md: ... two things that didn't make it into the final scenarios" - yes, please add these tests in. "sort-board-columns.md: no scenario confirms what happens to sort state across a reload" - The app appears to default to severity descending sort. Do the product specs say what is supposed to happen? If not, please add it as a product question. For now, add this as a regression test and somehow mark it as pending product decision. Keyboard accessibility - let's add this as 'out of scope' to all test plans... "board-severity.md: ... severity coloring survives combination with sort/filter/search" - add this to out of scope as well... "edit-bug.md: only Title is exercised as the 'revert on cancel/X/Escape' field..." - this is acceptable, but document this in 'out of scope' for the reason that testing one scenario is enough because the implementation is the same no matter what the field is.
>
> **Assistant:** Confirmed `specs/features/10-sort-board-columns.md` says nothing about reload behavior, so added a new scenario 4.1 to `sort-board-columns.md` explicitly labeled `[PENDING PRODUCT DECISION]`, documenting the current reset-to-default-on-reload behavior as a regression test (not a confirmed requirement), and added a matching "Sort state across page reload" entry to `specs/product/product-questions.md`. Added `bug-status.md` scenarios 2.2 (Closed→Open round-trip) and 2.3 (Closed state persists after reload). Added keyboard-accessibility "Out of Scope" lines to `bug-status.md`, `sort-board-columns.md`, `edit-bug.md`, and `board-severity.md`. Added the severity-coloring-under-sort/filter/search "Out of Scope" line to `board-severity.md`. Added the Title-is-representative-for-revert-testing rationale as an "Out of Scope" line in `edit-bug.md`.

> **User:** Thank you, let's end the session here. 1. Wrap our conversation in a markdown blockquote and append to the file @logs/prompt-logs/lesson-07.md. 2. Add a two-sentence summary on the top. 3. If possible, include any reasoning steps that you did in between as well.
