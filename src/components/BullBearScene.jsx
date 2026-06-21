/*
  Scena vettoriale (SVG) "bull vs bear" guidata dallo scroll.

  È il "media" che si espande dentro ScrollExpandMedia. Tutto self-contained
  (nessun asset di rete): toro verde a destra, orso rosso a sinistra. Con
  `progress` (0→1): i due caricano verso il centro, si scontrano (impatto +
  scossa), poi il TORO prevale mentre l'ORSO viene respinto e ribaltato.
  L'idle "sul posto" prima dello scroll è dato dal respiro del contenitore
  (.sem-idle in ScrollExpandMedia).
*/
const clamp = (v) => Math.min(1, Math.max(0, v));

export default function BullBearScene({ progress = 0 }) {
  const p = clamp(progress);
  const approach = clamp(p / 0.5);            // 0→1 nella prima metà (avvicinamento)
  const result = clamp((p - 0.5) / 0.5);      // 0→1 nella seconda metà (esito)
  const impact = Math.sin(Math.PI * clamp((p - 0.32) / 0.42)); // picco a metà scontro
  const shake = impact * 7 * Math.sin(p * 70); // vibrazione durante l'urto

  // Orso (rosso): si avvicina, poi viene respinto a sinistra, si ribalta e affonda.
  const bearX = 235 + 80 * approach - 190 * result + shake;
  const bearY = 250 + 42 * result;
  const bearRot = -24 * result;
  const bearScale = 1 - 0.12 * result;

  // Toro (verde): avanza al centro, regge l'urto e si impenna vincitore.
  const bullX = 560 - 90 * approach - 28 * result - shake;
  const bullY = 240 - 14 * result;
  const bullRot = -7 * result;
  const bullScale = 1 + 0.1 * result;

  return (
    <svg viewBox="0 0 800 460" preserveAspectRatio="xMidYMid slice"
      width="100%" height="100%" style={{ display: "block" }} role="img"
      aria-label="Toro verde contro orso rosso">
      <defs>
        <linearGradient id="bbGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5BF0B0" />
          <stop offset="55%" stopColor="#15C06E" />
          <stop offset="100%" stopColor="#0B7C49" />
        </linearGradient>
        <linearGradient id="bbRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF7A93" />
          <stop offset="55%" stopColor="#E5325C" />
          <stop offset="100%" stopColor="#9E1438" />
        </linearGradient>
        <radialGradient id="bbFloor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(18,167,103,0.35)" />
          <stop offset="100%" stopColor="rgba(18,167,103,0)" />
        </radialGradient>
        <filter id="bbGlowG" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="bbGlowR" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* pavimento / arena */}
      <ellipse cx="400" cy="380" rx="360" ry="46" fill="url(#bbFloor)" />

      {/* ── ORSO (rosso) — disegnato rivolto a destra, origine locale 0,0 ── */}
      <g transform={`translate(${bearX} ${bearY}) rotate(${bearRot}) scale(${bearScale})`}
        fill="url(#bbRed)" filter="url(#bbGlowR)" opacity={1 - 0.15 * result}>
        {/* zampe */}
        <rect x="-46" y="34" width="22" height="60" rx="10" />
        <rect x="8" y="40" width="22" height="56" rx="10" />
        {/* corpo voluminoso con gobba */}
        <ellipse cx="-6" cy="6" rx="62" ry="66" />
        <ellipse cx="-26" cy="-34" rx="44" ry="36" />
        {/* braccia alzate (orso che indietreggia) */}
        <rect x="34" y="-6" width="20" height="52" rx="10" transform="rotate(24 44 20)" />
        <rect x="-58" y="-2" width="20" height="50" rx="10" transform="rotate(-18 -48 22)" />
        {/* testa */}
        <circle cx="48" cy="-30" r="33" />
        {/* orecchie */}
        <circle cx="30" cy="-58" r="13" />
        <circle cx="64" cy="-56" r="13" />
        {/* muso */}
        <ellipse cx="76" cy="-22" rx="17" ry="13" />
        {/* occhio + naso (scuri) */}
        <circle cx="56" cy="-36" r="4.2" fill="#3a0a18" />
        <circle cx="90" cy="-24" r="4.6" fill="#3a0a18" />
      </g>

      {/* ── TORO (verde) — disegnato rivolto a sinistra, origine locale 0,0 ── */}
      <g transform={`translate(${bullX} ${bullY}) rotate(${bullRot}) scale(${bullScale})`}
        fill="url(#bbGreen)" filter="url(#bbGlowG)">
        {/* zampe */}
        <rect x="-78" y="34" width="16" height="62" rx="8" />
        <rect x="-44" y="40" width="16" height="58" rx="8" />
        <rect x="40" y="34" width="16" height="62" rx="8" />
        <rect x="72" y="40" width="16" height="58" rx="8" />
        {/* corpo + quarti posteriori */}
        <ellipse cx="20" cy="0" rx="86" ry="50" />
        <ellipse cx="78" cy="-6" rx="42" ry="46" />
        {/* coda */}
        <path d="M116,-14 q34,8 24,52 q-2,12 -12,10 q10,-30 -16,-52 Z" />
        {/* collo/spalla + testa abbassata (carica) */}
        <ellipse cx="-58" cy="-6" rx="46" ry="42" />
        <ellipse cx="-108" cy="10" rx="30" ry="25" />
        {/* muso */}
        <ellipse cx="-134" cy="22" rx="17" ry="12" />
        {/* corna ricurve in avanti (marcate) */}
        <path d="M-120,-16 C-156,-34 -176,-18 -156,8 C-160,-16 -140,-24 -112,-10 Z" />
        <path d="M-98,-18 C-118,-48 -144,-42 -132,-12 C-128,-34 -110,-34 -94,-12 Z" />
        {/* orecchio */}
        <path d="M-82,-16 l-22,-10 l9,20 Z" />
        {/* occhio */}
        <circle cx="-104" cy="6" r="4.2" fill="#06351f" />
        {/* narice (sbuffo) */}
        <circle cx="-140" cy="22" r="3" fill="#06351f" />
      </g>

      {/* ── impatto: nel punto d'incontro delle teste, sopra a tutto ── */}
      <g transform={`translate(${340 - shake} 232) scale(${0.2 + impact})`} opacity={impact}>
        <path d="M0,-44 L11,-12 44,0 11,12 0,44 -11,12 -44,0 -11,-12 Z"
          fill="#EAFBF2" opacity="0.92" />
        <circle cx="0" cy="0" r="13" fill="#9CFFD2" />
      </g>
    </svg>
  );
}
