import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import CandlestickBackground from "./CandlestickBackground.jsx";
import OpeningBook3D from "./OpeningBook3D.jsx";

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

/*
  Full-screen scroll-driven intro: an animated candlestick chart behind a 3D book.
  Scrolling (wheel / touch) opens the book and zooms in — at full progress we
  "enter the book" and reveal the main landing via onEnter().
*/
export default function LandingIntro({ onEnter, lang }) {
  const t = lang === "it";
  const [progress, setProgress] = useState(0);
  const [entering, setEntering] = useState(false);
  const progressRef = useRef(0);
  const enteredRef = useRef(false);

  // Skip entirely when 3D/animation isn't appropriate.
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !supportsWebGL()) {
      onEnter?.();
    }
  }, [onEnter]);

  const finish = () => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    setEntering(true);
    setTimeout(() => onEnter?.(), 750);
  };

  const bump = (delta) => {
    if (enteredRef.current) return;
    const next = Math.min(Math.max(progressRef.current + delta, 0), 1);
    progressRef.current = next;
    setProgress(next);
    if (next >= 1) finish();
  };

  useEffect(() => {
    // lock page scroll while the intro is active
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onWheel = (e) => { e.preventDefault(); bump(e.deltaY * 0.0011); };
    let lastTouch = 0;
    const onTouchStart = (e) => { lastTouch = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      e.preventDefault();
      const y = e.touches[0].clientY;
      bump((lastTouch - y) * 0.006);
      lastTouch = y;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: entering ? 0 : 1 }}
      transition={{ duration: 0.7 }}
      style={{
        position: "fixed", inset: 0, zIndex: 50, overflow: "hidden",
        background: "#EAEFFB", touchAction: "none",
      }}
    >
      {/* evolving candlestick chart */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - progress * 0.55, transition: "opacity .1s linear" }}>
        <CandlestickBackground />
      </div>
      {/* soft indigo vignette so the book reads clearly */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 48%, rgba(234,239,251,0.1), rgba(20,28,70,0.32) 78%)" }} />

      {/* 3D book */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
        <OpeningBook3D progressRef={progressRef} />
      </div>

      {/* white flash as we enter the book */}
      <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none",
        background: "#F7F2E6", opacity: Math.max(0, progress - 0.82) / 0.18 }} />

      {/* title + scroll hint, fade out as the book opens */}
      <div style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
        padding: "48px 20px", opacity: 1 - progress * 1.4 }}>
        <h1 className="display" style={{ margin: 0, color: "#0B1437", fontSize: "clamp(34px,9vw,64px)", textShadow: "0 4px 30px rgba(124,92,255,0.18)" }}>
          Odds<span style={{ color: "#7C5CFF" }}>Finance</span>
        </h1>
        <div style={{ textAlign: "center", color: "#3B5BFF" }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 10 }}>
            {t ? "Scorri per entrare" : "Scroll to enter"}
          </div>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.4, repeat: Infinity }}
            style={{ fontSize: 22, color: "#3B5BFF" }}>↓</motion.div>
        </div>
      </div>

      {/* skip */}
      <button onClick={finish}
        style={{ position: "absolute", top: 18, right: 18, zIndex: 5, cursor: "pointer",
          padding: "7px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-ui)",
          color: "#0B1437", background: "rgba(255,255,255,0.55)", border: "1px solid rgba(60,80,180,0.25)" }}>
        {t ? "Salta" : "Skip"}
      </button>
    </motion.div>
  );
}
