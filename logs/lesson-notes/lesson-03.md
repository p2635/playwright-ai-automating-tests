# Lesson 3 - Generator agent

> In one short paragraph, describe whether the tests are atomic, what you changed after the first generation, and how closely the code matches your plan.

- Are tests atomic? - Not quite. They are still mini-tours and I can break them down further. Although I specifically asked it to follow AAA, this does not necessary mean they are atomic. I need to review both the test plan and the spec file.
- What did I change? - The first generation included a fixture in the spec file itself. I told Claude to refactor so the fixture is in a different file for better readability and maintenance.
- How closely the code matches my plan - It matches too closely actually. I wanted it to be more atomic, but it was doing exactly to the plan. Disappointingly, AI did not generate all the necessary verification checks to ensure the AC has been met. For future prompting, I may have to break it down in detail to make sure the AC is actually met.

## What I learned

1. Test Maintenance - If the test plan changes, then the code has to change, or vice versa?
2. Test Generation
   1. AI does not generate tests properly e.g. expected results from test plan were not explicitly verified, maybe I need to improve my prompt.
   2. Generate one test before the rest, ensure it looks good before continuing. Break down your prompt by doing task decomposition.
3. Test Config - serial mode matters for test data
4. Traceability - mapping expected behaviour to AC
5. Learning - saving prompts for continuous learning
6. Errors - GH copilot can fail to respond because it cannot do tool_search for some reason. The fix is to just tell it not to do that.
