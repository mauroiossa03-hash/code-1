import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { C } from "../theme.js";
import { buildCfaCheckoutUrl, buildCourseCheckoutUrl } from "../lib/checkout.js";
import { fetchPublishedCourses, formatDuration } from "../data/courses.js";
import {
  ArrowLeft, ArrowRight, Check, X, ShieldCheck, Crown, MonitorPlay, Gauge, Clock,
  AlertTriangle,
} from "../components/icons.jsx";

const LEVELS = {
  beginner:     { it: "Base",        en: "Beginner" },
  intermediate: { it: "Intermedio",  en: "Intermediate" },
  advanced:     { it: "Avanzato",    en: "Advanced" },
};

export default function Pricing({ lang, user }) {
  const t = lang === "it";
  const navigate = useNavigate();
  const [tab, setTab] = useState("cfa"); // cfa | courses
  const [billing, setBilling] = useState("monthly");
  const [courses, setCourses] = useState(null);
  // Banner di errore mostrato in cima quando il checkout di un corso non parte
  // (di solito perché manca lemonsqueezy_variant_id sul corso). Prima il flow
  // navigava in silenzio al catalogo: l'utente non capiva perché.
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    fetchPublishedCourses().then(setCourses).catch(() => setCourses([]));
  }, []);

  const plans = [
    {
      name: "Free", price: 0, period: "", primary: false,
      features: t ? ["15 domande per topic", "3 topic sbloccati", "5 flashcard"] : ["15 questions per topic", "3 unlocked topics", "5 flashcards"],
      locked: t ? ["Topic avanzati", "Simulatore esame", "Statistiche complete"] : ["Advanced topics", "Exam simulator", "Full analytics"],
      cta: t ? "Inizia Gratis" : "Start Free",
    },
    {
      name: "Premium", price: billing === "monthly" ? 29 : 19, period: t ? `/mese${billing === "annual" ? " × 12" : ""}` : "/mo",
      primary: true, badge: t ? "Più popolare" : "Most popular",
      features: t
        ? ["2000+ domande CFA Level I", "Tutti i 10 topic", "500+ flashcard", "Simulatore esame completo", "Analytics per topic", "Weak area detection", "Aggiornamenti gratuiti", "IT & EN"]
        : ["2000+ CFA Level I questions", "All 10 topics", "500+ flashcards", "Full exam simulator", "Per-topic analytics", "Weak area detection", "Free updates", "IT & EN"],
      cta: t ? "Inizia ora" : "Get started",
    },
  ];

  const handleCfaCta = (plan) => {
    if (!plan.primary) { navigate(user ? "/cfa/dashboard" : "/register"); return; }
    if (!user) { navigate(`/login?next=${encodeURIComponent("/pricing")}`); return; }
    window.location.href = buildCfaCheckoutUrl(user, billing);
  };

  const handleCourseCta = (course) => {
    if (!user) { navigate(`/login?next=${encodeURIComponent("/pricing")}`); return; }
    try {
      setCheckoutError("");
      window.location.href = buildCourseCheckoutUrl(user, course);
    } catch (e) {
      console.error("buildCourseCheckoutUrl failed:", e);
      setCheckoutError(t
        ? `Acquisto temporaneamente non disponibile per “${course.title}”. Stiamo lavorando per riattivarlo a breve.`
        : `Checkout temporarily unavailable for “${course.title}”. We're working to bring it back soon.`);
    }
  };

  return (
    <div style={{ padding: "22px 18px 96px", position: "relative" }}>
      <div className="aurora" />
      <div style={{ position: "relative", zIndex: 1, maxWidth: "var(--page-max, 480px)", margin: "0 auto" }}>
        {!user && (
          <Link to="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
            <ArrowLeft size={15} /> {t ? "Indietro" : "Back"}
          </Link>
        )}

        {/* Banner errore checkout */}
        <AnimatePresence>
          {checkoutError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              role="alert"
              style={{
                marginBottom: 16, padding: "12px 14px", borderRadius: 12,
                background: "rgba(220, 38, 38, 0.08)", border: "1px solid rgba(220, 38, 38, 0.25)",
                color: C.red, fontSize: 13, lineHeight: 1.55,
                display: "flex", alignItems: "flex-start", gap: 10,
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>{checkoutError}</div>
              <button
                onClick={() => setCheckoutError("")}
                aria-label="dismiss"
                style={{ background: "transparent", border: "none", color: C.red, cursor: "pointer", padding: 0, lineHeight: 1 }}
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="tag" style={{ background: "rgba(255,255,255,0.7)", color: C.indigo, border: `1px solid ${C.border}`, marginBottom: 12 }}>{t ? "Prezzi" : "Pricing"}</div>
          <h2 className="display" style={{ fontSize: 30, color: C.ink, marginBottom: 8 }}>{t ? "Scegli cosa imparare" : "Choose what to learn"}</h2>
          <p style={{ fontSize: 13.5, color: C.textSoft }}>{t ? "Abbonamento CFA o corsi singoli. Nessuna sorpresa." : "CFA subscription or individual courses. No surprises."}</p>
        </div>

        {/* Segment CFA | Corsi */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
          <div style={{ display: "flex", background: C.surface, borderRadius: 12, padding: 4, border: `1px solid ${C.border}`, boxShadow: "var(--shadow-sm)" }}>
            {[["cfa", t ? "CFA Premium" : "CFA Premium"], ["courses", t ? "Corsi" : "Courses"]].map(([id, label]) => (
              <button key={id} onClick={() => { setTab(id); setCheckoutError(""); }}
                style={{ padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-ui)",
                  background: tab === id ? `linear-gradient(135deg, ${C.indigo}, ${C.indigoDeep})` : "transparent",
                  color: tab === id ? "#fff" : C.textSoft, transition: "all .2s" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === "cfa" ? (
          <>
            {/* Billing toggle */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
              <div style={{ display: "flex", background: C.surface, borderRadius: 12, padding: 4, border: `1px solid ${C.border}`, boxShadow: "var(--shadow-sm)" }}>
                {["monthly", "annual"].map((b) => (
                  <button key={b} onClick={() => setBilling(b)}
                    style={{ padding: "9px 18px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-ui)",
                      background: billing === b ? `linear-gradient(135deg, ${C.indigo}, ${C.indigoDeep})` : "transparent",
                      color: billing === b ? "#fff" : C.textSoft, transition: "all .2s" }}>
                    {b === "monthly" ? (t ? "Mensile" : "Monthly") : (t ? "Annuale -35%" : "Annual -35%")}
                  </button>
                ))}
              </div>
            </div>

            <div className="cards-grid" style={{ alignItems: "stretch" }}>
              {plans.map((plan, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  style={{ position: "relative", marginTop: plan.badge ? 14 : 0, height: "100%" }}>
                  {plan.badge && (
                    <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", zIndex: 2, whiteSpace: "nowrap" }}>
                      <span className="tag" style={{ background: `linear-gradient(135deg, #FFD66B, ${C.goldBright})`, color: "#3a2a00", padding: "5px 14px", boxShadow: "var(--shadow-md)" }}>
                        <Crown size={12} /> {plan.badge}
                      </span>
                    </div>
                  )}
                  <div className={plan.primary ? "sheen" : ""}
                    style={{ height: "100%", padding: "24px 20px", borderRadius: 22, position: "relative",
                      border: `1.5px solid ${plan.primary ? "transparent" : C.border}`,
                      background: plan.primary ? `linear-gradient(150deg, ${C.ink}, ${C.navy} 65%, ${C.indigoDeep})` : C.surface,
                      boxShadow: plan.primary ? "var(--shadow-lg)" : "var(--shadow-sm)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: plan.primary ? "#fff" : C.ink }}>{plan.name}</div>
                      {plan.price === 0 && <div style={{ fontSize: 12, color: C.textMute, marginTop: 2 }}>{t ? "Per sempre gratis" : "Free forever"}</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="display" style={{ fontSize: 34, fontWeight: 600, color: plan.primary ? "#fff" : C.ink }}>€{plan.price}</span>
                      <span style={{ fontSize: 12, color: plan.primary ? C.onDarkSoft : C.textMute }}>{plan.period}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
                    {plan.features.map((f, j) => (
                      <div key={j} style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 13 }}>
                        <span style={{ width: 18, height: 18, borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0, background: plan.primary ? "rgba(18,167,103,0.25)" : C.greenDim, color: plan.primary ? "#4ADE80" : C.green }}>
                          <Check size={12} strokeWidth={3} />
                        </span>
                        <span style={{ color: plan.primary ? "#EAF1FF" : C.textSoft }}>{f}</span>
                      </div>
                    ))}
                    {plan.locked?.map((f, j) => (
                      <div key={j} style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 13, opacity: 0.5 }}>
                        <span style={{ width: 18, height: 18, borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0, background: C.surfaceUp, color: C.textMute }}>
                          <X size={12} strokeWidth={3} />
                        </span>
                        <span style={{ color: C.textMute }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => handleCfaCta(plan)} className={plan.primary ? "btn btn-gold btn-block" : "btn btn-ghost btn-block"} style={{ padding: 13 }}>
                    {plan.cta} <ArrowRight size={16} />
                  </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          /* ---- Corsi ---- */
          <div className="cards-grid">
            {courses === null ? (
              <div style={{ textAlign: "center", color: C.textMute, padding: "30px 0", fontSize: 13 }}>{t ? "Caricamento…" : "Loading…"}</div>
            ) : courses.length === 0 ? (
              <div className="card" style={{ padding: "36px 24px", textAlign: "center" }}>
                <div style={{ width: 54, height: 54, borderRadius: 15, margin: "0 auto 14px", display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${C.indigoDim}, ${C.violetDim})`, color: C.indigo }}>
                  <MonitorPlay size={26} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, marginBottom: 6 }}>{t ? "Corsi in arrivo" : "Courses coming soon"}</div>
                <p style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.6 }}>{t ? "Stiamo preparando i primi video corsi." : "We're preparing the first video courses."}</p>
              </div>
            ) : (
              courses.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                    {c.level && <span className="tag" style={{ background: C.indigoDim, color: C.indigoDeep, border: `1px solid ${C.border}` }}><Gauge size={11} /> {LEVELS[c.level]?.[t ? "it" : "en"] || c.level}</span>}
                    {c.total_minutes > 0 && <span className="tag" style={{ background: C.surfaceUp, color: C.textSoft, border: `1px solid ${C.border}` }}><Clock size={11} /> {formatDuration(c.total_minutes * 60, t ? "it" : "en")}</span>}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, marginBottom: 4 }}>{c.title}</div>
                  {c.subtitle && <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.55, marginBottom: 14 }}>{c.subtitle}</div>}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <span className="display" style={{ fontSize: 24, fontWeight: 600, color: C.ink }}>
                      {c.price_eur > 0 ? `€${Number(c.price_eur).toFixed(0)}` : (t ? "Gratis" : "Free")}
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link to={`/corsi/${c.slug}`} className="btn btn-ghost btn-sm">{t ? "Dettagli" : "Details"}</Link>
                      <button onClick={() => handleCourseCta(c)} className="btn btn-primary btn-sm">{t ? "Acquista" : "Buy"} <ArrowRight size={14} /></button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 22, fontSize: 12, color: C.textMute, lineHeight: 1.9 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ShieldCheck size={14} color={C.green} /> {t ? "Pagamento sicuro via Lemon Squeezy" : "Secure payment via Lemon Squeezy"}
          </div>
          <br />
          {t ? "Garanzia 7 giorni soddisfatti o rimborsati" : "7-day money-back guarantee"}
        </div>
      </div>
    </div>
  );
}
