/* ──────────────────────────────────────────────────────────
   DESIGN TOKENS — "Aurora Glass"
   Premium light fintech/education system.
   Mirrors the CSS variables in styles.css so JS-driven inline
   styles and the WebGL hero stay in sync.
   ────────────────────────────────────────────────────────── */
export const C = {
  /* base / surfaces */
  bg:          "#EAEFFB",   // cool off-white canvas
  bgDeep:      "#E2E9F8",
  surface:     "#FFFFFF",
  surfaceUp:   "#F2F6FE",
  glass:       "rgba(255,255,255,0.66)",
  glassUp:     "rgba(255,255,255,0.82)",
  border:      "#DCE4F5",
  borderHi:    "#BCCBEC",

  /* brand */
  ink:         "#0B1437",   // near-black navy — dark sections & headings
  navy:        "#142a63",
  indigo:      "#3B5BFF",   // primary
  indigoHi:    "#5A74FF",
  indigoDeep:  "#2A41D8",
  indigoDim:   "#E3E8FF",
  violet:      "#7C5CFF",   // tech accent
  violetDim:   "#EBE6FF",

  /* premium / trust */
  gold:        "#C98A12",   // accessible gold for text/icons on light
  goldBright:  "#F0B429",   // decorative gold (stars, glints)
  goldDim:     "#FBEFCD",

  /* text */
  text:        "#0E1A40",
  textSoft:    "#56689A",
  textMute:    "#8493BC",
  onDark:      "#EAF1FF",
  onDarkSoft:  "#A9B8E6",

  /* semantic */
  green:       "#12A767",
  greenDim:    "#D6F3E5",
  red:         "#E23A63",
  redDim:      "#FBE0E8",
  amber:       "#E08A0B",
  cyan:        "#0CA5C0",
};

/* topic accent colors (kept vivid but harmonised) */
export const TOPIC_COLORS = {
  ethics: "#3B5BFF",
  quant:  "#7C5CFF",
  econ:   "#0CA5C0",
  fra:    "#8B5CF6",
  corp:   "#E0407E",
  equity: "#12A767",
  fi:     "#E08A0B",
  deriv:  "#F0653A",
  alts:   "#9333EA",
  port:   "#0EA5A5",
};
