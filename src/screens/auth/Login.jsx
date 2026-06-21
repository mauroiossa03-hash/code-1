import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { C } from "../../theme.js";
import { supabase } from "../../lib/supabase.js";
import { Logo } from "../../components/primitives.jsx";
import { AuthInput, AuthDivider, GoogleBtn, ErrorBanner } from "../../components/auth.jsx";
import { ArrowLeft, ArrowRight, AlertTriangle } from "../../components/icons.jsx";

export default function Login({ setUser, lang }) {
  const t = lang === "it";
  const navigate = useNavigate();

  // ?next=... viene impostato dai paywall (PremiumRoute, CourseDetail, Pricing…) e
  // va propagato a /register e /forgot così l'utente, qualsiasi flow scelga,
  // dopo l'auth torna dove voleva. Il redirect finale lo fa App.jsx (handleSetUser
  // e onAuthStateChange leggono lo stesso parametro).
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "";
  const nextSuffix = next ? `?next=${encodeURIComponent(next)}` : "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setError(t ? "Compila tutti i campi" : "Fill in all fields"); return; }
    setLoading(true); setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    setUser({
      id: data.user.id, email: data.user.email,
      name: data.user.user_metadata?.full_name || data.user.email.split("@")[0],
    });
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } });
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100dvh", position: "relative", overflow: "hidden" }}>
      <div className="aurora" />
      <div style={{ position: "relative", zIndex: 1, padding: "20px 22px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo size={17} />
        <button onClick={() => navigate("/")} className="btn btn-ghost btn-sm">
          <ArrowLeft size={15} /> {t ? "Torna" : "Back"}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ position: "relative", zIndex: 1, padding: "28px 24px 40px", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 440, margin: "0 auto", width: "100%", minHeight: "70dvh" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 className="display" style={{ fontSize: 34, color: C.ink, marginBottom: 7 }}>
            {t ? "Bentornato" : "Welcome back"}
          </h1>
          <p style={{ fontSize: 14.5, color: C.textSoft, lineHeight: 1.6 }}>
            {t ? "Accedi al tuo account OddsFinance" : "Sign in to your OddsFinance account"}
          </p>
        </div>

        <GoogleBtn lang={lang} onClick={handleGoogle} />
        <AuthDivider lang={lang} />

        <AuthInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mario@email.com" autoComplete="email" inputMode="email" />
        <AuthInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />

        <div style={{ textAlign: "right", marginTop: -6, marginBottom: 18 }}>
          <button onClick={() => navigate("/forgot")} style={{ background: "none", border: "none", color: C.indigo, fontSize: 12.5, cursor: "pointer", fontWeight: 700 }}>
            {t ? "Password dimenticata?" : "Forgot password?"}
          </button>
        </div>

        {error && <ErrorBanner><AlertTriangle size={16} /> {error}</ErrorBanner>}

        <button onClick={handleLogin} disabled={loading} className="btn btn-primary btn-block" style={{ padding: 14, fontSize: 15 }}>
          {loading ? (t ? "Accesso in corso..." : "Signing in...") : (<>{t ? "Accedi" : "Sign in"} <ArrowRight size={17} /></>)}
        </button>

        <div style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: C.textSoft }}>
          {t ? "Non hai un account?" : "Don't have an account?"}{" "}
          <button onClick={() => navigate(`/register${nextSuffix}`)} style={{ background: "none", border: "none", color: C.indigo, fontWeight: 800, cursor: "pointer", fontSize: 13 }}>
            {t ? "Registrati" : "Sign up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
