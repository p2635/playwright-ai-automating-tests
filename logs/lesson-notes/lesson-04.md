# Lesson 4 - Healer agent

## Break the test on the test side

Recommendations on what to break:

- Misspell a role name or accessible name string the test relies on.
- Point getByLabel at a label text that no longer exists (without changing the app yet).

Learning points:

- What I broke: I misspelt labels for two different locators (I just added an 's')
- Agent(s) used (healer only, planner plus generator, or both): Healer
- Result: The healer was easily able to identify that both locators were pointing to label typos.
- Test: Pass

## Break the test with an interface-only app change

Recommendations on what to break:

- Change visible copy on Login, New Bug, or Save while keeping the same handlers.
- Wrap a control in an extra element without changing its role or user steps.

Learning points:

- What I broke: Username htmlFor attribute -> Username-my-ass, "Search bugs by title" -> "Search bugs by tititis"
- Agent(s) used (healer only, planner plus generator, or both): Healer only
- Result: The agent was able to pick up context from the spec, and said that the implementation was wrong according to the spec. Still, it is outside of the tester's responsibility to fix and I would normally defer to the dev.
- Test: Pass

## Break the test with a behavior change

A) explain in writing why you chose healer-only versus planner plus generator update, or
B) refresh a Markdown plan and regenerate/update tests.

Recommendations on what to break:

- Add or change a required field on create or edit bug flows.
- Change how status or severity transitions work if your codebase supports it in one place.
- Any change where a passing user journey means something different than before.
- What I broke: I changed description to must be '1000 characters long'

```ts
// BACKEND - bugService.ts

export type CreateBugResult =
  | { success: true; bug: Bug }
  | {
      success: false;
      code:
        | "BLANK_TITLE"
        | "BLANK_SEVERITY"
        | "BLANK_OWNER"
        | "BLANK_DESCRIPTION"
        | "INVALID_SEVERITY"
        | "DESCRIPTION_TOO_SHORT";
    };
...
  if (owner === "") return { success: false, code: "BLANK_OWNER" };
  if (description === "") return { success: false, code: "BLANK_DESCRIPTION" };
  if (description.length < 1000) return { success: false, code: "DESCRIPTION_TOO_SHORT" };


// FRONTEND - createBugModal.ts
function validate(): string[] {
  const errors: string[] = [];
  if (!title.trim()) errors.push("Title is required.");
  if (!owner.trim()) errors.push("Owner is required.");
  if (!description.trim() || description.length < 1000)
    errors.push(
      "Description is required and must be at least 1000 characters long.",
    );
  if (!SEVERITIES.includes(severity)) errors.push("Severity is required.");
  return errors;
}
```

Learning points:

- Agent(s) used (healer only, planner plus generator, or both): Healer. Planner plus generator skipped, I would use this in normal circumstances
- Result: The healer correctly identify its an app-level issue, because it was using the specification file (feature) as the source of truth. It could not find anything to do with the 1000 character requirement. See the lesson 4 prompt.
- Test: Fail

## Summary

TASK: In one short paragraph, summarize which fixes felt “safe” with the healer alone and where you needed to rethink intent with the planner.

- Healer-alone:
  - Refactor/code changes (no product changes)
  - Minor product changes like text/button labels - On the other hand, maybe its better to update the test plan (to formally document it)
- Planner/Generator:
  - Product new features - if it affects the user
  - Product changes to existing features - e.g. bug description is no longer required. In this case, the existing spec tests will still pass if there are no field validation checks, and healer wouldn't be required.
