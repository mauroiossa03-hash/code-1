import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { C } from "../theme.js";
import { supabase } from "../lib/supabase.js";
import {
  Crown, Globe, CalendarDays, KeyRound, LogOut, ChevronRight, Sparkles, BookOpen,
} from "../components/icons.jsx";

export default function Profile({ user, setUser, setScreen, lang, setLang, isPremium }) {
  const t = lang === "it";
  const [showLogout, setShowLogout] = useState(false);
  const [examHistory, setExamHistory] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("exam_results")
        .select("score, total, module, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setExamHistory(data);
    };
    load();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setScreen("landing");
  };

  const settings = [
    { Icon: Globe, label: t ? "Lingua" : "Language", val: lang === "it" ? "Italiano" : "English", action: () => setLang(lang === "it" ? "en" : "it") },
    { Icon: CalendarDays, label: t ? "Data esame" : "Exam date", val: "Nov 2026", action: null },
    { Icon: KeyRound, label: t ? "Cambia password" : "Change password", val: "", action: () => setScreen("forgot") },
  ];

  return (
    <div style={{ padding: "24px 18px 96px", position: "relative" }}>
      <div className="aurora" />
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Avatar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 26, paddingTop: 6 }}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            style={{ width: 84, height: 84, borderRadius: "50%", marginBottom: 14, display: "grid", placeItems: "center",
              background: `linear-gradient(135deg, ${C.indigo}, ${C.violet})`, fontSize: 32, fontWeight: 700, color: "#fff",
              fontFamily: "var(--font-display)", boxShadow: "0 10px 30px rgba(59,91,255,0.4)" }}>
            {user.name?.[0]?.toUpperCase() || "U"}
          </motion.div>
          <h2 className="display" style={{ fontSize: 24, color: C.ink, marginBottom: 4 }}>{user.name}</h2>
          <div style={{ fontSize: 13, color: C.textMute }}>{user.email}</div>
          {isPremium && (
            <span className="tag" style={{ background: "rgba(201,138,18,0.12)", color: C.gold, border: "1px solid rgba(201,138,18,0.3)", marginTop: 10 }}>
              <Crown size={12} /> Premium
            </span>
          )}
        </div>

        {/* I miei corsi — shortcut */}
        <Link to="/i-miei-corsi" className="card card-hover" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 13, marginBottom: 22, textDecoration: "none" }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${C.indigoDim}, ${C.violetDim})`, color: C.violet, flexShrink: 0 }}>
            <BookOpen size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: C.ink }}>{t ? "I miei corsi" : "My Courses"}</div>
            <div style={{ fontSize: 12, color: C.textSoft }}>{t ? "Riprendi da dove hai lasciato" : "Pick up where you left off"}</div>
          </div>
          <ChevronRight size={20} color={C.indigo} />
        </Link>

        {/* Exam history */}
        {examHistory.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 12 }}>{t ? "Ultime simulazioni" : "Recent exams"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {examHistory.map((r, i) => {
                const pct = Math.round((r.score / r.total) * 100);
                return (
                  <div key={i} className="card" style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{r.module}</div>
                      <div style={{ fontSize: 11, color: C.textMute, marginTop: 2 }}>{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="mono" style={{ fontSize: 16, color: pct >= 70 ? C.green : C.amber, fontWeight: 600 }}>{pct}%</div>
                      <div style={{ fontSize: 10, color: C.textMute }}>{r.score}/{r.total}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {settings.map((item, i) => (
            <button key={i} onClick={item.action || undefined} className={item.action ? "card card-hover" : "card"}
              style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 13, textAlign: "left", width: "100%", cursor: item.action ? "pointer" : "default" }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", background: C.surfaceUp, color: C.indigo, flexShrink: 0 }}>
                <item.Icon size={18} />
              </div>
              <span style={{ flex: 1, fontSize: 14, color: C.ink, fontWeight: 600 }}>{item.label}</span>
              <span style={{ fontSize: 13, color: C.textMute, display: "flex", alignItems: "center", gap: 4 }}>
                {item.val} {item.action && <ChevronRight size={16} />}
              </span>
            </button>
          ))}
        </div>

        {!isPremium && (
          <div onClick={() => setScreen("pricing")} className="card card-hover sheen"
            style={{ padding: "16px 18px", marginBottom: 16, background: `linear-gradient(135deg, ${C.indigoDim}, ${C.violetDim})`, borderColor: C.borderHi }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: "#fff", color: C.gold, boxShadow: "var(--shadow-sm)" }}>
                <Crown size={21} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, marginBottom: 2, display: "flex", alignItems: "center", gap: 5 }}>
                  {t ? "Passa a Premium" : "Upgrade to Premium"} <Sparkles size={13} color={C.gold} />
                </div>
                <div style={{ fontSize: 12, color: C.textSoft }}>{t ? "Da €29/mese · Cancella quando vuoi" : "From €29/mo · Cancel anytime"}</div>
              </div>
              <ChevronRight size={20} color={C.indigo} style={{ marginLeft: "auto" }} />
            </div>
          </div>
        )}

        <button onClick={() => setShowLogout(true)} className="btn btn-ghost btn-block" style={{ padding: 13, borderColor: C.red, color: C.red }}>
          <LogOut size={16} /> {t ? "Esci dall'account" : "Sign out"}
        </button>
      </div>

      {/* Logout sheet */}
      <AnimatePresence>
        {showLogout && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowLogout(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(11,20,55,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: C.surface, borderRadius: "24px 24px 0 0", padding: "26px 24px calc(34px + env(safe-area-inset-bottom))", width: "100%", maxWidth: 480 }}>
              <div style={{ width: 40, height: 4, borderRadius: 99, background: C.border, margin: "0 auto 18px" }} />
              <div className="display" style={{ fontSize: 22, color: C.ink, marginBottom: 8 }}>{t ? "Vuoi uscire?" : "Sign out?"}</div>
              <p style={{ fontSize: 14, color: C.textSoft, marginBottom: 22, lineHeight: 1.6 }}>
                {t ? "I tuoi progressi sono salvati e potrai rientrare in qualsiasi momento." : "Your progress is saved. You can sign back in anytime."}
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowLogout(false)} className="btn btn-ghost btn-block" style={{ padding: 13 }}>{t ? "Annulla" : "Cancel"}</button>
                <button onClick={handleLogout} className="btn btn-block" style={{ padding: 13, background: C.red, color: "#fff" }}>{t ? "Esci" : "Sign out"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
