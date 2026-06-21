import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/*
  Adattamento JSX + CSS del componente "scroll-expansion-hero".

  L'originale fornito è scritto per Next.js + TypeScript + Tailwind + shadcn
  (usa next/image, 'use client', classi Tailwind). Questo progetto è invece
  Vite + React (JSX) + CSS puro, quindi qui l'effetto è riprodotto 1:1 ma:
    - <Image> di next  → <img> / <video> standard;
    - classi Tailwind  → stili inline + classi CSS del progetto (.sem-*);
    - aggiunti `onComplete` (callback a espansione completa) e `backgroundNode`
      (per usare uno sfondo animato live, es. il canvas delle candlestick).

  Comportamento: il media centrale si espande man mano che si scrolla, il titolo
  si divide in due parole che si allontanano, lo sfondo sfuma. A espansione
  completa (progress ≥ 1) viene invocato onComplete().
*/
export default function ScrollExpandMedia({
  mediaType = "image",
  mediaSrc,
  posterSrc,
  bgImageSrc,
  backgroundNode,
  renderMedia,
  title = "",
  date,
  scrollToExpand,
  textBlend = false,
  onComplete,
  children,
}) {
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const doneRef = useRef(false);
  const progressRef = useRef(0);
  const touchRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const bump = (delta) => {
      if (doneRef.current) return;
      const next = Math.min(Math.max(progressRef.current + delta, 0), 1);
      progressRef.current = next;
      setProgress(next);
      if (next >= 1 && !doneRef.current) {
        doneRef.current = true;
        onComplete?.();
      }
    };

    const onWheel = (e) => { e.preventDefault(); bump(e.deltaY * 0.0009); };
    const onTouchStart = (e) => { touchRef.current = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      e.preventDefault();
      const y = e.touches[0].clientY;
      const dy = touchRef.current - y;
      // più sensibile quando si scrolla in giù (espande)
      bump(dy * (dy < 0 ? 0.008 : 0.006));
      touchRef.current = y;
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
  }, [onComplete]);

  const mediaWidth = 300 + progress * (isMobile ? 650 : 1250);
  const mediaHeight = 400 + progress * (isMobile ? 200 : 400);
  const textTranslateX = progress * (isMobile ? 180 : 150);
  const idle = progress < 0.015; // prima dello scroll: il media "respira" sul posto

  const firstWord = title ? title.split(" ")[0] : "";
  const rest = title ? title.split(" ").slice(1).join(" ") : "";

  return (
    <div className="sem-root">
      {/* Sfondo (canvas live o immagine) che sfuma con lo scroll */}
      <motion.div className="sem-bg" animate={{ opacity: 1 - progress * 0.5 }} transition={{ duration: 0.1 }}>
        {backgroundNode || (bgImageSrc ? <img src={bgImageSrc} alt="" className="sem-bg-img" /> : null)}
        <div className="sem-bg-tint" />
      </motion.div>

      <div className="sem-stage">
        {/* Media che si espande */}
        <div
          className={`sem-media ${idle ? "sem-idle" : ""}`}
          style={{ width: `${mediaWidth}px`, height: `${mediaHeight}px`, maxWidth: "95vw", maxHeight: "85vh" }}
        >
          {renderMedia ? (
            <div className="sem-media-el">{renderMedia(progress)}</div>
          ) : mediaType === "video" ? (
            <video src={mediaSrc} poster={posterSrc} autoPlay muted loop playsInline preload="auto" className="sem-media-el" />
          ) : (
            <img src={mediaSrc} alt={title || "media"} className="sem-media-el"
              onError={(e) => { e.currentTarget.style.opacity = 0; }} />
          )}

          {/* Glow verde "bull che vince" che cresce con lo scroll */}
          <div className="sem-media-glow" style={{ opacity: 0.12 + progress * 0.5 }} />
          {/* Velo scuro che si schiarisce man mano che si espande */}
          <div className="sem-media-veil" style={{ opacity: 0.5 - progress * 0.35 }} />

          {(date || scrollToExpand) && (
            <div className="sem-media-caption">
              {date && <p className="sem-date" style={{ transform: `translateX(-${textTranslateX}vw)` }}>{date}</p>}
              {scrollToExpand && <p className="sem-hint" style={{ transform: `translateX(${textTranslateX}vw)` }}>{scrollToExpand}</p>}
            </div>
          )}
        </div>

        {/* Titolo che si divide in due e si allontana */}
        <div className={`sem-title ${textBlend ? "sem-blend" : ""}`}>
          <motion.h2 style={{ transform: `translateX(-${textTranslateX}vw)` }}>{firstWord}</motion.h2>
          <motion.h2 style={{ transform: `translateX(${textTranslateX}vw)` }}>{rest}</motion.h2>
        </div>
      </div>

      {children && (
        <motion.section className="sem-content" animate={{ opacity: progress >= 1 ? 1 : 0 }} transition={{ duration: 0.7 }}>
          {children}
        </motion.section>
      )}
    </div>
  );
}
