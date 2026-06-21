import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import CandlestickBackground from "./CandlestickBackground.jsx";
import ScrollExpandMedia from "./ScrollExpandMedia.jsx";

/*
  Intro a pieno schermo guidata dallo scroll, basata sull'effetto del componente
  "scroll-expansion-hero" (adattato a JSX/CSS in ScrollExpandMedia.jsx).

  Il media centrale è lo scontro bull (verde) vs bear (rosso): prima dello scroll
  "respira" sul posto (animazione idle), poi scorrendo si espande mentre un glow
  verde cresce (il bull prevale). Dietro, le candlestick continuano a muoversi
  con lo stesso criterio di prima. A espansione completa si entra nell'app.
*/
export default function LandingIntro({ onEnter, lang }) {
  const t = lang === "it";
  const [entering, setEntering] = useState(false);
  const enteredRef = useRef(false);

  // Salta l'intro se l'utente preferisce ridurre il movimento.
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) onEnter?.();
  }, [onEnter]);

  const finish = () => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    setEntering(true);
    setTimeout(() => onEnter?.(), 750);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: entering ? 0 : 1 }}
      transition={{ duration: 0.7 }}
      style={{ position: "fixed", inset: 0, zIndex: 50, overflow: "hidden", background: "#040c14", touchAction: "none" }}
    >
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="/bull-bear.webp"
        backgroundNode={<CandlestickBackground dark />}
        title="Odds Finance"
        scrollToExpand={t ? "Scorri — il toro batte l'orso" : "Scroll — the bull beats the bear"}
        textBlend={false}
        onComplete={finish}
      />

      {/* flash di "vittoria" all'ingresso */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: entering ? 0.9 : 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: "absolute", inset: 0, zIndex: 6, pointerEvents: "none", background: "#0e2a33" }}
      />

      {/* skip */}
      <button onClick={finish}
        style={{ position: "absolute", top: 18, right: 18, zIndex: 20, cursor: "pointer",
          padding: "7px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-ui)",
          color: "#EAF3FF", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}>
        {t ? "Salta" : "Skip"}
      </button>
    </motion.div>
  );
}
