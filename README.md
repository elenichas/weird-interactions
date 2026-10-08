# Weird Interactions

A tiny, original gallery of six deliberately unhelpful interfaces. React + TypeScript + Vite; no backend, analytics, cookies, accounts, or stored state.

## Run

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

## Verify

```sh
npm run typecheck
npm run build
npx playwright install --with-deps chromium webkit
npm test
```

Playwright covers desktop Chromium and iPhone-sized WebKit, including keyboard operation, reset during an active timer, bounded joke states, overflow, and reduced motion. CI runs the same checks on Node 22.

## The collection

1. **The noncommittal slider** springs back to 50 on release, blur, or cancellation.
2. **The shy button** dodges five times. Touch attempts move it too. Keyboard activation or “Stay still” catches it immediately.
3. **The bargaining counter** accepts every third request.
4. **The backwards welcome** goes from step 3 to step 1.
5. **The situationship switch** cycles through indecisive moods without ever claiming to be on.
6. **The perfectionist loader** stalls at 99% until you accept imperfection.

The page shell is intentionally reliable. Reset clears all experiments and timers. Jokes never move outside their own panel, trap navigation, submit data, or require endless effort. System reduced-motion preferences disable transitions.

## Inspiration

Researched before implementation: [Matt West's Bad UI](https://mattw.io/bad-ui/), [User Inyerface](https://userinyerface.com/), and [Goulart Nogueira's BadUI](https://goulartnogueira.github.io/BadUI/). This project uses original code, copy, visual design, and bounded interaction treatments; no assets or code were copied from these references.

The visual theme uses one continuous indigo-to-violet background gradient, frosted-glass panels, and warm gradient accents, without decorative background circles. Typography uses Manrope and Montserrat from Google Fonts with local sans-serif fallbacks. The SVG favicon is original. Build output is static and suitable for private Sites hosting; access control belongs to the host, not the client app.
