import { test, expect } from "../tests/pages/fixtures.js";
import users from "../users.json" with { type: "json" };

const user = users.find(({ username }) => username === "buggy");

if (!user) {
  throw new Error("Test user not found");
}

test("creates a new bug", async ({ page, loginPage, boardPage, createBugDialog }) => {
  const bugTitle = `Playwright bug ${Date.now()}`;

  await loginPage.login(user);
  await expect(page.getByRole("cell", { name: "Loading…" })).toBeHidden();
  await boardPage.newBugButton.click();

  await createBugDialog.fillAndSave({
    title: bugTitle,
    severity: "high",
    owner: user.username,
    description: "This is dummy bug data for the happy path test.",
  });

  await expect(boardPage.cellByTitle(bugTitle)).toBeVisible();
});

test("deletes an existing bug", async ({
  page,
  loginPage,
  boardPage,
  createBugDialog,
  editBugDialog,
}) => {
  const bugTitle = `Playwright bug to delete ${Date.now()}`;

  await loginPage.login(user);
  await expect(page.getByRole("cell", { name: "Loading…" })).toBeHidden();
  await boardPage.newBugButton.click();

  await createBugDialog.fillAndSave({
    title: bugTitle,
    severity: "high",
    owner: user.username,
    description: "This is dummy bug data for the delete test.",
  });

  const bugCell = boardPage.cellByTitle(bugTitle);
  await expect(bugCell).toBeVisible();
  await bugCell.click();

  await editBugDialog.expectVisible();
  await editBugDialog.delete();

  await expect(bugCell).toBeHidden();
});
