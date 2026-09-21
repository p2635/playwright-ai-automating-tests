# Form Filling Pattern

## Problem

Forms can be complex: multiple fields, validation, file uploads, dropdowns. How do you handle them cleanly?

## Solution: Form-Filling Methods

Create methods in your page object that represent filling a complete form, rather than filling individual fields in tests.

## Example

```typescript
// pages/BugFormPage.ts
export class BugFormPage {
  constructor(private page: Page) {}

  // Atomic field-filling methods
  private async fillTitle(title: string) {
    await this.page.getByLabel('Title').fill(title)
  }

  private async fillDescription(description: string) {
    await this.page.getByLabel('Description').fill(description)
  }

  private async selectSeverity(severity: 'Low' | 'Medium' | 'High') {
    await this.page.getByLabel('Severity').selectOption(severity)
  }

  // High-level form submission method
  async submitBugReport(bugData: {
    title: string
    description: string
    severity: 'Low' | 'Medium' | 'High'
  }) {
    await this.fillTitle(bugData.title)
    await this.fillDescription(bugData.description)
    await this.selectSeverity(bugData.severity)
    
    await this.page.getByRole('button', { name: 'Submit' }).click()
    
    // Wait for success state
    await this.page.waitForNavigation()
  }

  // Optional: method to fill with partial data
  async fillPartial(data: Partial<BugData>) {
    if (data.title) await this.fillTitle(data.title)
    if (data.description) await this.fillDescription(data.description)
    if (data.severity) await this.selectSeverity(data.severity)
  }
}
```

## Usage in Tests

```typescript
test('user can create a bug report', async ({ page }) => {
  const form = new BugFormPage(page)
  
  await form.submitBugReport({
    title: 'Login button broken',
    description: 'Button does not respond to clicks',
    severity: 'High'
  })
  
  // Page has navigated and bug is created
})
```

## Why This Works

✅ **Readable**: Tests say *what* they're testing, not *how*
✅ **Maintainable**: Change the form UI? Only update one method
✅ **Reusable**: Multiple tests can use the same form submission
✅ **Testable**: Can test partial fills, invalid data, etc.

## Pattern: Data-Driven Form Tests

```typescript
const bugDatasets = [
  { title: 'Bug 1', description: 'Desc 1', severity: 'Low' },
  { title: 'Bug 2', description: 'Desc 2', severity: 'High' },
  { title: 'Bug 3', description: 'Desc 3', severity: 'Medium' },
]

for (const bugData of bugDatasets) {
  test(`can submit bug: ${bugData.title}`, async ({ page }) => {
    const form = new BugFormPage(page)
    await form.submitBugReport(bugData)
    // Assert success
  })
}
```

Or using Playwright's built-in parameterization:

```typescript
test.describe('Bug form submissions', () => {
  const testCases = [/* ... */]
  
  testCases.forEach(({ title, bugData }) => {
    test(title, async ({ page }) => {
      const form = new BugFormPage(page)
      await form.submitBugReport(bugData)
    })
  })
})
```

---

## See Also

- [Page Objects Pattern](../concepts/page-objects.md)
- [Waits & Timing](../concepts/waits-timing.md) — handling form validation delays
