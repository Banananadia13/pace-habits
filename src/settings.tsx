import { AppState, Settings as SettingsT, clearState } from "./store";

/* ---------------------------------------------------------------------------
   Settings: name, theme, gentle reminder, export, reset. Nothing else.
--------------------------------------------------------------------------- */

export function Settings({
  state,
  setName,
  setSettings
}: {
  state: AppState;
  setName: (n: string) => void;
  setSettings: (s: SettingsT) => void;
}) {
  const s = state.settings;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pace-habits-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    if (!window.confirm("Delete everything on this device? This can't be undone.")) return;
    if (!window.confirm("Really sure? Your habits and history will be gone.")) return;
    clearState();
    location.reload();
  };

  return (
    <div className="fade-in">
      <h1>Settings</h1>

      <div className="card">
        <label className="field" style={{ marginBottom: 0 }}>
          <span>Your name</span>
          <input
            type="text"
            value={state.name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
      </div>

      <div className="card">
        <b>Appearance</b>
        <div className="spacer" />
        <div className="seg">
          {(["auto", "light", "dark"] as const).map((t) => (
            <button
              key={t}
              className={s.theme === t ? "on" : ""}
              onClick={() => setSettings({ ...s, theme: t })}
            >
              {t === "auto" ? "Auto" : t === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="row">
          <div>
            <b>Daily nudge</b>
            <div className="muted small">
              "Ready to cast today's vote?" — shown when you open the app after this time
              with the day still open.
            </div>
          </div>
        </div>
        <div className="spacer" />
        <div className="row">
          <input
            type="time"
            value={s.reminderTime ?? ""}
            onChange={(e) =>
              setSettings({ ...s, reminderTime: e.target.value || null })
            }
            style={{ maxWidth: 160 }}
          />
          {s.reminderTime && (
            <button
              className="linklike"
              onClick={() => setSettings({ ...s, reminderTime: null })}
            >
              Turn off
            </button>
          )}
        </div>
        <p className="muted small" style={{ marginBottom: 0 }}>
          Tip: a phone alarm labelled with your habit ("After I park the car…") is the
          most reliable reminder there is — this app never needs the internet, so it
          can't ping a server to nudge you.
        </p>
      </div>

      <div className="card">
        <b>Your data</b>
        <p className="muted small">
          Everything lives on this device. No account, no cloud, no analytics.
        </p>
        <button className="btn secondary" onClick={exportData}>
          Export my data (JSON)
        </button>
      </div>

      <div className="card">
        <b>Start over</b>
        <p className="muted small">Removes all habits, history and settings from this device.</p>
        <button className="btn secondary" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={reset}>
          Delete everything
        </button>
      </div>

      <p className="muted small" style={{ textAlign: "center" }}>
        PACE Habits · built on the ideas in James Clear's <i>Atomic Habits</i>
      </p>
    </div>
  );
}
