# PACE Habits — design rationale

The success metric: *can a 70-year-old client open this every day for two years
and effortlessly build a life-changing habit?* Every decision below traces back
to that sentence, and to the Four Laws applied to the app itself.

## Visual identity — PACE Health design system

The app is styled to the PACE Health design system (`pacedesignsystem.md`), the
same reference used for the *Making Exercise a Habit* workshop deck, so the two
read as one piece of work.

- **Navy dominates** (`#1C194E`) — headings, the primary button, filled
  calendar days. **PACE Green** (`#76BC1E` / `#92D050`) is the single sharp
  accent: kickers, positive states, the completed-habit card.
- **White ground, never cream.** Cards carry light lavender (`#F4F4F9`) and
  light green (`#E3F0D2`) tints, alternating the way the deck's cards do.
- **Cambria headings, Calibri body**, no third family. On iOS neither ships, so
  the stacks fall back to Georgia and the system sans — close in feel, and the
  layout is set in relative units so nothing breaks.
- **No accent rules, no edge stripes, no colour-only signalling**, per §8 of the
  system.

Two deliberate deviations, both documented in `theme.css`:

1. **A darkened green (`#41721A`) for small text on white.** The brand green is
   ~2.4:1 on white, which fails WCAG AA at body size. The brand green is still
   used for fills, where contrast is carried by the surface.
2. **Dark mode is invented**, since the design system covers print and slides
   only. It's derived from the navy ramp; on a dark ground the primary button
   flips to bright green with navy text, because a navy button would disappear.

## The app follows its own advice

| Law | How the app embodies it |
|---|---|
| Obvious | Every screen has exactly one primary action. Home is a greeting, an identity, one habit, one button. No dashboards on arrival, no tutorial — the wizard *is* the tutorial. |
| Attractive | Warm cream/pine/terracotta palette, large friendly type, rounded cards, generous whitespace. Copy talks like a coach, never like a database ("That's the hard part done"). |
| Easy | Logging is one tap (~2 seconds). Chips fill every input, so most of onboarding needs no typing. Reflection is optional and skippable. Nothing is more than two taps deep. |
| Satisfying | Completion triggers a short confetti moment that names the *identity*, not the number. Streaks exist but the language centres votes, which survive a broken streak. |

## Onboarding (the behaviour design flow)

The user never sees "add a habit". They design one, in Clear's sequence:

1. **Identity first** — "I want to become someone who…". Outcome-based change is
   fragile because behaviour and self-image conflict; identity-based change is
   durable because each action confirms it. The identity the user types is then
   used *everywhere* — greeting, button feedback, celebration, reminders — so
   the app keeps re-anchoring behaviour to person, not target.
2. **Outcome (optional, backgrounded)** — acknowledged once, then deliberately
   kept out of the daily loop. Outcomes are lagging indicators; staring at them
   during the plateau is what kills habits in weeks 4–6.
3. **One habit, enforced socially not technically** — adding a second habit hits
   a gentle interstitial explaining why one-at-a-time wins, with "you're right"
   as the easy path. Friction by design: the app applies the 3rd law *against*
   scope creep.
4. **Two-Minute Rule** — the app stores both the full habit and the tiny
   version, and only ever asks for the tiny version. The prescription is the
   entry point, not the dose. This is the single biggest difference from a
   normal tracker, which asks "did you walk 45 minutes?" and teaches people to
   fail.
5. **Implementation intention (cannot skip)** — "I will X at TIME in PLACE."
   Pre-deciding removes the in-the-moment decision, which is where most
   motivation is spent. It is the highest-evidence technique in the set, so it
   is the one mandatory step.
6. **Habit stack (chips of boring anchors)** — kettle, teeth, parking the car.
   The suggestions are deliberately mundane because reliable beats impressive.
7. **Environment design** — one physical change, phrased as an action to do
   this week. Visible cue > remembered cue; every act of remembering is a tax.
8. **Temptation bundling** — pairs the needed behaviour with a wanted one
   (Premack's principle), attacking the 2nd law directly.
9. **Never miss twice (cannot skip, pre-filled)** — the recovery plan is
   written on day zero, while it's hypothetical and easy. Pre-commitment makes
   a lapse a planned branch, not a failure state.

## Daily experience

- **Greeting → identity → habit → button.** The identity line ("Today you're
  becoming someone who moves every day") does silent work on every open.
- **Completion**: tap → haptic → 1.6s celebration naming the identity → optional
  one-tap reflection. Under five seconds including the celebration.
- **The reflection has a job**: if the last five completions were "easier than
  I expected", the app suggests a small increase — the Goldilocks Rule,
  automated from data the user gave in one tap.
- **Missed yesterday** produces a warm banner: *"one vote, not a verdict"*,
  plus the user's own recovery plan. No red, no broken-streak graphics, no
  guilt. Shame predicts disengagement; design against it.

## Breaking bad habits

The break wizard walks the inverted laws: make it invisible (remove the cue),
unattractive (name the true cost), difficult (add friction), unsatisfying
(accountability), plus a replacement behaviour — redirecting the cue is easier
than deleting it. The daily action becomes "mark today clean", which converts
an absence into a positive, votable act.

## Progress screen

Votes for the identity come first; stats are second. Four numbers (streak,
week, longest, share of days), one calendar, and a closing line — "you don't
need every square, just a majority" — which is the identity-votes idea made
visual. No graphs; graphs reward analysis, and analysis is not the behaviour.

## Toolkit

Interactive, not informational. The Habit Scorecard is a live list where
tapping cycles +/−/=, and the payoff is explicit: your most reliable "=" rows
are your best stacking anchors. Weekly reflection is three questions with a
design bias — the third asks what to *change about the system* (cue, size,
pairing), never "try harder".

## Accessibility & older adults

17px base type, 60px primary buttons, 40px+ touch targets everywhere,
WCAG-friendly contrast in both themes, `prefers-reduced-motion` respected,
chips instead of keyboards wherever possible, dark/light/auto. Vocabulary is
plain English; no gamification jargon.

## What was deliberately left out

Badges, levels, freeze tokens, social feeds, charts, streak insurance,
multiple simultaneous stats views, notification spam. Each one trades calm for
engagement. The app is trying to become boring in the best way — like brushing
your teeth.
