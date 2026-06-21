-- ============================================================
-- 003_courses_seed.sql
-- Dati di esempio per il modulo Corsi.
-- I corsi sono is_published = false: NON appaiono nel catalogo
-- finché non li attivi (update is_published = true).
-- Le lezioni usano provider 'supabase' con path placeholder nel
-- bucket "course-videos"; sostituisci video_id con i path reali.
-- ============================================================

-- ---- Corso 1 ----------------------------------------------
with c as (
  insert into public.courses
    (slug, title, subtitle, description, category, level, language, price_eur,
     total_minutes, total_lessons, is_published, lemonsqueezy_variant_id)
  values
    ('finanza-personale-fondamenti',
     'Finanza Personale: i Fondamenti',
     'Costruisci basi solide per gestire e far crescere il tuo capitale',
     E'Un percorso pratico dalla gestione del budget agli investimenti di base.\n\nImparerai a costruire un fondo di emergenza, capire interesse composto e diversificazione, e impostare un piano di investimento sostenibile nel tempo.',
     'finanza-personale', 'beginner', 'it', 49.00,
     78, 3, false, null)
  returning id
),
m1 as (
  insert into public.course_modules (course_id, title, description, position)
  select id, 'Modulo 1 — Basi', 'Mentalità e strumenti di partenza', 1 from c
  returning id, course_id
)
insert into public.lessons
  (module_id, slug, title, description, video_provider, video_id, duration_sec, position, is_preview, resources)
select m1.id, v.slug, v.title, v.description, 'supabase', v.video_id, v.duration_sec, v.position, v.is_preview, v.resources
from m1, (values
  ('benvenuto',        'Benvenuto e come usare il corso', 'Panoramica del percorso e obiettivi.', 'finanza-personale/benvenuto.mp4',        420,  1, true,  '[]'::jsonb),
  ('budget',           'Costruire un budget che funziona', 'Metodo pratico per tracciare entrate e uscite.', 'finanza-personale/budget.mp4',  1500, 2, false, '[{"label":"Template budget (PDF)","url":"https://example.com/budget.pdf"}]'::jsonb),
  ('interesse-composto','Il potere dell''interesse composto', 'Perché iniziare presto cambia tutto.', 'finanza-personale/interesse.mp4',  1680, 3, false, '[]'::jsonb)
) as v(slug, title, description, video_id, duration_sec, position, is_preview, resources);

-- ---- Corso 2 ----------------------------------------------
with c as (
  insert into public.courses
    (slug, title, subtitle, description, category, level, language, price_eur,
     total_minutes, total_lessons, is_published, lemonsqueezy_variant_id)
  values
    ('investire-in-azioni',
     'Investire in Azioni: Analisi e Strategia',
     'Dalla lettura di un bilancio alla costruzione di un portafoglio',
     E'Capire come valutare un''azienda, leggere i bilanci e costruire una tesi di investimento.\n\nApproccio data-driven, con esempi reali e framework replicabili.',
     'investimenti', 'intermediate', 'it', 89.00,
     46, 2, false, null)
  returning id
),
m1 as (
  insert into public.course_modules (course_id, title, description, position)
  select id, 'Modulo 1 — Analisi fondamentale', 'Leggere e interpretare i numeri', 1 from c
  returning id, course_id
)
insert into public.lessons
  (module_id, slug, title, description, video_provider, video_id, duration_sec, position, is_preview, resources)
select m1.id, v.slug, v.title, v.description, 'supabase', v.video_id, v.duration_sec, v.position, v.is_preview, v.resources
from m1, (values
  ('introduzione-analisi', 'Introduzione all''analisi fondamentale', 'Cosa guardare e perché.', 'investire-azioni/intro.mp4', 600, 1, true, '[]'::jsonb),
  ('conto-economico',      'Leggere il conto economico', 'Ricavi, margini e qualità degli utili.', 'investire-azioni/conto-economico.mp4', 2160, 2, false, '[]'::jsonb)
) as v(slug, title, description, video_id, duration_sec, position, is_preview, resources);

-- ---- Corso 3 ----------------------------------------------
with c as (
  insert into public.courses
    (slug, title, subtitle, description, category, level, language, price_eur,
     total_minutes, total_lessons, is_published, lemonsqueezy_variant_id)
  values
    ('macroeconomia-per-investitori',
     'Macroeconomia per Investitori',
     'Tassi, inflazione e cicli: leggere il quadro grande',
     E'Come le forze macro muovono i mercati e cosa significano per le tue decisioni di investimento.',
     'macro', 'advanced', 'it', 79.00,
     22, 1, false, null)
  returning id
),
m1 as (
  insert into public.course_modules (course_id, title, description, position)
  select id, 'Modulo 1 — Il quadro macro', 'Variabili chiave e loro impatto', 1 from c
  returning id, course_id
)
insert into public.lessons
  (module_id, slug, title, description, video_provider, video_id, duration_sec, position, is_preview, resources)
select m1.id, v.slug, v.title, v.description, 'supabase', v.video_id, v.duration_sec, v.position, v.is_preview, v.resources
from m1, (values
  ('tassi-e-inflazione', 'Tassi di interesse e inflazione', 'La relazione che governa i mercati.', 'macro/tassi.mp4', 1320, 1, true, '[]'::jsonb)
) as v(slug, title, description, video_id, duration_sec, position, is_preview, resources);

-- Per pubblicare un corso quando è pronto:
--   update public.courses set is_published = true where slug = 'finanza-personale-fondamenti';
