import { useEffect, useState } from "react";
import { AppState, Habit } from "./store";
import {
  todayKey,
  greeting,
  missedYesterday,
  currentStreak,
  feelsAutomatic
} from "./logic";
import { Celebration, Sheet, CheckIcon } from "./ui";

/* ---------------------------------------------------------------------------
   Home = the whole daily experience.
   Greeting → identity → today's tiny habit → one big button.
   Completion takes one tap; celebration ties the tap to the identity;
   an optional one-question reflection follows and is always skippable.
--------------------------------------------------------------------------- */

export function Home({
  state,
  complete,
  undo,
  setFeeling
}: {
  state: AppState;
  complete: (habitId: string) => void;
  undo: (habitId: string) => void;
  setFeeling: (habitId: string, date: string, feeling: string) => void;
}) {
  const [celebrating, setCelebrating] = useState<Habit | null>(null);
  const [reflecting, setReflecting] = useState<Habit | null>(null);

  const active = state.habits.filter((h) => !h.archived);
  const today = todayKey();

  useEffect(() => {
    if (!celebrating) return;
    const t = setTimeout(() => {
      setReflecting(celebrating);
      setCelebrating(null);
    }, 1600);
    return () => clearTimeout(t);
  }, [celebrating]);

  const onComplete = (h: Habit) => {
    complete(h.id);
    if (navigator.vibrate) navigator.vibrate(30);
    setCelebrating(h);
  };

  const first = active[0];

  return (
    <div className="fade-in">
      <h1>{greeting(state.name)}</h1>
      {first && (
        <p className="identity-line">
          Today you're becoming <b>someone who {first.identity}</b>.
        </p>
      )}
      <div className="spacer" />
      <div className="spacer" />

      {active.length === 0 && (
        <div className="card tinted">
          <h2>No habit yet</h2>
          <p className="muted">Head to the Toolkit to design one — it takes two minutes.</p>
        </div>
      )}

      {active.map((h) => {
        const done = new Set(state.completions[h.id] || []);
        const isDone = done.has(today);
        const streak = currentStreak(done);
        const recover = missedYesterday(done, h.createdAt);
        const automatic = feelsAutomatic(state.feelings[h.id] || {}, state.completions[h.id] || []);

        return (
          <div className="card" key={h.id}>
            {recover && (
              <div className="recovery">
                <b>Yesterday didn't happen — that's one vote, not a verdict.</b>
                Your plan: {h.recovery} Never miss twice.
              </div>
            )}

            <div className="kicker">{h.type === "break" ? "Today's clean day" : "Today's habit"}</div>
            <div className="habit-tiny">{h.tiny}</div>
            <div className="habit-meta">
              {h.type === "build" && (h.time || h.place) && (
                <div>
                  {h.time ? `At ${h.time}` : ""}
                  {h.place ? ` · ${h.place}` : ""}
                </div>
              )}
              {h.type === "build" && h.anchor && <div>After I {h.anchor}, I begin.</div>}
              {h.type === "break" && h.replacement && <div>When the urge hits: {h.replacement}.</div>}
              {h.bundle && <div>Paired with {h.bundle.toLowerCase()}.</div>}
            </div>

            {isDone ? (
              <div className="done-card">
                <div className="checkmark">
                  <CheckIcon />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="msg">Done. A vote for someone who {h.identity}.</div>
                  <div className="sub">
                    {streak > 1 ? `${streak} days in a row.` : "The streak starts here."}
                  </div>
                </div>
                <button className="linklike" onClick={() => undo(h.id)}>
                  Undo
                </button>
              </div>
            ) : (
              <button className="btn" onClick={() => onComplete(h)}>
                {h.type === "break" ? "Mark today clean" : "Complete"}
              </button>
            )}

            {automatic && !isDone && (
              <p className="muted small" style={{ marginBottom: 0 }}>
                This has felt easy five times running. When you're ready, nudge it up a
                little — just enough to stay interesting.
              </p>
            )}
          </div>
        );
      })}

      {celebrating && <Celebration identity={celebrating.identity} />}

      {reflecting && (
        <Sheet onClose={() => setReflecting(null)}>
          <h2>How did that feel?</h2>
          <p className="muted small">Optional — one tap, or skip.</p>
          <div className="chips" style={{ marginBottom: 14 }}>
            {[
              ["easy", "Easier than I expected"],
              ["ok", "About right"],
              ["hard", "A stretch today"]
            ].map(([val, label]) => (
              <button
                key={val}
                className="chip"
                onClick={() => {
                  setFeeling(reflecting.id, today, val);
                  setReflecting(null);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <button className="btn ghost" onClick={() => setReflecting(null)}>
            Skip
          </button>
        </Sheet>
      )}
    </div>
  );
}
