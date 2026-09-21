# Playwright Fundamentals

A structured guide to core Playwright concepts and APIs, with examples and patterns from this project.

## Roadmap

Start here if you're new to Playwright:

1. **[Selectors & Locators](./concepts/selectors-locators.md)** — How to find elements reliably
2. **[Page Objects Pattern](./concepts/page-objects.md)** — Organizing test code for maintainability
3. **[Fixtures & Test Setup](./concepts/fixtures.md)** — Reusable test infrastructure
4. **[Waits & Timing](./concepts/waits-timing.md)** — Handling asynchronous operations
5. **[Error Handling](./concepts/error-handling.md)** — Debugging test failures

## Concepts

Deep-dive topics organized in [./concepts/](./concepts/)

- `selectors-locators.md` — CSS, XPath, text selectors, generate locator tool
- `page-objects.md` — Page object model pattern, organization, inheritance
- `fixtures.md` — Setup/teardown, fixture scope, beforeEach/afterEach
- `waits-timing.md` — Implicit waits, explicit waits, waitFor(), race conditions
- `error-handling.md` — Common errors, debugging, console logs, network inspection

## Patterns

Reusable code patterns I've developed or discovered in [./patterns/](./patterns/)

- `login-pattern.md` — Authenticating in tests
- `form-filling-pattern.md` — Complex form interactions
- `data-driven-tests.md` — Parameterized tests with multiple data sets
- `fixture-organization.md` — How I structure beforeEach/afterEach

## Troubleshooting

Common problems and solutions in [./troubleshooting/](./troubleshooting/)

- `element-not-found.md` — Root causes and fixes
- `timeout-errors.md` — Diagnosing and fixing flaky tests
- `network-issues.md` — Handling API calls in tests
- `locator-instability.md` — When selectors break and why

---

**How to use**: Each concept file includes theory, examples from this project, and references to actual test files.
