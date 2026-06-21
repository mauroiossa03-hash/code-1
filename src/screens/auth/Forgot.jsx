import { useState } from "react";
import { motion } from "framer-motion";
import { C } from "../../theme.js";
import { supabase } from "../../lib/supabase.js";
import { AuthInput } from "../../components/auth.jsx";
import { ArrowLeft, ArrowRight, KeyRound, CheckCircle2 } from "../../components/icons.jsx";

export default function Forgot({ setScreen, lang }) {
  const t = lang === "it";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) return;
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
    setLoading(false); setSent(true);
  };

  if (sent) {
    return (
      <div style={{ minHeight: "100dvh", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
        <div className="aurora" />
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} style={{ position: "relative", zIndex: 1, maxWidth: 340 }}>
          <div style={{ width: 78, height: 78, borderRadius: 22, margin: "0 auto 20px", display: "grid", placeItems: "center", background: C.greenDim, color: C.green }}>
            <CheckCircle2 size={36} />
          </div>
          <h2 className="display" style={{ fontSize: 26, color: C.ink, marginBottom: 10 }}>
            {t ? "Email inviata!" : "Email sent!"}
          </h2>
          <p style={{ fontSize: 14, color: C.textSoft, lineHeight: 1.7, marginBottom: 26 }}>
            {t ? `Controlla ${email} per il link di reset della password.` : `Check ${email} for the password reset link.`}
          </p>
          <button onClick={() => setScreen("login")} className="btn btn-primary" style={{ padding: "13px 28px" }}>
            {t ? "Torna al login" : "Back to login"}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", position: "relative", overflow: "hidden" }}>
      <div className="aurora" />
      <div style={{ position: "relative", zIndex: 1, padding: "20px 22px 0" }}>
        <button onClick={() => setScreen("login")} className="btn btn-ghost btn-sm">
          <ArrowLeft size={15} /> {t ? "Torna al login" : "Back to login"}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ position: "relative", zIndex: 1, padding: "30px 24px", maxWidth: 440, margin: "0 auto", width: "100%", minHeight: "70dvh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, marginBottom: 18, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${C.indigoDim}, ${C.violetDim})`, border: `1px solid ${C.border}`, color: C.indigo }}>
            <KeyRound size={28} />
          </div>
          <h1 className="display" style={{ fontSize: 28, color: C.ink, marginBottom: 8 }}>
            {t ? "Password dimenticata?" : "Forgot password?"}
          </h1>
          <p style={{ fontSize: 14, color: C.textSoft, lineHeight: 1.6 }}>
            {t ? "Inserisci la tua email e ti mandiamo un link per reimpostare la password." : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        <AuthInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mario@email.com" autoComplete="email" inputMode="email" />
        <button onClick={handleReset} disabled={loading || !email} className="btn btn-primary btn-block" style={{ padding: 14, fontSize: 15 }}>
          {loading ? (t ? "Invio in corso..." : "Sending...") : (<>{t ? "Invia link reset" : "Send reset link"} <ArrowRight size={17} /></>)}
        </button>
      </motion.div>
    </div>
  );
}
