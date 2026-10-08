import { useEffect, useReducer, useRef, useState } from 'react';
import { characters, fitText, gameReducer, gapFor, initialGame, landingRow, MAX_SLOTS, SLOTS_PER_ROW } from './blockGame';
import './earn-your-words.css';

export function EarnYourWords() {
  const [game, dispatch] = useReducer(gameReducer, undefined, initialGame);
  const [text, setText] = useState('');
  const [notice, setNotice] = useState('');
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const boardRef = useRef<HTMLDivElement>(null);
  const earned = Math.min(MAX_SLOTS, game.rows * SLOTS_PER_ROW);
  const remaining = earned - characters(text).length;
  const ghost = landingRow(game);
  const gap = gapFor(game.rows);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const changed = () => setReducedMotion(media.matches);
    media.addEventListener('change', changed);
    return () => media.removeEventListener('change', changed);
  }, []);
  useEffect(() => {
    if (!game.running || reducedMotion) return;
    const timer = window.setInterval(() => dispatch('down'), 900);
    return () => window.clearInterval(timer);
  }, [game.running, reducedMotion]);
  useEffect(() => {
    const pause = () => dispatch('pause');
    const visibility = () => { if (document.hidden) pause(); };
    window.addEventListener('blur', pause);
    document.addEventListener('visibilitychange', visibility);
    return () => { window.removeEventListener('blur', pause); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  const status = game.blocked ? 'A small pile-up. Retry the board; your letters are safe.' : earned === MAX_SLOTS ? '80 slots earned. Your keyboard can retire from sport.' : game.running ? 'Fill the two-square gap in the bottom row.' : game.rows ? `${game.rows} ${game.rows === 1 ? 'row' : 'rows'} cleared. ${earned} character slots earned. Type, or play for more.` : 'One row buys four characters. The first drop is on the house.';
  return <section className="panel typing-panel" aria-labelledby="title-07">
    <div className="panel-heading"><span className="number">07</span><span className="tag">Pay to type. In effort.</span></div>
    <h2 id="title-07">Earn your words</h2>
    <p className="description">Your keyboard has a side quest. Clear a row to unlock four characters.</p>
    <div className="typing-layout">
      <div className="block-game" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) dispatch('pause'); }} onKeyDown={event => {
        if (!game.running || event.altKey || event.ctrlKey || event.metaKey) return;
        const action = event.key === 'ArrowLeft' ? 'left' : event.key === 'ArrowRight' ? 'right' : event.key === 'ArrowDown' ? 'down' : event.key === ' ' && event.target === boardRef.current ? 'drop' : undefined;
        if (action) { event.preventDefault(); dispatch(action); }
      }}>
        <div className="block-board" ref={boardRef} tabIndex={0} role="group" aria-label={`Block game board. Piece in columns ${game.x + 1} and ${game.x + 2}, row ${game.y + 1}. Bottom gap in columns ${gap + 1} and ${gap + 2}.`} aria-describedby="block-instructions">
          {game.board.flatMap((row, y) => row.map((filled, x) => {
            const piece = !game.blocked && y === game.y && (x === game.x || x === game.x + 1);
            const shadow = !game.blocked && y === ghost && (x === game.x || x === game.x + 1);
            return <span key={`${y}-${x}`} aria-hidden="true" className={`block-cell${filled ? ' settled' : ''}${shadow ? ' ghost' : ''}${piece ? ' falling' : ''}`} />;
          }))}
          {!game.running && <span className="board-badge" aria-hidden="true">{game.blocked ? 'PILE-UP' : earned === MAX_SLOTS ? 'WELL PLAYED' : game.rows ? 'LETTERS EARNED' : 'READY WHEN YOU ARE'}</span>}
        </div>
        <div className="block-tools">
          <p id="block-instructions" className="block-help">Slide the pair into the gap, then drop.<br/>{reducedMotion ? 'No automatic falling with reduced motion.' : 'Blocks fall slowly. Leaving the game pauses it.'}<br/>Arrow keys move; Space drops when the board is focused. Or use the buttons.</p>
          <div className="block-controls">
            <button className="outline-button" aria-label="Move block left" disabled={!game.running} onClick={() => dispatch('left')}>←</button>
            <button className="outline-button" aria-label="Move block right" disabled={!game.running} onClick={() => dispatch('right')}>→</button>
            <button className="outline-button" disabled={!game.running} onClick={() => dispatch('drop')}>Drop ↓</button>
          </div>
          <div className="block-actions">
            <button className="dark-button" disabled={game.blocked || earned === MAX_SLOTS} onClick={() => { if (game.running) dispatch('pause'); else { dispatch('start'); boardRef.current?.focus(); } }}>{game.running ? 'Pause game' : game.rows ? 'Play for more' : 'Start game'}</button>
            <button className="text-button" onClick={() => dispatch('retry')}>Retry board</button>
          </div>
          <p className="block-score">{game.rows} {game.rows === 1 ? 'row' : 'rows'} · {earned} slots earned</p>
        </div>
      </div>
      <div className="earned-input">
        <span className="tiny-label">The very exclusive text box</span>
        <label htmlFor="earned-words">Your victory message</label>
        <textarea id="earned-words" rows={3} value={text} autoComplete="off" spellCheck={false} aria-describedby="typing-budget typing-privacy" placeholder={earned ? 'You may now have an opinion.' : 'Clear a row to earn your first 4 characters…'} onChange={event => {
          const value = event.target.value;
          setText(fitText(value, earned));
          setNotice(characters(value).length > earned ? 'Out of character slots. Clear another row to write more.' : '');
        }} />
        <p id="typing-budget" className="typing-budget"><strong>{remaining}</strong> {remaining === 1 ? 'character' : 'characters'} available <span> / {earned} unlocked</span></p>
        <p id="typing-privacy" className="block-help">Just a toy message, never a real password. Nothing is sent or saved. Deleting frees your slots; pasting uses them too.</p>
        <p className="typing-notice" role="status">{notice}</p>
      </div>
    </div>
    <p className="remark" aria-live="polite">{status}</p>
  </section>;
}
