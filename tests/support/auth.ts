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
