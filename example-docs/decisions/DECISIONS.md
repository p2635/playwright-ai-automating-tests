# Design Decisions

This document records significant decisions made while building this test suite, the reasoning behind them, and trade-offs accepted.

## Format

Each decision includes:
- **What**: The decision made
- **Why**: The reasoning (constraints, benefits, drawbacks avoided)
- **Trade-off**: What we gave up to make this choice
- **Date**: When decided
- **Status**: Active / Reconsidered / Superseded

---

## Decisions

### 1. Use Page Objects for Test Organization

**What**: Organize tests using the Page Object Model pattern (one class per page).

**Why**: 
- Tests are more readable (describe intent, not mechanics)
- Changes to the UI only require updating the page object, not multiple tests
- Reusable methods reduce duplication

**Trade-off**: More boilerplate code upfront, but pays off quickly in maintenance.

**Date**: [Start of project]

**Status**: Active ✅

**Example**: See [PageObjects/](../../tests/pages/) directory

---

### 2. Prefer Role-Based Locators Over CSS Selectors

**What**: Use `page.getByRole()` and `getByLabel()` instead of CSS or XPath selectors.

**Why**:
- Role-based locators are resilient to UI changes
- They align with how users interact with the page (accessibility-first)
- Less likely to break in maintenance

**Trade-off**: Slightly more verbose syntax, but clarity > conciseness.

**Date**: [Early in project]

**Status**: Active ✅

**Example**: See [selectors-locators.md](../learning/playwright-fundamentals/concepts/selectors-locators.md)

---

### 3. Use beforeEach/afterEach Fixtures Instead of Page Fixtures

**What**: Setup/teardown login and test data in `beforeEach`/`afterEach` blocks rather than Playwright `page` fixtures.

**Why**:
- [Your reason here — e.g., "More explicit control over test isolation", "Easier to debug", "Tests read more clearly"]
- [Additional reason]

**Trade-off**: Slightly more code per test file, but clearer dependencies.

**Date**: [Date of decision]

**Status**: Active ✅

**Example**: See [delete-bug.spec.ts](../../tests/bugs/delete-bug.spec.ts)

---

## Template for Future Decisions

```markdown
### N. [Decision Title]

**What**: [What was decided]

**Why**: 
- [Reason 1]
- [Reason 2]

**Trade-off**: [What was given up]

**Date**: [Date]

**Status**: [Active / Reconsidered / Superseded]

**Reference**: [Link to code or docs]
```

---

## Reconsidered Decisions

*Decisions that seemed good but were reconsidered:*

- [To be filled in as you learn]

---

**Purpose**: This document helps future developers (and future you) understand the "why" behind architectural choices.
