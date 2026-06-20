import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { C } from "../theme.js";
import { supabase } from "../lib/supabase.js";
import { TOPICS, FREE_QUESTIONS_PER_TOPIC } from "../data.js";
import { ProgressRing } from "../components/primitives.jsx";
import { TopicIcon } from "../components/icons.jsx";
import {
  CheckCircle2, Target, BookOpen, CalendarDays, Lock, ChevronRight, Crown, Sparkles,
} from "../components/icons.jsx";

export default function Dashboard({ setScreen, setActiveTopic, lang, isPremium, user }) {
  const t = lang === "it";
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select("topic, questions_answered, questions_correct");
      if (!error && data) {
        const map = {};
        data.forEach((row) => {
          map[row.topic] = {
            answered: row.questions_answered,
            correct: row.questions_correct,
            pct: row.questions_answered > 0 ? Math.round((row.questions_correct / row.questions_answered) * 100) : 0,
          };
        });
        setProgress(map);
      }
      setLoading(false);
    };
    loadProgress();
  }, []);

  const totalAnswered = Object.values(progress).reduce((a, b) => a + (b.answered || 0), 0);
  const totalCorrect = Object.values(progress).reduce((a, b) => a + (b.correct || 0), 0);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const overall = Math.round(Object.values(progress).reduce((a, b) => a + (b.pct || 0), 0) / TOPICS.length);
  const daysLeft = Math.max(0, Math.ceil((new Date("2026-11-15") - new Date()) / (1000 * 60 * 60 * 24)));

  const stats = [
    { Icon: CheckCircle2, val: loading ? "…" : totalAnswered, label: t ? "Risposte" : "Answered", color: C.indigo },
    { Icon: Target, val: loading ? "…" : `${accuracy}%`, label: "Accuracy", color: C.green },
    { Icon: BookOpen, val: loading ? "…" : `${Object.keys(progress).length}/10`, label: t ? "Topic" : "Topics", color: C.violet },
  ];

  return (
    <div style={{ position: "relative", padding: "22px 18px 96px" }}>
      <div className="aurora" />
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div className="eyebrow">{t ? "Bentornato" : "Welcome back"}</div>
            <div className="display" style={{ fontSize: 26, color: C.ink, marginTop: 3 }}>{user?.name || "Studente"}</div>
          </div>
          <div style={{ position: "relative" }}>
            <ProgressRing pct={overall || 0} size={58} />
            <div className="mono" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 600, color: C.indigo }}>
              {overall || 0}%
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card" style={{ padding: "16px 8px", textAlign: "center" }}>
              <div style={{ display: "grid", placeItems: "center", marginBottom: 6, color: s.color }}><s.Icon size={20} /></div>
              <div className="mono" style={{ fontSize: 19, fontWeight: 600, color: C.ink }}>{s.val}</div>
              <div style={{ fontSize: 10, color: C.textMute, fontWeight: 700, letterSpacing: ".04em", marginTop: 2 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Exam countdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="sheen" style={{ padding: "18px 20px", marginBottom: 22, borderRadius: 20, background: `linear-gradient(140deg, ${C.ink}, ${C.navy} 70%, ${C.indigoDeep})`, boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.onDarkSoft, fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 5 }}>
                <CalendarDays size={13} /> {t ? "Prossimo Esame" : "Next Exam"}
              </div>
              <div className="display" style={{ fontSize: 19, color: "#fff" }}>CFA Level I — Nov 2026</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="mono" style={{ fontSize: 28, color: C.goldBright, fontWeight: 600, lineHeight: 1 }}>{daysLeft}</div>
              <div style={{ fontSize: 9.5, color: C.onDarkSoft, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginTop: 2 }}>{t ? "giorni" : "days"}</div>
            </div>
          </div>
        </motion.div>

        {/* Topics */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: C.ink, letterSpacing: "-.01em" }}>{t ? "Topic" : "Topics"}</h2>
          <span style={{ fontSize: 12, color: C.textMute, fontWeight: 600 }}>{t ? "10 aree" : "10 areas"}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TOPICS.map((tp, i) => {
            const p = progress[tp.id] || { pct: 0, answered: 0 };
            const locked = !tp.free && !isPremium;
            const freeLabel = !isPremium && tp.free ? ` · ${FREE_QUESTIONS_PER_TOPIC} free` : "";
            return (
              <motion.div key={tp.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
                onClick={() => { if (!locked) { setActiveTopic(tp.id); setScreen("quiz"); } }}
                className={locked ? "card" : "card card-hover tilt"}
                style={{ padding: "14px 15px", opacity: locked ? 0.7 : 1, cursor: locked ? "default" : "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: "grid", placeItems: "center", background: `${tp.color}16`, color: tp.color, border: `1px solid ${tp.color}2a` }}>
                    <TopicIcon name={tp.icon} size={20} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: locked ? C.textMute : C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "62%" }}>{tp.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        {locked && <Lock size={12} color={C.textMute} />}
                        <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: locked ? C.textMute : tp.color }}>{loading ? "…" : `${p.pct}%`}</span>
                      </div>
                    </div>
                    <div style={{ height: 5, background: C.surfaceUp, borderRadius: 99, overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} transition={{ duration: 0.8, delay: 0.1 + i * 0.03 }}
                        style={{ height: "100%", background: locked ? C.border : `linear-gradient(90deg, ${tp.color}, ${tp.color}bb)`, borderRadius: 99 }} />
                    </div>
                    <div style={{ fontSize: 10.5, color: C.textMute, marginTop: 5 }}>
                      {locked ? (t ? "Sblocca con Premium" : "Unlock with Premium")
                              : `${p.answered} ${t ? "risposte" : "answered"} · ${tp.total} ${t ? "totali" : "total"}${freeLabel}`}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {!isPremium && (
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            onClick={() => setScreen("pricing")} className="card card-hover sheen"
            style={{ padding: "18px 20px", marginTop: 16, background: `linear-gradient(135deg, ${C.indigoDim}, ${C.violetDim})`, borderColor: C.borderHi }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: "#fff", color: C.gold, boxShadow: "var(--shadow-sm)" }}>
                <Crown size={22} />
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: C.ink, marginBottom: 2, display: "flex", alignItems: "center", gap: 5 }}>
                  {t ? "Sblocca Premium" : "Unlock Premium"} <Sparkles size={14} color={C.gold} />
                </div>
                <div style={{ fontSize: 12, color: C.textSoft }}>{t ? "Accedi a tutti i 2000+ quesiti" : "Access all 2000+ questions"}</div>
              </div>
              <ChevronRight size={20} color={C.indigo} style={{ marginLeft: "auto" }} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
