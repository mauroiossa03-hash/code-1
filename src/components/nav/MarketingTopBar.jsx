import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { C } from "../../theme.js";
import { Logo } from "../primitives.jsx";
import { Globe, ChevronDown, User, LogOut, BookOpen, GraduationCap } from "../icons.jsx";

/*
  TopBar marketing usata su / e /corsi*.
  Mostra i link prodotto e, se loggato, un dropdown avatar
  (Profilo, I miei corsi, Esci). Se non loggato, bottone Accedi.
*/
const linkBase = {
  fontSize: 13.5, fontWeight: 700, color: C.textSoft, textDecoration: "none",
  padding: "6px 4px", whiteSpace: "nowrap",
};

export default function MarketingTopBar({ lang, setLang, user, onLogout }) {
  const t = lang === "it";
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (p) => location.pathname === p || (p !== "/" && location.pathname.startsWith(p));

  const links = [
    { to: "/cfa", label: "CFA" },
    { to: "/corsi", label: t ? "Corsi" : "Courses" },
    { to: "/pricing", label: "Pricing" },
  ];

  return (
    <div className="top-bar" style={{ gap: 10 }}>
      <Link to="/" style={{ textDecoration: "none" }}><Logo size={16} /></Link>

      <nav style={{ display: "flex", alignItems: "center", gap: 14, marginLeft: "auto" }}>
        {links.map((l) => (
          <Link key={l.to} to={l.to}
            style={{ ...linkBase, color: isActive(l.to) ? C.indigo : C.textSoft }}>
            {l.label}
          </Link>
        ))}

        <button onClick={() => setLang(t ? "en" : "it")} className="btn btn-ghost btn-sm" aria-label="Switch language">
          <Globe size={14} /> {t ? "EN" : "IT"}
        </button>

        {!user ? (
          <button onClick={() => navigate("/login")} className="btn btn-primary btn-sm">
            {t ? "Accedi" : "Login"}
          </button>
        ) : (
          <div style={{ position: "relative" }}>
            <button onClick={() => setOpen((o) => !o)} className="btn btn-ghost btn-sm" aria-haspopup="menu" aria-expanded={open}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", display: "grid", placeItems: "center",
                background: `linear-gradient(135deg, ${C.indigo}, ${C.violet})`, color: "#fff", fontSize: 11, fontWeight: 800 }}>
                {user.name?.[0]?.toUpperCase() || "U"}
              </span>
              <ChevronDown size={14} />
            </button>
            {open && (
              <>
                <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                <div role="menu" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 41,
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: "var(--shadow-lg)",
                  minWidth: 190, padding: 6 }}>
                  <MenuItem Icon={User} label={t ? "Profilo" : "Profile"} onClick={() => { setOpen(false); navigate("/profilo"); }} />
                  <MenuItem Icon={BookOpen} label={t ? "I miei corsi" : "My Courses"} onClick={() => { setOpen(false); navigate("/i-miei-corsi"); }} />
                  <MenuItem Icon={GraduationCap} label={t ? "CFA Dashboard" : "CFA Dashboard"} onClick={() => { setOpen(false); navigate("/cfa/dashboard"); }} />
                  <div style={{ height: 1, background: C.border, margin: "6px 4px" }} />
                  <MenuItem Icon={LogOut} label={t ? "Esci" : "Sign out"} danger onClick={() => { setOpen(false); onLogout?.(); }} />
                </div>
              </>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}

function MenuItem({ Icon, label, onClick, danger }) {
  return (
    <button role="menuitem" onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
        padding: "9px 10px", borderRadius: 9, border: "none", background: "transparent", cursor: "pointer",
        fontSize: 13, fontWeight: 600, fontFamily: "var(--font-ui)", color: danger ? C.red : C.ink }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceUp)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
      <Icon size={16} /> {label}
    </button>
  );
}
