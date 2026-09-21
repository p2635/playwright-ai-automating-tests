# Selectors & Locators in Playwright

## Overview

A **selector** is a query to find an element. A **locator** is Playwright's API for interacting with elements safely.

**Key principle**: Use [Playwright's locator strategies](#playwright-locators) whenever possible. Avoid raw CSS/XPath selectors in tests—they're fragile.

## Playwright Locators (Recommended)

Playwright's locators are resilient and easy to read:

```typescript
// By role (most stable, closest to user perspective)
page.getByRole('button', { name: 'Submit' })
page.getByRole('heading', { level: 1 })

// By label text (great for forms)
page.getByLabel('Email address')

// By placeholder
page.getByPlaceholder('Enter your name')

// By text
page.getByText('Click me')

// By test ID (stable, requires markup)
page.getByTestId('user-profile-card')

// Fallback: CSS or XPath
page.locator('button.primary')
page.locator('xpath=//div[@role="dialog"]')
```

### Why Role-Based Locators Are Best

```typescript
// ❌ Fragile: breaks if styling changes
await page.locator('.submit-btn-blue').click()

// ✅ Stable: works as long as button is accessible
await page.getByRole('button', { name: 'Submit' }).click()
```

**Reason**: Role-based locators align with how users actually interact with the page. If the button is still a button with the label "Submit," the locator works—no matter how the CSS changes.

## When to Use Each Strategy

| Locator | Use Case | Stability |
|---------|----------|-----------|
| `getByRole()` | Any interactive element (buttons, inputs, headings) | ⭐⭐⭐⭐⭐ |
| `getByLabel()` | Form inputs with labels | ⭐⭐⭐⭐⭐ |
| `getByPlaceholder()` | Inputs with placeholder text | ⭐⭐⭐⭐ |
| `getByText()` | Content matching specific text | ⭐⭐⭐⭐ |
| `getByTestId()` | Elements with `data-testid` attribute | ⭐⭐⭐⭐⭐ |
| `locator()` + CSS | Last resort for complex cases | ⭐⭐ |

## Example from This Project

From `tests/bugs/delete-bug.spec.ts`:

```typescript
// ✅ Good: uses getByRole
await page.getByRole('button', { name: 'Delete Bug' }).click()
await page.getByRole('button', { name: /Confirm/i }).click()

// Also good: getByTestId for elements harder to identify
await page.getByTestId('bug-row-42').hover()
```

## Generating Locators

Playwright's Inspector tool can help:

```bash
npx playwright codegen https://example.com
```

This opens an interactive tool where you can click elements and it generates locator code.

**Tip**: Use it to start, but then refactor to use more stable locator strategies (role-based > test IDs > CSS).

---

## References

- [Playwright Locators Docs](https://playwright.dev/docs/locators)
- [getByRole() API](https://playwright.dev/docs/api/class-page#page-get-by-role)
- [Related tests](../../../tests/) — search for `getByRole` to see usage
