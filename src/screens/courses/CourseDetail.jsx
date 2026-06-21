import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { C } from "../../theme.js";
import { fetchCourseBySlug, isEnrolled, formatDuration } from "../../data/courses.js";
import { buildCourseCheckoutUrl } from "../../lib/checkout.js";
import { Spinner } from "../../components/primitives.jsx";
import {
  ArrowLeft, PlayCircle, Lock, Clock, Gauge, Check, ShieldCheck, ListVideo,
  AlertTriangle, X,
} from "../../components/icons.jsx";

const LEVELS = {
  beginner:     { it: "Base",        en: "Beginner" },
  intermediate: { it: "Intermedio",  en: "Intermediate" },
  advanced:     { it: "Avanzato",    en: "Advanced" },
};

export default function CourseDetail({ lang, user }) {
  const t = lang === "it";
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(undefined); // undefined=loading, null=not found
  const [enrolled, setEnrolled] = useState(false);
  // Banner inline al posto di alert() nativo quando manca lemonsqueezy_variant_id.
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchCourseBySlug(slug)
      .then(async (c) => {
        if (cancelled) return;
        setCourse(c);
        if (c && user) setEnrolled(await isEnrolled(c.id));
      })
      .catch((e) => { console.error(e); if (!cancelled) setCourse(null); });
    return () => { cancelled = true; };
  }, [slug, user]);

  if (course === undefined) return <Spinner pad={120} />;
  if (course === null) {
    return (
      <div style={{ padding: "60px 22px", textAlign: "center", maxWidth: "var(--page-max, 480px)", margin: "0 auto" }}>
        <h1 className="display" style={{ fontSize: 24, marginBottom: 10 }}>{t ? "Corso non trovato" : "Course not found"}</h1>
        <Link to="/corsi" className="btn btn-ghost btn-sm"><ArrowLeft size={15} /> {t ? "Torna al catalogo" : "Back to catalog"}</Link>
      </div>
    );
  }

  const allLessons = (course.modules || []).flatMap((m) => m.lessons);
  const firstPreview = allLessons.find((l) => l.is_preview);

  const startCheckout = () => {
    if (!user) { navigate(`/login?next=${encodeURIComponent(`/corsi/${slug}`)}`); return; }
    try {
      setCheckoutError("");
      window.location.href = buildCourseCheckoutUrl(user, course);
    } catch (e) {
      console.error("buildCourseCheckoutUrl failed:", e);
      setCheckoutError(t
        ? "Acquisto temporaneamente non disponibile per questo corso. Stiamo lavorando per riattivarlo a breve."
        : "Checkout temporarily unavailable for this course. We're working to bring it back soon.");
    }
  };

  const goToCourse = () => {
    const target = allLessons[0];
    if (target) navigate(`/corsi/${slug}/lezione/${target.slug}`);
  };

  return (
    <div style={{ padding: "16px 18px 120px", position: "relative" }}>
      <div className="aurora" />
      <div style={{ position: "relative", zIndex: 1, maxWidth: "var(--page-max, 480px)", margin: "0 auto" }}>
        <Link to="/corsi" className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }}>
          <ArrowLeft size={15} /> {t ? "Catalogo" : "Catalog"}
        </Link>

        {/* Banner errore checkout */}
        <AnimatePresence>
          {checkoutError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              role="alert"
              style={{
                marginBottom: 14, padding: "12px 14px", borderRadius: 12,
                background: "rgba(220, 38, 38, 0.08)", border: "1px solid rgba(220, 38, 38, 0.25)",
                color: C.red, fontSize: 13, lineHeight: 1.55,
                display: "flex", alignItems: "flex-start", gap: 10,
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>{checkoutError}</div>
              <button
                onClick={() => setCheckoutError("")}
                aria-label="dismiss"
                style={{ background: "transparent", border: "none", color: C.red, cursor: "pointer", padding: 0, lineHeight: 1 }}
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero cover / trailer */}
        <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 18, boxShadow: "var(--shadow-md)" }}>
          <div style={{ height: 180, background: course.cover_url
            ? `center/cover no-repeat url(${course.cover_url})`
            : `linear-gradient(135deg, ${C.indigo}, ${C.violet})`,
            display: "grid", placeItems: "center" }}>
            {!course.cover_url && <ListVideo size={48} color="rgba(255,255,255,0.85)" />}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {course.level && (
            <span className="tag" style={{ background: C.indigoDim, color: C.indigoDeep, border: `1px solid ${C.border}` }}>
              <Gauge size={11} /> {LEVELS[course.level]?.[t ? "it" : "en"] || course.level}
            </span>
          )}
          {course.total_minutes > 0 && (
            <span className="tag" style={{ background: C.surfaceUp, color: C.textSoft, border: `1px solid ${C.border}` }}>
              <Clock size={11} /> {formatDuration(course.total_minutes * 60, t ? "it" : "en")}
            </span>
          )}
          {course.total_lessons > 0 && (
            <span className="tag" style={{ background: C.surfaceUp, color: C.textSoft, border: `1px solid ${C.border}` }}>
              <PlayCircle size={11} /> {course.total_lessons} {t ? "lezioni" : "lessons"}
            </span>
          )}
        </div>

        <h1 className="display" style={{ fontSize: 28, color: C.ink, marginBottom: 8 }}>{course.title}</h1>
        {course.subtitle && <p style={{ fontSize: 15, color: C.textSoft, lineHeight: 1.6, marginBottom: 16 }}>{course.subtitle}</p>}

        {course.description && (
          <div style={{ fontSize: 14, color: C.text, lineHeight: 1.7, marginBottom: 24, whiteSpace: "pre-wrap" }}>
            {course.description}
          </div>
        )}

        {/* Programma */}
        <h2 className="display" style={{ fontSize: 20, color: C.ink, marginBottom: 12 }}>{t ? "Programma" : "Curriculum"}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          {(course.modules || []).map((m) => (
            <div key={m.id}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, marginBottom: 8 }}>{m.title}</div>
              <div className="card" style={{ padding: 6, display: "flex", flexDirection: "column" }}>
                {m.lessons.map((l, i) => {
                  const accessible = l.is_preview || enrolled;
                  const inner = (
                    <>
                      <span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0,
                        background: accessible ? C.indigoDim : C.surfaceUp, color: accessible ? C.indigo : C.textMute }}>
                        {accessible ? <PlayCircle size={16} /> : <Lock size={14} />}
                      </span>
                      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{l.title}</span>
                      {l.is_preview && !enrolled && (
                        <span className="tag" style={{ background: C.greenDim, color: C.green, border: "none", fontSize: 10 }}>{t ? "Anteprima" : "Preview"}</span>
                      )}
                      <span style={{ fontSize: 11.5, color: C.textMute, minWidth: 38, textAlign: "right" }}>
                        {l.duration_sec ? formatDuration(l.duration_sec, t ? "it" : "en") : ""}
                      </span>
                    </>
                  );
                  const rowStyle = { display: "flex", alignItems: "center", gap: 11, padding: "10px 10px",
                    borderBottom: i < m.lessons.length - 1 ? `1px solid ${C.border}` : "none", textDecoration: "none" };
                  return accessible ? (
                    <Link key={l.id} to={`/corsi/${course.slug}/lezione/${l.slug}`} style={rowStyle}>{inner}</Link>
                  ) : (
                    <div key={l.id} style={{ ...rowStyle, opacity: 0.85 }}>{inner}</div>
                  );
                })}
                {m.lessons.length === 0 && (
                  <div style={{ padding: 12, fontSize: 12.5, color: C.textMute }}>{t ? "Lezioni in arrivo." : "Lessons coming soon."}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12.5, color: C.textMute, marginBottom: 8 }}>
          {t ? "Docente" : "Instructor"}: <strong style={{ color: C.textSoft }}>{course.instructor}</strong>
        </div>
      </div>

      {/* CTA sticky */}
      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} transition={{ type: "spring", damping: 26, stiffness: 280 }}
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
          background: C.surface, borderTop: `1px solid ${C.border}`, boxShadow: "0 -6px 24px rgba(11,20,55,0.08)",
          padding: "12px 18px calc(12px + env(safe-area-inset-bottom))" }}>
        <div style={{ maxWidth: "var(--page-max, 480px)", margin: "0 auto", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div className="display" style={{ fontSize: 24, fontWeight: 600, color: C.ink, lineHeight: 1 }}>
              {course.price_eur > 0 ? `€${Number(course.price_eur).toFixed(0)}` : (t ? "Gratis" : "Free")}
            </div>
            <div style={{ fontSize: 11, color: C.textMute, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
              <ShieldCheck size={12} color={C.green} /> {t ? "Accesso a vita" : "Lifetime access"}
            </div>
          </div>
          {enrolled ? (
            <button onClick={goToCourse} className="btn btn-primary btn-lg" style={{ flexShrink: 0 }}>
              <Check size={17} /> {t ? "Vai al corso" : "Go to course"}
            </button>
          ) : firstPreview && !user ? (
            <Link to={`/corsi/${slug}/lezione/${firstPreview.slug}`} className="btn btn-ghost btn-lg" style={{ flexShrink: 0, marginRight: 8 }}>
              {t ? "Anteprima" : "Preview"}
            </Link>
          ) : null}
          {!enrolled && (
            <button onClick={startCheckout} className="btn btn-gold btn-lg" style={{ flexShrink: 0 }}>
              {t ? "Iscriviti" : "Enroll"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
