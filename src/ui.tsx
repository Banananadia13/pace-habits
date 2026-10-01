import { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Small shared pieces: chips, sheets, celebration, tab bar icons.     */
/* ------------------------------------------------------------------ */

export function Chips({
  options,
  onPick,
  selected
}: {
  options: string[];
  onPick: (v: string) => void;
  selected?: string;
}) {
  return (
    <div className="chips">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className={"chip" + (selected === o ? " selected" : "")}
          onClick={() => onPick(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Sheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true">
        {children}
      </div>
    </>
  );
}

// PACE Health palette: navy, PACE green, bright green, indigo, mid lavender.
const CONFETTI_COLORS = ["#1C194E", "#76BC1E", "#92D050", "#322D6E", "#E4E3F0"];

export function Celebration({ identity }: { identity: string }) {
  const pieces = Array.from({ length: 22 }, (_, i) => ({
    left: `${(i * 41) % 100}%`,
    delay: `${(i % 7) * 0.06}s`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rot: (i * 53) % 360
  }));
  return (
    <div className="celebrate-backdrop">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti"
          style={{
            left: p.left,
            background: p.color,
            animationDelay: p.delay,
            transform: `rotate(${p.rot}deg)`
          }}
        />
      ))}
      <div className="celebrate-card">
        <div className="checkmark" style={{ margin: "0 auto", width: 64, height: 64 }}>
          <CheckIcon size={30} />
        </div>
        <div className="vote">One vote cast</div>
        <div className="who">for someone who {identity}</div>
      </div>
    </div>
  );
}

/* ------------------------------ icons ------------------------------ */

export function CheckIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.5l4.2 4.3L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11l8-7 8 7v8a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 19v-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 20V10M12 20V4M19 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ToolIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M18.5 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z" fill="currentColor" />
    </svg>
  );
}

export function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.8l1.2 2.6 2.8-.6 1 2.7 2.7 1-.6 2.8 2.1 1.7-2.1 1.7.6 2.8-2.7 1-1 2.7-2.8-.6L12 21.2l-1.2-2.6-2.8.6-1-2.7-2.7-1 .6-2.8L2.8 12l2.1-1.7-.6-2.8 2.7-1 1-2.7 2.8.6L12 2.8z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
