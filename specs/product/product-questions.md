# Product Questions

Open questions raised while writing specs or test plans that need a product/design decision. Each entry should be resolved (moved to the relevant spec, or answered and archived) once decided.

## Open

### Bug state filter: no accessible "selected" indicator

- **Raised by:** Test plan review, `specs/test-plans/bug-status.md` (Scenario 3.1, "Board state filter defaults to Open").
- **Context:** The board's Open/Closed state filter (`specs/features/13-bug-status.md`) is implemented as two plain buttons distinguished only by a CSS background class (`bg-primary`) when active — there is no `aria-pressed`, `aria-selected`, or `role="radiogroup"`/`role="radio"` semantics exposed. `specs/features/13-bug-status.md` says "the currently selected option is visually clearly indicated" but does not specify the accessible/DOM representation of that state.
- **Question:** Should the state filter expose an accessible selected-state attribute (e.g. `aria-pressed` on each button, or a `role="radiogroup"` / `aria-checked` pattern)? This affects both screen-reader accessibility and how reliably automated tests can assert which filter is active without depending on a specific CSS class name.
- **Status:** Unresolved — pending product/design decision.
