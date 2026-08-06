import { useState } from "react";
import { AppState } from "./store";
import {
  currentStreak,
  longestStreak,
  last7,
  last30,
  daysSince,
  completionPct,
  monthGrid,
  todayKey,
  identityConfidence
} from "./logic";

/* ---------------------------------------------------------------------------
   Progress: votes, streaks, one calendar. Human words over graphs.
--------------------------------------------------------------------------- */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function Progress({ state }: { state: AppState }) {
  const active = state.habits.filter((h) => !h.archived);
  const [sel, setSel] = useState(0);
  const now = new Date();
  const [ym, setYm] = useState<[number, number]>([now.getFullYear(), now.getMonth()]);

  if (active.length === 0)
    return (
      <div className="fade-in">
        <h1>Progress</h1>
        <div className="card tinted">
          <p style={{ margin: 0 }}>Once you have a habit, your votes will show up here.</p>
        </div>
      </div>
    );

  const habit = active[Math.min(sel, active.length - 1)];
  const dates = state.completions[habit.id] || [];
  const done = new Set(dates);
  const streak = currentStreak(done);
  const votes30 = last30(done);
  const cells = monthGrid(ym[0], ym[1]);
  const today = todayKey();

  return (
    <div className="fade-in">
      <h1>Progress</h1>
      <p className="identity-line">
        Votes for <b>someone who {habit.identity}</b>: <b>{dates.length}</b>
      </p>
      <p className="muted small">Identity confidence: {identityConfidence(votes30)}.</p>

      {active.length > 1 && (
        <div className="chips" style={{ marginBottom: 16 }}>
          {active.map((h, i) => (
            <button
              key={h.id}
              className={"chip" + (i === sel ? " selected" : "")}
              onClick={() => setSel(i)}
            >
              {h.tiny}
            </button>
          ))}
        </div>
      )}

      <div className="spacer" />
      <div className="stat-grid">
        <div className="stat">
          <div className="n">{streak}</div>
          <div className="l">day streak</div>
        </div>
        <div className="stat">
          <div className="n">{last7(done)}<span className="muted" style={{ fontSize: 18 }}>/7</span></div>
          <div className="l">this week</div>
        </div>
        <div className="stat">
          <div className="n">{longestStreak(dates)}</div>
          <div className="l">longest streak</div>
        </div>
        <div className="stat">
          <div className="n">{completionPct(done, habit.createdAt)}%</div>
          <div className="l">of days since you started</div>
        </div>
      </div>

      <div className="spacer" />
      <div className="card">
        <div className="cal-head">
          <button
            className="cal-nav"
            aria-label="Previous month"
            onClick={() => setYm(([y, m]) => (m === 0 ? [y - 1, 11] : [y, m - 1]))}
          >
            ‹
          </button>
          <b>
            {MONTHS[ym[1]]} {ym[0]}
          </b>
          <button
            className="cal-nav"
            aria-label="Next month"
            onClick={() => setYm(([y, m]) => (m === 11 ? [y + 1, 0] : [y, m + 1]))}
          >
            ›
          </button>
        </div>
        <div className="cal-grid">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div className="cal-dow" key={i}>
              {d}
            </div>
          ))}
          {cells.map((c, i) =>
            c === null ? (
              <div key={i} />
            ) : (
              <div
                key={i}
                className={
                  "cal-cell" + (done.has(c) ? " done" : "") + (c === today ? " today" : "")
                }
              >
                {Number(c.slice(-2))}
              </div>
            )
          )}
        </div>
      </div>

      <p className="muted small" style={{ textAlign: "center" }}>
        Day {daysSince(habit.createdAt)} of becoming someone who {habit.identity}.
        <br />
        Every square is a vote. You don't need them all — just a majority.
      </p>
    </div>
  );
}
