import { useState } from "react";
import { AppState, Habit, ScorecardItem, Reflection, uid } from "./store";
import { todayKey } from "./logic";
import { Wizard } from "./wizard";

/* ---------------------------------------------------------------------------
   Toolkit: the interactive Atomic Habits tools.
   - design a new habit / break a bad habit (the wizard)
   - refine the current habit design
   - Habit Scorecard (awareness → anchors)
   - Weekly reflection
--------------------------------------------------------------------------- */

type Mode =
  | { kind: "menu" }
  | { kind: "wizard"; type: "build" | "break"; editing?: Habit }
  | { kind: "scorecard" }
  | { kind: "reflect" };

export function Toolkit({
  state,
  addHabit,
  updateHabit,
  archiveHabit,
  setScorecard,
  addReflection
}: {
  state: AppState;
  addHabit: (h: Habit) => void;
  updateHabit: (h: Habit) => void;
  archiveHabit: (id: string) => void;
  setScorecard: (items: ScorecardItem[]) => void;
  addReflection: (r: Reflection) => void;
}) {
  const [mode, setMode] = useState<Mode>({ kind: "menu" });
  const active = state.habits.filter((h) => !h.archived);

  if (mode.kind === "wizard")
    return (
      <Wizard
        mode={mode.type}
        initial={mode.editing}
        existingCount={active.length}
        onCancel={() => setMode({ kind: "menu" })}
        onDone={(h) => {
          if (mode.editing) updateHabit(h);
          else addHabit(h);
          setMode({ kind: "menu" });
        }}
      />
    );

  if (mode.kind === "scorecard")
    return (
      <Scorecard
        items={state.scorecard}
        onChange={setScorecard}
        onBack={() => setMode({ kind: "menu" })}
      />
    );

  if (mode.kind === "reflect")
    return (
      <Reflect
        past={state.reflections}
        onSave={(r) => {
          addReflection(r);
          setMode({ kind: "menu" });
        }}
        onBack={() => setMode({ kind: "menu" })}
      />
    );

  return (
    <div className="fade-in">
      <h1>Toolkit</h1>
      <p className="muted">
        Small tools from <i>Atomic Habits</i>. Use one when something feels stuck.
      </p>
      <div className="spacer" />

      {active.map((h) => (
        <ToolRow
          key={h.id}
          warm
          title={`Refine: ${h.tiny}`}
          desc="Adjust the cue, size, pairing or recovery plan"
          onClick={() => setMode({ kind: "wizard", type: h.type, editing: h })}
        />
      ))}

      <ToolRow
        title="Design a new habit"
        desc="Identity → one tiny habit → cue → plan"
        onClick={() => setMode({ kind: "wizard", type: "build" })}
      />
      <ToolRow
        title="Break a bad habit"
        desc="The Four Laws, inverted"
        onClick={() => setMode({ kind: "wizard", type: "break" })}
      />
      <ToolRow
        title="Habit Scorecard"
        desc="Map your day, find your anchors"
        onClick={() => setMode({ kind: "scorecard" })}
      />
      <ToolRow
        title="Weekly reflection"
        desc="Three questions, two minutes"
        onClick={() => setMode({ kind: "reflect" })}
      />

      {active.length > 0 && (
        <>
          <div className="divider" />
          <p className="muted small">
            Finished with a habit, or want a clean slate? You can retire it — the votes
            you cast stay counted.
          </p>
          {active.map((h) => (
            <button
              key={h.id}
              className="linklike"
              onClick={() => {
                if (window.confirm(`Retire "${h.tiny}"? Its history is kept.`))
                  archiveHabit(h.id);
              }}
            >
              Retire "{h.tiny}"
            </button>
          ))}
        </>
      )}
    </div>
  );
}

function ToolRow({
  title,
  desc,
  onClick,
  warm
}: {
  title: string;
  desc: string;
  onClick: () => void;
  warm?: boolean;
}) {
  return (
    <button className="tool-row" onClick={onClick}>
      <div className={"tool-icon" + (warm ? " warm" : "")}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div className="t">{title}</div>
        <div className="d">{desc}</div>
      </div>
      <span className="muted">›</span>
    </button>
  );
}

/* ------------------------------ Scorecard ------------------------------ */

const MARKS: ScorecardItem["mark"][] = ["=", "+", "-"];

function Scorecard({
  items,
  onChange,
  onBack
}: {
  items: ScorecardItem[];
  onChange: (items: ScorecardItem[]) => void;
  onBack: () => void;
}) {
  const [text, setText] = useState("");

  const add = () => {
    const t = text.trim();
    if (!t) return;
    onChange([...items, { id: uid(), text: t, mark: "=" }]);
    setText("");
  };

  const cycle = (id: string) =>
    onChange(
      items.map((it) =>
        it.id === id
          ? { ...it, mark: MARKS[(MARKS.indexOf(it.mark) + 1) % MARKS.length] }
          : it
      )
    );

  const anchors = items.filter((i) => i.mark !== "-");

  return (
    <div className="fade-in">
      <button className="linklike" onClick={onBack}>← Toolkit</button>
      <div className="kicker">Awareness before change</div>
      <h1>Habit Scorecard</h1>
      <p className="muted">
        List what you do each day, in order — however small. Tap the circle to mark each
        one: <b>+</b> helps who you're becoming, <b>−</b> works against them, <b>=</b> neutral.
      </p>

      <div className="card">
        {items.length === 0 && (
          <p className="muted small" style={{ margin: 0 }}>
            Start from waking up: alarm off, check phone, kettle on…
          </p>
        )}
        {items.map((it) => (
          <div className="score-row" key={it.id}>
            <button
              className={
                "score-mark " + (it.mark === "+" ? "p" : it.mark === "-" ? "m" : "e")
              }
              onClick={() => cycle(it.id)}
              aria-label={`Mark: ${it.mark}. Tap to change.`}
            >
              {it.mark === "-" ? "−" : it.mark}
            </button>
            <div className="score-text">{it.text}</div>
            <button
              className="score-del"
              aria-label="Remove"
              onClick={() => onChange(items.filter((x) => x.id !== it.id))}
            >
              ×
            </button>
          </div>
        ))}
        <div className="row" style={{ marginTop: 12 }}>
          <input
            type="text"
            value={text}
            placeholder="Add a daily moment…"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <button className="btn" style={{ width: "auto", minHeight: 48, padding: "12px 18px" }} onClick={add}>
            Add
          </button>
        </div>
      </div>

      {anchors.length > 0 && (
        <div className="card tinted">
          <b>Your most reliable anchors</b>
          <p className="muted small" style={{ marginBottom: 0 }}>
            The unglamorous ones are the best ones. Any <b>=</b> that happens every single
            day is a perfect "After I…" for a new habit.
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Reflection ------------------------------ */

function Reflect({
  past,
  onSave,
  onBack
}: {
  past: Reflection[];
  onSave: (r: Reflection) => void;
  onBack: () => void;
}) {
  const [wentWell, setWentWell] = useState("");
  const [gotInWay, setGotInWay] = useState("");
  const [oneChange, setOneChange] = useState("");

  return (
    <div className="fade-in">
      <button className="linklike" onClick={onBack}>← Toolkit</button>
      <div className="kicker">Weekly reflection</div>
      <h1>Two honest minutes.</h1>

      <label className="field">
        <span>What went well this week?</span>
        <textarea value={wentWell} onChange={(e) => setWentWell(e.target.value)} />
      </label>
      <label className="field">
        <span>What got in the way?</span>
        <textarea value={gotInWay} onChange={(e) => setGotInWay(e.target.value)} />
      </label>
      <label className="field">
        <span>One small change for next week — cue, size, or pairing?</span>
        <textarea value={oneChange} onChange={(e) => setOneChange(e.target.value)} />
      </label>

      <button
        className="btn"
        disabled={!wentWell.trim() && !gotInWay.trim() && !oneChange.trim()}
        onClick={() => onSave({ date: todayKey(), wentWell, gotInWay, oneChange })}
      >
        Save reflection
      </button>

      {past.length > 0 && (
        <>
          <div className="divider" />
          <h2>Earlier</h2>
          {[...past].reverse().slice(0, 6).map((r, i) => (
            <div className="card" key={i}>
              <div className="kicker">{r.date}</div>
              {r.wentWell && <p style={{ margin: "4px 0" }}><b>Well:</b> {r.wentWell}</p>}
              {r.gotInWay && <p style={{ margin: "4px 0" }}><b>In the way:</b> {r.gotInWay}</p>}
              {r.oneChange && <p style={{ margin: "4px 0" }}><b>Next:</b> {r.oneChange}</p>}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
