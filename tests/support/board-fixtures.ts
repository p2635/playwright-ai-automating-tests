import type { APIRequestContext } from "@playwright/test";

const apiURL = process.env.BUGGYBOARD_API_URL ?? "http://localhost:3000/api";

export interface BugFixture {
  title: string;
  description: string;
  severity: "HIGH" | "MID" | "LOW";
  owner: string;
  state: "OPEN" | "CLOSED";
}

export interface Bug extends BugFixture {
  id: number;
}

/** Creates a single bug via the REST API without touching any other board data. */
export async function createBug(
  request: APIRequestContext,
  fixture: BugFixture
): Promise<Bug> {
  const response = await request.post(`${apiURL}/bugs`, { data: fixture });
  const created = await response.json();

  if (fixture.state === "CLOSED") {
    const updated = await request.put(`${apiURL}/bugs/${created.id}`, {
      data: fixture,
    });
    return await updated.json();
  }

  return created;
}

/** Returns all bugs currently on the board via the REST API. */
export async function getBugs(request: APIRequestContext): Promise<Bug[]> {
  const response = await request.get(`${apiURL}/bugs`);
  return await response.json();
}

/** Deletes a bug by id if it still exists; no-ops if it was already removed. */
export async function deleteBugIfExists(
  request: APIRequestContext,
  id: number
) {
  const bugs = await getBugs(request);
  if (bugs.some((bug) => bug.id === id)) {
    await request.delete(`${apiURL}/bugs/${id}`);
  }
}

/** Deletes every bug currently on the board via the REST API. */
export async function deleteAllBugs(request: APIRequestContext) {
  const existing = await getBugs(request);
  for (const bug of existing) {
    await request.delete(`${apiURL}/bugs/${bug.id}`);
  }
}
