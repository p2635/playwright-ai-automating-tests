<!-- This error happened during vibe coding of 'create new bug' test for GH copilot. It found a conflict in locators which it automatically healed. -->

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bugs.spec.ts >> creates a new bug
- Location: tests/bugs.spec.ts:3:1

# Error details

```
Error: locator.fill: Error: strict mode violation: getByLabel('Title') resolved to 2 elements:
    1) <input value="" type="text" role="search" placeholder="Search bugs…" aria-label="Search bugs by title" class="flex-1 min-w-0 rounded-l border-0 bg-transparent px-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-none"/> aka getByRole('search', { name: 'Search bugs by title' })
    2) <input value="" type="text" id="bug-title" autocomplete="off" class="w-full rounded border border-stone-300 px-3 py-2 text-stone-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"/> aka getByRole('textbox', { name: 'Title' })

Call log:
  - waiting for getByLabel('Title')

```

# Page snapshot

```yaml
- generic [ref=e3]:
    - banner [ref=e4]:
        - generic [ref=e5]:
            - img "BuggyBoard" [ref=e7]
            - heading "BuggyBoard" [level=1] [ref=e8]
        - generic [ref=e9]:
            - search "Search bugs by title" [ref=e11]
            - button "New Bug" [ref=e13] [cursor=pointer]
            - button "Logout" [ref=e15] [cursor=pointer]
    - main [ref=e16]:
        - generic [ref=e17]:
            - group "Filter by bug state" [ref=e19]:
                - button "Open" [ref=e20] [cursor=pointer]
                - button "Closed" [ref=e21] [cursor=pointer]
            - table "Bugs" [ref=e24]:
                - rowgroup [ref=e25]:
                    - row [ref=e26]:
                        - columnheader [ref=e27]:
                            - button "ID" [ref=e28] [cursor=pointer]
                        - columnheader [ref=e30]:
                            - button "Severity" [ref=e31] [cursor=pointer]:
                                - text: Severity
                                - generic [aria-hidden] [ref=e32]: ↓
                        - columnheader [ref=e33]:
                            - button "Title" [ref=e34] [cursor=pointer]
                        - columnheader [ref=e36]:
                            - button "Owner" [ref=e37] [cursor=pointer]
                - rowgroup [ref=e39]:
                    - button [ref=e40] [cursor=pointer]:
                        - cell "1" [ref=e41]
                        - cell "MID" [ref=e42]
                        - cell "bugbug" [ref=e44]
                        - cell "buggy" [ref=e45]
    - dialog [ref=e46]:
        - generic [ref=e48]:
            - generic [ref=e49]:
                - heading "Create bug" [level=2] [ref=e50]
                - button "Close" [ref=e51] [cursor=pointer]: ×
            - generic [ref=e53]:
                - generic [ref=e54]:
                    - generic [ref=e55]: Title
                    - textbox "Title" [active] [ref=e56]
                - generic [ref=e57]:
                    - generic [ref=e58]: Severity
                    - combobox "Severity" [ref=e59]:
                        - option "HIGH"
                        - option "MID" [selected]
                        - option "LOW"
                - generic [ref=e60]:
                    - generic [ref=e61]: Owner
                    - textbox "Owner" [ref=e62]: buggy
                - generic [ref=e63]:
                    - generic [ref=e64]: Description
                    - textbox "Description" [ref=e65]
                - generic [ref=e66]:
                    - button "Cancel" [ref=e67] [cursor=pointer]
                    - button "Save" [ref=e68] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  |
  3  | test("creates a new bug", async ({ page }) => {
  4  |   await page.goto("/login");
  5  |
  6  |   await page.getByLabel("Username").fill("buggy");
  7  |   await page.getByLabel("Password").fill("1970beetle");
  8  |   await page.getByRole("button", { name: "Login" }).click();
  9  |
  10 |   await expect(page).toHaveURL(/\/board$/);
  11 |   await page.getByRole("button", { name: "New Bug" }).click();
  12 |
> 13 |   await page.getByLabel("Title").fill("Sample bug created by Playwright");
     |                                  ^ Error: locator.fill: Error: strict mode violation: getByLabel('Title') resolved to 2 elements:
  14 |   await page.getByLabel("Severity").selectOption("high");
  15 |   await page.getByLabel("Owner").fill("buggy");
  16 |   await page.getByLabel("Description").fill("This is dummy bug data for the happy path test.");
  17 |   await page.getByRole("button", { name: "Save" }).click();
  18 |
  19 |   const createdBug = page.getByRole("row", {
  20 |     name: /Sample bug created by Playwright.*buggy/,
  21 |   });
  22 |   await expect(createdBug).toBeVisible();
  23 | });
  24 |
```
