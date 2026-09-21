# Lesson 5 - Playwright CLI

## Exercise

> Document what you learned. In one short paragraph, note which behavior you chose, whether playwright-cli appeared during planner and generator runs, and one thing you would tighten next time (plan, prompt, or spec structure).

Behaviour: I chose delete bug, but I did it without following the video exactly.

About playwright-cli: Playwright-cli didn't actually appear initially, because the context picked up MCP. To force Claude to use the CLI, I stopped the MCP server. I also explicitly prompted Claude to avoid using the MCP.

One thing you would tighten next time: I would stop MCP servers and remove any references to the subagents (Planner, generator, and healer). It also helped to have the feature spec files, because it gives the AI context for acceptance criteria to map onto. What I forgot to do was generate 1 test first before generating the rest (for an initial quality check).

How the tests went:

```bash
Phil@MyComputer playwright-ai-automating-tests % npm test tests/delete-bug/                              

> test
> playwright test --grep-invert @seed tests/delete-bug/


Running 6 tests using 5 workers
  6 passed (8.3s)
```

## Notes

1. When tests were generated, there were no bug count checks.
