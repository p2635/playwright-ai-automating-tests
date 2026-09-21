# [EXAMPLE] Fixtures & Test Setup Notes

**Date**: 2026-09-21  
**Topic**: Understanding Playwright fixtures vs. beforeEach/afterEach

## Initial Questions

- What's the difference between a Playwright fixture and just using beforeEach?
- When should I use each?
- How do I share state between tests?

## What I Learned

### Fixtures
- Reusable across tests
- Defined at the test level, scoped
- Cleaner syntax but requires understanding fixture scope
- Good for: browser, page, context (Playwright manages these)

### beforeEach/afterEach
- More explicit, easier to debug
- Runs for every test in the file
- Good for: application-level setup (login, test data)

### Key Insight
For our test suite, mixing both works:
- Use Playwright's built-in fixtures (page, browser)
- Use beforeEach for app-specific setup (logging in)

## Example

```typescript
// Using beforeEach for app setup
beforeEach(async ({ page }) => {
  await loginAs('user@example.com')
  await page.goto('/dashboard')
})

// Tests then focus on the behavior
test('can delete a bug', async ({ page }) => {
  // Already logged in, already on dashboard
  await page.getByRole('button', { name: 'Delete' }).click()
})
```

## Confusion Points (Resolved)

- ✅ Thought fixtures were only for Playwright objects → No, can create custom fixtures
- ✅ Wasn't sure about cleanup → afterEach runs before next test starts
- ✅ Wondered about performance → Faster than managing state in every test

## Next Steps

- Review the actual fixture implementation in this project
- Document the pattern in [fixtures.md](../../docs/learning/playwright-fundamentals/concepts/fixtures.md)

---

**Related**: See [prompt logs] for the Claude conversation that clarified this.
