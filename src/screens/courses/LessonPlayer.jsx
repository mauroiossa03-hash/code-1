import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { C } from "../../theme.js";
import {
  fetchCourseBySlug, isEnrolled, fetchLessonProgress, saveLessonProgress, formatDuration,
} from "../../data/courses.js";
import { getLessonSource } from "../../lib/video.js";
import { Spinner } from "../../components/primitives.jsx";
import {
  ArrowLeft, ChevronLeft, ChevronRight, PlayCircle, Lock, Check,
  Download, ChevronDown, FileText,
} from "../../components/icons.jsx";

/*
  Player lezione. L'accesso è gestito qui (non da EnrolledRoute) per poter
  consentire le lezioni is_preview anche ai non iscritti, come da spec.
  Le lezioni non-preview richiedono enrollment valido; in più la RLS lato
  Supabase impedisce comunque di leggere video_id senza accesso.
*/
const THROTTLE_MS = 10000;

export default function LessonPlayer({ lang, user }) {
  const t = lang === "it";
  const { slug, lessonSlug } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(undefined);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState({});
  const [source, setSource] = useState(null);
  const [denied, setDenied] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const videoRef = useRef(null);
  const lastSavedRef = useRef(0);

  // carica corso + enrollment + progressi
  useEffect(() => {
    let cancelled = false;
    fetchCourseBySlug(slug).then(async (c) => {
      if (cancelled) return;
      setCourse(c);
      if (!c) return;
      const enr = user ? await isEnrolled(c.id) : false;
      if (cancelled) return;
      setEnrolled(enr);
      const lessonIds = c.modules.flatMap((m) => m.lessons).map((l) => l.id);
      if (user) setProgress(await fetchLessonProgress(lessonIds));
    }).catch((e) => { console.error(e); if (!cancelled) setCourse(null); });
    return () => { cancelled = true; };
  }, [slug, user]);

  const flatLessons = useMemo(
    () => (course?.modules || []).flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title }))),
    [course],
  );
  const current = useMemo(
    () => flatLessons.find((l) => l.slug === lessonSlug),
    [flatLessons, lessonSlug],
  );
  const idx = current ? flatLessons.findIndex((l) => l.id === current.id) : -1;
  const prev = idx > 0 ? flatLessons[idx - 1] : null;
  const next = idx >= 0 && idx < flatLessons.length - 1 ? flatLessons[idx + 1] : null;

  const canAccess = current && (current.is_preview || enrolled);

  // risolvi la sorgente video quando cambia lezione
  useEffect(() => {
    let cancelled = false;
    setSource(null);
    setDenied(false);
    if (!current) return;
    if (!canAccess) { setDenied(true); return; }
    getLessonSource({ provider: current.video_provider, videoId: current.video_id })
      .then((s) => { if (!cancelled) setSource(s); })
      .catch((e) => { console.error("video source error:", e); if (!cancelled) setDenied(true); });
    return () => { cancelled = true; };
  }, [current, canAccess]);

  // tracking progressi (solo file/<video>, solo se loggato)
  const onTimeUpdate = () => {
    if (!user || !current) return;
    const v = videoRef.current;
    if (!v) return;
    const now = Date.now();
    if (now - lastSavedRef.current >= THROTTLE_MS) {
      lastSavedRef.current = now;
      saveLessonProgress(current.id, v.currentTime, false);
    }
  };
  const onEnded = () => {
    if (!user || !current) return;
    const v = videoRef.current;
    saveLessonProgress(current.id, v?.duration || current.duration_sec || 0, true);
    setProgress((p) => ({ ...p, [current.id]: { ...(p[current.id] || {}), completed_at: new Date().toISOString() } }));
  };

  if (course === undefined) return <Spinner pad={120} />;
  if (course === null || !current) {
    return (
      <div style={{ padding: "60px 22px", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
        <h1 className="display" style={{ fontSize: 24, marginBottom: 10 }}>{t ? "Lezione non trovata" : "Lesson not found"}</h1>
        <Link to={`/corsi/${slug}`} className="btn btn-ghost btn-sm"><ArrowLeft size={15} /> {t ? "Torna al corso" : "Back to course"}</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 18px 96px", position: "relative" }}>
      <div className="aurora" />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto" }}>
        <Link to={`/corsi/${slug}`} className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>
          <ArrowLeft size={15} /> {course.title}
        </Link>

        {/* Video */}
        <div style={{ borderRadius: 16, overflow: "hidden", background: "#000", marginBottom: 14, aspectRatio: "16 / 9" }}>
          {denied ? (
            <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: C.ink, color: C.onDarkSoft, textAlign: "center", padding: 20 }}>
              <div>
                <Lock size={28} style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: "#fff" }}>{t ? "Contenuto riservato" : "Locked content"}</div>
                <div style={{ fontSize: 12.5, marginBottom: 14 }}>{t ? "Iscriviti al corso per sbloccare questa lezione." : "Enroll in the course to unlock this lesson."}</div>
                <Link to={`/corsi/${slug}`} className="btn btn-white btn-sm">{t ? "Vai all'iscrizione" : "Go to enrollment"}</Link>
              </div>
            </div>
          ) : !source ? (
            <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: C.ink }}>
              <Spinner pad={0} />
            </div>
          ) : source.kind === "file" ? (
            <video ref={videoRef} src={source.src} controls playsInline
              onTimeUpdate={onTimeUpdate} onEnded={onEnded}
              style={{ width: "100%", height: "100%", display: "block" }} />
          ) : (
            <iframe src={source.src} title={current.title} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
              style={{ width: "100%", height: "100%", border: "none", display: "block" }} />
          )}
        </div>

        <h1 className="display" style={{ fontSize: 22, color: C.ink, marginBottom: 4 }}>{current.title}</h1>
        <div style={{ fontSize: 12, color: C.textMute, marginBottom: 14 }}>{current.moduleTitle}</div>
        {current.description && <p style={{ fontSize: 14, color: C.textSoft, lineHeight: 1.65, marginBottom: 16 }}>{current.description}</p>}

        {/* Risorse */}
        {Array.isArray(current.resources) && current.resources.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 8 }}>{t ? "Risorse" : "Resources"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {current.resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noreferrer" className="card card-hover"
                  style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                  <Download size={16} color={C.indigo} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{r.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Transcript */}
        {current.transcript && (
          <div className="card" style={{ padding: 0, marginBottom: 18, overflow: "hidden" }}>
            <button onClick={() => setShowTranscript((s) => !s)}
              style={{ width: "100%", padding: "13px 16px", display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer" }}>
              <FileText size={16} color={C.indigo} />
              <span style={{ flex: 1, textAlign: "left", fontSize: 13.5, fontWeight: 700, color: C.ink }}>{t ? "Trascrizione" : "Transcript"}</span>
              <ChevronDown size={16} style={{ transform: showTranscript ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
            </button>
            {showTranscript && (
              <div style={{ padding: "0 16px 16px", fontSize: 13, color: C.textSoft, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{current.transcript}</div>
            )}
          </div>
        )}

        {/* Prev / Next */}
        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          <button disabled={!prev} onClick={() => prev && navigate(`/corsi/${slug}/lezione/${prev.slug}`)}
            className="btn btn-ghost btn-block" style={{ padding: 12, opacity: prev ? 1 : 0.4 }}>
            <ChevronLeft size={16} /> {t ? "Precedente" : "Previous"}
          </button>
          <button disabled={!next} onClick={() => next && navigate(`/corsi/${slug}/lezione/${next.slug}`)}
            className="btn btn-primary btn-block" style={{ padding: 12, opacity: next ? 1 : 0.4 }}>
            {t ? "Successiva" : "Next"} <ChevronRight size={16} />
          </button>
        </div>

        {/* Indice lezioni */}
        <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 10 }}>{t ? "Contenuto del corso" : "Course content"}</div>
        <div className="card" style={{ padding: 6 }}>
          {flatLessons.map((l, i) => {
            const active = l.id === current.id;
            const done = !!progress[l.id]?.completed_at;
            const accessible = l.is_preview || enrolled;
            const inner = (
              <>
                <span style={{ width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0,
                  background: done ? C.greenDim : active ? C.indigoDim : C.surfaceUp,
                  color: done ? C.green : accessible ? C.indigo : C.textMute }}>
                  {done ? <Check size={14} /> : accessible ? <PlayCircle size={15} /> : <Lock size={13} />}
                </span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: active ? 800 : 600, color: active ? C.indigo : C.ink }}>{l.title}</span>
                <span style={{ fontSize: 11, color: C.textMute }}>{l.duration_sec ? formatDuration(l.duration_sec, t ? "it" : "en") : ""}</span>
              </>
            );
            const rowStyle = { display: "flex", alignItems: "center", gap: 10, padding: "9px 10px",
              borderBottom: i < flatLessons.length - 1 ? `1px solid ${C.border}` : "none", textDecoration: "none",
              background: active ? C.surfaceUp : "transparent", borderRadius: 8 };
            return accessible ? (
              <Link key={l.id} to={`/corsi/${slug}/lezione/${l.slug}`} style={rowStyle}>{inner}</Link>
            ) : (
              <div key={l.id} style={{ ...rowStyle, opacity: 0.8 }}>{inner}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
