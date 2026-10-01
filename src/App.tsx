import { useEffect, useMemo, useState } from "react";
import {
  AppState,
  Habit,
  Reflection,
  ScorecardItem,
  Settings as SettingsT,
  loadState,
  saveState
} from "./store";
import { todayKey } from "./logic";
import { Onboarding } from "./onboarding";
import { Home } from "./home";
import { Progress } from "./progress";
import { Toolkit } from "./toolkit";
import { Settings } from "./settings";
import { HomeIcon, ChartIcon, ToolIcon, GearIcon } from "./ui";

type View = "home" | "progress" | "toolkit" | "settings";

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [view, setView] = useState<View>("home");
  const [nudge, setNudge] = useState(false);

  // persist on every change
  useEffect(() => saveState(state), [state]);

  // theme
  useEffect(() => {
    const apply = () => {
      const pref = state.settings.theme;
      const dark =
        pref === "dark" ||
        (pref === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", dark ? "#141230" : "#FFFFFF");
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [state.settings.theme]);

  // in-app nudge: reminder time passed, today's vote still open
  useEffect(() => {
    const t = state.settings.reminderTime;
    if (!t || !state.onboarded) return;
    const [hh, mm] = t.split(":").map(Number);
    const now = new Date();
    const passed = now.getHours() > hh || (now.getHours() === hh && now.getMinutes() >= mm);
    const anyOpen = state.habits.some(
      (h) => !h.archived && !(state.completions[h.id] || []).includes(todayKey())
    );
    setNudge(passed && anyOpen);
  }, [state]);

  /* ------------------------------ mutations ------------------------------ */

  const complete = (habitId: string) =>
    setState((s) => {
      const list = s.completions[habitId] || [];
      if (list.includes(todayKey())) return s;
      return {
        ...s,
        completions: { ...s.completions, [habitId]: [...list, todayKey()] }
      };
    });

  const undo = (habitId: string) =>
    setState((s) => ({
      ...s,
      completions: {
        ...s.completions,
        [habitId]: (s.completions[habitId] || []).filter((d) => d !== todayKey())
      }
    }));

  const setFeeling = (habitId: string, date: string, feeling: string) =>
    setState((s) => ({
      ...s,
      feelings: {
        ...s.feelings,
        [habitId]: { ...(s.feelings[habitId] || {}), [date]: feeling }
      }
    }));

  const addHabit = (h: Habit) => setState((s) => ({ ...s, habits: [...s.habits, h] }));

  const updateHabit = (h: Habit) =>
    setState((s) => ({
      ...s,
      habits: s.habits.map((x) => (x.id === h.id ? h : x))
    }));

  const archiveHabit = (id: string) =>
    setState((s) => ({
      ...s,
      habits: s.habits.map((x) => (x.id === id ? { ...x, archived: true } : x))
    }));

  const setScorecard = (items: ScorecardItem[]) =>
    setState((s) => ({ ...s, scorecard: items }));

  const addReflection = (r: Reflection) =>
    setState((s) => ({ ...s, reflections: [...s.reflections, r] }));

  const setName = (name: string) => setState((s) => ({ ...s, name }));

  const setSettings = (settings: SettingsT) => setState((s) => ({ ...s, settings }));

  const finishOnboarding = (name: string, habit: Habit) =>
    setState((s) => ({ ...s, name, habits: [habit], onboarded: true }));

  /* -------------------------------- render -------------------------------- */

  const tabs = useMemo(
    () =>
      [
        ["home", "Today", <HomeIcon key="h" />],
        ["progress", "Progress", <ChartIcon key="p" />],
        ["toolkit", "Toolkit", <ToolIcon key="t" />],
        ["settings", "Settings", <GearIcon key="s" />]
      ] as [View, string, JSX.Element][],
    []
  );

  if (!state.onboarded)
    return (
      <div className="app">
        <Onboarding onFinish={finishOnboarding} />
      </div>
    );

  return (
    <div className="app">
      {nudge && view === "home" && (
        <div className="recovery" role="status">
          <b>Time to cast another vote.</b>
          Ready to become someone who {state.habits.find((h) => !h.archived)?.identity}?
        </div>
      )}

      {view === "home" && (
        <Home state={state} complete={complete} undo={undo} setFeeling={setFeeling} />
      )}
      {view === "progress" && <Progress state={state} />}
      {view === "toolkit" && (
        <Toolkit
          state={state}
          addHabit={addHabit}
          updateHabit={updateHabit}
          archiveHabit={archiveHabit}
          setScorecard={setScorecard}
          addReflection={addReflection}
        />
      )}
      {view === "settings" && (
        <Settings state={state} setName={setName} setSettings={setSettings} />
      )}

      <nav className="tabbar" aria-label="Main">
        {tabs.map(([v, label, icon]) => (
          <button
            key={v}
            className={"tab" + (view === v ? " active" : "")}
            onClick={() => setView(v)}
            aria-current={view === v ? "page" : undefined}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
