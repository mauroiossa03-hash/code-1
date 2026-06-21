import { Link } from "react-router-dom";
import { C } from "../theme.js";
import { Logo } from "./primitives.jsx";
import { LayoutGrid, HelpCircle, Layers3, FileText, User, Globe, Crown } from "./icons.jsx";

const NAV_ITEMS = [
  { id: "dashboard", Icon: LayoutGrid, it: "Dashboard", en: "Dashboard" },
  { id: "quiz", Icon: HelpCircle, it: "Quiz", en: "Quiz" },
  { id: "flashcard", Icon: Layers3, it: "Flashcard", en: "Cards" },
  { id: "exam", Icon: FileText, it: "Esame", en: "Exam" },
  { id: "profile", Icon: User, it: "Profilo", en: "Profile" },
];

export function TopBar({ lang, setLang, isPremium, setScreen }) {
  return (
    <div className="top-bar">
      <Link to="/" style={{ textDecoration: "none" }}><Logo size={16} /></Link>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => setLang(lang === "it" ? "en" : "it")} className="btn btn-ghost btn-sm" aria-label="Switch language">
          <Globe size={14} /> {lang === "it" ? "EN" : "IT"}
        </button>
        {isPremium ? (
          <span className="tag" style={{ background: "rgba(201,138,18,0.12)", color: C.gold, border: "1px solid rgba(201,138,18,0.3)" }}>
            <Crown size={12} /> PRO
          </span>
        ) : (
          <button onClick={() => setScreen("pricing")} className="btn btn-primary btn-sm">Premium</button>
        )}
      </div>
    </div>
  );
}

export function BottomNav({ screen, setScreen, lang }) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((it) => {
        const active = screen === it.id;
        return (
          <button key={it.id} onClick={() => setScreen(it.id)} className={`nav-btn ${active ? "active" : ""}`}
            style={{ color: active ? C.indigo : C.textMute }} aria-current={active ? "page" : undefined}>
            <it.Icon size={21} strokeWidth={active ? 2.4 : 2} />
            <span className="nav-label">{lang === "it" ? it.it : it.en}</span>
            <span className="nav-dot" />
          </button>
        );
      })}
    </nav>
  );
}
