import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "./lib/supabase.js";
import { TopBar, BottomNav } from "./components/Nav.jsx";
import BackgroundPaths from "./components/BackgroundPaths.jsx";

import Landing from "./screens/Landing.jsx";
import Login from "./screens/Login.jsx";
import Register from "./screens/Register.jsx";
import Forgot from "./screens/Forgot.jsx";
import Dashboard from "./screens/Dashboard.jsx";
import Quiz from "./screens/Quiz.jsx";
import Flashcards from "./screens/Flashcards.jsx";
import Exam from "./screens/Exam.jsx";
import Pricing from "./screens/Pricing.jsx";
import Profile from "./screens/Profile.jsx";

const AUTH_SCREENS = ["landing", "login", "register", "forgot"];

function userFromSession(session) {
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.user_metadata?.full_name || session.user.email.split("@")[0],
  };
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [lang, setLang] = useState("it");
  const [isPremium, setIsPremium] = useState(false);
  const [activeTopic, setActiveTopic] = useState("all");
  const [user, setUser] = useState(null);

  /* ── Auth session ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(userFromSession(session)); setScreen("dashboard"); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(userFromSession(session));
        setScreen((s) => (AUTH_SCREENS.includes(s) ? "dashboard" : s));
      } else {
        setUser(null);
        setScreen("landing");
      }
    });
    return () => subscription.unsubscribe();
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

  const handleSetUser = (u) => { setUser(u); setScreen("dashboard"); };
  const showNav = !AUTH_SCREENS.includes(screen) && !!user;

  const renderScreen = () => {
    switch (screen) {
      case "landing": return <Landing setScreen={setScreen} lang={lang} setLang={setLang} />;
      case "login": return <Login setScreen={setScreen} setUser={handleSetUser} lang={lang} />;
      case "register": return <Register setScreen={setScreen} setUser={handleSetUser} lang={lang} />;
      case "forgot": return <Forgot setScreen={setScreen} lang={lang} />;
      case "pricing": return <Pricing lang={lang} user={user} setScreen={setScreen} />;
      default: break;
    }
    if (!user) return <Landing setScreen={setScreen} lang={lang} setLang={setLang} />;
    switch (screen) {
      case "dashboard": return <Dashboard setScreen={setScreen} setActiveTopic={setActiveTopic} lang={lang} isPremium={isPremium} user={user} />;
      case "quiz": return <Quiz activeTopic={activeTopic} lang={lang} isPremium={isPremium} setScreen={setScreen} />;
      case "flashcard": return <Flashcards lang={lang} isPremium={isPremium} />;
      case "exam": return <Exam lang={lang} isPremium={isPremium} setScreen={setScreen} />;
      case "profile": return <Profile user={user} setUser={setUser} setScreen={setScreen} lang={lang} setLang={setLang} isPremium={isPremium} />;
      default: return <Dashboard setScreen={setScreen} setActiveTopic={setActiveTopic} lang={lang} isPremium={isPremium} user={user} />;
    }
  };

  return (
    <div className="app-shell">
      <BackgroundPaths />
      {showNav && <TopBar lang={lang} setLang={setLang} isPremium={isPremium} setScreen={setScreen} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          style={{ position: "relative", zIndex: 1 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: [0.2, 0.7, 0.3, 1] }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      {showNav && <BottomNav screen={screen} setScreen={setScreen} lang={lang} />}
    </div>
  );
}
