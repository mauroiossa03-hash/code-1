import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { C } from "../../theme.js";
import HeroStage from "../../components/HeroStage.jsx";
import { Logo } from "../../components/primitives.jsx";
import {
  GraduationCap, MonitorPlay, Sparkles, ArrowRight, ShieldCheck,
  LineChart, Globe2, Award, Check,
} from "../../components/icons.jsx";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.2, 0.7, 0.3, 1] },
  }),
};

export default function Homepage({ lang, user }) {
  const t = lang === "it";
  const isLogged = !!user;

  // Per i loggati la card CFA punta direttamente alla Dashboard (CTA "Vai al CFA"),
  // per gli anonimi alla landing prodotto (CTA "Esplora CFA").
  const products = [
    {
      Icon: GraduationCap,
      to: isLogged ? "/cfa/dashboard" : "/cfa",
      title: "CFA Prep",
      desc: t ? "Quiz, flashcard e simulatore d'esame su tutti e 10 i topic del CFA Level 1."
              : "Quizzes, flashcards and a full exam simulator across all 10 CFA Level 1 topics.",
      cta: isLogged ? (t ? "Vai al CFA" : "Go to CFA") : (t ? "Esplora CFA" : "Explore CFA"),
      tint: C.indigo,
    },
    {
      Icon: MonitorPlay, to: "/corsi",
      title: t ? "Corsi On-Demand" : "On-Demand Courses",
      desc: t ? "Video corsi registrati su finanza personale, investimenti e macroeconomia."
              : "Recorded video courses on personal finance, investing and macroeconomics.",
      cta: t ? "Vedi i corsi" : "Browse courses",
      tint: C.violet,
    },
    {
      Icon: Sparkles, to: "/pricing",
      title: t ? "Presto: nuovi prodotti" : "Coming soon: more",
      desc: t ? "Stiamo costruendo nuovi percorsi di formazione finanziaria di alto livello."
              : "We're building more high-level financial education tracks.",
      cta: t ? "Scopri i piani" : "See pricing",
      tint: C.cyan,
    },
  ];

  const why = [
    { Icon: Award, title: t ? "Autorevolezza" : "Authority",
      desc: t ? "Contenuti originali, curati e aggiornati da chi lavora nel settore." : "Original content, curated and kept up to date by industry practitioners." },
    { Icon: LineChart, title: t ? "Approccio data-driven" : "Data-driven approach",
      desc: t ? "Analytics dei progressi e percorsi che si adattano alle tue lacune." : "Progress analytics and paths that adapt to your gaps." },
    { Icon: Globe2, title: t ? "Italiano & Inglese" : "Italian & English",
      desc: t ? "Tutta la piattaforma è disponibile in due lingue." : "The whole platform is available in two languages." },
  ];

  // Saluto e CTA cambiano in base allo stato di login. Per il loggato:
  // - tag: "Bentornato, <nome>"
  // - hero CTA: "Vai al CFA" + "I miei corsi"
  // - nessuna riga "Nessuna carta richiesta"
  // - niente CTA band finale "Crea il tuo account"
  const tagText = isLogged
    ? (t ? `Bentornato, ${user.name}` : `Welcome back, ${user.name}`)
    : (t ? "Formazione finanziaria di alto livello" : "High-level financial education");

  return (
    <div style={{ position: "relative", minHeight: "100dvh", overflow: "hidden", paddingBottom: 60 }}>
      <div className="aurora"><div className="aurora-grid" /></div>

      <main style={{ position: "relative", zIndex: 1, padding: "8px 22px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <motion.div variants={reveal} custom={0} initial="hidden" animate="show"
          className="tag" style={{ background: "rgba(255,255,255,0.7)", color: C.indigo, border: `1px solid ${C.border}`, marginTop: 14, marginBottom: 18, boxShadow: "var(--shadow-sm)" }}>
          <Sparkles size={13} /> {tagText}
        </motion.div>

        <motion.div variants={reveal} custom={1} initial="hidden" animate="show"
          style={{ position: "relative", width: "100%", height: 270, marginBottom: 4, maxWidth: 480 }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 45%, rgba(124,92,255,0.18), transparent 62%)" }} />
          <HeroStage />
        </motion.div>

        <motion.h1 variants={reveal} custom={2} initial="hidden" animate="show"
          className="display" style={{ fontSize: "clamp(34px,8.5vw,50px)", marginBottom: 16, color: C.ink, maxWidth: 540 }}>
          {t ? <>La piattaforma italiana per la <span className="grad-text">formazione finanziaria</span> di alto livello</>
             : <>The Italian platform for <span className="grad-text">high-level financial</span> education</>}
        </motion.h1>

        <motion.p variants={reveal} custom={3} initial="hidden" animate="show"
          style={{ fontSize: 15.5, color: C.textSoft, maxWidth: 440, lineHeight: 1.65, marginBottom: 26 }}>
          {t ? "Preparati al CFA, segui corsi video on-demand e costruisci competenze finanziarie reali — tutto in un unico posto, in italiano e inglese."
             : "Prepare for the CFA, follow on-demand video courses and build real financial skills — all in one place, in Italian and English."}
        </motion.p>

        <motion.div variants={reveal} custom={4} initial="hidden" animate="show"
          style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 14 }}>
          {isLogged ? (
            <>
              <Link to="/cfa/dashboard" className="btn btn-primary btn-lg btn-glow">
                {t ? "Vai al CFA" : "Go to CFA"} <ArrowRight size={18} />
              </Link>
              <Link to="/i-miei-corsi" className="btn btn-ghost btn-lg">
                {t ? "I miei corsi" : "My courses"}
              </Link>
            </>
          ) : (
            <>
              <Link to="/cfa" className="btn btn-primary btn-lg btn-glow">
                {t ? "Inizia col CFA" : "Start with CFA"} <ArrowRight size={18} />
              </Link>
              <Link to="/corsi" className="btn btn-ghost btn-lg">
                {t ? "Esplora i corsi" : "Explore courses"}
              </Link>
            </>
          )}
        </motion.div>

        {!isLogged && (
          <motion.div variants={reveal} custom={5} initial="hidden" animate="show"
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.textMute, marginBottom: 8, fontWeight: 600 }}>
            <ShieldCheck size={15} color={C.green} /> {t ? "Nessuna carta richiesta per iniziare" : "No card required to start"}
          </motion.div>
        )}

        {/* Product cards */}
        <div className="cards-grid cols-3" style={{ marginTop: 44, width: "100%", maxWidth: "var(--page-max, 480px)" }}>
          {products.map((p, i) => (
            <motion.div key={p.to + p.title} variants={reveal} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} style={{ height: "100%" }}>
              <Link to={p.to} className="card card-hover" style={{ height: "100%", padding: 20, textAlign: "left", display: "flex", gap: 16, alignItems: "flex-start", textDecoration: "none" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, display: "grid", placeItems: "center",
                  background: `${p.tint}14`, color: p.tint, border: `1px solid ${p.tint}33` }}>
                  <p.Icon size={26} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.6, marginBottom: 8 }}>{p.desc}</div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: p.tint, display: "inline-flex", alignItems: "center", gap: 5 }}>
                    {p.cta} <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Why OddsFinance */}
        <div style={{ marginTop: 60, width: "100%", maxWidth: "var(--page-max, 480px)" }}>
          <motion.h2 variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="display" style={{ fontSize: 28, color: C.ink, marginBottom: 18 }}>
            {t ? "Perché OddsFinance" : "Why OddsFinance"}
          </motion.h2>
          <div className="cards-grid cols-3">
            {why.map((w, i) => (
              <motion.div key={i} variants={reveal} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
                className="card" style={{ height: "100%", padding: 18, textAlign: "left", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: "grid", placeItems: "center",
                  background: `linear-gradient(135deg, ${C.indigoDim}, ${C.violetDim})`, color: C.indigo, border: `1px solid ${C.border}` }}>
                  <w.Icon size={21} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, marginBottom: 3 }}>{w.title}</div>
                  <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.6 }}>{w.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA band: solo per anonimi.
           Per i loggati l'invito a "creare un account" non ha senso;
           gli shortcut alle loro aree sono già nei bottoni in hero + topbar. */}
        {!isLogged && (
          <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="sheen" style={{ marginTop: 56, width: "100%", maxWidth: "var(--page-max, 480px)", padding: "38px 28px", borderRadius: 26, textAlign: "center",
              background: `linear-gradient(150deg, ${C.ink}, ${C.navy} 60%, ${C.indigoDeep})`, boxShadow: "var(--shadow-lg)" }}>
            <h2 className="display" style={{ fontSize: 26, color: "#fff", marginBottom: 10 }}>
              {t ? "Pronto a iniziare?" : "Ready to start?"}
            </h2>
            <p style={{ fontSize: 14, color: C.onDarkSoft, marginBottom: 22, lineHeight: 1.6 }}>
              {t ? "Crea un account gratuito ed esplora CFA Prep e i corsi." : "Create a free account and explore CFA Prep and the courses."}
            </p>
            <Link to="/register" className="btn btn-white btn-lg">
              {t ? "Crea il tuo account" : "Create your account"} <ArrowRight size={18} />
            </Link>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: C.onDarkSoft, marginTop: 14 }}>
              <Check size={14} color={C.green} /> {t ? "Gratis per cominciare" : "Free to start"}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 44, paddingTop: 22, borderTop: `1px solid ${C.border}`, width: "100%", maxWidth: "var(--page-max, 480px)",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <Logo size={15} />
          <div style={{ fontSize: 12, color: C.textMute }}>© 2026 OddsFinance</div>
        </div>
      </main>
    </div>
  );
}
