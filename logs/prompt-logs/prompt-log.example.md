# [EXAMPLE] Claude Discussion: Page Objects Pattern - 2026-09-19

**Question**: When should I use private methods vs. public methods in page objects?

## Summary

Discussed the design of page objects and method visibility:

### Key Points

1. **Private getter methods for locators**
   ```typescript
   private get deleteButton() { ... }
   ```
   - Users of the page object don't need to know *how* to find the button
   - Only the page object should expose high-level actions

2. **Public methods for user actions**
   ```typescript
   async deleteBug(id: number) { ... }
   ```
   - Tests call action methods
   - Action methods use private locators internally

3. **When to break encapsulation**
   - Rarely: only when a test needs very specific behavior
   - Instead: add a new action method to the page object

## Example Before/After

```typescript
// ❌ Before (leaky abstraction)
test('can delete', async ({ page }) => {
  const bugsPage = new BugsPage(page)
  const deleteBtn = bugsPage.deleteButton // accessing private concern
  await deleteBtn.click()
})

// ✅ After (clean abstraction)
test('can delete', async ({ page }) => {
  const bugsPage = new BugsPage(page)
  await bugsPage.deleteBug(42) // high-level action
})
```

## Takeaway for This Project

✅ Make all locators private (use `private get`)  
✅ Expose only user-intent methods (click, submit, fill, navigate, assert)  
✅ If a test needs a specific getter, add a public action method instead

---

**Formalized in**: [page-objects.md](../../docs/learning/playwright-fundamentals/concepts/page-objects.md)
