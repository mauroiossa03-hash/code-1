import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { C } from "../../theme.js";
import { supabase } from "../../lib/supabase.js";
import {
  TOPIC_TO_VOLUME, FREE_FLASHCARDS, MOCK_FLASHCARDS, dbFlashcardToApp,
} from "../../data.js";
import { Spinner, TopicBadge } from "../../components/primitives.jsx";
import { TopicIcon } from "../../components/icons.jsx";
import { Check, X, Lock, RotateCw, Crown } from "lucide-react";

/* Consumo gratuito persistito per utente (le flashcard non sono per-topic qui). */
const cardsKey = (uid) => `of_freecards_v1:${uid || "anon"}`;
const readSeen = (uid) => {
  try { return parseInt(localStorage.getItem(cardsKey(uid)) || "0", 10) || 0; }
  catch { return 0; }
};
const writeSeen = (uid, val) => {
  try { localStorage.setItem(cardsKey(uid), String(val)); } catch { /* ignore */ }
};

export default function Flashcards({ lang, isPremium }) {
  const t = lang === "it";
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loadingF, setLoadingF] = useState(true);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [uid, setUid] = useState(null);
  const [seen, setSeen] = useState(0);          // flashcard gratuite già consumate (persistente)
  const [seenLoaded, setSeenLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data?.user?.id || "anon"));
  }, []);

  useEffect(() => {
    if (uid == null) return;
    setSeen(readSeen(uid));
    setSeenLoaded(true);
  }, [uid]);

  useEffect(() => {
    const load = async () => {
      setLoadingF(true);
      const volumes = Object.values(TOPIC_TO_VOLUME);
      if (volumes.length === 0) { setCards(MOCK_FLASHCARDS); setLoadingF(false); return; }
      const { data, error } = await supabase.from("flashcards").select("*").in("volume", volumes).order("id");
      setCards(error || !data || data.length === 0 ? MOCK_FLASHCARDS : data.map(dbFlashcardToApp));
      setLoadingF(false);
    };
    load();
  }, []);

  const visibleCards = isPremium ? cards : cards.slice(0, FREE_FLASHCARDS);
  const hitFreeLimit = !isPremium && seenLoaded && seen >= FREE_FLASHCARDS;
  const card = visibleCards[idx % Math.max(visibleCards.length, 1)];

  const next = (knew) => {
    if (knew && card) setKnown((k) => [...k, card.id]);
    if (!isPremium) {
      const nv = seen + 1;
      setSeen(nv);
      writeSeen(uid, nv);
    }
    setFlipped(false);
    setTimeout(() => setIdx((i) => (i + 1) % Math.max(visibleCards.length, 1)), 180);
  };

  if (loadingF || !seenLoaded) {
    return (
      <div style={{ padding: "24px 18px 96px" }}>
        <h2 className="display" style={{ fontSize: 24, color: C.ink, marginBottom: 24 }}>Flashcards</h2>
        <Spinner />
      </div>
    );
  }

  /* Limite gratuito raggiunto → schermata di upgrade (niente loop infinito). */
  if (hitFreeLimit) {
    return (
      <div style={{ padding: "40px 24px 96px", textAlign: "center", position: "relative" }}>
        <div className="aurora" />
        <div style={{ position: "relative", zIndex: 1 }} className="anim-fadeIn">
          <div style={{ width: 84, height: 84, borderRadius: 24, margin: "0 auto 18px", display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${C.indigoDim}, ${C.violetDim})`, color: C.indigo }}>
            <Lock size={38} />
          </div>
          <h2 className="display" style={{ fontSize: 24, color: C.ink, marginBottom: 10 }}>
            {t ? `Hai usato le ${FREE_FLASHCARDS} flashcard gratuite` : `You've used your ${FREE_FLASHCARDS} free flashcards`}
          </h2>
          <p style={{ fontSize: 13.5, color: C.textSoft, lineHeight: 1.7, marginBottom: 26, maxWidth: 320, marginInline: "auto" }}>
            {t ? `Sblocca tutte le ${cards.length}+ flashcard con ripetizione spaziata e tutti i topic con Premium.`
               : `Unlock all ${cards.length}+ flashcards with spaced repetition across every topic with Premium.`}
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/pricing")}>
            <Crown size={18} /> {t ? "Scopri Premium" : "See Premium Plans"}
          </button>
        </div>
      </div>
    );
  }

  const pct = visibleCards.length > 0 ? ((idx + 1) / visibleCards.length) * 100 : 0;

  return (
    <div style={{ padding: "24px 18px 96px", position: "relative" }}>
      <div className="aurora" />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 className="display" style={{ fontSize: 24, color: C.ink }}>Flashcards</h2>
          <span className="mono" style={{ fontSize: 12, color: C.textMute }}>{idx + 1}/{visibleCards.length}</span>
        </div>

        <div style={{ height: 4, background: C.surfaceUp, borderRadius: 99, marginBottom: 26, overflow: "hidden" }}>
          <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }}
            style={{ height: "100%", background: `linear-gradient(90deg, ${C.indigo}, ${C.violet})`, borderRadius: 99 }} />
        </div>

        {card && (
          <>
            {/* 3D flip card */}
            <div onClick={() => setFlipped((f) => !f)} role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFlipped((f) => !f); }}
              style={{ perspective: 1400, cursor: "pointer", marginBottom: 20 }}>
              <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.55, ease: [0.2, 0.7, 0.3, 1] }}
                style={{ position: "relative", minHeight: 280, transformStyle: "preserve-3d" }}>
                {/* Front */}
                <Face>
                  <FaceHeader topic={card.topic} tag={card.tag} dark={false} />
                  <FaceBody label={t ? "DOMANDA" : "QUESTION"} text={card.front} dark={false} />
                  <FaceHint text={t ? "Tocca per la risposta" : "Tap for answer"} dark={false} />
                </Face>
                {/* Back */}
                <Face back>
                  <FaceHeader topic={card.topic} tag={card.tag} dark />
                  <FaceBody label={t ? "RISPOSTA" : "ANSWER"} text={card.back} dark />
                  <FaceHint text={t ? "Tocca per la domanda" : "Tap for question"} dark />
                </Face>
              </motion.div>
            </div>

            {flipped && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button onClick={() => next(false)} className="btn btn-ghost" style={{ padding: 14, borderColor: C.red, color: C.red }}>
                  <X size={17} /> {t ? "Da ripassare" : "Study more"}
                </button>
                <button onClick={() => next(true)} className="btn btn-block" style={{ padding: 14, background: `linear-gradient(135deg, ${C.green}, #0E9C5E)`, color: "#fff" }}>
                  <Check size={17} /> {t ? "Lo so" : "Got it!"}
                </button>
              </motion.div>
            )}
          </>
        )}

        {!isPremium && (
          <div className="card" style={{ marginTop: 22, padding: 16, borderColor: C.borderHi, background: C.indigoDim }}>
            <div style={{ fontSize: 13, color: C.indigoDeep, fontWeight: 800, marginBottom: 4, display: "flex", alignItems: "center", gap: 7 }}>
              <Lock size={14} /> {t ? `${Math.max(0, FREE_FLASHCARDS - seen)} flashcard gratuite rimanenti (${cards.length} totali)` : `${Math.max(0, FREE_FLASHCARDS - seen)} free flashcards left (${cards.length} total)`}
            </div>
            <div style={{ fontSize: 12, color: C.textSoft }}>{t ? "Sblocca tutte le flashcard con Premium" : "Unlock all flashcards with Premium"}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Flip-card face helpers ── */
function Face({ children, back = false }) {
  return (
    <div
      style={{
        position: back ? "absolute" : "relative", inset: back ? 0 : undefined,
        minHeight: 280, padding: "26px 24px", borderRadius: 24,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : "none",
        background: back ? `linear-gradient(150deg, ${C.ink}, ${C.navy} 70%, ${C.indigoDeep})` : "var(--surface)",
        border: back ? "1px solid rgba(255,255,255,0.14)" : `1px solid ${C.border}`,
        boxShadow: "var(--shadow-md)",
      }}
    >
      {children}
    </div>
  );
}
function FaceHeader({ topic, tag, dark }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      {dark ? (
        <span className="tag" style={{ background: "rgba(255,255,255,0.12)", color: "#EAF1FF", border: "1px solid rgba(255,255,255,0.18)" }}>
          <TopicIcon name="target" size={12} /> Answer
        </span>
      ) : (
        <TopicBadge topic={topic} />
      )}
      <span className="tag" style={{ background: dark ? "rgba(240,180,41,0.18)" : "rgba(201,138,18,0.12)", color: dark ? "#F0B429" : C.gold, border: `1px solid ${dark ? "rgba(240,180,41,0.3)" : "rgba(201,138,18,0.25)"}` }}>
        {tag}
      </span>
    </div>
  );
}
function FaceBody({ label, text, dark }) {
  return (
    <div>
      <div className="eyebrow" style={{ color: dark ? "#9FB4FF" : C.textMute, marginBottom: 12 }}>{label}</div>
      <div className="display" style={{ fontSize: 18, lineHeight: 1.5, color: dark ? "#fff" : C.ink, whiteSpace: "pre-line", fontWeight: 500 }}>{text}</div>
    </div>
  );
}
function FaceHint({ text, dark }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11.5, color: dark ? "#9FB4FF" : C.textMute, marginTop: 16 }}>
      <RotateCw size={13} /> {text}
    </div>
  );
}
