import { useState } from "react";
import { Habit } from "./store";
import { Wizard } from "./wizard";

/* ---------------------------------------------------------------------------
   Onboarding: welcome → first name → the build wizard → done.
   No tutorial. The wizard IS the onboarding — by the end the user has a
   complete behaviour design, not an empty app.
--------------------------------------------------------------------------- */

export function Onboarding({
  onFinish
}: {
  onFinish: (name: string, habit: Habit) => void;
}) {
  const [stage, setStage] = useState<"welcome" | "name" | "wizard" | "done">("welcome");
  const [name, setName] = useState("");
  const [habit, setHabit] = useState<Habit | null>(null);

  if (stage === "welcome")
    return (
      <div className="fade-in" style={{ paddingTop: 60, textAlign: "center" }}>
        <div
          className="checkmark"
          style={{ width: 76, height: 76, margin: "0 auto 26px", borderRadius: 24 }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5l4.2 4.3L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1>PACE Habits</h1>
        <p className="muted big" style={{ fontWeight: 500 }}>
          Tiny habits. Real change.
        </p>
        <div className="card tinted" style={{ textAlign: "left", marginTop: 30 }}>
          <p style={{ margin: 0 }}>
            You won't set goals here. You'll decide <b>who you're becoming</b>, pick{" "}
            <b>one tiny habit</b> that person would do, and cast a small vote for them
            every day.
          </p>
          <p className="muted small" style={{ marginBottom: 0 }}>
            Two minutes a day. Everything stays on your device.
          </p>
        </div>
        <button className="btn" onClick={() => setStage("name")}>
          Begin
        </button>
      </div>
    );

  if (stage === "name")
    return (
      <div className="fade-in" style={{ paddingTop: 40 }}>
        <div className="kicker">First things first</div>
        <h1>What should we call you?</h1>
        <p className="muted">Just a first name — it stays on this device.</p>
        <input
          type="text"
          value={name}
          placeholder="Your first name"
          autoComplete="given-name"
          onChange={(e) => setName(e.target.value)}
        />
        <div className="wizard-actions">
          <button
            className="btn"
            disabled={name.trim().length === 0}
            onClick={() => setStage("wizard")}
          >
            Next
          </button>
        </div>
      </div>
    );

  if (stage === "wizard")
    return (
      <div style={{ paddingTop: 16 }}>
        <Wizard
          mode="build"
          existingCount={0}
          onCancel={() => setStage("name")}
          onDone={(h) => {
            setHabit(h);
            setStage("done");
          }}
        />
      </div>
    );

  return (
    <div className="fade-in" style={{ paddingTop: 80, textAlign: "center" }}>
      <h1>That's the hard part done.</h1>
      <p className="muted big" style={{ fontWeight: 500 }}>
        Your first vote is waiting, {name.trim()}.
      </p>
      <button
        className="btn"
        style={{ marginTop: 30 }}
        onClick={() => habit && onFinish(name.trim(), habit)}
      >
        Show me today
      </button>
    </div>
  );
}
