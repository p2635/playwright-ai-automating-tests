# Lesson 2 - Playwright Planner Agent (17 September 13:15)

> In one short paragraph, note what matched the app, what surprised you, and whether you would trust this plan as input to generate tests later.

What matched:

> **Assistant:** **Passed**
>
> - 1.1 Default Open board contents
> - 1.6 No-match empty state
> - 1.7 Clear search restoration
> - Sorting indicators and sort persistence
> - Open/Closed state intersection behavior
> - Title-only scope and severity exclusion
>
> **Assistant:** **Failed**
>
> - 1.2, 1.3, 1.4, 1.5, 1.8, and part of 1.9
>
> The common defect is punctuation normalization. Searching `login` returns only `Login fails`, while the plan expects it to also match `Issue with log-in`. Searching `log-in` returns only `Issue with log-in`, rather than both titles. Case-insensitive and whitespace normalization otherwise worked.

What surprised me:

- How fast AI was able to generate a bunch of tests. Even though I didn't specify it, it also created a seed fixture file to set up test data
- The test plan said the search field label is 'Search bugs by title'. But I read label to mean the placeholder text, I saw the placeholder was 'Search...'. The AI was referring to the HTML label.
- When I was doing exploratory tests, I found things the AI did not.

Whether I would trust the plan:

- Yes I would trust it to generate it, but I would also review it. The trick is, I need to learn the skill of what to review. The AI can generate so many tests now.
- I would ask the AI to map any requirements to acceptance criteria. If it doesn't match the AC, then it should flag it to me for review rather than make things up.

## Lessons learned

I thought the test plan was wrong 'log-in' vs 'login' but its testing normalization. The test plan should really refer back to the feature spec to say 'consistent with xxx'. The test plan actually found bugs which I thought were false positives.

## Issues I found

This are issues that I found but were not picked up by AI.

Application overview

1. This test plan says 'The title bar contains a live search field labeled "Search bugs by title"', which I correctly verified in the HTML. However, when I look at it visually, the placeholder is "Search bugs...". It's worth explicitly noting this difference between placeholder and label.

Customer experience

General customer experience.

1. (IGNORE - this is expected behaviour according to the feature spec in `features/13-bug-status.md`) 'Search bugs..." field - it is not clear what the expected result is. Should this feature be able to search both open and closed bugs? Or only the open/closed filter the customer has currently set?

Customer messages that are not actionable.

1. "No bugs matched." - I believe this could be improved as "No bugs matched. Please update your search criteria or clear your search to find another bug." (although I think my wording could be improved)
2. "No bugs." - I can think of two scenarios:
   1. 0 open bugs, some closed bugs - This could be improved as "No open bugs exist. Please click Closed to see (count) closed bugs."
   2. 0 open bugs, 0 closed bugs - Is it even worth having any of the bug board controls/search available or enabled if no bugs exist at all? Perhaps it should say "Welcome to BuggyBoard. Create a new bug to get started tracking bugs".

Note: I wonder what named testing heuristic this fails specifically? It would be good to know so I can apply the same heuristic to another testing problem or describe to AI.
