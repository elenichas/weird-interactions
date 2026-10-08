import { test, expect } from '@playwright/test';
import { characters, fitText, gameReducer, initialGame, MAX_SLOTS, SLOTS_PER_ROW } from '../src/components/blockGame';

test('a first drop clears a row and later gaps require steering', () => {
  let game = gameReducer(initialGame(), 'start');
  game = gameReducer(game, 'drop');
  expect(game.rows).toBe(1);
  expect(game.running).toBe(false);
  game = gameReducer(game, 'start');
  game = gameReducer(game, 'left');
  game = gameReducer(game, 'left');
  game = gameReducer(game, 'drop');
  expect(game.rows).toBe(2);
});

test('movement is bounded and pile-up is recoverable without losing slots', () => {
  let game = gameReducer(initialGame(), 'start');
  game = gameReducer(game, 'drop');
  game = gameReducer(game, 'start');
  for (let i = 0; i < 20; i++) game = gameReducer(game, 'right');
  expect(game.x).toBe(4);
  // Start pieces in the middle, away from the second round's left-hand gap.
  for (let i = 0; i < 12; i++) game = gameReducer(game, 'drop');
  expect(game.blocked).toBe(true);
  expect(game.running).toBe(false);
  game = gameReducer(game, 'retry');
  expect(game.blocked).toBe(false);
  expect(game.rows).toBe(1);
  expect(game.y).toBe(0);
});

test('pause ignores movement and all slots have a finite finish', () => {
  const initial = initialGame();
  expect(gameReducer(initial, 'drop')).toEqual(initial);
  let game = initial;
  for (let i = 0; i < MAX_SLOTS / SLOTS_PER_ROW; i++) {
    game = gameReducer(game, 'start');
    const direction = i % 3 === 1 ? 'left' : 'right';
    if (i % 3 !== 0) { game = gameReducer(game, direction); game = gameReducer(game, direction); }
    game = gameReducer(game, 'drop');
  }
  expect(game.rows * SLOTS_PER_ROW).toBe(MAX_SLOTS);
  expect(gameReducer(game, 'start').running).toBe(false);
});

test('quotas count whole Unicode graphemes and never split emoji or accents', () => {
  const text = '👩🏽‍💻🇫🇷e\u0301🐈Z';
  expect(characters(text)).toHaveLength(5);
  expect(fitText(text, 4)).toBe('👩🏽‍💻🇫🇷e\u0301🐈');
  expect(fitText(text, 0)).toBe('');
  expect(fitText('abcd', 4)).toBe('abcd');
});
