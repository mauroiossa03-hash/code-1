import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { C } from "../../theme.js";
import { supabase } from "../../lib/supabase.js";
import {
  TOPICS, TOPIC_TO_VOLUME, FREE_QUESTIONS_PER_TOPIC,
  MOCK_QUESTIONS, dbQuestionToApp,
} from "../../data.js";
import { Spinner, TopicBadge } from "../../components/primitives.jsx";
import QuestionChart from "../../components/QuestionChart.jsx";
import { Lock, Crown, Check, X, ArrowRight, Sparkles } from "../../components/icons.jsx";
import { ListOrdered, Shuffle } from "lucide-react";

/* Chiave di persistenza del consumo gratuito, per utente e per topic.
   Così rientrando nella sezione il conteggio NON riparte da 15. */
const freeKey = (uid, filter) => `of_freeq_v1:${uid || "anon"}:${filter}`;
const readFree = (uid, filter) => {
  try { return parseInt(localStorage.getItem(freeKey(uid, filter)) || "0", 10) || 0; }
  catch { return 0; }
};
const writeFree = (uid, filter, val) => {
  try { localStorage.setItem(freeKey(uid, filter), String(val)); } catch { /* ignore */ }
};

/* Ordina i quesiti: "modules" = ordine dei learning module (TOPICS) poi id;
   "shuffle" = rimescolamento deterministico (stabile finché non si ripreme Shuffle). */
function orderQuestions(list, order, seed) {
  if (!list || list.length === 0) return [];
  if (order === "shuffle") {
    const a = [...list];
    let s = (seed || 1) >>> 0;
    const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const rank = Object.fromEntries(TOPICS.map((tp, i) => [tp.id, i]));
  return [...list].sort((x, y) => {
    const rx = rank[x.topic] ?? 99, ry = rank[y.topic] ?? 99;
    if (rx !== ry) return rx - ry;
    return (x.id || 0) - (y.id || 0);
  });
}

export default function Quiz({ activeTopic, lang, isPremium, setScreen }) {
  const t = lang === "it";
  const [rawQuestions, setRawQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(true);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [filter, setFilter] = useState(activeTopic && activeTopic !== "all" ? activeTopic : "all");
  const [order, setOrder] = useState("modules");      // "modules" | "shuffle"
  const [shuffleSeed, setShuffleSeed] = useState(1);
  const [uid, setUid] = useState(null);
  const [freeUsed, setFreeUsed] = useState(0);        // quesiti gratuiti già consumati (persistente)
  const [freeLoaded, setFreeLoaded] = useState(false);
  const timerRef = useRef();

  const questions = useMemo(() => orderQuestions(rawQuestions, order, shuffleSeed), [rawQuestions, order, shuffleSeed]);

  /* Utente corrente (per scoping del conteggio gratuito). */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data?.user?.id || "anon"));
  }, []);

  /* Carica il consumo gratuito persistito per (utente, topic). */
  useEffect(() => {
    if (uid == null) return;
    setFreeUsed(readFree(uid, filter));
    setFreeLoaded(true);
  }, [uid, filter]);

  useEffect(() => {
    const load = async () => {
      setLoadingQ(true); setRawQuestions([]); setQIdx(0); setScore({ correct: 0, total: 0 });
      const volumesToLoad = filter === "all" ? Object.values(TOPIC_TO_VOLUME) : TOPIC_TO_VOLUME[filter] ? [TOPIC_TO_VOLUME[filter]] : [];

      if (volumesToLoad.length === 0) {
        setRawQuestions(filter === "all" ? MOCK_QUESTIONS : MOCK_QUESTIONS.filter((q) => q.topic === filter));
        setLoadingQ(false); return;
      }
      const { data, error } = await supabase.from("questions").select("*").in("volume", volumesToLoad).order("id");
      if (error || !data || data.length === 0) {
        setRawQuestions(filter === "all" ? MOCK_QUESTIONS : MOCK_QUESTIONS.filter((q) => q.topic === filter));
      } else {
        setRawQuestions(data.map(dbQuestionToApp));
      }
      setLoadingQ(false);
    };
    load();
  }, [filter]);

  const q = questions[qIdx % Math.max(questions.length, 1)];
  const hitFreeLimit = !isPremium && freeUsed >= FREE_QUESTIONS_PER_TOPIC;
  const remaining = Math.max(0, FREE_QUESTIONS_PER_TOPIC - freeUsed);
  const reveal = () => { clearInterval(timerRef.current); setRevealed(true); };

  useEffect(() => {
    if (!q || loadingQ || hitFreeLimit) return;
    setSelected(null); setRevealed(false); setTimeLeft(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((tl) => { if (tl <= 1) { reveal(); return 0; } return tl - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, [qIdx, filter, loadingQ, order, shuffleSeed]);

  const handleSelect = async (i) => {
    if (revealed || selected !== null) return;
    setSelected(i); reveal();
    const isCorrect = i === q.correct;
    setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const topic = q.topic;
        const { data: existing } = await supabase.from("user_progress")
          .select("questions_answered, questions_correct").eq("user_id", user.id).eq("topic", topic).maybeSingle();
        const newAnswered = (existing?.questions_answered || 0) + 1;
        const newCorrect = (existing?.questions_correct || 0) + (isCorrect ? 1 : 0);
        await supabase.from("user_progress").upsert(
          { user_id: user.id, topic, questions_answered: newAnswered, questions_correct: newCorrect, last_activity: new Date().toISOString() },
          { onConflict: "user_id,topic" }
        );
      }
    } catch (err) {
      console.error("Progress save failed (non-blocking):", err);
    }
  };

  const next = () => {
    // Ogni avanzamento consuma una domanda gratuita (persistita), così il limite
    // si raggiunge davvero e non riparte rientrando nella sezione.
    if (!isPremium) {
      const nv = freeUsed + 1;
      setFreeUsed(nv);
      writeFree(uid, filter, nv);
    }
    setQIdx((qi) => (qi + 1) % Math.max(questions.length, 1));
  };

  const changeOrder = (mode) => {
    setOrder(mode);
    if (mode === "shuffle") setShuffleSeed((s) => (s * 48271 + 1) & 0x7fffffff);
    setQIdx(0);
  };

  const letters = ["A", "B", "C", "D"];
  const timerColor = timeLeft > 20 ? C.green : timeLeft > 10 ? C.amber : C.red;
  const circ = 2 * Math.PI * 22;

  const optStyle = (i) => {
    const base = { borderColor: C.border, bg: C.surfaceUp, badge: C.indigoDim, badgeText: C.indigo, txt: C.text };
    if (!revealed) return selected === i ? { ...base, borderColor: C.indigo, bg: "#fff", badge: C.indigo, badgeText: "#fff" } : base;
    if (i === q.correct) return { borderColor: C.green, bg: C.greenDim, badge: C.green, badgeText: "#fff", txt: C.ink };
    if (i === selected) return { borderColor: C.red, bg: C.redDim, badge: C.red, badgeText: "#fff", txt: C.ink };
    return { ...base, txt: C.textMute };
  };

  const orderBtn = (mode, Icon, label) => (
    <button onClick={() => changeOrder(mode)}
      className={order === mode ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
      style={{ whiteSpace: "nowrap", flexShrink: 0, gap: 6 }}>
      <Icon size={13} /> {label}
    </button>
  );

  return (
    <div style={{ padding: "18px 18px 96px", position: "relative" }}>
      {/* Filtri topic */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 10 }}>
        {[{ id: "all", name: t ? "Tutti" : "All" }, ...TOPICS.slice(0, 3)].map((tp) => (
          <button key={tp.id} onClick={() => { setFilter(tp.id); setQIdx(0); }}
            className={filter === tp.id ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
            style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
            {tp.name}
          </button>
        ))}
        <button className="btn btn-ghost btn-sm" style={{ whiteSpace: "nowrap", flexShrink: 0, opacity: 0.55 }} disabled>
          <Lock size={12} /> {t ? "Altro" : "More"}
        </button>
      </div>

      {/* Ordine: per moduli oppure shuffle */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", overflowX: "auto", paddingBottom: 8, marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: C.textMute, letterSpacing: ".06em", textTransform: "uppercase", flexShrink: 0 }}>
          {t ? "Ordine" : "Order"}
        </span>
        {orderBtn("modules", ListOrdered, t ? "Per moduli" : "By modules")}
        {orderBtn("shuffle", Shuffle, "Shuffle")}
      </div>

      {(loadingQ || !freeLoaded) && <Spinner />}

      {!loadingQ && freeLoaded && hitFreeLimit ? (
        <div style={{ textAlign: "center", padding: "30px 16px" }} className="anim-fadeIn">
          <div style={{ width: 84, height: 84, borderRadius: 24, margin: "0 auto 18px", display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${C.indigoDim}, ${C.violetDim})`, color: C.indigo }}>
            <Lock size={38} />
          </div>
          <h3 className="display" style={{ fontSize: 24, color: C.ink, marginBottom: 10 }}>
            {t ? `Hai usato le ${FREE_QUESTIONS_PER_TOPIC} domande gratuite` : `You've used your ${FREE_QUESTIONS_PER_TOPIC} free questions`}
          </h3>
          <p style={{ fontSize: 13.5, color: C.textSoft, lineHeight: 1.7, marginBottom: 26, maxWidth: 320, marginInline: "auto" }}>
            {t ? `Sblocca tutti i ${TOPICS.find((tp) => tp.id === filter)?.total || 2000}+ quesiti di questo topic con Premium.`
               : `Unlock all ${TOPICS.find((tp) => tp.id === filter)?.total || 2000}+ questions in this topic with Premium.`}
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => setScreen("pricing")}>
            <Crown size={18} /> {t ? "Scopri Premium" : "See Premium Plans"}
          </button>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-ghost btn-md" onClick={() => { setFilter("all"); setQIdx(0); }}>
              {t ? "Cambia topic" : "Change topic"}
            </button>
          </div>
        </div>
      ) : !loadingQ && freeLoaded && q ? (
        <>
          {/* Score bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[
              { label: t ? "Corrette" : "Correct", val: score.correct, color: C.green },
              { label: t ? "Totali" : "Total", val: score.total, color: C.textSoft },
              { label: "Accuracy", val: score.total ? `${Math.round((score.correct / score.total) * 100)}%` : "—", color: C.indigo },
            ].map((s, i) => (
              <div key={i} className="card" style={{ flex: 1, padding: "10px 8px", textAlign: "center" }}>
                <div className="mono" style={{ fontSize: 18, fontWeight: 600, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 9, color: C.textMute, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {!isPremium && (
            <div style={{ marginBottom: 12, padding: "9px 14px", borderRadius: 10, background: C.indigoDim, border: `1px solid ${C.border}`, fontSize: 12, color: C.indigoDeep, fontWeight: 700, display: "flex", alignItems: "center", gap: 7 }}>
              <Sparkles size={14} />
              {t ? `${remaining} domande gratuite rimanenti` : `${remaining} free questions remaining`}
            </div>
          )}

          {/* Question card */}
          <AnimatePresence mode="wait">
            <motion.div key={qIdx} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28 }}
              className="card" style={{ padding: 20, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 12 }}>
                <TopicBadge topic={q.topic} />
                <div style={{ position: "relative", width: 50, height: 50, flexShrink: 0 }}>
                  <svg width="50" height="50" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="25" cy="25" r="22" fill="none" stroke={C.surfaceUp} strokeWidth="4" />
                    <circle cx="25" cy="25" r="22" fill="none" stroke={timerColor} strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={circ} strokeDashoffset={circ * (1 - timeLeft / 30)}
                      style={{ transition: "stroke-dashoffset 1s linear, stroke .4s" }} />
                  </svg>
                  <div className="mono" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 600, color: timerColor }}>{timeLeft}</div>
                </div>
              </div>

              {/* Grafico della domanda (se presente nei dati) */}
              {q.hasChart && q.chartData && <QuestionChart data={q.chartData} />}

              <p className="display" style={{ fontSize: 18, lineHeight: 1.55, color: C.ink, marginBottom: 18, fontWeight: 500 }}>{q.q}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {q.opts.map((opt, i) => {
                  const s = optStyle(i);
                  return (
                    <motion.button key={i} onClick={() => handleSelect(i)} disabled={revealed}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 13, textAlign: "left",
                        background: s.bg, border: `1.5px solid ${s.borderColor}`, color: s.txt,
                        cursor: revealed ? "default" : "pointer", fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 500,
                        transition: "all .25s",
                      }}>
                      <span style={{ width: 28, height: 28, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", background: s.badge, color: s.badgeText, fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, transition: "all .25s" }}>
                        {revealed && i === q.correct ? <Check size={15} /> : revealed && i === selected ? <X size={15} /> : letters[i]}
                      </span>
                      <span style={{ flex: 1 }}>{opt}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Explanation */}
          <AnimatePresence>
            {revealed && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="card" style={{ padding: "16px 18px", marginBottom: 12, borderColor: `${C.indigo}55`, overflow: "hidden" }}>
                <div className="eyebrow" style={{ color: C.indigo, marginBottom: 8 }}>{t ? "Spiegazione" : "Explanation"}</div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: C.textSoft }}>{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {revealed && (
            <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              onClick={next} className="btn btn-primary btn-block" style={{ padding: 14, fontSize: 15 }}>
              {t ? "Prossima Domanda" : "Next Question"} <ArrowRight size={17} />
            </motion.button>
          )}
        </>
      ) : null}
    </div>
  );
}
