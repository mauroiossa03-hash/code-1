import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { C } from "../../theme.js";
import {
  fetchMyCourses, fetchCourseBySlug, fetchLessonProgress,
} from "../../data/courses.js";
import { ProgressRing, Spinner } from "../../components/primitives.jsx";
import { BookOpen, PlayCircle, ArrowRight, ListVideo } from "../../components/icons.jsx";

/* Dashboard "I miei corsi": enrollment + % completamento + bottone Continua. */
export default function MyCourses({ lang }) {
  const t = lang === "it";
  const [items, setItems] = useState(null); // [{ course, pct, continueSlug, continueLesson }]

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const enrollments = await fetchMyCourses();
        const enriched = await Promise.all(enrollments.map(async (e) => {
          const full = await fetchCourseBySlug(e.course.slug);
          const lessons = (full?.modules || []).flatMap((m) => m.lessons);
          const lessonIds = lessons.map((l) => l.id);
          const prog = await fetchLessonProgress(lessonIds);
          const completed = lessons.filter((l) => prog[l.id]?.completed_at).length;
          const pct = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
          // lezione da continuare: ultima last_watched, altrimenti prima non completata, altrimenti prima
          let cont = null, lastTs = 0;
          for (const l of lessons) {
            const p = prog[l.id];
            if (p?.last_watched_at) {
              const ts = new Date(p.last_watched_at).getTime();
              if (ts > lastTs) { lastTs = ts; cont = l; }
            }
          }
          if (!cont) cont = lessons.find((l) => !prog[l.id]?.completed_at) || lessons[0] || null;
          return { course: e.course, pct, completed, total: lessons.length, continueLesson: cont };
        }));
        if (!cancelled) setItems(enriched);
      } catch (err) {
        console.error(err);
        if (!cancelled) setItems([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ padding: "22px 18px 96px", position: "relative" }}>
      <div className="aurora" />
      <div style={{ position: "relative", zIndex: 1, maxWidth: "var(--page-max, 480px)", margin: "0 auto" }}>
        <div className="tag" style={{ background: "rgba(255,255,255,0.7)", color: C.violet, border: `1px solid ${C.border}`, marginBottom: 12 }}>
          <BookOpen size={13} /> {t ? "I miei corsi" : "My Courses"}
        </div>
        <h1 className="display" style={{ fontSize: 28, color: C.ink, marginBottom: 18 }}>
          {t ? "Continua a imparare" : "Keep learning"}
        </h1>

        {items === null ? (
          <Spinner pad={80} />
        ) : items.length === 0 ? (
          <Empty t={t} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {items.map((it, i) => (
              <motion.div key={it.course.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <CourseRow item={it} t={t} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseRow({ item, t }) {
  const navigate = useNavigate();
  const { course, pct, completed, total, continueLesson } = item;
  const go = () => {
    if (continueLesson) navigate(`/corsi/${course.slug}/lezione/${continueLesson.slug}`);
    else navigate(`/corsi/${course.slug}`);
  };
  return (
    <div className="card" style={{ padding: 16, display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: 12, flexShrink: 0, overflow: "hidden",
        background: course.cover_url ? `center/cover no-repeat url(${course.cover_url})` : `linear-gradient(135deg, ${C.indigo}, ${C.violet})`,
        display: "grid", placeItems: "center" }}>
        {!course.cover_url && <ListVideo size={24} color="rgba(255,255,255,0.85)" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: C.ink, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{course.title}</div>
        <div style={{ fontSize: 11.5, color: C.textMute, marginBottom: 8 }}>
          {completed}/{total} {t ? "lezioni completate" : "lessons done"}
        </div>
        <button onClick={go} className="btn btn-primary btn-sm" style={{ padding: "7px 14px" }}>
          <PlayCircle size={14} /> {pct > 0 ? (t ? "Continua" : "Continue") : (t ? "Inizia" : "Start")} <ArrowRight size={13} />
        </button>
      </div>
      <ProgressRing pct={pct} size={50} stroke={5} />
    </div>
  );
}

function Empty({ t }) {
  return (
    <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: 58, height: 58, borderRadius: 16, margin: "0 auto 16px", display: "grid", placeItems: "center",
        background: `linear-gradient(135deg, ${C.indigoDim}, ${C.violetDim})`, color: C.indigo }}>
        <BookOpen size={28} />
      </div>
      <div style={{ fontSize: 17, fontWeight: 800, color: C.ink, marginBottom: 6 }}>
        {t ? "Non hai ancora corsi" : "No courses yet"}
      </div>
      <p style={{ fontSize: 13.5, color: C.textSoft, lineHeight: 1.6, marginBottom: 18 }}>
        {t ? "Esplora il catalogo e iscriviti al tuo primo corso." : "Browse the catalog and enroll in your first course."}
      </p>
      <Link to="/corsi" className="btn btn-primary"><ListVideo size={16} /> {t ? "Vai al catalogo" : "Browse catalog"}</Link>
    </div>
  );
}
