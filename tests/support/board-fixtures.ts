import type { APIRequestContext } from "@playwright/test";

const apiURL = process.env.BUGGYBOARD_API_URL ?? "http://localhost:3000/api";

export interface BugFixture {
  title: string;
  description: string;
  severity: "HIGH" | "MID" | "LOW";
  owner: string;
  state: "OPEN" | "CLOSED";
}

export const boardFixtures: BugFixture[] = [
  {
    title: "Login fails",
    description: "Authentication timeout",
    severity: "HIGH",
    owner: "buggy",
    state: "OPEN",
  },
  {
    title: "Issue with log-in",
    description: "Login form validation",
    severity: "MID",
    owner: "qa-user",
    state: "OPEN",
  },
  {
    title: "Search indexing delay",
    description: "The login owner cannot find results",
    severity: "LOW",
    owner: "qa-user",
    state: "OPEN",
  },
  {
    title: "Payment button disabled",
    description: "Payment cannot be submitted",
    severity: "HIGH",
    owner: "login-owner",
    state: "OPEN",
  },
  {
    title: "Login fixed",
    description: "Closed authentication issue",
    severity: "LOW",
    owner: "qa-user",
    state: "CLOSED",
  },
  {
    title: "Archive cleanup",
    description: "Old records",
    severity: "HIGH",
    owner: "buggy",
    state: "CLOSED",
  },
];

/** Resets the backend to only the seeded board fixtures via the REST API. */
export async function seedBoardFixtures(request: APIRequestContext) {
  const existing = await (await request.get(`${apiURL}/bugs`)).json();
  for (const bug of existing) {
    await request.delete(`${apiURL}/bugs/${bug.id}`);
  }

  for (const fixture of boardFixtures) {
    const response = await request.post(`${apiURL}/bugs`, { data: fixture });
    const created = await response.json();

    if (fixture.state === "CLOSED") {
      await request.put(`${apiURL}/bugs/${created.id}`, { data: fixture });
    }
  }
}
