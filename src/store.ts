// ---------------------------------------------------------------------------
// PACE Habits — local-first state.
// Everything lives in localStorage. No accounts, no network, no analytics.
// The store is a plain serialisable object so a future sync/export layer
// (EP mode, shared habits, HealthKit) can be added without touching screens.
// ---------------------------------------------------------------------------

export type HabitType = "build" | "break";

export interface Habit {
  id: string;
  type: HabitType;
  /** "someone who …" — the identity this habit votes for */
  identity: string;
  /** optional outcome, kept deliberately in the background */
  outcome?: string;
  /** the full habit ("Walk 45 minutes") */
  name: string;
  /** the two-minute version — what the app actually asks for each day */
  tiny: string;
  /** implementation intention */
  time?: string;
  place?: string;
  /** habit stack anchor: "After I ___" */
  anchor?: string;
  /** environment design note */
  environment?: string;
  /** temptation bundle */
  bundle?: string;
  /** never-miss-twice recovery plan */
  recovery: string;
  /** inverse four laws (break habits only) */
  invisible?: string;
  unattractive?: string;
  difficult?: string;
  unsatisfying?: string;
  replacement?: string;
  createdAt: string; // date key yyyy-mm-dd
  archived?: boolean;
}

export interface ScorecardItem {
  id: string;
  text: string;
  mark: "+" | "-" | "=";
}

export interface Reflection {
  date: string;
  wentWell: string;
  gotInWay: string;
  oneChange: string;
}

export interface Settings {
  theme: "auto" | "light" | "dark";
  reminderTime: string | null; // "HH:MM" or null = off
}

export interface AppState {
  version: 1;
  onboarded: boolean;
  name: string;
  habits: Habit[];
  /** habitId -> array of date keys (yyyy-mm-dd) */
  completions: Record<string, string[]>;
  /** habitId -> date -> feeling */
  feelings: Record<string, Record<string, string>>;
  scorecard: ScorecardItem[];
  reflections: Reflection[];
  settings: Settings;
}

const KEY = "pace-habits-v1";

export const defaultState = (): AppState => ({
  version: 1,
  onboarded: false,
  name: "",
  habits: [],
  completions: {},
  feelings: {},
  scorecard: [],
  reflections: [],
  settings: { theme: "auto", reminderTime: null }
});

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...defaultState(), ...parsed, settings: { ...defaultState().settings, ...(parsed.settings || {}) } };
  } catch {
    return defaultState();
  }
}

export function saveState(s: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage full or unavailable — fail quietly, state stays in memory */
  }
}

export function clearState(): void {
  localStorage.removeItem(KEY);
}

export const uid = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
