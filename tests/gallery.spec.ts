import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('all six experiments render without horizontal overflow', async ({ page }) => {
  await expect(page).toHaveTitle(/Weird Interactions/);
  await expect(page.locator('main section')).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('navigation', { name: 'Inspiration' }).getByRole('link')).toHaveCount(3);
});

test('slider changes while held and snaps back when released', async ({ page }) => {
  const slider = page.getByRole('slider', { name: 'Indecisive volume' });
  await slider.focus();
  await page.keyboard.down('ArrowRight');
  await expect(slider).toHaveValue('51');
  await page.keyboard.up('ArrowRight');
  await expect(slider).toHaveValue('50');
  await expect(page.getByText('Actually, 50 feels right. Always has.')).toBeVisible();
});

test('shy button can be caught with the reliable stay-still control', async ({ page }) => {
  await page.getByRole('button', { name: 'Stay still' }).click();
  await page.getByRole('button', { name: 'I’m ready' }).click();
  await expect(page.getByRole('button', { name: 'Okay, hi! ♡' })).toBeVisible();
});

test('shy button accepts keyboard activation immediately', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Click me', exact: true });
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Okay, hi! ♡' })).toBeVisible();
});

test('counter negotiates twice and accepts every third request', async ({ page }) => {
  const plus = page.getByRole('button', { name: 'Increase counter' });
  const minus = page.getByRole('button', { name: 'Decrease counter' });
  const output = page.getByLabel('Counter value');
  await plus.click(); await expect(output).toHaveText('00');
  await plus.click(); await expect(output).toHaveText('00');
  await plus.click(); await expect(output).toHaveText('01');
  await minus.click(); await minus.click(); await minus.click();
  await expect(output).toHaveText('00');
});

test('welcome moves backwards to a stable finished state', async ({ page }) => {
  await expect(page.getByLabel('Step 3 of 3')).toBeVisible();
  await page.getByRole('button', { name: 'Next (but backwards)' }).click();
  await expect(page.getByLabel('Step 2 of 3')).toBeVisible();
  await page.getByRole('button', { name: 'Next (but backwards)' }).click();
  await expect(page.getByLabel('Step 1 of 3')).toBeVisible();
  await page.getByRole('button', { name: 'Start finishing' }).click();
  await expect(page.getByRole('button', { name: 'Nothing accomplished ✓' })).toBeDisabled();
});

test('switch cycles four moods but never promises to be on', async ({ page }) => {
  const toggle = page.getByRole('switch', { name: 'Indecisive switch' });
  for (const text of ['MAYBE', 'ASK LATER', 'OFF, AGAIN', 'OFF']) {
    await toggle.click();
    await expect(page.locator('.switch-label')).toHaveText(text);
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  }
});

test('loader stops at 99 until imperfection is accepted', async ({ page }) => {
  await page.clock.install();
  await page.getByRole('button', { name: 'Make some progress' }).click();
  await page.clock.runFor(2000);
  const progress = page.getByRole('progressbar');
  await expect(progress).toHaveAttribute('aria-valuenow', '99');
  await page.clock.fastForward(10000);
  await expect(progress).toHaveAttribute('aria-valuenow', '99');
  await page.getByRole('button', { name: 'Embrace imperfection' }).click();
  await expect(progress).toHaveAttribute('aria-valuenow', '100');
});

test('global reset cancels active progress and resets every panel', async ({ page }) => {
  await page.clock.install();
  await page.getByRole('switch').click();
  await page.getByRole('button', { name: 'Next (but backwards)' }).click();
  await page.getByRole('button', { name: 'Make some progress' }).click();
  await page.clock.runFor(400);
  await page.getByRole('button', { name: 'Reset everything' }).click();
  await page.clock.fastForward(5000);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  await expect(page.locator('.switch-label')).toHaveText('OFF');
  await expect(page.getByLabel('Step 3 of 3')).toBeVisible();
  await expect(page.getByLabel('Counter value')).toHaveText('00');
  await expect(page.getByRole('slider')).toHaveValue('50');
  await expect(page.getByRole('button', { name: 'Click me', exact: true })).toBeVisible();
});

test('reduced-motion disables decorative transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.shy-button').evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
});
