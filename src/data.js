import { TOPIC_COLORS } from "./theme.js";

/* ── TOPICS ──
   `icon` is a Lucide icon key (resolved in components/icons.jsx).
   No emoji — vector icons keep the UI consistent and themeable. */
export const TOPICS = [
  { id: "ethics", name: "Ethics & Standards",     icon: "scale",     total: 180, free: true  },
  { id: "quant",  name: "Quantitative Methods",   icon: "sigma",     total: 220, free: true  },
  { id: "econ",   name: "Economics",              icon: "trending",  total: 250, free: true  },
  { id: "fra",    name: "Financial Reporting",    icon: "clipboard", total: 280, free: false },
  { id: "corp",   name: "Corporate Finance",      icon: "building",  total: 160, free: false },
  { id: "equity", name: "Equity Investments",     icon: "barchart",  total: 210, free: false },
  { id: "fi",     name: "Fixed Income",           icon: "landmark",  total: 230, free: false },
  { id: "deriv",  name: "Derivatives",            icon: "repeat",    total: 140, free: false },
  { id: "alts",   name: "Alternative Investments",icon: "gem",       total: 120, free: false },
  { id: "port",   name: "Portfolio Management",   icon: "target",    total: 175, free: false },
].map((t) => ({ ...t, color: TOPIC_COLORS[t.id] }));

/* Map topic id → volume name used in the Supabase `questions` table.
   Only loaded volumes appear here; others fall back to mock data. */
export const TOPIC_TO_VOLUME = {
  econ: "Economics Vol 2",
};

export const FREE_QUESTIONS_PER_TOPIC = 15;
export const FREE_FLASHCARDS = 5;

/* Totale dei quesiti disponibili su tutti i topic — usato per la
   percentuale di completamento mostrata in Dashboard. */
export const TOTAL_QUESTIONS = TOPICS.reduce((sum, t) => sum + (t.total || 0), 0);

/* ── FALLBACK MOCK DATA (used when Supabase has no data for a topic) ── */
export const MOCK_QUESTIONS = [
  {
    id: 1, topic: "ethics",
    q: "According to the CFA Institute Code of Ethics, members must act with integrity, competence, diligence, and respect and in an ethical manner with the public, clients, prospective clients, employers, employees, colleagues in the investment profession, and other participants in the global capital markets. Which of the following best describes a violation of this standard?",
    opts: [
      "Disclosing a conflict of interest to a supervisor before executing a trade",
      "Placing personal trades ahead of client trades to benefit from anticipated price movements",
      "Reporting suspected violations of the Code to the CFA Institute",
      "Maintaining client confidentiality while complying with legal requirements",
    ],
    correct: 1,
    explanation:
      "Front-running — placing personal trades before client trades to profit from anticipated price movements — is a clear violation of the duty of loyalty to clients and the prohibition against self-dealing under Standard VI(B) Priority of Transactions.",
  },
  {
    id: 2, topic: "quant",
    q: "An investment has an expected return of 12% with a standard deviation of 8%. Assuming returns are normally distributed, what is the probability that the return will be less than 4%?",
    opts: ["2.28%", "15.87%", "84.13%", "97.72%"],
    correct: 1,
    explanation:
      "4% is exactly one standard deviation below the mean (12% − 8% = 4%). For a normal distribution, approximately 15.87% of outcomes fall more than one standard deviation below the mean.",
  },
  {
    id: 3, topic: "econ",
    q: "When the central bank unexpectedly raises interest rates, which of the following is the most likely immediate effect on the foreign exchange market?",
    opts: [
      "The domestic currency depreciates due to capital outflows",
      "The domestic currency appreciates as foreign capital flows in seeking higher yields",
      "Exchange rates remain stable as markets had anticipated the move",
      "The domestic currency depreciates due to lower inflation expectations",
    ],
    correct: 1,
    explanation:
      "Higher domestic interest rates attract foreign capital seeking better returns, increasing demand for the domestic currency and causing it to appreciate. This is consistent with interest rate parity theory.",
  },
];

export const MOCK_FLASHCARDS = [
  { id: 1, topic: "quant",  front: "What is the formula for the Sharpe Ratio?", back: "Sharpe Ratio = (Rp − Rf) / σp\n\nWhere Rp = portfolio return, Rf = risk-free rate, σp = portfolio standard deviation", tag: "Formula" },
  { id: 2, topic: "ethics", front: "Standard III(A) — Loyalty, Prudence and Care", back: "Members must act for the benefit of their clients and place their clients' interests before their employer's or their own interests. The client's interests always come first.", tag: "Standard" },
  { id: 3, topic: "fi",     front: "What is Modified Duration?", back: "Modified Duration = Macaulay Duration / (1 + y/m)\n\nMeasures the price sensitivity of a bond to interest rate changes. A duration of 5 means ~5% price change per 1% yield change.", tag: "Formula" },
];

/* ── SUPABASE → APP FORMAT CONVERTERS ── */
export function dbQuestionToApp(row) {
  const opts = [row.option_a, row.option_b, row.option_c, row.option_d];
  const correctIndex = { A: 0, B: 1, C: 2, D: 3 }[row.correct_answer] ?? 0;
  const topicId =
    Object.entries(TOPIC_TO_VOLUME).find(([, v]) => v === row.volume)?.[0] || "econ";
  return {
    id: row.id,
    topic: topicId,
    q: row.question_text,
    opts,
    correct: correctIndex,
    explanation: row.explanation,
    difficulty: row.difficulty,
    tags: row.tags || [],
    hasChart: row.has_chart,
    chartData: row.chart_data,
  };
}

export function dbFlashcardToApp(row) {
  const topicId =
    Object.entries(TOPIC_TO_VOLUME).find(([, v]) => v === row.volume)?.[0] || "econ";
  return {
    id: row.id,
    topic: topicId,
    front: row.front,
    back: row.back,
    tag: row.tags?.[0] || "Concept",
  };
}
