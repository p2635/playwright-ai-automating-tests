# Lesson 06 - Scaling with POM and fixtures

> In one short paragraph, you summarized what you built and how you steered the AI when it drifted.

The first part was to build the test plan. At first I generated the test plan using Claude Code. I specifically asked the AI to follow the test plan template. Once that was done, I reviewed the test plan carefully and iterated once to improve it. There was a test that could be split into two. Another test name was renamed to be clearer.

The second part was to generate the `.spec.ts` tests. I explicitly instructed Claude to only use Playwright CLI. I told Claude not to use the Playwright MCP server. Halfway through I actually removed the agent files manually. This was while Claude was generating the tests, so it got confused (which was funny to see). I did a spot check of the tests and they were successfully generated, following page fixtures. The only issue was too many files generated (12 files), so I asked Claude to categorise them for better readability (4 files).
