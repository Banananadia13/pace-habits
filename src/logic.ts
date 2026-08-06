// ---------------------------------------------------------------------------
// Pure date / streak / vote logic. No DOM, no storage — easily testable.
// Dates are local-timezone keys "yyyy-mm-dd" so a habit completed at 11pm
// counts for the right day wherever the user is.
// ---------------------------------------------------------------------------

export const dateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const todayKey = (): string => dateKey(new Date());

export function shiftDay(key: string, delta: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return dateKey(new Date(y, m - 1, d + delta));
}

/** Streak ending today (or yesterday, if today isn't done yet). */
export function currentStreak(done: Set<string>): number {
  let day = todayKey();
  if (!done.has(day)) day = shiftDay(day, -1);
  let n = 0;
  while (done.has(day)) {
    n++;
    day = shiftDay(day, -1);
  }
  return n;
}

export function longestStreak(dates: string[]): number {
  const s = new Set(dates);
  let best = 0;
  for (const d of s) {
    if (s.has(shiftDay(d, -1))) continue; // not a streak start
    let n = 0;
    let cur = d;
    while (s.has(cur)) {
      n++;
      cur = shiftDay(cur, 1);
    }
    if (n > best) best = n;
  }
  return best;
}

/** Completions in the last 7 days including today. */
export function last7(done: Set<string>): number {
  let n = 0;
  for (let i = 0; i < 7; i++) if (done.has(shiftDay(todayKey(), -i))) n++;
  return n;
}

/** Votes (completions) in the last 30 days. */
export function last30(done: Set<string>): number {
  let n = 0;
  for (let i = 0; i < 30; i++) if (done.has(shiftDay(todayKey(), -i))) n++;
  return n;
}

/** Inclusive day count since the habit started (minimum 1). */
export function daysSince(startKey: string): number {
  const [y, m, d] = startKey.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const now = new Date();
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.max(1, Math.round((now.getTime() - start.getTime()) / 86400000) + 1);
}

export function completionPct(done: Set<string>, startKey: string): number {
  return Math.min(100, Math.round((100 * done.size) / daysSince(startKey)));
}

/** True when yesterday was missed (and today not yet done) for a habit that
 *  existed before yesterday — the "never miss twice" moment. */
export function missedYesterday(done: Set<string>, createdAt: string): boolean {
  const yesterday = shiftDay(todayKey(), -1);
  if (createdAt > yesterday) return false;
  return !done.has(yesterday) && !done.has(todayKey());
}

/** Month grid, Monday-first. null cells pad the first/last week. */
export function monthGrid(year: number, month: number): (string | null)[] {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysIn = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(dateKey(new Date(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function greeting(name: string): string {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return name ? `${part}, ${name}.` : `${part}.`;
}

/** Human confidence label from recent votes — deliberately words, not a score. */
export function identityConfidence(votes30: number): string {
  if (votes30 >= 25) return "Becoming you";
  if (votes30 >= 15) return "Strong";
  if (votes30 >= 5) return "Growing";
  if (votes30 >= 1) return "Just starting";
  return "Ready when you are";
}

/** Goldilocks nudge: true when the last few completions all felt easy. */
export function feelsAutomatic(feelings: Record<string, string>, done: string[]): boolean {
  const recent = [...done].sort().slice(-5);
  if (recent.length < 5) return false;
  return recent.every((d) => feelings[d] === "easy");
}
