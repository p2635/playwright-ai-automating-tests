import { test, expect } from '@playwright/test';
import users from '../users.json' with { type: 'json' };

const user = users.find(({ username }) => username === 'buggy');

if (!user) {
  throw new Error('Test user not found');
}

test.describe('Seeding: Board setup', () => {
  test('should log in as buggy', { tag: '@seed' }, async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Username').fill(user.username);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/board$/);
    await expect(page.getByRole('heading', { name: 'BuggyBoard' })).toBeVisible();
  });
});
