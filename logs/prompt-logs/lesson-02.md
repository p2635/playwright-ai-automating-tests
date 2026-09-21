# Prompt Logs for Lesson 2 - Exploring the App and Vibe Coding for Rapid Insights

## Manual run of creating bug

<details markdown="1">
<summary>Conversation with GitHub Copilot (click to expand)</summary>

Observable Playwright action log:

> - Ran setup planner page with `tests/seed.spec.ts`.
> - Installed the missing Chromium browser dependency with `npx playwright install chromium`.
> - Retried setup planner page; the external browser opened at `http://localhost:5173/board` in the authenticated board state.
> - Ran the `New Bug` click.
> - Ran a browser snapshot and verified the Create bug dialog, labeled controls, Cancel and Save buttons, and HIGH/MID/LOW severity options.
> - Ran browser searches for `Create bug` and `HIGH`.
> - Ran a screenshot and saved `artifacts/create-bug-scenario-1-1.png`.

Transcript:

> **User:** Use Playwright MCP to run the first scenario in the test plan documented in the file in context. Run it in an external browser (not a VS Code browser) so can see the steps as they happen. The BuggyBoard app is running locally at [http://localhost:5173/](http://localhost:5173/). Once execution is finished, provide a short summary of what passed or failed against the expected results in the plan.
> Treat this as an exploratory test. Do not generate test code for it. Do not attempt to run existing test scripts.
>
> **Assistant:** I’ll locate the referenced test plan and identify its first scenario, then use the Playwright MCP browser session against the running app and compare the observed result with the plan. I’ll keep this exploratory and won’t invoke the repository’s test scripts.
>
> **Assistant:** The referenced plan is the create-bug plan; its first scenario is `1.1`, “opens the create-bug modal with required controls.” I’ll authenticate as `buggy` if the app starts at login, then verify the modal, labels, buttons, and severity options in the visible external Playwright browser.
>
> **Assistant:** The browser connector requires a Playwright setup step before navigation. I’m initializing it with the repository’s seed file, which should establish the authenticated board state without running an existing test script.
>
> **Assistant:** Setup reached the seed but failed before opening the page because the configured Chromium binary is missing. I’ll install only that Playwright browser dependency, then retry the MCP setup; no application test file will be executed.
>
> **Assistant:** The external Chromium session is now open on the authenticated board, and the seed completed successfully. The board is empty but the `New Bug` control is present, so I’m executing the single planned interaction and checking each expected control in the resulting dialog.
>
> **Assistant:** Scenario `1.1` passed in the external Playwright Chromium browser.
>
> Verified:
>
> - “Create bug” dialog is visible.
> - Title, Severity, Owner, and Description controls are present.
> - Cancel and Save buttons are present.
> - Severity offers HIGH, MID, and LOW.
>
> Screenshot: [artifacts/create-bug-scenario-1-1.png](artifacts/create-bug-scenario-1-1.png)

</details>

## Manual run of open board

<details markdown="1">
<summary>Manual run of test plan (click to expand)</summary>

> **User:**
> Use Playwright MCP to run the first scenario in the test plan documented in the file in context. Run it in an external browser (not a VS Code browser) so can see the steps as they happen. The BuggyBoard app is running locally at [http://localhost:5173/](http://localhost:5173/). Once execution is finished, provide a short summary of what passed or failed against the expected results in the plan.
> Treat this as an exploratory test. Do not generate test code for it. Do not attempt to run existing test scripts.
>
> **Assistant:** I’ll run the scenario interactively in the external Playwright browser, first inspecting the current board state and then checking each expected result for the default Open view. I’ll keep this exploratory and won’t invoke the repository’s test scripts or create test code.
>
> **Assistant:** The app redirected to `/board`, so the browser session is already authenticated and at the target page. I’m checking the accessible board structure now: search value, selected state, table rows, and both empty-state messages.
>
> **Assistant:** The default board currently shows exactly four Open rows with IDs `5`, `8`, `6`, and `7`, and the Open control is visually active while Closed is inactive. I’m doing the final visibility checks for the required titles and confirming that no closed bug or empty-state message is present.
>
> **Assistant:** Exploratory scenario 1.1 passed.
>
> - Board loaded at `/board`.
> - Search field was empty.
> - Open state was active.
> - All four expected Open bugs were visible: `Login fails`, `Issue with log-in`, `Search indexing delay`, and `Payment button disabled`.
> - Closed bug `Login fixed` was absent.
> - Neither `No bugs matched.` nor `No bugs.` appeared.
> - The table contained only the selected Open-state bugs.
>
> No test scripts were run and no test code was created.
>
> **User:** Now run all of them, the other instructions remain the same.
>
> **Assistant:** I’ll continue in the same external Playwright browser and execute scenarios 1.1 through 1.9 interactively, resetting to `/board` between workflows where needed. I’ll record each expected-result check and report any implementation mismatches, without running repository tests or generating code.
>
> **Assistant:** The second part of 1.2 passed independently: replacing the query with `fails` leaves only `Login fails`. The failure is specifically the required punctuation-equivalent match, so I’m moving through case, whitespace, punctuation, scope, empty-state, clear, sorting, and combined-state checks now.
>
> **Assistant:** Case-insensitive matching, whitespace collapsing, title-only scope, and severity exclusion are working. The repeated issue is punctuation normalization: `log-in` is treated differently from `login`, causing the matching row to disappear and also affecting the broader scenarios that depend on that equivalence. Next I’m checking the exact no-match state and recovery behavior.
>
> **Assistant:** Sorting and recovery checks are behaving correctly: Title ascending and then Severity ascending both persist through filtering, including the `aria-sort` indicators. The filtered Title results still miss `Issue with log-in` only because of the punctuation-normalization defect; I’m now running the Open/Closed intersection workflow.
>
> **Assistant:** The combined Open/Closed workflow passes: state filtering intersects with title search, preserves the query across state changes, and shows `No bugs matched.` rather than leaking rows from the other state. I’m running one final direct `log-in` query on Open to confirm the punctuation defect in both directions, then I’ll summarize all scenario outcomes.
>
> **User:** Continue: "Continue to iterate?"
>
> **Assistant:** Exploratory execution completed in the external Playwright browser. No existing tests were run and no test code was created.
>
> **Assistant:** **Passed**
>
> - 1.1 Default Open board contents
> - 1.6 No-match empty state
> - 1.7 Clear search restoration
> - Sorting indicators and sort persistence
> - Open/Closed state intersection behavior
> - Title-only scope and severity exclusion
>
> **Assistant:** **Failed**
>
> - 1.2, 1.3, 1.4, 1.5, 1.8, and part of 1.9
>
> The common defect is punctuation normalization. Searching `login` returns only `Login fails`, while the plan expects it to also match `Issue with log-in`. Searching `log-in` returns only `Issue with log-in`, rather than both titles. Case-insensitive and whitespace normalization otherwise worked.

</details>
