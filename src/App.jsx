import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "./lib/supabase.js";
import { TopBar, BottomNav } from "./components/Nav.jsx";
import MarketingTopBar from "./components/nav/MarketingTopBar.jsx";
import CoursesBottomNav from "./components/nav/CoursesBottomNav.jsx";
import BackgroundPaths from "./components/BackgroundPaths.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PremiumRoute from "./components/PremiumRoute.jsx";

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
        if (AUTH_PATHS.includes(window.location.pathname)) navigate("/cfa/dashboard");
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
  const handleSetUser = (u) => { setUser(u); navigate("/cfa/dashboard"); };
  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); navigate("/"); };

  /* ── Navigazione contesto-aware ── */
  const isAuth = AUTH_PATHS.includes(path);
  const isCoursesArea = path.startsWith("/corsi") || path === "/i-miei-corsi";
  const isCfaApp = path.startsWith("/cfa/"); // dashboard/quiz/flashcards/exam
  const isLessonPlayer = /^\/corsi\/[^/]+\/lezione\//.test(path);
  const isMarketing = path === "/" || path === "/cfa" || path === "/pricing" || isCoursesArea;
  const introActive = path === "/" && !introDone;

  // Layout largo (desktop-friendly) per marketing/corsi/player; stretto per app CFA/auth.
  const wideLayout = isMarketing;

  // TopBar
  const showMarketingTop = !isAuth && isMarketing && !isLessonPlayer && !introActive;
  const showAppTop = !isAuth && (isCfaApp || path === "/profilo") && !!user;

  // BottomNav
  const showCfaBottom = (isCfaApp || path === "/profilo") && !!user;
  const showCoursesBottom = isCoursesArea && !!user && !isLessonPlayer;

  const currentScreen = PATH_TO_SCREEN[path];

  return (
    <div className={`app-shell${wideLayout ? " shell-wide" : ""}`}>
      <BackgroundPaths />
      {introActive && <LandingIntro lang={lang} onEnter={() => setIntroDone(true)} />}
      {showMarketingTop && <MarketingTopBar lang={lang} setLang={setLang} user={user} onLogout={handleLogout} />}
      {showAppTop && <TopBar lang={lang} setLang={setLang} isPremium={isPremium} setScreen={setScreen} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={path}
          style={{ position: "relative", zIndex: 1 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: [0.2, 0.7, 0.3, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<Homepage lang={lang} />} />
            <Route path="/cfa" element={user ? <Navigate to="/cfa/dashboard" replace /> : <CfaLanding lang={lang} />} />

            <Route path="/login" element={<Login setScreen={setScreen} setUser={handleSetUser} lang={lang} />} />
            <Route path="/register" element={<Register setScreen={setScreen} setUser={handleSetUser} lang={lang} />} />
            <Route path="/forgot" element={<Forgot setScreen={setScreen} lang={lang} />} />

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
            <Route path="/cfa/exam" element={
              <PremiumRoute user={user} isPremium={isPremium}>
                <Exam lang={lang} isPremium={isPremium} setScreen={setScreen} />
              </PremiumRoute>
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
