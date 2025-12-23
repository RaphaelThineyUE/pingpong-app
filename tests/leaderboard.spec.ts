import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });
});

test('filters recent matches and leaderboard by date range', async ({ page }) => {
  const seededMatches = [
    {
      player1: 'Dad',
      player2: 'Luc',
      score1: 21,
      score2: 10,
      dateTime: '2024-05-10T18:30:00.000Z'
    },
    {
      player1: 'Alex',
      player2: 'Mom',
      score1: 8,
      score2: 21,
      dateTime: '2024-01-05T11:00:00.000Z'
    }
  ];

  await page.addInitScript((matches) => {
    localStorage.setItem('pingpong_matches', JSON.stringify(matches));
  }, seededMatches);

  await page.goto('/');

  await page.getByLabel('From').fill('2024-05-01');
  await page.getByLabel('To').fill('2024-05-31');

  await expect(page.getByText('Matches in range: 1')).toBeVisible();
  await expect(page.getByText('Showing 1 of 2')).toBeVisible();

  const recentCards = page.locator('div.bg-gray-50.rounded-lg');
  await expect(recentCards).toHaveCount(1);
  await expect(recentCards.first().getByText('Dad', { exact: true })).toBeVisible();
  await expect(recentCards.first().getByText('Luc', { exact: true })).toBeVisible();

  const leaderboardRows = page.locator('table tbody tr');
  await expect(leaderboardRows).toHaveCount(2);
});

test('adds a match and updates leaderboard', async ({ page }) => {
  await page.goto('/');

  await page.locator('#player1').selectOption('Dad');
  await page.locator('#player2').selectOption('Luc');
  await page.locator('#score1').fill('21');
  await page.locator('#score2').fill('15');
  await page.getByRole('button', { name: 'Record Match' }).click();

  await expect(page.getByText('Matches in range: 1')).toBeVisible();

  const leaderboardRows = page.locator('table tbody tr');
  await expect(leaderboardRows).toHaveCount(2);
  await expect(page.locator('table tbody')).toContainText('Dad');
  await expect(page.locator('table tbody')).toContainText('Luc');
});
