import { StrictMode, useEffect, useRef, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function Panel({ number, tag, title, description, className = '', children }: { number: string; tag: string; title: string; description: string; className?: string; children: ReactNode }) {
  return <section className={`panel ${className}`} aria-labelledby={`title-${number}`}><div className="panel-heading"><span className="number">{number}</span><span className="tag">{tag}</span></div><h2 id={`title-${number}`}>{title}</h2><p className="description">{description}</p>{children}</section>;
}
function Slider() {
  const [value, setValue] = useState(50);
  const [released, setReleased] = useState(false);
  const settle = () => { setValue(50); setReleased(true); };
  return <Panel number="01" tag="Commitment issues" title="The noncommittal slider" description="Go on. Find your perfect volume."><div className="experiment slider-experiment"><div className="big-value">{value}<span>%</span></div><label className="sr-only" htmlFor="volume">Indecisive volume</label><input id="volume" type="range" min="0" max="100" value={value} onChange={e => {setValue(Number(e.target.value)); setReleased(false);}} onPointerUp={settle} onPointerCancel={settle} onKeyUp={settle} onBlur={settle} style={{'--value': `${value}%`} as React.CSSProperties}/><div className="range-labels"><span>A little</span><span>A lot</span></div></div><p className="remark" aria-live="polite">{released ? 'Actually, 50 feels right. Always has.' : 'Drag it. Let go. Lower your expectations.'}</p></Panel>;
}
function Evasive() {
  const [dodges, setDodges] = useState(0);
  const [caught, setCaught] = useState(false);
  const [kind, setKind] = useState(false);
  const moves = [[50,50],[74,27],[26,73],[72,73],[28,27],[50,50]];
  const move = () => { if (!kind && !caught) setDodges(n => Math.min(n + 1, 5)); };
  const [x,y] = moves[dodges];
  return <Panel number="02" tag="Personal space" title="The shy button" description="It really wants to be clicked. Probably." className="shy-panel"><div className="experiment chase-area"><span className="crosshair" aria-hidden="true">+</span><button className="shy-button" style={{left:`${x}%`,top:`${y}%`}} onPointerEnter={e => {if(e.pointerType === 'mouse') move();}} onClick={e => {if(e.detail === 0 || kind || dodges >= 5) setCaught(true); else move();}}>{caught ? 'Okay, hi! ♡' : dodges >= 5 || kind ? 'I’m ready' : 'Click me'}</button></div><div className="remark remark-row"><span aria-live="polite">{caught ? 'A beautiful, mildly awkward connection.' : dodges >= 5 ? 'Social battery depleted. You win.' : `${dodges}/5 evasive maneuvers`}</span><button className="text-button" onClick={() => setKind(true)} disabled={kind || caught}>Stay still</button></div></Panel>;
}
function Counter() {
  const [value, setValue] = useState(0);
  const [requests, setRequests] = useState(0);
  const [message, setMessage] = useState('One small click. One lengthy negotiation.');
  function change(direction: number) { const next = requests + 1; setRequests(next); if(next % 3 === 0) { setValue(v => v + direction); setMessage('Fine. But I’m counting this as a favor.'); } else setMessage(next % 3 === 1 ? 'Interesting proposal. Have you considered no?' : 'Let me circle back on that number.'); }
  return <Panel number="03" tag="Under review" title="The bargaining counter" description="Math, with a middle manager."><div className="experiment counter-experiment"><div className="counter-controls"><button aria-label="Decrease counter" onClick={() => change(-1)}>−</button><output aria-label="Counter value">{value.toString().padStart(2, '0')}</output><button aria-label="Increase counter" onClick={() => change(1)}>+</button></div><span className="tiny-label">{requests === 0 ? 'No requests on file' : `${requests} request${requests === 1 ? '' : 's'} filed`}</span></div><p className="remark" aria-live="polite">{message}</p></Panel>;
}
function Wizard() {
  const [step, setStep] = useState(3);
  const [done, setDone] = useState(false);
  const words = ['Welcome, finally.', 'A little less ready.', 'You’re all set!'];
  return <Panel number="04" tag="Reverse engineering" title="The backwards welcome" description="Every great journey ends at the beginning." className="wizard-panel"><div className="experiment wizard-experiment"><div className="steps" aria-label={`Step ${step} of 3`}>{[1,2,3].map(n => <span key={n} className={n === step ? 'active' : ''}>{n}</span>)}</div><strong aria-live="polite">{done ? 'You have successfully unstarted.' : words[step - 1]}</strong><button className="dark-button" onClick={() => {if(step > 1) setStep(step - 1); else setDone(true);}} disabled={done}>{done ? 'Nothing accomplished ✓' : step === 1 ? 'Start finishing' : 'Next (but backwards)'}</button></div><p className="remark">{done ? 'No account. No form. No progress. Lovely.' : `Step ${step} of 3. You’re making regress.`}</p></Panel>;
}
function Toggle() {
  const [attempts, setAttempts] = useState(0);
  const mood = attempts % 4;
  const labels = ['OFF', 'MAYBE', 'ASK LATER', 'OFF, AGAIN'];
  return <Panel number="05" tag="It’s complicated" title="The situationship switch" description="Are we on? It doesn’t like labels."><div className="experiment toggle-experiment"><button role="switch" aria-checked={false} aria-label="Indecisive switch" className={`weird-switch mood-${mood}`} onClick={() => setAttempts(n => n + 1)}><span /></button><strong className="switch-label" aria-live="polite">{labels[mood]}</strong></div><p className="remark">{['It’s not you. It’s the boolean.', 'Let’s see where this goes.', 'Really enjoying what we have right now.', 'We should just stay settings.'][mood]}</p></Panel>;
}
function Progress() {
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => { if (!running) return; timer.current = setInterval(() => setProgress(p => { if(p >= 99) return 99; return Math.min(99,p+11); }), 180); return () => {if(timer.current) clearInterval(timer.current);}; }, [running]);
  useEffect(() => {if(progress === 99) setRunning(false);}, [progress]);
  return <Panel number="06" tag="Almost there™" title="The perfectionist loader" description="The last 1% is a lifestyle."><div className="experiment progress-experiment"><div className="progress-value">{progress}<span>%</span><span className="loading-note">{progress === 100 ? 'Good enough.' : progress === 99 ? 'So close. So comfortable.' : running ? 'Becoming almost ready…' : 'Ready to get almost ready.'}</span></div><div className="progress-track" role="progressbar" aria-label="Perfectionist progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div style={{width:`${progress}%`}} /></div><button className="outline-button" disabled={running || progress === 100} onClick={() => {if(progress === 99) setProgress(100); else setRunning(true);}}>{progress === 100 ? 'Imperfection accepted ✓' : progress === 99 ? 'Embrace imperfection' : running ? 'Almosting…' : 'Make some progress'}</button></div><p className="remark" aria-live="polite">{progress === 100 ? 'Turns out, done is a perfectly good feeling.' : progress === 99 ? 'Waiting won’t help. Permission to be done?' : 'Estimated time remaining: emotionally unclear.'}</p></Panel>;
}
function App() {
  const [session, setSession] = useState(0);
  const [resetMessage, setResetMessage] = useState('');
  return <><a className="skip-link" href="#experiments">Skip to experiments</a><div className="page"><header><a className="wordmark" href="#" aria-label="Weird Interactions home"><span className="mark" aria-hidden="true">w↯</span><span>WEIRD<br/>INTERACTIONS</span></a><div className="header-right"><span className="edition">VOL. 01 / SMALL INCONVENIENCES</span><button className="reset-button" onClick={() => {setSession(n => n + 1); setResetMessage('All six experiments reset.');}}>Reset everything <span aria-hidden="true">↺</span></button></div></header><main><div className="intro"><div><div className="eyebrow"><span className="asterisk" aria-hidden="true">✳</span> A PLAYGROUND FOR QUESTIONABLE UX</div><h1>Perfectly good.<br/><span>Deliberately wrong.</span></h1></div><div className="intro-aside"><span className="stamp">PLEASE DO<br/>NOT IMPROVE</span><p>Six little interfaces. <br/>Absolutely no intention <br/>of being helpful.</p></div></div><div className="collection-bar"><span>THE COLLECTION <span className="count">06</span></span><span>Touch, click, question your choices.</span></div><div className="grid" id="experiments" key={session}><Slider/><Evasive/><Counter/><Wizard/><Toggle/><Progress/></div><p className="access-note">The jokes stay in their boxes. Keyboard-friendly, touch-ready, and nothing here is saved.</p><p className="sr-only" role="status">{resetMessage}</p></main><footer><div><strong>Bad ideas. Good company.</strong><span>A small tribute to the internet’s least helpful interfaces.</span></div><nav aria-label="Inspiration"><a href="https://mattw.io/bad-ui/" target="_blank" rel="noreferrer">Bad UI</a><a href="https://userinyerface.com/" target="_blank" rel="noreferrer">User Inyerface</a><a href="https://goulartnogueira.github.io/BadUI/" target="_blank" rel="noreferrer">BadUI collection</a></nav></footer></div></>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
