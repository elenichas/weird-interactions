import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('all seven experiments render without horizontal overflow', async ({ page }, testInfo) => {
  await expect(page).toHaveTitle(/Weird Interactions/);
  await expect(page.locator('main section')).toHaveCount(7);
  await expect(page.locator('.eyebrow')).toHaveText('A PLAYGROUND FOR QUESTIONABLE UX');
  await expect(page.locator('.intro')).not.toContainText('✳');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('navigation', { name: 'Inspiration' }).getByRole('link')).toHaveCount(3);
  const screenshot = testInfo.outputPath('gallery-full-page.png');
  await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
  await testInfo.attach('Gallery full-page appearance', { path: screenshot, contentType: 'image/png' });
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

test('dropdown picks the next mood and wraps around on repeated choices', async ({ page }) => {
  const dropdown = page.getByRole('combobox', { name: 'Pick your mood' });
  await expect(dropdown).toHaveValue('');
  for (const [requested, chosen] of [
    ['Feeling focused', 'Feeling sleepy'],
    ['Feeling social', 'Feeling mysterious'],
    ['Feeling mysterious', 'Feeling focused'],
    ['Feeling sleepy', 'Feeling social'],
    ['Feeling focused', 'Feeling sleepy'],
  ]) {
    await dropdown.selectOption(requested);
    await expect(dropdown).toHaveValue(chosen);
    await expect(page.getByText(`You asked for: ${requested.toLowerCase()}.`)).toBeVisible();
    await expect(page.getByText(`“${chosen}.” There. Much more you.`)).toBeVisible();
  }
});

test('dropdown accepts a keyboard selection', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Mobile uses its native touch picker.');
  const dropdown = page.getByRole('combobox', { name: 'Pick your mood' });
  await dropdown.focus();
  await page.keyboard.press('ArrowDown');
  await expect(dropdown).toHaveValue('Feeling sleepy');
  await expect(page.getByText('You asked for: feeling focused.')).toBeVisible();
});

test('dropdown is keyboard reachable and reset restores its initial state', async ({ page }) => {
  const dropdown = page.getByRole('combobox', { name: 'Pick your mood' });
  await dropdown.focus();
  await expect(dropdown).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Next (but backwards)' })).toBeFocused();
  await dropdown.selectOption('Feeling mysterious');
  await page.getByRole('button', { name: 'Reset everything' }).click();
  await expect(dropdown).toHaveValue('');
  await expect(page.getByText('It always prefers the next option.')).toBeVisible();
  await dropdown.selectOption('Feeling focused');
  await expect(dropdown).toHaveValue('Feeling sleepy');
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
  await page.getByRole('combobox', { name: 'Pick your mood' }).selectOption('Feeling focused');
  await page.getByRole('button', { name: 'Next (but backwards)' }).click();
  await page.getByRole('button', { name: 'Make some progress' }).click();
  await page.clock.runFor(400);
  await page.getByRole('button', { name: 'Reset everything' }).click();
  await page.clock.fastForward(5000);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  await expect(page.locator('.switch-label')).toHaveText('OFF');
  await expect(page.getByLabel('Step 3 of 3')).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Pick your mood' })).toHaveValue('');
  await expect(page.getByRole('slider')).toHaveValue('50');
  await expect(page.getByRole('button', { name: 'Click me', exact: true })).toBeVisible();
});

test('reduced-motion disables decorative transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.shy-button').evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
});

test('game earns typing slots, limits Unicode and paste, and refunds deletions', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const input = page.getByRole('textbox', { name: 'Your victory message' });
  await input.fill('not yet');
  await expect(input).toHaveValue('');
  await page.getByRole('button', { name: 'Start game', exact: true }).click();
  await page.getByRole('button', { name: 'Drop ↓', exact: true }).click();
  await expect(page.getByText('1 row · 4 slots earned')).toBeVisible();
  await input.fill('👩🏽‍💻🇫🇷e\u0301🐈Z');
  await expect(input).toHaveValue('👩🏽‍💻🇫🇷e\u0301🐈');
  await expect(page.locator('.typing-budget')).toContainText('0 characters available');
  await input.fill('abc');
  await expect(page.locator('.typing-budget')).toContainText('1 character available');
  await input.press('End');
  // insertText follows the browser's text insertion path, as paste does, without clipboard permissions.
  await page.keyboard.insertText('defgh');
  await expect(input).toHaveValue('abcd');
  await input.press('Backspace');
  await expect(input).toHaveValue('abc');
  await input.press('ArrowLeft');
  await expect(page.getByRole('button', { name: 'Play for more' })).toBeVisible();
  const screenshot = testInfo.outputPath('earned-words-panel.png');
  await page.locator('.typing-panel').screenshot({ path: screenshot, animations: 'disabled' });
  await testInfo.attach('Earn your words panel', { path: screenshot, contentType: 'image/png' });
});

test('game supports keyboard steering and touch buttons for the second row', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Start game', exact: true }).click();
  await page.keyboard.press('Space');
  await expect(page.getByText('1 row · 4 slots earned')).toBeVisible();
  await page.getByRole('button', { name: 'Play for more' }).click();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('group', { name: /Block game board/ })).toHaveAttribute('aria-label', /columns 4 and 5/);
  await page.keyboard.press('ArrowLeft');
  await page.getByRole('button', { name: 'Move block left' }).click();
  await page.getByRole('button', { name: 'Move block left' }).click();
  await page.getByRole('button', { name: 'Drop ↓', exact: true }).click();
  await expect(page.getByText('2 rows · 8 slots earned')).toBeVisible();
  await page.getByRole('button', { name: 'Retry board' }).click();
  await expect(page.getByText('2 rows · 8 slots earned')).toBeVisible();
});

test('falling pauses on exit and reset cancels game timers and clears text', async ({ page }) => {
  await page.clock.install();
  await page.getByRole('button', { name: 'Start game', exact: true }).click();
  await page.clock.runFor(950);
  const board = page.getByRole('group', { name: /Block game board/ });
  await expect(board).toHaveAttribute('aria-label', /row 2\./);
  const input = page.getByRole('textbox', { name: 'Your victory message' });
  await input.focus();
  await page.clock.runFor(2000);
  await expect(board).toHaveAttribute('aria-label', /row 2\./);
  await page.getByRole('button', { name: 'Start game', exact: true }).click();
  await page.getByRole('button', { name: 'Drop ↓', exact: true }).click();
  await input.fill('hi');
  await page.getByRole('button', { name: 'Play for more' }).click();
  await page.getByRole('button', { name: 'Reset everything' }).click();
  await page.clock.runFor(5000);
  await expect(input).toHaveValue('');
  await expect(page.getByText('0 rows · 0 slots earned')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start game', exact: true })).toBeVisible();
  await expect(board).toHaveAttribute('aria-label', /row 1\./);
});

test('reduced motion waits for manual moves and paused keys leave the board alone', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.getByRole('button', { name: 'Start game', exact: true }).click();
  await page.clock.runFor(5000);
  const board = page.getByRole('group', { name: /Block game board/ });
  await expect(board).toHaveAttribute('aria-label', /row 1\./);
  await page.keyboard.press('ArrowDown');
  await expect(board).toHaveAttribute('aria-label', /row 2\./);
  await page.getByRole('button', { name: 'Pause game' }).click();
  await board.focus();
  await page.keyboard.press('ArrowDown');
  await expect(board).toHaveAttribute('aria-label', /row 2\./);
});
