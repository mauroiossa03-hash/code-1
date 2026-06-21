import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { C } from "../../theme.js";
import { fetchPublishedCourses, formatDuration } from "../../data/courses.js";
import { Spinner } from "../../components/primitives.jsx";
import { MonitorPlay, Clock, Gauge, ListVideo } from "../../components/icons.jsx";

const LEVELS = {
  beginner:     { it: "Base",        en: "Beginner" },
  intermediate: { it: "Intermedio",  en: "Intermediate" },
  advanced:     { it: "Avanzato",    en: "Advanced" },
};

export default function CoursesCatalog({ lang }) {
  const t = lang === "it";
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState(false);
  const [cat, setCat] = useState("all");
  const [lvl, setLvl] = useState("all");

  useEffect(() => {
    let cancelled = false;
    fetchPublishedCourses()
      .then((rows) => { if (!cancelled) setCourses(rows); })
      .catch((e) => { console.error(e); if (!cancelled) { setError(true); setCourses([]); } });
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(() => {
    const set = new Set((courses || []).map((c) => c.category).filter(Boolean));
    return ["all", ...set];
  }, [courses]);

  const levels = useMemo(() => {
    const set = new Set((courses || []).map((c) => c.level).filter(Boolean));
    return ["all", ...set];
  }, [courses]);

  const filtered = useMemo(() => {
    return (courses || []).filter((c) =>
      (cat === "all" || c.category === cat) && (lvl === "all" || c.level === lvl));
  }, [courses, cat, lvl]);

  return (
    <div style={{ padding: "22px 18px 96px", position: "relative" }}>
      <div className="aurora" />
      <div style={{ position: "relative", zIndex: 1, maxWidth: "var(--page-max, 480px)", margin: "0 auto" }}>
        <div style={{ marginBottom: 18 }}>
          <div className="tag" style={{ background: "rgba(255,255,255,0.7)", color: C.violet, border: `1px solid ${C.border}`, marginBottom: 12 }}>
            <MonitorPlay size={13} /> {t ? "Corsi On-Demand" : "On-Demand Courses"}
          </div>
          <h1 className="display" style={{ fontSize: 30, color: C.ink, marginBottom: 6 }}>
            {t ? "Catalogo corsi" : "Course catalog"}
          </h1>
          <p style={{ fontSize: 13.5, color: C.textSoft }}>
            {t ? "Video corsi registrati su finanza, investimenti e mercati." : "Recorded video courses on finance, investing and markets."}
          </p>
        </div>

        {courses === null ? (
          <Spinner pad={80} />
        ) : courses.length === 0 ? (
          <EmptyState t={t} error={error} />
        ) : (
          <>
            {/* Filtri */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {categories.length > 2 && (
                <ChipRow items={categories} value={cat} onChange={setCat}
                  label={(v) => v === "all" ? (t ? "Tutte" : "All") : prettify(v)} />
              )}
              {levels.length > 2 && (
                <ChipRow items={levels} value={lvl} onChange={setLvl}
                  label={(v) => v === "all" ? (t ? "Tutti i livelli" : "All levels") : (LEVELS[v]?.[t ? "it" : "en"] || v)} />
              )}
            </div>

            <div className="cards-grid cols-3">
              {filtered.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: i * 0.05 }} style={{ height: "100%" }}>
                  <CourseCard course={c} t={t} />
                </motion.div>
              ))}
              {filtered.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", color: C.textMute, fontSize: 13, padding: "30px 0" }}>
                  {t ? "Nessun corso con questi filtri." : "No courses match these filters."}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course, t }) {
  return (
    <Link to={`/corsi/${course.slug}`} className="card card-hover" style={{ height: "100%", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", textDecoration: "none" }}>
      <div style={{ height: 130, background: course.cover_url
        ? `center/cover no-repeat url(${course.cover_url})`
        : `linear-gradient(135deg, ${C.indigo}, ${C.violet})`,
        display: "grid", placeItems: "center" }}>
        {!course.cover_url && <ListVideo size={40} color="rgba(255,255,255,0.85)" />}
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
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
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, marginBottom: 4 }}>{course.title}</div>
        {course.subtitle && <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.55, marginBottom: 12 }}>{course.subtitle}</div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="display" style={{ fontSize: 22, fontWeight: 600, color: C.ink }}>
            {course.price_eur > 0 ? `€${Number(course.price_eur).toFixed(0)}` : (t ? "Gratis" : "Free")}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.violet }}>{t ? "Dettagli →" : "Details →"}</span>
        </div>
      </div>
    </Link>
  );
}

function ChipRow({ items, value, onChange, label }) {
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
      {items.map((it) => (
        <button key={it} onClick={() => onChange(it)}
          className="tag" style={{ cursor: "pointer", whiteSpace: "nowrap",
            background: value === it ? `linear-gradient(135deg, ${C.indigo}, ${C.indigoDeep})` : C.surface,
            color: value === it ? "#fff" : C.textSoft, border: `1px solid ${value === it ? "transparent" : C.border}` }}>
          {label(it)}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ t, error }) {
  return (
    <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: 58, height: 58, borderRadius: 16, margin: "0 auto 16px", display: "grid", placeItems: "center",
        background: `linear-gradient(135deg, ${C.indigoDim}, ${C.violetDim})`, color: C.indigo }}>
        <MonitorPlay size={28} />
      </div>
      <div style={{ fontSize: 17, fontWeight: 800, color: C.ink, marginBottom: 6 }}>
        {t ? "Nuovi corsi in arrivo" : "New courses coming soon"}
      </div>
      <p style={{ fontSize: 13.5, color: C.textSoft, lineHeight: 1.6 }}>
        {error
          ? (t ? "Al momento non riusciamo a caricare il catalogo. Riprova più tardi." : "We can't load the catalog right now. Please try again later.")
          : (t ? "Stiamo preparando i primi video corsi. Torna presto!" : "We're preparing the first video courses. Check back soon!")}
      </p>
    </div>
  );
}

function prettify(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
