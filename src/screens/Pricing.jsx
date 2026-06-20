import { useState } from "react";
import { motion } from "framer-motion";
import { C } from "../theme.js";
import { CHECKOUT } from "../lib/supabase.js";
import BackgroundPaths from "../components/BackgroundPaths.jsx";
import ScrollStage from "../components/ScrollStage.jsx";
import { ArrowLeft, ArrowRight, Check, X, ShieldCheck, Crown } from "../components/icons.jsx";

export default function Pricing({ lang, user, setScreen }) {
  const t = lang === "it";
  const [billing, setBilling] = useState("monthly");

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

  const handleCta = (plan) => {
    if (!plan.primary) { setScreen(user ? "dashboard" : "register"); return; }
    if (!user) { setScreen("register"); return; }
    const base = billing === "monthly" ? CHECKOUT.monthly : CHECKOUT.annual;
    const params = new URLSearchParams();
    if (user?.email) params.set("checkout[email]", user.email);
    if (user?.id) params.set("checkout[custom][user_id]", user.id);
    window.location.href = `${base}?${params.toString()}`;
  };

  return (
    <div style={{ padding: "22px 18px 96px", position: "relative", overflow: "hidden" }}>
      <BackgroundPaths />
      <div className="aurora" />
      <div style={{ position: "relative", zIndex: 1 }}>
        {!user && (
          <button onClick={() => setScreen("landing")} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
            <ArrowLeft size={15} /> {t ? "Indietro" : "Back"}
          </button>
        )}

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="tag" style={{ background: "rgba(255,255,255,0.7)", color: C.indigo, border: `1px solid ${C.border}`, marginBottom: 12 }}>{t ? "Prezzi" : "Pricing"}</div>
          <h2 className="display" style={{ fontSize: 30, color: C.ink, marginBottom: 8 }}>{t ? "Scegli il tuo piano" : "Choose your plan"}</h2>
          <p style={{ fontSize: 13.5, color: C.textSoft }}>{t ? "Nessuna sorpresa. Cancella quando vuoi." : "No surprises. Cancel anytime."}</p>
        </div>

        {/* Billing toggle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
          <div style={{ display: "flex", background: C.surface, borderRadius: 12, padding: 4, border: `1px solid ${C.border}`, boxShadow: "var(--shadow-sm)" }}>
            {["monthly", "annual"].map((b) => (
              <button key={b} onClick={() => setBilling(b)}
                style={{
                  padding: "9px 18px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-ui)",
                  background: billing === b ? `linear-gradient(135deg, ${C.indigo}, ${C.indigoDeep})` : "transparent",
                  color: billing === b ? "#fff" : C.textSoft, transition: "all .2s",
                }}>
                {b === "monthly" ? (t ? "Mensile" : "Monthly") : (t ? "Annuale -35%" : "Annual -35%")}
              </button>
            ))}
          </div>
        </div>

        <ScrollStage>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {plans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={plan.primary ? "sheen" : ""}
                style={{
                  padding: "24px 20px", borderRadius: 22, position: "relative",
                  border: `1.5px solid ${plan.primary ? "transparent" : C.border}`,
                  background: plan.primary ? `linear-gradient(150deg, ${C.ink}, ${C.navy} 65%, ${C.indigoDeep})` : C.surface,
                  boxShadow: plan.primary ? "var(--shadow-lg)" : "var(--shadow-sm)",
                }}>
                {plan.badge && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)" }}>
                    <span className="tag" style={{ background: `linear-gradient(135deg, #FFD66B, ${C.goldBright})`, color: "#3a2a00", padding: "5px 14px", boxShadow: "var(--shadow-md)" }}>
                      <Crown size={12} /> {plan.badge}
                    </span>
                  </div>
                )}
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

                <button onClick={() => handleCta(plan)} className={plan.primary ? "btn btn-gold btn-block" : "btn btn-ghost btn-block"} style={{ padding: 13 }}>
                  {plan.cta} <ArrowRight size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </ScrollStage>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: C.textMute, lineHeight: 1.9 }}>
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
