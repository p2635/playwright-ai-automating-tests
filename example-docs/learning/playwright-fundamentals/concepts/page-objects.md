# Page Object Model Pattern

## What Is It?

The Page Object Model (POM) is a design pattern where each page (or component) of your app has a corresponding class that encapsulates:
- **Locators** — how to find elements on that page
- **Actions** — methods that interact with the page (click, fill, submit, etc.)
- **Assertions** — methods that verify page state

## Why It Matters

```typescript
// ❌ Without Page Objects (tests are hard to maintain)
test('user can delete a bug', async ({ page }) => {
  await page.goto('/bugs')
  await page.locator('button.delete-btn').click()
  await page.locator('xpath=//div[@role="dialog"]//button[contains(text(), "Confirm")]').click()
  await expect(page.locator('table tbody tr')).toHaveCount(4)
})

// ✅ With Page Objects (tests read like user stories)
test('user can delete a bug', async ({ page }) => {
  const bugsPage = new BugsPage(page)
  await bugsPage.goto()
  await bugsPage.deleteBug(5)
  await bugsPage.confirmDeletion()
  await expect(bugsPage.bugsTable).toHaveCount(4)
})
```

**Why the second is better**:
- Intent is clear (user is deleting a bug)
- If selectors change, only BugsPage needs updating
- Tests are reusable and focus on behavior, not implementation

## Basic Structure

```typescript
// pages/BugsPage.ts
import { Page } from '@playwright/test'

export class BugsPage {
  constructor(private page: Page) {}

  // Locators
  get deleteButton() {
    return this.page.getByRole('button', { name: 'Delete' })
  }

  get confirmDialog() {
    return this.page.getByRole('dialog')
  }

  // Actions
  async goto() {
    await this.page.goto('/bugs')
  }

  async deleteBug(bugId: number) {
    const row = this.page.getByTestId(`bug-row-${bugId}`)
    await row.hover()
    await this.deleteButton.click()
  }

  async confirmDeletion() {
    await this.confirmDialog.getByRole('button', { name: 'Confirm' }).click()
  }

  // Assertions
  async expectBugCount(count: number) {
    await expect(this.page.locator('table tbody tr')).toHaveCount(count)
  }
}
```

## Usage in Tests

```typescript
import { test, expect } from '@playwright/test'
import { BugsPage } from './pages/BugsPage'

test('user can delete a bug', async ({ page }) => {
  const bugsPage = new BugsPage(page)
  
  await bugsPage.goto()
  await bugsPage.deleteBug(5)
  await bugsPage.confirmDeletion()
  
  await bugsPage.expectBugCount(4)
})
```

## Best Practices

✅ **Do:**
- Create one page object per major page/component
- Name methods as user actions (`deleteBug()`, not `clickDeleteButton()`)
- Keep locators private (`get` or `private get`)
- Return `this` from action methods to enable chaining (fluent API)

❌ **Don't:**
- Put assertions in page objects (keep them in tests)
- Make page objects do too much (keep them focused)
- Hardcode waits (let Playwright handle them)

## Example Inheritance

```typescript
// pages/BasePage.ts
export class BasePage {
  constructor(protected page: Page) {}
  
  async goto(path: string) {
    await this.page.goto(path)
  }
}

// pages/BugsPage.ts
export class BugsPage extends BasePage {
  async goto() {
    await super.goto('/bugs')
  }
  
  // ... rest of BugsPage
}
```

---

## References

- [Playwright Page Object Model Guide](https://playwright.dev/docs/pom)
- [Example page objects in this project](../../../tests/pages/)
