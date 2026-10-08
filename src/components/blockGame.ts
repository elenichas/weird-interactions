/** A small original falling-domino puzzle. No storage, randomness, or network. */
export const WIDTH = 6;
export const HEIGHT = 8;
export const SLOTS_PER_ROW = 4;
export const MAX_SLOTS = 80;
export type Game = { board: boolean[][]; x: number; y: number; rows: number; running: boolean; blocked: boolean };
export type Action = 'start' | 'pause' | 'left' | 'right' | 'down' | 'drop' | 'retry';
export const gapFor = (rows: number) => [2, 0, 4][rows % 3];
function freshBoard(rows: number): boolean[][] {
  const gap = gapFor(rows);
  return Array.from({ length: HEIGHT }, (_, y) => Array.from({ length: WIDTH }, (_, x) => y === HEIGHT - 1 && x !== gap && x !== gap + 1));
}
export const initialGame = (): Game => ({ board: freshBoard(0), x: 2, y: 0, rows: 0, running: false, blocked: false });
function fits(game: Game, x: number, y: number) {
  return x >= 0 && x + 1 < WIDTH && y < HEIGHT && !game.board[y][x] && !game.board[y][x + 1];
}
export function landingRow(game: Game) {
  let y = game.y;
  while (fits(game, game.x, y + 1)) y++;
  return y;
}
function lock(game: Game): Game {
  const board = game.board.map(row => [...row]);
  board[game.y][game.x] = board[game.y][game.x + 1] = true;
  if (board.some(row => row.every(Boolean))) {
    const rows = game.rows + 1;
    return { board: freshBoard(rows), x: 2, y: 0, rows, running: false, blocked: false };
  }
  const next = { ...game, board, x: 2, y: 0 };
  return fits(next, 2, 0) ? next : { ...next, running: false, blocked: true };
}
export function gameReducer(game: Game, action: Action): Game {
  if (action === 'pause') return { ...game, running: false };
  if (action === 'retry') return { ...game, board: freshBoard(game.rows), x: 2, y: 0, running: false, blocked: false };
  if (action === 'start') return game.blocked || game.rows * SLOTS_PER_ROW >= MAX_SLOTS ? game : { ...game, running: true };
  if (!game.running) return game;
  if (action === 'left' || action === 'right') {
    const x = game.x + (action === 'left' ? -1 : 1);
    return fits(game, x, game.y) ? { ...game, x } : game;
  }
  if (action === 'drop') return lock({ ...game, y: landingRow(game) });
  return fits(game, game.x, game.y + 1) ? { ...game, y: game.y + 1 } : lock(game);
}
const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
export const characters = (value: string) => Array.from(segmenter.segment(value), part => part.segment);
export const fitText = (value: string, slots: number) => characters(value).slice(0, slots).join('');
