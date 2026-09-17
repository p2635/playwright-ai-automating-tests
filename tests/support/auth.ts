import { expect, type Page } from "@playwright/test";
import users from "../../users.json" with { type: "json" };

export interface TestUser {
  username: string;
  password: string;
}

/** Looks up a seeded user from users.json, or throws if it isn't there. */
export function getUser(username: string): TestUser {
  const user = users.find((candidate) => candidate.username === username);

  if (!user) {
    throw new Error(`Test user not found: ${username}`);
  }

  return user;
}

/** Logs in as the given user and waits for the board page to load. */
export async function loginAndOpenBoard(page: Page, user: TestUser) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(user.username);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/board$/);
}
