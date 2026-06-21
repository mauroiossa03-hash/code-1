import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import CandlestickBackground from "./CandlestickBackground.jsx";

/*
  Intro guidata dallo scroll, sfondo chiaro con le candlestick dietro.
  Scorrendo: le candlestick si avvicinano (zoom) e il toro (verde, da sinistra)
  e l'orso (rosso, da destra) — ritagliati dalla foto — si avvicinano tra loro
  fino allo scontro al centro; a quel punto si entra nell'app. Prima dello
  scroll corrono sul posto (gallop). Nessun testo.
*/
export default function LandingIntro({ onEnter, lang }) {
  const t = lang === "it";
  const [progress, setProgress] = useState(0);
  const [entering, setEntering] = useState(false);
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const progressRef = useRef(0);
  const enteredRef = useRef(false);

  const finish = () => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    setEntering(true);
    setTimeout(() => onEnter?.(), 600);
  };

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { onEnter?.(); return; }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const bump = (delta) => {
      if (enteredRef.current) return;
      const next = Math.min(Math.max(progressRef.current + delta, 0), 1);
      progressRef.current = next;
      setProgress(next);
      if (next >= 1) finish();
    };

    const onWheel = (e) => { e.preventDefault(); bump(e.deltaY * 0.0011); };
    let lastTouch = 0;
    const onTouchStart = (e) => { lastTouch = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      e.preventDefault();
      const y = e.touches[0].clientY;
      bump((lastTouch - y) * 0.006);
      lastTouch = y;
    };
    const onResize = () => setW(window.innerWidth);

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dist = Math.max(110, Math.min(w * 0.26, 320));     // avvicinamento animali
  const clash = Math.max(0, (progress - 0.86) / 0.14);     // 0→1 nello scontro finale
  const shakeX = clash > 0 ? Math.sin(progress * 130) * clash * 6 : 0;
  const textFade = Math.max(0, 1 - progress * 2.2);        // titolo + hint svaniscono scorrendo

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: entering ? 0 : 1 }}
      transition={{ duration: 0.55 }}
      style={{
        position: "fixed", inset: 0, zIndex: 50, overflow: "hidden", touchAction: "none",
        background: "linear-gradient(180deg, #FFFFFF 0%, #EEF2FB 100%)",
      }}
    >
      {/* candlestick chiare dietro — si avvicinano (zoom) man mano che si scorre */}
      <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + progress * 0.18})`,
        transformOrigin: "50% 62%", transition: "transform .08s linear" }}>
        <CandlestickBackground />
      </div>

      {/* animali (con leggera scossa allo scontro) */}
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${shakeX}px)` }}>
        {/* TORO (verde) — da sinistra verso il centro */}
        <div style={{ position: "absolute", left: "3vw", bottom: "24vh",
          transform: `translateX(${progress * dist}px)` }}>
          <GroundShadow />
          <motion.img
            src="/bull.png" alt="Toro"
            animate={{ y: [0, -8, 0], rotate: [0, -1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ height: "clamp(180px, 42vh, 430px)", width: "auto", display: "block",
              filter: "drop-shadow(0 0 16px rgba(18,167,103,0.45))" }}
            onError={(e) => { e.currentTarget.style.opacity = 0; }}
          />
        </div>

        {/* ORSO (rosso) — da destra verso il centro */}
        <div style={{ position: "absolute", right: "3vw", bottom: "24vh",
          transform: `translateX(${-progress * dist}px)` }}>
          <GroundShadow />
          <motion.img
            src="/bear.png" alt="Orso"
            animate={{ y: [0, -7, 0], rotate: [0, 1, 0] }}
            transition={{ duration: 0.54, repeat: Infinity, ease: "easeInOut" }}
            style={{ height: "clamp(165px, 39vh, 400px)", width: "auto", display: "block",
              filter: "drop-shadow(0 0 16px rgba(226,58,99,0.45))" }}
            onError={(e) => { e.currentTarget.style.opacity = 0; }}
          />
        </div>
      </div>

      {/* flash dello scontro al centro */}
      <div style={{
        position: "absolute", top: "46%", left: "50%", width: 280, height: 280,
        marginLeft: -140, marginTop: -140, pointerEvents: "none", borderRadius: "50%",
        opacity: clash, transform: `scale(${0.5 + clash})`,
        background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(160,255,210,0.5) 40%, rgba(255,255,255,0) 70%)",
      }} />

      {/* Titolo brand — svanisce man mano che si scorre */}
      <div style={{ position: "absolute", top: "8vh", left: 0, right: 0, textAlign: "center",
        zIndex: 10, pointerEvents: "none", opacity: textFade, transition: "opacity .1s linear" }}>
        <div className="display" style={{ fontSize: "clamp(34px, 9vw, 64px)", color: "#0B1437", lineHeight: 1,
          textShadow: "0 2px 18px rgba(255,255,255,0.6)" }}>
          Odds<span style={{ color: "#7C5CFF" }}>Finance</span>
        </div>
      </div>

      {/* Hint "Scorri per entrare" + chevron — svanisce scorrendo */}
      <div style={{ position: "absolute", bottom: 26, left: 0, right: 0, textAlign: "center",
        zIndex: 10, pointerEvents: "none", opacity: textFade, transition: "opacity .1s linear" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase",
          color: "#3B5BFF", marginBottom: 8 }}>
          {t ? "Scorri per entrare" : "Scroll to enter"}
        </div>
        <motion.div animate={{ y: [0, 9, 0] }} transition={{ duration: 1.4, repeat: Infinity }}
          style={{ fontSize: 24, color: "#3B5BFF", fontWeight: 700, lineHeight: 1 }}>⌄</motion.div>
      </div>

      {/* skip */}
      <button onClick={finish}
        style={{ position: "absolute", top: 18, right: 18, zIndex: 20, cursor: "pointer",
          padding: "7px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-ui)",
          color: "#0B1437", background: "rgba(255,255,255,0.7)", border: "1px solid rgba(60,80,180,0.25)" }}>
        {t ? "Salta" : "Skip"}
      </button>
    </motion.div>
  );
}

/* ombra morbida a terra sotto ciascun animale */
function GroundShadow() {
  return (
    <div style={{
      position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)",
      width: "78%", height: 26, borderRadius: "50%", pointerEvents: "none",
      background: "radial-gradient(ellipse, rgba(20,42,99,0.22), rgba(20,42,99,0) 70%)",
    }} />
  );
}
