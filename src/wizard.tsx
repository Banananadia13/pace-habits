import { useState, ReactNode } from "react";
import { Habit, HabitType, uid } from "./store";
import { todayKey } from "./logic";
import { Chips } from "./ui";

/* ---------------------------------------------------------------------------
   The habit wizard walks the Atomic Habits sequence:
   identity → (outcome) → one habit → shrink it → implementation intention →
   habit stack → environment → temptation bundle → never miss twice → review.

   Break mode walks the inverse Four Laws instead.
   Chips fill inputs so most steps need zero typing.
--------------------------------------------------------------------------- */

interface Fields {
  identity: string;
  outcome: string;
  name: string;
  tiny: string;
  time: string;
  place: string;
  anchor: string;
  environment: string;
  bundle: string;
  recovery: string;
  invisible: string;
  unattractive: string;
  difficult: string;
  unsatisfying: string;
  replacement: string;
}

const emptyFields = (): Fields => ({
  identity: "",
  outcome: "",
  name: "",
  tiny: "",
  time: "",
  place: "",
  anchor: "",
  environment: "",
  bundle: "",
  recovery: "I'll do the two-minute version the next day, no matter what.",
  invisible: "",
  unattractive: "",
  difficult: "",
  unsatisfying: "",
  replacement: ""
});

function fromHabit(h: Habit): Fields {
  return { ...emptyFields(), ...Object.fromEntries(
    Object.entries(h).filter(([, v]) => typeof v === "string")
  ) } as Fields;
}

interface StepDef {
  key: string;
  kicker: string;
  title: string;
  sub?: string;
  valid: (f: Fields) => boolean;
  skippable?: boolean;
  render: (f: Fields, set: (patch: Partial<Fields>) => void) => ReactNode;
}

const field = (
  f: Fields,
  set: (p: Partial<Fields>) => void,
  key: keyof Fields,
  placeholder: string,
  chips?: string[]
) => (
  <>
    <input
      type="text"
      value={f[key]}
      placeholder={placeholder}
      onChange={(e) => set({ [key]: e.target.value } as Partial<Fields>)}
      autoComplete="off"
    />
    {chips && <Chips options={chips} selected={f[key]} onPick={(v) => set({ [key]: v } as Partial<Fields>)} />}
  </>
);

/* ------------------------------ build steps ------------------------------ */

const buildSteps: StepDef[] = [
  {
    key: "identity",
    kicker: "Start with who",
    title: "I want to become someone who…",
    sub: "Not a goal. A person. Every completed day will be a vote for them.",
    valid: (f) => f.identity.trim().length > 1,
    render: (f, set) =>
      field(f, set, "identity", "moves every day", [
        "moves every day",
        "looks after their health",
        "reads regularly",
        "is calm and present",
        "is getting stronger",
        "cooks real meals",
        "sleeps well"
      ])
  },
  {
    key: "outcome",
    kicker: "Optional",
    title: "Any outcome you're hoping for?",
    sub: "We'll keep this in the background. The identity stays front and centre.",
    valid: () => true,
    skippable: true,
    render: (f, set) => field(f, set, "outcome", "e.g. less back pain, more energy")
  },
  {
    key: "name",
    kicker: "Just one",
    title: "Choose one habit.",
    sub: "One. The person you described — what would they do most days? You can add more later, once this one is boring.",
    valid: (f) => f.name.trim().length > 1,
    render: (f, set) =>
      field(f, set, "name", "Walk after dinner", [
        "Go for a walk",
        "Do my home exercises",
        "Read before bed",
        "Stretch",
        "Meditate",
        "Journal",
        "Practise guitar",
        "Drink water with meals"
      ])
  },
  {
    key: "tiny",
    kicker: "The Two-Minute Rule",
    title: "Now shrink it.",
    sub: "Make it so small you can't say no. This is your entry point, not your final dose — walk 45 minutes becomes put shoes on and step outside.",
    valid: (f) => f.tiny.trim().length > 1,
    render: (f, set) =>
      field(f, set, "tiny", "Walk outside for two minutes", [
        "Walk outside for two minutes",
        "Do one set",
        "Read one page",
        "Roll out the mat",
        "One minute of stretching",
        "Three slow breaths",
        "Write one sentence",
        "Fill the water bottle"
      ])
  },
  {
    key: "intention",
    kicker: "Implementation intention",
    title: "When and where, exactly.",
    sub: "People who decide the time and place in advance are far more likely to follow through — the decision is already made.",
    valid: (f) => f.time.trim().length > 0 && f.place.trim().length > 0,
    render: (f, set) => (
      <>
        <label className="field">
          <span>I will {f.tiny ? f.tiny.toLowerCase() : "do it"} at…</span>
          {field(f, set, "time", "7:00 am", ["First thing", "7:00 am", "Lunchtime", "After work", "6:00 pm", "After dinner"])}
        </label>
        <label className="field">
          <span>in…</span>
          {field(f, set, "place", "the kitchen", ["the kitchen", "the lounge room", "outside the front door", "the garage", "the bedroom", "the park"])}
        </label>
      </>
    )
  },
  {
    key: "anchor",
    kicker: "Habit stacking",
    title: "After I…",
    sub: "Borrow a cue you already have. The best anchors are boring and certain — they happen every single day.",
    valid: () => true,
    skippable: true,
    render: (f, set) =>
      field(f, set, "anchor", "put the kettle on", [
        "brush my teeth",
        "make coffee",
        "put the kettle on",
        "park the car",
        "close the laptop",
        "feed the dog",
        "sit down for dinner"
      ])
  },
  {
    key: "environment",
    kicker: "Environment design",
    title: "Make the cue impossible to miss.",
    sub: "One physical change this week. Visible beats remembered — every time you have to remember, you pay a tax.",
    valid: () => true,
    skippable: true,
    render: (f, set) =>
      field(f, set, "environment", "Leave my shoes by the front door", [
        "Shoes by the door",
        "Mat left unrolled",
        "Book on the pillow",
        "Bands on the door handle",
        "Water bottle on the desk",
        "Guitar on a stand"
      ])
  },
  {
    key: "bundle",
    kicker: "Temptation bundling",
    title: "Pair it with something you enjoy.",
    sub: "Something you already look forward to — but only while doing the habit.",
    valid: () => true,
    skippable: true,
    render: (f, set) =>
      field(f, set, "bundle", "My favourite podcast", [
        "Favourite podcast",
        "A good playlist",
        "Morning coffee",
        "An episode of my show",
        "Walking with my partner",
        "Audiobook"
      ])
  },
  {
    key: "recovery",
    kicker: "Never miss twice",
    title: "If a day doesn't happen — what's the plan?",
    sub: "Missing once is an accident. Missing twice is the start of a new habit. Decide the comeback now, while it's easy.",
    valid: (f) => f.recovery.trim().length > 3,
    render: (f, set) => (
      <>
        <textarea
          value={f.recovery}
          onChange={(e) => set({ recovery: e.target.value })}
        />
        <Chips
          options={[
            "Two-minute version the next day, no matter what",
            "Do it before breakfast the next morning",
            "Text a friend and restart same day"
          ]}
          onPick={(v) => set({ recovery: v })}
        />
      </>
    )
  }
];

/* ------------------------------ break steps ------------------------------ */

const breakSteps: StepDef[] = [
  {
    key: "identity",
    kicker: "Start with who",
    title: "I want to become someone who…",
    sub: "Breaking a habit is also a vote for an identity. Who is the person without it?",
    valid: (f) => f.identity.trim().length > 1,
    render: (f, set) =>
      field(f, set, "identity", "is present with the people around them", [
        "is present, not scrolling",
        "sleeps well",
        "spends with intention",
        "eats mindfully",
        "protects their evenings"
      ])
  },
  {
    key: "name",
    kicker: "Name it",
    title: "What habit are you breaking?",
    valid: (f) => f.name.trim().length > 1,
    render: (f, set) =>
      field(f, set, "name", "Doom scrolling in bed", [
        "Doom scrolling",
        "Late-night snacking",
        "Impulse buying",
        "TV until midnight",
        "Hitting snooze"
      ])
  },
  {
    key: "invisible",
    kicker: "Inverse 1st law",
    title: "Make it invisible.",
    sub: "Remove the cue. Out of sight does most of the work willpower gets credit for.",
    valid: () => true,
    skippable: true,
    render: (f, set) =>
      field(f, set, "invisible", "Charge my phone outside the bedroom", [
        "Phone charges outside the bedroom",
        "Delete the app",
        "Move the app off my home screen",
        "Log out after each use",
        "Snacks off the bench, out of reach"
      ])
  },
  {
    key: "unattractive",
    kicker: "Inverse 2nd law",
    title: "Make it unattractive.",
    sub: "What is this habit actually costing you? Write it where future-you will believe it.",
    valid: () => true,
    skippable: true,
    render: (f, set) =>
      field(f, set, "unattractive", "It steals my sleep and my mornings", [
        "It steals my sleep",
        "It takes time from my kids",
        "It leaves me flat, not rested",
        "It costs me money I care about"
      ])
  },
  {
    key: "difficult",
    kicker: "Inverse 3rd law",
    title: "Make it difficult.",
    sub: "Add steps between you and the habit. Friction works in both directions.",
    valid: () => true,
    skippable: true,
    render: (f, set) =>
      field(f, set, "difficult", "Greyscale mode + 30-second app timer", [
        "Greyscale mode",
        "App time limit",
        "Remove saved cards from my browser",
        "TV remote in a drawer",
        "No snacks in the house"
      ])
  },
  {
    key: "unsatisfying",
    kicker: "Inverse 4th law",
    title: "Make it unsatisfying.",
    sub: "Add a cost when it happens. Being seen is usually enough.",
    valid: () => true,
    skippable: true,
    render: (f, set) =>
      field(f, set, "unsatisfying", "Tell my partner each time it happens", [
        "Tell my partner when it happens",
        "Track slips honestly in this app",
        "A friend gets $5 per slip"
      ])
  },
  {
    key: "replacement",
    kicker: "Replace, don't erase",
    title: "When the urge hits, I will…",
    sub: "A habit is easier to redirect than to delete. Give the cue somewhere better to go.",
    valid: (f) => f.replacement.trim().length > 1,
    render: (f, set) =>
      field(f, set, "replacement", "Read one page instead", [
        "Read one page",
        "Three slow breaths",
        "Stand up and stretch",
        "Drink a glass of water",
        "Step outside for a minute"
      ])
  },
  {
    key: "recovery",
    kicker: "Never miss twice",
    title: "If you slip — what's the plan?",
    sub: "A slip is data, not a verdict. Decide the comeback now.",
    valid: (f) => f.recovery.trim().length > 3,
    render: (f, set) => (
      <textarea value={f.recovery} onChange={(e) => set({ recovery: e.target.value })} />
    )
  }
];

/* ------------------------------- component ------------------------------- */

export function Wizard({
  mode,
  initial,
  existingCount,
  onDone,
  onCancel
}: {
  mode: HabitType;
  initial?: Habit;
  existingCount: number;
  onDone: (h: Habit) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState<Fields>(initial ? fromHabit(initial) : emptyFields());
  const [step, setStep] = useState(0);
  // gentle friction when adding a habit on top of existing ones
  const [gate, setGate] = useState(mode === "build" && !initial && existingCount > 0);

  const steps = mode === "build" ? buildSteps : breakSteps;
  const review = step === steps.length;
  const cur = review ? null : steps[step];
  const set = (patch: Partial<Fields>) => setF((prev) => ({ ...prev, ...patch }));

  if (gate) {
    return (
      <div className="fade-in">
        <div className="kicker">A gentle word first</div>
        <h1>One habit at a time works best.</h1>
        <p className="muted">
          The people who succeed with this approach master one habit until it's boring,
          then add the next. Adding a second habit now roughly halves your odds on both.
        </p>
        <div className="wizard-actions" style={{ flexDirection: "column" }}>
          <button className="btn secondary" onClick={onCancel}>
            You're right — I'll master my current habit first
          </button>
          <button className="btn ghost" onClick={() => setGate(false)}>
            I understand, add another anyway
          </button>
        </div>
      </div>
    );
  }

  const finish = () => {
    const h: Habit = {
      id: initial?.id ?? uid(),
      type: mode,
      identity: f.identity.trim(),
      outcome: f.outcome.trim() || undefined,
      name: f.name.trim(),
      tiny:
        mode === "build"
          ? f.tiny.trim()
          : `A day without ${f.name.trim().toLowerCase()}`,
      time: f.time.trim() || undefined,
      place: f.place.trim() || undefined,
      anchor: f.anchor.trim() || undefined,
      environment: f.environment.trim() || undefined,
      bundle: f.bundle.trim() || undefined,
      recovery: f.recovery.trim(),
      invisible: f.invisible.trim() || undefined,
      unattractive: f.unattractive.trim() || undefined,
      difficult: f.difficult.trim() || undefined,
      unsatisfying: f.unsatisfying.trim() || undefined,
      replacement: f.replacement.trim() || undefined,
      createdAt: initial?.createdAt ?? todayKey()
    };
    onDone(h);
  };

  return (
    <div className="fade-in" key={step}>
      <div className="wizard-top">
        <button className="linklike" onClick={step === 0 ? onCancel : () => setStep(step - 1)}>
          ← Back
        </button>
        <div className="progress-dots" aria-label={`Step ${step + 1} of ${steps.length + 1}`}>
          {Array.from({ length: steps.length + 1 }, (_, i) => (
            <i key={i} className={i <= step ? "on" : ""} />
          ))}
        </div>
      </div>

      {cur ? (
        <>
          <div className="kicker">{cur.kicker}</div>
          <h1>{cur.title}</h1>
          {cur.sub && <p className="muted">{cur.sub}</p>}
          <div className="spacer" />
          {cur.render(f, set)}
          <div className="wizard-actions">
            {cur.skippable && !f[cur.key as keyof Fields] && (
              <button className="btn secondary" onClick={() => setStep(step + 1)}>
                Skip
              </button>
            )}
            <button className="btn" disabled={!cur.valid(f)} onClick={() => setStep(step + 1)}>
              Next
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="kicker">Your plan</div>
          <h1>{mode === "build" ? "Small enough to start today." : "The old habit just got harder."}</h1>
          <div className="card" style={{ marginTop: 16 }}>
            <PlanLine k="Becoming" v={`Someone who ${f.identity}`} />
            {mode === "build" ? (
              <>
                <PlanLine k="Daily habit" v={f.tiny} />
                {(f.time || f.place) && (
                  <PlanLine k="When & where" v={`At ${f.time || "—"} in ${f.place || "—"}`} />
                )}
                {f.anchor && <PlanLine k="Stacked on" v={`After I ${f.anchor}`} />}
                {f.environment && <PlanLine k="Environment" v={f.environment} />}
                {f.bundle && <PlanLine k="Paired with" v={f.bundle} />}
              </>
            ) : (
              <>
                <PlanLine k="Breaking" v={f.name} />
                {f.invisible && <PlanLine k="Invisible" v={f.invisible} />}
                {f.unattractive && <PlanLine k="Unattractive" v={f.unattractive} />}
                {f.difficult && <PlanLine k="Difficult" v={f.difficult} />}
                {f.unsatisfying && <PlanLine k="Unsatisfying" v={f.unsatisfying} />}
                {f.replacement && <PlanLine k="Instead" v={f.replacement} />}
              </>
            )}
            <PlanLine k="If a day is missed" v={f.recovery} />
          </div>
          <button className="btn" onClick={finish}>
            {initial ? "Save changes" : "Start — today counts"}
          </button>
        </>
      )}
    </div>
  );
}

function PlanLine({ k, v }: { k: string; v: string }) {
  return (
    <div className="plan-line">
      <div className="k">{k}</div>
      <div>{v}</div>
    </div>
  );
}
