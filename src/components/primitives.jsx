import { C } from "../theme.js";
import { TOPICS } from "../data.js";
import { TopicIcon } from "./icons.jsx";

/* ── Brand mark: bar chart + bell curve on a navy chip ── */
export function LogoMark({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ flexShrink: 0, display: "block" }} aria-hidden="true">
      <defs>
        <linearGradient id="lgChip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#16235A" /><stop offset="100%" stopColor="#0B1437" />
        </linearGradient>
        <linearGradient id="lgBar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#2A41D8" /><stop offset="100%" stopColor="#7C5CFF" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="96" height="96" rx="26" fill="url(#lgChip)" stroke="#2B3F7A" strokeWidth="1" />
      <g>
        <rect x="20" y="58" width="6" height="22" rx="2" fill="url(#lgBar)" opacity="0.85" />
        <rect x="30" y="48" width="6" height="32" rx="2" fill="url(#lgBar)" opacity="0.92" />
        <rect x="40" y="32" width="6" height="48" rx="2" fill="#EAF1FF" />
        <rect x="50" y="38" width="6" height="42" rx="2" fill="url(#lgBar)" />
        <rect x="60" y="48" width="6" height="32" rx="2" fill="url(#lgBar)" opacity="0.92" />
        <rect x="70" y="58" width="6" height="22" rx="2" fill="url(#lgBar)" opacity="0.85" />
      </g>
      <path d="M16 66 Q34 60 43 38 Q49 24 53 38 Q62 60 84 66" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

export function Logo({ size = 19, compact = false, onDark = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <LogoMark size={size * 1.95} />
      {!compact && (
        <span
          className="display"
          style={{
            fontWeight: 600, fontSize: size, letterSpacing: "-0.02em",
            color: onDark ? "#EAF1FF" : C.ink, whiteSpace: "nowrap", lineHeight: 1.1,
          }}
        >
          Odds<span style={{ color: C.indigo }}>Finance</span>
        </span>
      )}
    </div>
  );
}

/* ── Progress ring ── */
export function ProgressRing({ pct, size = 56, stroke = 5, color = C.indigo, track = C.border, gradient = true }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const id = `ring-${Math.round(pct)}-${size}`;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }} aria-hidden="true">
      {gradient && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={C.indigo} /><stop offset="100%" stopColor={C.violet} />
          </linearGradient>
        </defs>
      )}
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={gradient ? `url(#${id})` : color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,.7,.3,1)" }}
      />
    </svg>
  );
}

/* ── Spinner ── */
export function Spinner({ pad = 60 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: `${pad}px 0` }}>
      <div
        style={{
          width: 34, height: 34, borderRadius: "50%",
          border: `3px solid ${C.border}`, borderTopColor: C.indigo,
          animation: "spin .7s linear infinite",
        }}
      />
    </div>
  );
}

/* ── Skeleton block ── */
export function Skeleton({ h = 14, w = "100%", r = 10, style }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: r, ...style }} />;
}

/* ── Topic badge ── */
export function TopicBadge({ topic, withIcon = true }) {
  const t = TOPICS.find((x) => x.id === topic) || TOPICS[0];
  return (
    <span className="tag" style={{ background: `${t.color}18`, color: t.color, border: `1px solid ${t.color}38` }}>
      {withIcon && <TopicIcon name={t.icon} size={12} strokeWidth={2.4} />}
      {t.name}
    </span>
  );
}
