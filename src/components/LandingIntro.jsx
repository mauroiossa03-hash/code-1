import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/*
  Intro semplice ed efficace: sfondo chiaro, solo il toro (verde) e l'orso
  (rosso) ritagliati dalla foto. Partono ai lati correndo sul posto, poi
  caricano uno contro l'altro fino allo scontro al centro; quindi si entra
  nell'app. Nessun testo.
*/
export default function LandingIntro({ onEnter, lang }) {
  const t = lang === "it";
  const [charge, setCharge] = useState(false);
  const [impact, setImpact] = useState(false);
  const [entering, setEntering] = useState(false);
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
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

    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);

    // sequenza: corsa sul posto → carica → scontro → entra
    const t1 = setTimeout(() => setCharge(true), 750);
    const t2 = setTimeout(() => setImpact(true), 1950);
    const t3 = setTimeout(() => finish(), 2500);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dist = Math.max(110, Math.min(w * 0.26, 320)); // quanto caricano verso il centro

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
      {/* leggera scossa allo scontro */}
      <motion.div
        animate={impact ? { x: [0, -9, 8, -5, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* TORO (verde) — parte da sinistra, corre verso destra */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: charge ? dist : 0 }}
          transition={{ duration: 1.2, ease: [0.5, 0, 0.6, 1] }}
          style={{ position: "absolute", left: "3vw", bottom: "24vh", transformOrigin: "bottom center" }}
        >
          <GroundShadow />
          <motion.img
            src="/bull.png" alt="Toro"
            animate={{ y: [0, -14, 0], rotate: [0, -1.5, 0] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ height: "clamp(190px, 44vh, 440px)", width: "auto", display: "block",
              filter: "drop-shadow(0 0 16px rgba(18,167,103,0.45))" }}
            onError={(e) => { e.currentTarget.style.opacity = 0; }}
          />
        </motion.div>

        {/* ORSO (rosso) — parte da destra, corre verso sinistra */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: charge ? -dist : 0 }}
          transition={{ duration: 1.2, ease: [0.5, 0, 0.6, 1] }}
          style={{ position: "absolute", right: "3vw", bottom: "24vh", transformOrigin: "bottom center" }}
        >
          <GroundShadow />
          <motion.img
            src="/bear.png" alt="Orso"
            animate={{ y: [0, -12, 0], rotate: [0, 1.5, 0] }}
            transition={{ duration: 0.44, repeat: Infinity, ease: "easeInOut" }}
            style={{ height: "clamp(170px, 40vh, 400px)", width: "auto", display: "block",
              filter: "drop-shadow(0 0 16px rgba(226,58,99,0.45))" }}
            onError={(e) => { e.currentTarget.style.opacity = 0; }}
          />
        </motion.div>
      </motion.div>

      {/* flash dello scontro al centro */}
      <motion.div
        initial={{ opacity: 0, scale: 0.4 }}
        animate={impact ? { opacity: [0, 0.9, 0], scale: [0.4, 1.3, 1.8] } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: "absolute", top: "46%", left: "50%", width: 260, height: 260,
          marginLeft: -130, marginTop: -130, pointerEvents: "none", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(160,255,210,0.5) 40%, rgba(255,255,255,0) 70%)",
        }}
      />

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

/* ombra morbida a terra sotto ciascun animale (per ancorarli sullo sfondo chiaro) */
function GroundShadow() {
  return (
    <div style={{
      position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)",
      width: "78%", height: 26, borderRadius: "50%", pointerEvents: "none",
      background: "radial-gradient(ellipse, rgba(20,42,99,0.22), rgba(20,42,99,0) 70%)",
    }} />
  );
}
