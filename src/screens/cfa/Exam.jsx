import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { C } from "../../theme.js";
import { supabase } from "../../lib/supabase.js";
import { TOPIC_TO_VOLUME, MOCK_QUESTIONS, dbQuestionToApp } from "../../data.js";
import { Spinner, TopicBadge } from "../../components/primitives.jsx";
import {
  Lock, FileText, Timer, BarChart3, Target, ArrowRight, PartyPopper, Crown, Clock,
} from "../../components/icons.jsx";

const TOTAL_TIME = 270 * 60;
const QUESTIONS_PER_SESSION = 90;

export default function Exam({ lang, isPremium, setScreen }) {
  const t = lang === "it";
  const [phase, setPhase] = useState("intro"); // intro | session | done
  const [examQuestions, setExamQuestions] = useState([]);
  const [loadingExam, setLoadingExam] = useState(false);
  const [session, setSession] = useState(1);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const timerRef = useRef();

  const loadExamQuestions = async () => {
    setLoadingExam(true);
    const volumes = Object.values(TOPIC_TO_VOLUME);
    let all = [];
    if (volumes.length > 0) {
      const { data, error } = await supabase.from("questions").select("*").in("volume", volumes);
      if (!error && data && data.length > 0) all = data.map(dbQuestionToApp);
    }
    if (all.length < 10) all = [...MOCK_QUESTIONS, ...MOCK_QUESTIONS, ...MOCK_QUESTIONS];
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    setExamQuestions(shuffled.slice(0, Math.min(180, shuffled.length)));
    setLoadingExam(false);
  };

  useEffect(() => {
    if (phase === "session") timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const fmtTime = (s) => {
    const r = Math.max(0, TOTAL_TIME - s);
    return `${String(Math.floor(r / 3600)).padStart(2, "0")}:${String(Math.floor((r % 3600) / 60)).padStart(2, "0")}:${String(r % 60).padStart(2, "0")}`;
  };

  const saveResult = async (score, total, sessionNum) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("exam_results").insert({
      user_id: user.id, score, total, module: `Session ${sessionNum}`, volume: "CFA Level I", created_at: new Date().toISOString(),
    });
  };

  const handleEndSession = async () => {
    clearInterval(timerRef.current);
    const sessionQs = examQuestions.slice((session - 1) * QUESTIONS_PER_SESSION, session * QUESTIONS_PER_SESSION);
    let correct = 0;
    sessionQs.forEach((q, i) => {
      const gi = (session - 1) * QUESTIONS_PER_SESSION + i;
      if (answers[gi] === q.correct) correct++;
    });
    const total = sessionQs.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    await saveResult(correct, total, session);
    setResult({ score: correct, total, pct });
    setPhase("done");
  };

  /* ── Pagina informativa per il piano Free ──
     Non reindirizza al pricing: spiega cosa fa la sezione e che è riservata
     agli abbonati, con un CTA non invasivo verso Premium. */
  if (!isPremium) {
    const info = [
      { Icon: FileText, title: t ? "180 domande in stile esame" : "180 exam-style questions", desc: t ? "Estratte da tutti e 10 i topic del CFA Level I." : "Drawn from all 10 CFA Level I topics." },
      { Icon: Timer, title: t ? "2 sessioni da 270 minuti" : "2 × 270-minute sessions", desc: t ? "Stesso ritmo e durata del giorno dell'esame." : "Same pace and duration as exam day." },
      { Icon: BarChart3, title: t ? "Report e punteggio salvato" : "Report & saved score", desc: t ? "Confronto con la soglia di superamento del 70%." : "Compared against the 70% passing threshold." },
      { Icon: Target, title: t ? "Condizioni reali d'esame" : "Real exam conditions", desc: t ? "Timer continuo, niente spiegazioni durante la prova." : "Continuous timer, no explanations mid-exam." },
    ];
    return (
      <div style={{ padding: "32px 22px 96px", position: "relative" }}>
        <div className="aurora" />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 460, margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 86, height: 86, borderRadius: 24, margin: "0 auto 18px", display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${C.indigoDim}, ${C.violetDim})`, color: C.indigo }}>
              <Lock size={40} />
            </div>
            <span className="tag" style={{ background: "rgba(201,138,18,0.12)", color: C.gold, border: "1px solid rgba(201,138,18,0.3)", marginBottom: 14 }}>
              <Crown size={12} /> {t ? "Riservato agli abbonati" : "Subscribers only"}
            </span>
            <h2 className="display" style={{ fontSize: 28, color: C.ink, marginBottom: 10 }}>{t ? "Simulatore d'Esame" : "Exam Simulator"}</h2>
            <p style={{ fontSize: 14, color: C.textSoft, lineHeight: 1.7, marginBottom: 26 }}>
              {t ? "Il simulatore replica l'esame CFA Level I completo. Ecco cosa fa questa sezione — disponibile con il piano Premium."
                 : "The simulator replicates the full CFA Level I exam. Here's what this section does — available on the Premium plan."}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            {info.map((it, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="card" style={{ padding: "14px 16px", display: "flex", gap: 14, alignItems: "center", textAlign: "left" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${C.indigoDim}, ${C.violetDim})`, color: C.indigo }}>
                  <it.Icon size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink, marginBottom: 2 }}>{it.title}</div>
                  <div style={{ fontSize: 12, color: C.textSoft }}>{it.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <button onClick={() => setScreen("pricing")} className="btn btn-primary btn-block btn-lg">
            <Crown size={18} /> {t ? "Sblocca con Premium" : "Unlock with Premium"}
          </button>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button onClick={() => setScreen("dashboard")} className="btn btn-ghost btn-md">
              {t ? "Torna alla dashboard" : "Back to dashboard"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Done ── */
  if (phase === "done" && result) {
    const pass = result.pct >= 70;
    return (
      <div style={{ padding: "32px 20px 96px", textAlign: "center", position: "relative" }}>
        <div className="aurora" />
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} style={{ position: "relative", zIndex: 1 }}>
          <div style={{ width: 86, height: 86, borderRadius: 24, margin: "0 auto 16px", display: "grid", placeItems: "center", background: pass ? C.greenDim : "#FCEEDD", color: pass ? C.green : C.amber }}>
            {pass ? <PartyPopper size={40} /> : <BarChart3 size={40} />}
          </div>
          <h2 className="display" style={{ fontSize: 28, color: C.ink, marginBottom: 4 }}>{t ? "Sessione completata" : "Session complete"}</h2>
          <div className="mono" style={{ fontSize: 52, color: pass ? C.green : C.amber, fontWeight: 600, margin: "16px 0 8px" }}>{result.pct}%</div>
          <p style={{ fontSize: 14, color: C.textSoft, marginBottom: 8 }}>{result.score}/{result.total} {t ? "risposte corrette" : "correct answers"}</p>
          <p style={{ fontSize: 13, color: pass ? C.green : C.amber, fontWeight: 700, marginBottom: 30 }}>
            {pass ? (t ? "Sopra la soglia di superamento stimata (70%)" : "Above estimated passing threshold (70%)")
                  : (t ? "Sotto la soglia di superamento stimata (70%)" : "Below estimated passing threshold (70%)")}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 360, margin: "0 auto" }}>
            {session === 1 && (
              <button className="btn btn-primary btn-block" style={{ padding: 14, fontSize: 15 }} onClick={() => {
                setSession(2); setQIdx(0); setSelected(null); setElapsed(0); setResult(null); setPhase("session");
              }}>
                {t ? "Inizia Sessione 2" : "Start Session 2"} <ArrowRight size={17} />
              </button>
            )}
            <button className="btn btn-ghost btn-block" style={{ padding: 13 }} onClick={() => {
              setPhase("intro"); setSession(1); setQIdx(0); setAnswers({}); setElapsed(0); setResult(null);
            }}>
              {t ? "Ricomincia" : "Restart"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Intro ── */
  if (phase === "intro") {
    const items = [
      { Icon: FileText, title: t ? "180 Domande Totali" : "180 Total Questions", desc: t ? "90 per sessione, come il vero esame" : "90 per session, just like the real exam" },
      { Icon: Timer, title: t ? "270 Minuti per Sessione" : "270 Minutes per Session", desc: t ? "1.5 minuti a domanda" : "1.5 minutes per question" },
      { Icon: BarChart3, title: t ? "Report Dettagliato" : "Detailed Report", desc: t ? "Score salvato nel tuo profilo" : "Score saved to your profile" },
      { Icon: Target, title: t ? "Benchmark 70%" : "70% Benchmark", desc: t ? "Il passing score CFA stimato" : "Estimated CFA passing score" },
    ];
    return (
      <div style={{ padding: "24px 18px 96px", position: "relative" }}>
        <div className="aurora" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 className="display" style={{ fontSize: 26, color: C.ink, marginBottom: 6 }}>{t ? "Simulatore d'Esame" : "Exam Simulator"}</h2>
          <p style={{ fontSize: 13.5, color: C.textSoft, marginBottom: 26, lineHeight: 1.6 }}>
            {t ? "Replica esatta dell'esame CFA Level I. 2 sessioni da 90 domande, 270 minuti ciascuna." : "Exact replica of the CFA Level I exam. 2 sessions of 90 questions, 270 minutes each."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 30 }}>
            {items.map((it, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="card" style={{ padding: "14px 16px", display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${C.indigoDim}, ${C.violetDim})`, color: C.indigo }}>
                  <it.Icon size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink, marginBottom: 2 }}>{it.title}</div>
                  <div style={{ fontSize: 12, color: C.textSoft }}>{it.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <button onClick={async () => { await loadExamQuestions(); setPhase("session"); }}
            className="btn btn-primary btn-block btn-lg" disabled={loadingExam}>
            {loadingExam ? (t ? "Caricamento..." : "Loading...") : (<>{t ? "Inizia Sessione 1" : "Start Session 1"} <ArrowRight size={18} /></>)}
          </button>
        </div>
      </div>
    );
  }

  /* ── Session ── */
  const sessionQs = examQuestions.slice((session - 1) * QUESTIONS_PER_SESSION, session * QUESTIONS_PER_SESSION);
  const q = sessionQs[qIdx];
  if (!q) return <Spinner />;
  const globalIdx = (session - 1) * QUESTIONS_PER_SESSION + qIdx;
  const lowTime = elapsed > TOTAL_TIME * 0.8;

  return (
    <div style={{ padding: "16px 18px 96px" }}>
      {/* Header */}
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, padding: "12px 16px" }}>
        <div>
          <div className="eyebrow" style={{ fontSize: 9.5 }}>{t ? "Sessione" : "Session"} {session}/2</div>
          <div className="mono" style={{ fontSize: 13, color: C.ink, marginTop: 2 }}>Q {qIdx + 1}/{sessionQs.length}</div>
        </div>
        <div style={{ textAlign: "center", display: "flex", alignItems: "center", gap: 7 }}>
          <Clock size={16} color={lowTime ? C.red : C.gold} />
          <div>
            <div className="mono" style={{ fontSize: 19, color: lowTime ? C.red : C.ink, fontWeight: 600 }}>{fmtTime(elapsed)}</div>
            <div style={{ fontSize: 8.5, color: C.textMute, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>{t ? "Rimanente" : "Remaining"}</div>
          </div>
        </div>
        <button onClick={handleEndSession} className="btn btn-ghost btn-sm" style={{ borderColor: C.red, color: C.red }}>{t ? "Fine" : "End"}</button>
      </div>

      <div style={{ height: 3, background: C.surfaceUp, borderRadius: 99, marginBottom: 18, overflow: "hidden" }}>
        <motion.div animate={{ width: `${((qIdx + 1) / sessionQs.length) * 100}%` }} style={{ height: "100%", background: `linear-gradient(90deg, ${C.indigo}, ${C.violet})`, borderRadius: 99 }} />
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 14 }}>
        <TopicBadge topic={q.topic} />
        <p className="display" style={{ fontSize: 17, lineHeight: 1.6, color: C.ink, margin: "16px 0", fontWeight: 500 }}>{q.q}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {q.opts.map((opt, i) => {
            const sel = answers[globalIdx] === i || selected === i;
            return (
              <button key={i} onClick={() => { setSelected(i); setAnswers((p) => ({ ...p, [globalIdx]: i })); }}
                style={{
                  padding: "12px 14px", borderRadius: 12, textAlign: "left",
                  background: sel ? C.indigoDim : C.surfaceUp, border: `1.5px solid ${sel ? C.indigo : C.border}`,
                  color: C.text, cursor: "pointer", fontSize: 13.5, fontWeight: 500, fontFamily: "var(--font-ui)",
                  display: "flex", gap: 10, alignItems: "center", transition: "all .2s",
                }}>
                <span className="mono" style={{ color: sel ? C.indigo : C.textMute, fontSize: 12, fontWeight: 600, minWidth: 16 }}>{"ABCD"[i]}</span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={() => { setSelected(null); if (qIdx + 1 < sessionQs.length) setQIdx((i) => i + 1); else handleEndSession(); }}
        className="btn btn-primary btn-block" style={{ padding: 13, fontSize: 14 }}>
        {qIdx + 1 < sessionQs.length ? (<>{t ? "Successiva" : "Next"} <ArrowRight size={16} /></>) : (t ? "Termina sessione" : "End session")}
      </button>
    </div>
  );
}
