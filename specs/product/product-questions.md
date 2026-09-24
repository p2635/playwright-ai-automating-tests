# Product Questions

Open questions raised while writing specs or test plans that need a product/design decision. Each entry should be resolved (moved to the relevant spec, or answered and archived) once decided.

## Open

### Bug state filter: no accessible "selected" indicator

- **Raised by:** Test plan review, `specs/test-plans/bug-status.md` (Scenario 3.1, "Board state filter defaults to Open").
- **Context:** The board's Open/Closed state filter (`specs/features/13-bug-status.md`) is implemented as two plain buttons distinguished only by a CSS background class (`bg-primary`) when active — there is no `aria-pressed`, `aria-selected`, or `role="radiogroup"`/`role="radio"` semantics exposed. `specs/features/13-bug-status.md` says "the currently selected option is visually clearly indicated" but does not specify the accessible/DOM representation of that state.
- **Question:** Should the state filter expose an accessible selected-state attribute (e.g. `aria-pressed` on each button, or a `role="radiogroup"` / `aria-checked` pattern)? This affects both screen-reader accessibility and how reliably automated tests can assert which filter is active without depending on a specific CSS class name.
- **Status:** Unresolved — pending product/design decision.

### Sort state across page reload

- **Raised by:** Test plan review, `specs/test-plans/sort-board-columns.md` (Scenario 4.1, "Sort resets to the default (Severity descending) after reload").
- **Context:** `specs/features/10-sort-board-columns.md` specifies the default sort (Severity descending) and how clicking column headers changes the active sort, but says nothing about what should happen to the active sort across a page reload or navigation away and back. The current implementation holds sort state only in React component state, so it silently resets to the default on every reload.
- **Question:** Is resetting to the default sort on reload the intended behavior, or should the active sort persist (e.g. via URL query params, localStorage, or a user preference)? A user who has sorted by Title and then refreshes the page may be surprised to see it revert to Severity order.
- **Status:** Unresolved — pending product decision. `specs/test-plans/sort-board-columns.md` Scenario 4.1 documents the current (reset-to-default) behavior as a regression test only, not as a confirmed requirement, and is marked `[PENDING PRODUCT DECISION]` until this is resolved.
