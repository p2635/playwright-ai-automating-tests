const apiUrl = process.env.BUGGYBOARD_API_URL ?? "http://localhost:3000/api";

const fixtures = [
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

async function request(path, options) {
  const response = await fetch(`${apiUrl}${path}`, options);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`${options?.method ?? "GET"} ${path} failed (${response.status}): ${message}`);
  }
  return response.status === 204 ? null : response.json();
}

const existingBugs = await request("/bugs");
for (const bug of existingBugs) {
  await request(`/bugs/${bug.id}`, { method: "DELETE" });
}

for (const fixture of fixtures) {
  const created = await request("/bugs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fixture),
  });

  if (fixture.state === "CLOSED") {
    await request(`/bugs/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fixture),
    });
  }
}

const seededBugs = await request("/bugs");
const seededTitles = seededBugs.map(({ title }) => title);
const missingTitles = fixtures
  .map(({ title }) => title)
  .filter((title) => !seededTitles.includes(title));

if (missingTitles.length > 0 || seededBugs.length !== fixtures.length) {
  throw new Error(`Fixture verification failed. Missing: ${missingTitles.join(", ") || "none"}`);
}

console.log(`Seeded ${seededBugs.length} board fixtures.`);