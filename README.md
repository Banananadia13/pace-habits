# PACE Habits

A tiny, calm behaviour-change companion built on the ideas in James Clear's
*Atomic Habits*. Not a habit tracker — a coach that walks you through designing
one habit properly, then asks for one tap a day.

Everything stays on the device. No accounts, no backend, no analytics, no
internet needed after the first load.

## Quick start (development)

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build locally
```

## Deploying to GitHub Pages

1. Create a GitHub repository and push this folder to the `main` branch.
2. In the repo: **Settings → Pages → Source → GitHub Actions**.
3. Push. The included workflow (`.github/workflows/deploy.yml`) builds and
   deploys automatically. Your app appears at
   `https://<username>.github.io/<repo>/`.

The Vite config uses `base: "./"`, so the build works at any path — no
configuration needed for project pages.

### Getting it to clients

Generate a QR code that points at your Pages URL (any free QR generator).
Clients scan it, then:

- **iPhone**: Share button → *Add to Home Screen*
- **Android**: Chrome menu → *Install app* (or the install banner)

From then on it opens full-screen like a native app and works with no signal.

## How it stores data

A single JSON blob in `localStorage` (`pace-habits-v1`), defined in
`src/store.ts`. Users can export it as a file from Settings. Clearing browser
data deletes it — worth telling clients.

## A note on reminders

The app is fully offline with no server, so it cannot send push notifications.
Settings offers a "daily nudge" (shown in-app when the day's vote is still
open) and recommends the honest workaround: a phone alarm labelled with the
habit stack ("After I park the car…"). For clients, the implementation
intention + habit stack is the real reminder system — that's by design.

## Architecture

```
src/
  store.ts       # state shape + localStorage persistence (swap point for sync)
  logic.ts       # pure date/streak/vote functions (no DOM, unit-testable)
  ui.tsx         # shared pieces: chips, sheet, celebration, icons
  wizard.tsx     # the Atomic Habits design flow (build + break modes)
  onboarding.tsx # welcome → name → wizard → first vote
  home.tsx       # the daily experience
  progress.tsx   # votes, streaks, calendar
  toolkit.tsx    # scorecard, weekly reflection, habit design tools
  settings.tsx   # theme, nudge, export, reset
  App.tsx        # state owner, mutations, tabs, theming
```

Screens never touch `localStorage` directly — they receive state and mutation
functions from `App`. Future features (EP mode, shared habits, HealthKit,
templates, multiple routines) slot in as new screens plus new fields on the
store, without rewrites. `AppState.version` exists so migrations can be added
to `loadState()`.

## Design intent

See `DESIGN.md` for every screen and the behavioural reasoning behind it.
The one-line version: the app itself follows the Four Laws — obvious (one
action per screen), attractive (warm, calm, unhurried), easy (one tap to log,
chips instead of typing), satisfying (a celebration that names the identity,
not just the streak).
