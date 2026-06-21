import { useMemo } from "react";
import { C } from "../theme.js";

/*
  Renderer compatto per i grafici allegati alle domande (campo `chart_data`
  della tabella Supabase `questions`, esposto come q.chartData + q.hasChart).

  Il formato di chart_data non è rigido, quindi normalizziamo difensivamente
  le forme più comuni in { type, series:[{label,value}] }:
    - [1, 2, 3]                        → line
    - [{label,value}] / [{x,y}] / [{name,value}]
    - { labels:[], values:[] }
    - { labels:[], datasets:[{data:[]}] }   (stile Chart.js)
    - { points:[{x,y}] }
    - { type:"bar"|"line", ... }
  Se non riusciamo a interpretare i dati, non rendiamo nulla (la domanda
  resta comunque utilizzabile).
*/
function normalize(raw) {
  let data = raw;
  if (typeof data === "string") {
    try { data = JSON.parse(data); } catch { return null; }
  }
  if (!data) return null;

  let type = (data.type || data.chartType || "").toLowerCase();
  let series = null;

  const toSeries = (arr) =>
    arr
      .map((d, i) => {
        if (typeof d === "number") return { label: String(i + 1), value: d };
        if (d == null) return null;
        const value = d.value ?? d.y ?? d.v ?? d.count;
        const label = d.label ?? d.x ?? d.name ?? d.key ?? String(i + 1);
        return value == null || isNaN(Number(value)) ? null : { label: String(label), value: Number(value) };
      })
      .filter(Boolean);

  if (Array.isArray(data)) {
    series = toSeries(data);
    if (!type) type = data.every((d) => typeof d === "number") ? "line" : "bar";
  } else if (Array.isArray(data.points)) {
    series = toSeries(data.points);
    type = type || "line";
  } else if (Array.isArray(data.values)) {
    const labels = data.labels || [];
    series = data.values.map((v, i) => ({ label: String(labels[i] ?? i + 1), value: Number(v) })).filter((d) => !isNaN(d.value));
    type = type || "bar";
  } else if (Array.isArray(data.datasets) && data.datasets[0]?.data) {
    const labels = data.labels || [];
    series = data.datasets[0].data.map((v, i) => ({ label: String(labels[i] ?? i + 1), value: Number(v) })).filter((d) => !isNaN(d.value));
    type = type || "bar";
  } else if (Array.isArray(data.data)) {
    series = toSeries(data.data);
    type = type || "bar";
  }

  if (!series || series.length === 0) return null;
  return { type: type === "line" || type === "area" ? "line" : "bar", series };
}

export default function QuestionChart({ data, height = 150 }) {
  const chart = useMemo(() => normalize(data), [data]);
  if (!chart) return null;

  const { type, series } = chart;
  const W = 320, H = height, padX = 30, padY = 16;
  const innerW = W - padX * 2, innerH = H - padY * 2;
  const values = series.map((s) => s.value);
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const x = (i) => padX + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
  const y = (v) => padY + innerH - ((v - min) / range) * innerH;
  const baselineY = padY + innerH - ((0 - min) / range) * innerH;

  return (
    <div className="card" style={{ padding: "12px 12px 8px", marginBottom: 16, background: C.surfaceUp }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} role="img" aria-label="Grafico della domanda">
        <defs>
          <linearGradient id="qchartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.indigo} stopOpacity="0.35" />
            <stop offset="100%" stopColor={C.indigo} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* gridlines orizzontali */}
        {[0, 0.5, 1].map((g) => (
          <line key={g} x1={padX} x2={W - padX} y1={padY + innerH * g} y2={padY + innerH * g}
            stroke={C.border} strokeWidth="1" />
        ))}

        {type === "line" ? (
          <>
            <polyline
              points={series.map((s, i) => `${x(i)},${y(s.value)}`).join(" ")}
              fill="none" stroke={C.indigo} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            <polygon
              points={`${x(0)},${baselineY} ${series.map((s, i) => `${x(i)},${y(s.value)}`).join(" ")} ${x(series.length - 1)},${baselineY}`}
              fill="url(#qchartFill)" />
            {series.map((s, i) => (
              <circle key={i} cx={x(i)} cy={y(s.value)} r="3" fill="#fff" stroke={C.indigo} strokeWidth="2" />
            ))}
          </>
        ) : (
          series.map((s, i) => {
            const bw = Math.max(6, (innerW / series.length) * 0.6);
            const bx = padX + (i + 0.5) * (innerW / series.length) - bw / 2;
            const top = Math.min(y(s.value), baselineY);
            const bh = Math.max(2, Math.abs(baselineY - y(s.value)));
            return <rect key={i} x={bx} y={top} width={bw} height={bh} rx="3"
              fill={s.value >= 0 ? C.indigo : C.red} opacity="0.9" />;
          })
        )}

        {/* etichette asse X (max 6 per non affollare) */}
        {series.map((s, i) => {
          const step = Math.ceil(series.length / 6);
          if (i % step !== 0 && i !== series.length - 1) return null;
          return (
            <text key={i} x={x(i)} y={H - 2} textAnchor="middle"
              fill={C.textMute} fontSize="9" fontFamily="var(--font-mono)">{s.label}</text>
          );
        })}
      </svg>
    </div>
  );
}
