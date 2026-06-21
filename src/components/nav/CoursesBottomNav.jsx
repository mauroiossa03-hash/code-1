import { useNavigate, useLocation } from "react-router-dom";
import { C } from "../../theme.js";
import { Home, ListVideo, BookOpen, User } from "../icons.jsx";

/*
  Bottom nav alternativo per utenti loggati dentro /corsi* e /i-miei-corsi
  (scelta confermata in D3). Voci: Home, Corsi, I miei corsi, Profilo.
*/
const ITEMS = [
  { to: "/", Icon: Home, it: "Home", en: "Home" },
  { to: "/corsi", Icon: ListVideo, it: "Corsi", en: "Courses" },
  { to: "/i-miei-corsi", Icon: BookOpen, it: "I miei corsi", en: "My Courses" },
  { to: "/profilo", Icon: User, it: "Profilo", en: "Profile" },
];

export default function CoursesBottomNav({ lang }) {
  const navigate = useNavigate();
  const location = useLocation();
  const t = lang === "it";

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <nav className="bottom-nav">
      {ITEMS.map((it) => {
        const active = isActive(it.to);
        return (
          <button key={it.to} onClick={() => navigate(it.to)} className={`nav-btn ${active ? "active" : ""}`}
            style={{ color: active ? C.indigo : C.textMute }} aria-current={active ? "page" : undefined}>
            <it.Icon size={21} strokeWidth={active ? 2.4 : 2} />
            <span className="nav-label">{t ? it.it : it.en}</span>
            <span className="nav-dot" />
          </button>
        );
      })}
    </nav>
  );
}
