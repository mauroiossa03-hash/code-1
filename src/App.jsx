import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "./lib/supabase.js";
import { BottomNav } from "./components/Nav.jsx";
import MarketingTopBar from "./components/nav/MarketingTopBar.jsx";
import CoursesBottomNav from "./components/nav/CoursesBottomNav.jsx";
import BackgroundPaths from "./components/BackgroundPaths.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import LandingIntro from "./components/LandingIntro.jsx";
import Homepage from "./screens/home/Homepage.jsx";
import CfaLanding from "./screens/cfa/CfaLanding.jsx";
import Login from "./screens/auth/Login.jsx";
import Register from "./screens/auth/Register.jsx";
import Forgot from "./screens/auth/Forgot.jsx";
import Dashboard from "./screens/cfa/Dashboard.jsx";
import Quiz from "./screens/cfa/Quiz.jsx";
import Flashcards from "./screens/cfa/Flashcards.jsx";
import Exam from "./screens/cfa/Exam.jsx";
import Pricing from "./screens/Pricing.jsx";
import Profile from "./screens/Profile.jsx";
import CoursesCatalog from "./screens/courses/CoursesCatalog.jsx";
import CourseDetail from "./screens/courses/CourseDetail.jsx";
import LessonPlayer from "./screens/courses/LessonPlayer.jsx";
import MyCourses from "./screens/courses/MyCourses.jsx";

// Mappa i vecchi setScreen("name") (usati dentro gli screen esistenti) → route reali.
const SCREEN_TO_PATH = {
  landing: "/",
  login: "/login",
  register: "/register",
  forgot: "/forgot",
  dashboard: "/cfa/dashboard",
  quiz: "/cfa/quiz",
  flashcard: "/cfa/flashcards",
  exam: "/cfa/exam",
  pricing: "/pricing",
  profile: "/profilo",
};

const PATH_TO_SCREEN = {
  "/cfa/dashboard": "dashboard",
  "/cfa/quiz": "quiz",
  "/cfa/flashcards": "flashcard",
  "/cfa/exam": "exam",
  "/profilo": "profile",
};

const AUTH_PATHS = ["/login", "/register", "/forgot"];

function userFromSession(session) {
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.user_metadata?.full_name || session.user.email.split("@")[0],
  };
}

// Helper: legge il parametro ?next= dalla URL corrente. Usato dopo login/OAuth
// per riportare l'utente alla pagina che voleva raggiungere prima del paywall.
function readNextParam() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("next") || "";
  } catch {
    return "";
  }
}

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const [lang, setLang] = useState("it");
  const [isPremium, setIsPremium] = useState(false);
  const [activeTopic, setActiveTopic] = useState("all");
  const [user, setUser] = useState(null);
  const [introDone, setIntroDone] = useState(false);

  /* ── Auth session ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(userFromSession(session));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(userFromSession(session));
        // Solo se siamo ancora su una pagina di auth, naviga: rispetta ?next= se presente,
        // altrimenti default alla Dashboard CFA. Copre OAuth (Google) e conferma email.
        if (AUTH_PATHS.includes(window.location.pathname)) {
          const next = readNextParam();
          navigate(next || "/cfa/dashboard");
        }
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Premium subscription polling ── */
  useEffect(() => {
    if (!user) { setIsPremium(false); return; }
    let cancelled = false;
    const fetchPremium = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data, error } = await supabase
        .from("subscriptions")
        .select("status, current_period_end")
        .eq("user_id", authUser.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) { console.error("Subscription fetch error:", error); return; }
      if (data && data.status === "active") {
        const stillValid = !data.current_period_end || new Date(data.current_period_end) > new Date();
        setIsPremium(stillValid);
      } else {
        setIsPremium(false);
      }
    };
    fetchPremium();
    const interval = setInterval(fetchPremium, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [user]);

  const setScreen = (name) => navigate(SCREEN_TO_PATH[name] || "/");

  // Dopo email+password login/register, Login.jsx chiama setUser passando l'oggetto
  // utente. Qui aggiorniamo lo state e gestiamo il redirect rispettando ?next=.
  const handleSetUser = (u) => {
    setUser(u);
    const next = readNextParam();
    navigate(next || "/cfa/dashboard");
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); navigate("/"); };

  /* ── Navigazione contesto-aware ── */
  const isAuth = AUTH_PATHS.includes(path);
  const isCoursesArea = path.startsWith("/corsi") || path === "/i-miei-corsi";
  const isCfaApp = path.startsWith("/cfa/"); // dashboard/quiz/flashcards/exam
  const isLessonPlayer = /^\/corsi\/[^/]+\/lezione\//.test(path);
  const introActive = path === "/" && !introDone;

  // Layout largo (desktop-friendly) ovunque tranne le pagine di autenticazione,
  // che restano form centrati e stretti anche su schermi grandi.
  const wideLayout = !isAuth;

  // TopBar unica su tutto il sito (anche dentro il CFA): stesse opzioni
  // CFA · Corsi · Pricing · Profilo. La navigazione di sezione del CFA
  // (Dashboard/Quiz/Flashcard/Esame) resta nella bottom nav.
  const showMarketingTop = !isAuth && !isLessonPlayer && !introActive;

  // BottomNav
  const showCfaBottom = (isCfaApp || path === "/profilo") && !!user;
  const showCoursesBottom = isCoursesArea && !!user && !isLessonPlayer;

  const currentScreen = PATH_TO_SCREEN[path];

  return (
    <div className={`app-shell${wideLayout ? " shell-wide" : ""}`}>
      <BackgroundPaths />
      {introActive && <LandingIntro lang={lang} onEnter={() => setIntroDone(true)} />}
      {showMarketingTop && <MarketingTopBar lang={lang} setLang={setLang} user={user} onLogout={handleLogout} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={path}
          className="page-frame"
          style={{ position: "relative", zIndex: 1 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: [0.2, 0.7, 0.3, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<Homepage lang={lang} user={user} />} />
            <Route path="/cfa" element={user ? <Navigate to="/cfa/dashboard" replace /> : <CfaLanding lang={lang} />} />

            <Route path="/login" element={<Login setUser={handleSetUser} lang={lang} />} />
            <Route path="/register" element={<Register setUser={handleSetUser} lang={lang} />} />
            <Route path="/forgot" element={<Forgot lang={lang} />} />

            <Route path="/pricing" element={<Pricing lang={lang} user={user} />} />
            <Route path="/profilo" element={
              <ProtectedRoute user={user}>
                <Profile user={user} setUser={setUser} setScreen={setScreen} lang={lang} setLang={setLang} isPremium={isPremium} />
              </ProtectedRoute>
            } />

            <Route path="/cfa/dashboard" element={
              <ProtectedRoute user={user}>
                <Dashboard setScreen={setScreen} setActiveTopic={setActiveTopic} lang={lang} isPremium={isPremium} user={user} />
              </ProtectedRoute>
            } />
            <Route path="/cfa/quiz" element={
              <ProtectedRoute user={user}>
                <Quiz activeTopic={activeTopic} lang={lang} isPremium={isPremium} setScreen={setScreen} />
              </ProtectedRoute>
            } />
            <Route path="/cfa/flashcards" element={
              <ProtectedRoute user={user}>
                <Flashcards lang={lang} isPremium={isPremium} />
              </ProtectedRoute>
            } />
            {/* /cfa/exam: solo auth richiesta. Il gate Premium è gestito DENTRO Exam.jsx
                con una schermata lock-up (icona + descrizione + CTA "Sblocca Premium"),
                che converte meglio di un redirect secco a /pricing. */}
            <Route path="/cfa/exam" element={
              <ProtectedRoute user={user}>
                <Exam lang={lang} isPremium={isPremium} setScreen={setScreen} />
              </ProtectedRoute>
            } />

            {/* Corsi */}
            <Route path="/corsi" element={<CoursesCatalog lang={lang} />} />
            <Route path="/corsi/:slug" element={<CourseDetail lang={lang} user={user} />} />
            <Route path="/corsi/:slug/lezione/:lessonSlug" element={<LessonPlayer lang={lang} user={user} />} />
            <Route path="/i-miei-corsi" element={
              <ProtectedRoute user={user}>
                <MyCourses lang={lang} />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      {showCfaBottom && currentScreen && <BottomNav screen={currentScreen} setScreen={setScreen} lang={lang} />}
      {showCoursesBottom && <CoursesBottomNav lang={lang} />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
