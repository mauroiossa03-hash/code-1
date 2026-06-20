import { motion } from "framer-motion";
import { C } from "../theme.js";
import { Logo } from "../components/primitives.jsx";
import HeroStage from "../components/HeroStage.jsx";
import {
  Target, Layers3, Timer, BarChart3, ArrowRight, Sparkles, Star,
  ShieldCheck, Globe, GraduationCap, Check,
} from "../components/icons.jsx";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.2, 0.7, 0.3, 1] },
  }),
};

export default function Landing({ setScreen, lang, setLang }) {
  const t = lang === "it";

  const features = t
    ? [
        { Icon: Target, title: "Quiz mirati per topic", desc: "Oltre 2000 domande in stile esame su tutti e 10 gli argomenti, con spiegazioni dettagliate per ogni risposta." },
        { Icon: Layers3, title: "Flashcard intelligenti", desc: "Memorizza formule e concetti chiave con un sistema di ripetizione che si concentra sulle tue aree deboli." },
        { Icon: Timer, title: "Simulatore d'esame reale", desc: "180 domande, 2 sessioni da 270 minuti. Identica all'esperienza del giorno dell'esame CFA." },
        { Icon: BarChart3, title: "Analytics dei progressi", desc: "Monitora accuratezza, tempo e padronanza per ogni topic. Sai sempre dove migliorare." },
      ]
    : [
        { Icon: Target, title: "Topic-focused quizzes", desc: "2000+ exam-style questions across all 10 areas, with detailed explanations for every answer." },
        { Icon: Layers3, title: "Smart flashcards", desc: "Memorize key formulas and concepts with spaced repetition that targets your weak areas." },
        { Icon: Timer, title: "Real exam simulator", desc: "180 questions, 2 × 270-minute sessions. Identical to CFA exam-day experience." },
        { Icon: BarChart3, title: "Progress analytics", desc: "Track accuracy, timing and mastery per topic. Always know what to improve." },
      ];

  const stats = [
    { n: "2,000+", l: t ? "Domande" : "Questions" },
    { n: "10", l: t ? "Topic CFA" : "CFA Topics" },
    { n: "180", l: t ? "Simulatore" : "Exam Sim" },
  ];

  return (
    <div style={{ position: "relative", minHeight: "100dvh", overflow: "hidden", paddingBottom: 40 }}>
      <div className="aurora"><div className="aurora-grid" /></div>

      {/* Header */}
      <header style={{ position: "relative", zIndex: 2, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setLang(t ? "en" : "it")} className="btn btn-ghost btn-sm" aria-label="Switch language">
            <Globe size={14} /> {t ? "EN" : "IT"}
          </button>
          <button onClick={() => setScreen("login")} className="btn btn-primary btn-sm">
            {t ? "Accedi" : "Login"}
          </button>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 1, padding: "8px 22px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        {/* Eyebrow */}
        <motion.div variants={reveal} custom={0} initial="hidden" animate="show"
          className="tag" style={{ background: "rgba(255,255,255,0.7)", color: C.indigo, border: `1px solid ${C.border}`, marginBottom: 18, boxShadow: "var(--shadow-sm)" }}>
          <GraduationCap size={13} /> {t ? "CFA Level 1 — Oltre 2000 Domande" : "CFA Level 1 — 2000+ Questions"}
        </motion.div>

        {/* 3D hero stage */}
        <motion.div variants={reveal} custom={1} initial="hidden" animate="show"
          style={{ position: "relative", width: "100%", height: 290, marginBottom: 4 }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 45%, rgba(124,92,255,0.18), transparent 62%)" }} />
          <HeroStage />
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={reveal} custom={2} initial="hidden" animate="show"
          className="display" style={{ fontSize: "clamp(36px,8.5vw,52px)", marginBottom: 16, color: C.ink }}>
          {t ? <>Supera il CFA <span className="grad-text">Level 1</span> al primo tentativo</>
             : <>Pass the CFA <span className="grad-text">Level 1</span> on your first attempt</>}
        </motion.h1>

        <motion.p variants={reveal} custom={3} initial="hidden" animate="show"
          style={{ fontSize: 15.5, color: C.textSoft, maxWidth: 420, lineHeight: 1.65, marginBottom: 26 }}>
          {t ? "Smetti di studiare alla cieca. Quiz adattivi, simulatore d'esame e analisi dei progressi su tutti e 10 i topic — costruiti per farti superare l'esame, non solo per esercitarti."
             : "Stop studying blind. Adaptive quizzes, a full exam simulator and progress analytics across all 10 topics — built to get you through the exam, not just to practice."}
        </motion.p>

        <motion.div variants={reveal} custom={4} initial="hidden" animate="show"
          style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => setScreen("register")} className="btn btn-primary btn-lg btn-glow">
            {t ? "Inizia Gratis" : "Start Free"} <ArrowRight size={18} />
          </button>
          <button onClick={() => setScreen("pricing")} className="btn btn-ghost btn-lg">
            {t ? "Vedi i piani" : "See pricing"}
          </button>
        </motion.div>

        <motion.div variants={reveal} custom={5} initial="hidden" animate="show"
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.textMute, marginTop: 16, fontWeight: 600 }}>
          <ShieldCheck size={15} color={C.green} /> {t ? "Nessuna carta richiesta · Inizia in 30 secondi" : "No card required · Start in 30 seconds"}
        </motion.div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 44, maxWidth: 440, width: "100%" }}>
          {stats.map((s, i) => (
            <motion.div key={i} variants={reveal} custom={6 + i} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="card tilt" style={{ padding: "18px 10px", textAlign: "center" }}>
              <div className="display grad-text" style={{ fontSize: 30, fontWeight: 600 }}>{s.n}</div>
              <div style={{ fontSize: 11, color: C.textMute, fontWeight: 700, letterSpacing: ".04em", marginTop: 2 }}>{s.l}</div>
            </motion.div>
          ))}
        </div>

        {/* Social proof */}
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="card-glass" style={{ marginTop: 36, padding: "20px 22px", maxWidth: 440, width: "100%" }}>
          <div style={{ display: "flex", gap: 3, justifyContent: "center", marginBottom: 10 }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={17} fill={C.goldBright} color={C.goldBright} />)}
          </div>
          <p className="display" style={{ fontSize: 17, fontStyle: "italic", color: C.text, lineHeight: 1.5, marginBottom: 8 }}>
            {t ? "“Ho passato il Level 1 al primo colpo. Il simulatore è identico all'esame vero.”"
               : "“Passed Level 1 first try. The simulator is identical to the real exam.”"}
          </p>
          <div style={{ fontSize: 12.5, color: C.textMute, fontWeight: 600 }}>— Marco R., CFA Candidate</div>
        </motion.div>

        {/* Features */}
        <div style={{ marginTop: 64, width: "100%", maxWidth: 480 }}>
          <motion.h2 variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="display" style={{ fontSize: 30, color: C.ink, marginBottom: 8 }}>
            {t ? "Tutto ciò che ti serve per superarlo" : "Everything you need to pass"}
          </motion.h2>
          <motion.p variants={reveal} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{ fontSize: 14, color: C.textSoft, marginBottom: 26, lineHeight: 1.6 }}>
            {t ? "Quattro strumenti, un solo obiettivo: portarti all'esame preparato." : "Four tools, one goal: get you to exam day ready."}
          </motion.p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {features.map((f, i) => (
              <motion.div key={i} variants={reveal} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
                className="card card-hover" style={{ padding: 20, textAlign: "left", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, flexShrink: 0, display: "grid", placeItems: "center",
                  background: `linear-gradient(135deg, ${C.indigoDim}, ${C.violetDim})`, color: C.indigo, border: `1px solid ${C.border}` }}>
                  <f.Icon size={24} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize: 15.5, fontWeight: 800, color: C.ink, marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA band */}
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="sheen" style={{ marginTop: 56, width: "100%", maxWidth: 480, padding: "38px 28px", borderRadius: 26, textAlign: "center",
            background: `linear-gradient(150deg, ${C.ink}, ${C.navy} 60%, ${C.indigoDeep})`, boxShadow: "var(--shadow-lg)" }}>
          <div style={{ display: "inline-flex", marginBottom: 14, padding: 12, borderRadius: 16, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.16)" }}>
            <Sparkles size={24} color={C.goldBright} />
          </div>
          <h2 className="display" style={{ fontSize: 28, color: "#fff", marginBottom: 10 }}>
            {t ? "Pronto a iniziare?" : "Ready to start?"}
          </h2>
          <p style={{ fontSize: 14, color: C.onDarkSoft, marginBottom: 22, lineHeight: 1.6 }}>
            {t ? "Unisciti agli studenti che si preparano in modo intelligente. Gratis per cominciare." : "Join students preparing the smart way. Free to start."}
          </p>
          <button onClick={() => setScreen("register")} className="btn btn-white btn-lg">
            {t ? "Crea il tuo account gratuito" : "Create your free account"} <ArrowRight size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: C.onDarkSoft, marginTop: 14 }}>
            <Check size={14} color={C.green} /> {t ? "Garanzia 7 giorni sui piani Premium" : "7-day money-back guarantee on Premium"}
          </div>
        </motion.div>

        {/* Footer */}
        <div style={{ marginTop: 44, paddingTop: 22, borderTop: `1px solid ${C.border}`, width: "100%", maxWidth: 480,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <Logo size={15} />
          <div style={{ fontSize: 12, color: C.textMute }}>© 2026 OddsFinance</div>
        </div>
      </main>
    </div>
  );
}
