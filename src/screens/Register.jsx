import { useState } from "react";
import { motion } from "framer-motion";
import { C } from "../theme.js";
import { supabase } from "../lib/supabase.js";
import { Logo } from "../components/primitives.jsx";
import { AuthInput, AuthDivider, GoogleBtn, ErrorBanner } from "../components/auth.jsx";
import { ArrowLeft, ArrowRight, AlertTriangle, Mail } from "../components/icons.jsx";

export default function Register({ setScreen, setUser, lang }) {
  const t = lang === "it";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const handleRegister = async () => {
    if (!name || !email || !password) { setError(t ? "Compila tutti i campi" : "Fill in all fields"); return; }
    if (password !== confirm) { setError(t ? "Le password non coincidono" : "Passwords don't match"); return; }
    if (password.length < 8) { setError(t ? "Password minimo 8 caratteri" : "Password must be at least 8 characters"); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) { setError(error.message); setLoading(false); return; }
    setLoading(false); setStep(2);
  };

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } });
    setLoading(false);
  };

  if (step === 2) {
    return (
      <div style={{ minHeight: "100dvh", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
        <div className="aurora" />
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{ position: "relative", zIndex: 1, maxWidth: 360 }}>
          <div style={{ width: 80, height: 80, borderRadius: 22, margin: "0 auto 22px", display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${C.indigoDim}, ${C.violetDim})`, border: `1px solid ${C.border}`, color: C.indigo }}>
            <Mail size={34} />
          </div>
          <h2 className="display" style={{ fontSize: 28, color: C.ink, marginBottom: 10 }}>
            {t ? "Controlla la tua email" : "Check your email"}
          </h2>
          <p style={{ fontSize: 14, color: C.textSoft, lineHeight: 1.7, marginBottom: 30 }}>
            {t ? `Abbiamo inviato un link di conferma a ${email}. Clicca il link per attivare il tuo account.`
               : `We sent a confirmation link to ${email}. Click the link to activate your account.`}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => setScreen("login")} className="btn btn-primary btn-block" style={{ padding: 13 }}>
              {t ? "Vai al login" : "Go to login"} <ArrowRight size={17} />
            </button>
            <button onClick={() => setStep(1)} className="btn btn-ghost btn-block" style={{ padding: 11 }}>
              {t ? "Riprova con un'altra email" : "Try another email"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", position: "relative", overflow: "hidden" }}>
      <div className="aurora" />
      <div style={{ position: "relative", zIndex: 1, padding: "20px 22px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo size={17} />
        <button onClick={() => setScreen("login")} className="btn btn-ghost btn-sm">
          <ArrowLeft size={15} /> {t ? "Accedi" : "Sign in"}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ position: "relative", zIndex: 1, padding: "26px 24px 40px", maxWidth: 440, margin: "0 auto", width: "100%" }}>
        <div style={{ marginBottom: 26 }}>
          <h1 className="display" style={{ fontSize: 32, color: C.ink, marginBottom: 7 }}>
            {t ? "Crea il tuo account" : "Create your account"}
          </h1>
          <p style={{ fontSize: 14, color: C.textSoft }}>
            {t ? "Inizia gratis, nessuna carta richiesta" : "Start free, no credit card required"}
          </p>
        </div>

        <GoogleBtn lang={lang} onClick={handleGoogle} />
        <AuthDivider lang={lang} />

        <AuthInput label={t ? "Nome completo" : "Full name"} value={name} onChange={(e) => setName(e.target.value)} placeholder="Mario Rossi" autoComplete="name" />
        <AuthInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mario@email.com" autoComplete="email" inputMode="email" />
        <AuthInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t ? "Minimo 8 caratteri" : "At least 8 characters"} hint={t ? "Minimo 8 caratteri" : "At least 8 characters"} autoComplete="new-password" />
        <AuthInput label={t ? "Conferma password" : "Confirm password"} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" autoComplete="new-password" />

        {error && <ErrorBanner><AlertTriangle size={16} /> {error}</ErrorBanner>}

        <button onClick={handleRegister} disabled={loading} className="btn btn-primary btn-block" style={{ padding: 14, fontSize: 15 }}>
          {loading ? (t ? "Creazione account..." : "Creating account...") : (<>{t ? "Crea account" : "Create account"} <ArrowRight size={17} /></>)}
        </button>

        <p style={{ fontSize: 11.5, color: C.textMute, textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
          {t ? "Registrandoti accetti i nostri" : "By registering you agree to our"}{" "}
          <span style={{ color: C.indigo, cursor: "pointer", fontWeight: 600 }}>{t ? "Termini" : "Terms"}</span>{" "}
          {t ? "e la" : "and"}{" "}
          <span style={{ color: C.indigo, cursor: "pointer", fontWeight: 600 }}>Privacy Policy</span>
        </p>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: C.textSoft }}>
          {t ? "Hai già un account?" : "Already have an account?"}{" "}
          <button onClick={() => setScreen("login")} style={{ background: "none", border: "none", color: C.indigo, fontWeight: 800, cursor: "pointer", fontSize: 13 }}>
            {t ? "Accedi" : "Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
