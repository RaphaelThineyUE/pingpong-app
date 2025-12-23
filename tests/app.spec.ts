import { test, expect } from '@playwright/test';
import { environment } from '../src/environments/environment';

const sheetId = environment.googleSheets.spreadsheetId;
const sheetName = environment.googleSheets.sheetName;

const sheetsApiPattern = '**/sheets.googleapis.com/v4/spreadsheets/**';
const webAppPattern = '**/script.google.com/**/exec';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });
});

test('loads matches from Google Sheets and renders stats/history', async ({ page }) => {
  await page.route(sheetsApiPattern, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        values: [
          ['Date', 'Dad', 'Luc', 'Alex', 'Mom'],
          ['2024-05-10 18:30', '21', '', '', '10'],
          ['2024-05-12 19:00', '', '21', '15', '']
        ]
      })
    });
  });

  await page.route(webAppPattern, async route => {
    await route.fulfill({ status: 200, body: '' });
  });

  await page.goto('/');

  await expect(page.getByTestId('match-history')).toBeVisible();
  await expect(page.getByTestId('leaderboard-status')).toBeVisible();
  await expect(page.getByText('Matches in range: 2')).toBeVisible();

  await expect(page.getByTestId('match-history').getByTestId('match-card')).toHaveCount(2);
  await expect(page.getByTestId('leaderboard-status').locator('tbody tr')).toHaveCount(4);
  await expect(page.getByTestId('raw-data-table').locator('tbody tr')).toHaveCount(2);

  const expectedUrl = `https://docs.google.com/spreadsheets/d/${sheetId}`;
  await expect(page.getByTestId('sheet-link')).toHaveAttribute('href', expectedUrl);
  await expect(page.getByText(`View raw Google Sheet (${sheetName})`)).toBeVisible();
});

test('submits a match, syncs to Google Sheets, and updates UI', async ({ page }) => {
  let submitBody = '';

  await page.route(sheetsApiPattern, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ values: [] })
    });
  });

  await page.route(webAppPattern, async route => {
    submitBody = route.request().postData() || '';
    await route.fulfill({ status: 200, body: '' });
  });

  await page.goto('/');

  const submitButton = page.getByRole('button', { name: 'Record Match' });
  await expect(submitButton).toBeDisabled();

  await page.locator('#player1').selectOption('Dad');
  await page.locator('#player2').selectOption('Luc');
  await page.locator('#score1').fill('21');
  await page.locator('#score2').fill('15');

  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  await expect(page.getByText('Matches in range: 1')).toBeVisible();
  await expect(page.getByTestId('match-history').getByTestId('match-card')).toHaveCount(1);
  await expect(page.getByTestId('leaderboard-status').locator('tbody tr')).toHaveCount(2);
  expect(submitBody).toContain('"dad":21');
  expect(submitBody).toContain('"luc":15');
});

test('filters by date range and keeps raw data unfiltered', async ({ page }) => {
  await page.route(sheetsApiPattern, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        values: [
          ['Date', 'Dad', 'Luc', 'Alex', 'Mom'],
          ['2024-01-05 10:00', '21', '', '', '10'],
          ['2024-06-10 18:30', '', '21', '15', '']
        ]
      })
    });
  });

  await page.route(webAppPattern, async route => {
    await route.fulfill({ status: 200, body: '' });
  });

  await page.goto('/');

  await page.getByLabel('From').fill('2024-06-01');
  await page.getByLabel('To').fill('2024-06-30');

  await expect(page.getByText('Matches in range: 1')).toBeVisible();
  await expect(page.getByTestId('match-history').getByTestId('match-card')).toHaveCount(1);
  await expect(page.getByTestId('raw-data-table').locator('tbody tr')).toHaveCount(2);
});

test('deletes a match and sends delete request to Google Sheets', async ({ page }) => {
  const requestBodies: string[] = [];

  await page.route(sheetsApiPattern, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        values: [
          ['Date', 'Dad', 'Luc', 'Alex', 'Mom'],
          ['2024-04-10 18:30', '21', '', '', '10']
        ]
      })
    });
  });

  await page.route(webAppPattern, async route => {
    requestBodies.push(route.request().postData() || '');
    await route.fulfill({ status: 200, body: '' });
  });

  await page.goto('/');

  await expect(page.getByTestId('match-history').getByTestId('match-card')).toHaveCount(1);
  await page.getByTestId('delete-match').first().click();

  await expect(page.getByTestId('match-history')).toHaveCount(0);
  await expect(page.getByTestId('empty-state')).toBeVisible();
  expect(requestBodies.some(body => body.includes('"action":"delete"'))).toBe(true);
});
