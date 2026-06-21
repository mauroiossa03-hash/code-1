/*
  Helper di fetch per il modulo Corsi (tabelle: courses, course_modules,
  lessons, course_enrollments, lesson_progress).
  Tutte le query usano .maybeSingle() dove la riga potrebbe non esistere
  (evita errori 406).
*/
import { supabase } from "../lib/supabase.js";

/* Catalogo: solo corsi pubblicati, più recenti prima. */
export async function fetchPublishedCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/* Dettaglio corso per slug (con moduli + lezioni ordinati). */
export async function fetchCourseBySlug(slug) {
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  if (!course) return null;

  const { data: modules, error: mErr } = await supabase
    .from("course_modules")
    .select("*")
    .eq("course_id", course.id)
    .order("position", { ascending: true });
  if (mErr) throw mErr;

  const moduleIds = (modules || []).map((m) => m.id);
  let lessons = [];
  if (moduleIds.length) {
    const { data: lessonRows, error: lErr } = await supabase
      .from("lessons")
      .select("id, module_id, slug, title, description, video_provider, video_id, duration_sec, position, is_preview, resources, transcript")
      .in("module_id", moduleIds)
      .order("position", { ascending: true });
    if (lErr) throw lErr;
    lessons = lessonRows || [];
  }

  const modulesWithLessons = (modules || []).map((m) => ({
    ...m,
    lessons: lessons.filter((l) => l.module_id === m.id),
  }));

  return { ...course, modules: modulesWithLessons };
}

/* True se l'utente corrente ha un enrollment valido per il corso. */
export async function isEnrolled(courseId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase
    .from("course_enrollments")
    .select("id, expires_at")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();
  if (error) { console.error("isEnrolled error:", error); return false; }
  if (!data) return false;
  return !data.expires_at || new Date(data.expires_at) > new Date();
}

/* Stessa verifica ma a partire dallo slug (usata da EnrolledRoute). */
export async function isEnrolledBySlug(slug) {
  const { data: course, error } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !course) return false;
  return isEnrolled(course.id);
}

/* Corsi a cui l'utente è iscritto, con il record corso annidato. */
export async function fetchMyCourses() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("course_enrollments")
    .select("id, granted_at, expires_at, source, course:courses(*)")
    .eq("user_id", user.id)
    .order("granted_at", { ascending: false });
  if (error) throw error;
  return (data || []).filter((e) => e.course); // scarta corsi rimossi
}

/* Mappa lesson_id -> progress per l'utente, su un set di lezioni. */
export async function fetchLessonProgress(lessonIds) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !lessonIds?.length) return {};
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id, watched_seconds, completed_at, last_watched_at")
    .eq("user_id", user.id)
    .in("lesson_id", lessonIds);
  if (error) { console.error("fetchLessonProgress error:", error); return {}; }
  const map = {};
  for (const row of data || []) map[row.lesson_id] = row;
  return map;
}

/* Upsert progresso (throttle gestito dal player). */
export async function saveLessonProgress(lessonId, watchedSeconds, completed = false) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const row = {
    user_id: user.id,
    lesson_id: lessonId,
    watched_seconds: Math.floor(watchedSeconds),
    last_watched_at: new Date().toISOString(),
  };
  if (completed) row.completed_at = new Date().toISOString();
  const { error } = await supabase
    .from("lesson_progress")
    .upsert(row, { onConflict: "user_id,lesson_id" });
  if (error) console.error("saveLessonProgress error:", error);
}

/* Helper formattazione durata (sec -> "1h 12m" / "8m"). */
export function formatDuration(totalSec, lang = "it") {
  const sec = totalSec || 0;
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return lang === "it" ? "—" : "—";
}
