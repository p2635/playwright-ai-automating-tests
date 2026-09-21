import { test, expect } from "../tests/pages/fixtures.js";
import users from "../users.json" with { type: "json" };

const user = users.find(({ username }) => username === "buggy");

if (!user) {
  throw new Error("Test user not found");
}

test("logs in to BuggyBoard", async ({ loginPage, boardPage }) => {
  await loginPage.login(user);

  await expect(boardPage.heading).toBeVisible();
});
