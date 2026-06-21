-- ============================================================
-- 002_courses.sql
-- Schema modulo Corsi per OddsFinance.
-- Eseguire nello SQL Editor di Supabase (NON via import CSV).
-- Non tocca le tabelle CFA esistenti (questions, flashcards,
-- user_progress, exam_results, subscriptions).
-- ============================================================

-- 1. CORSI
create table if not exists public.courses (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  subtitle    text,
  description text,                           -- markdown
  cover_url   text,
  trailer_url text,
  category    text,                           -- es. 'finanza-personale', 'investimenti', 'macro'
  level       text check (level in ('beginner','intermediate','advanced')),
  language    text default 'it',
  price_eur   numeric(10,2) not null default 0,
  instructor  text default 'Mauro Iossa',
  total_minutes int default 0,
  total_lessons int default 0,
  is_published boolean default false,
  lemonsqueezy_variant_id text,               -- per checkout one-off
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 2. MODULI (sezioni dentro un corso)
create table if not exists public.course_modules (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  title       text not null,
  description text,
  position    int not null,
  created_at  timestamptz default now()
);

-- 3. LEZIONI
create table if not exists public.lessons (
  id              uuid primary key default gen_random_uuid(),
  module_id       uuid not null references public.course_modules(id) on delete cascade,
  slug            text not null,              -- unico nello scope del corso
  title           text not null,
  description     text,
  video_provider  text not null,              -- 'bunny' | 'mux' | 'vimeo' | 'supabase'
  video_id        text not null,
  duration_sec    int default 0,
  position        int not null,
  is_preview      boolean default false,
  resources       jsonb default '[]'::jsonb,  -- [{label, url}]
  transcript      text,
  created_at      timestamptz default now()
);

-- 4. ENROLLMENT (chi ha accesso a quale corso)
create table if not exists public.course_enrollments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  source      text not null check (source in ('purchase','subscription','bundle','manual')),
  granted_at  timestamptz default now(),
  expires_at  timestamptz,                    -- null = perpetuo
  lemonsqueezy_order_id text,
  unique (user_id, course_id)
);

-- 5. PROGRESSI LEZIONI
create table if not exists public.lesson_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  lesson_id       uuid not null references public.lessons(id) on delete cascade,
  watched_seconds int default 0,
  completed_at    timestamptz,
  last_watched_at timestamptz default now(),
  unique (user_id, lesson_id)
);

-- Indici utili
create index if not exists idx_modules_course   on public.course_modules(course_id);
create index if not exists idx_lessons_module    on public.lessons(module_id);
create index if not exists idx_enroll_user       on public.course_enrollments(user_id);
create index if not exists idx_progress_user     on public.lesson_progress(user_id);

-- ============================================================
-- RLS
-- ============================================================
alter table public.courses             enable row level security;
alter table public.course_modules      enable row level security;
alter table public.lessons             enable row level security;
alter table public.course_enrollments  enable row level security;
alter table public.lesson_progress     enable row level security;

-- Catalogo: tutti possono leggere i corsi pubblicati
drop policy if exists "courses readable when published" on public.courses;
create policy "courses readable when published" on public.courses
  for select using (is_published = true);

drop policy if exists "modules readable when course published" on public.course_modules;
create policy "modules readable when course published" on public.course_modules
  for select using (
    exists (select 1 from public.courses c where c.id = course_id and c.is_published)
  );

-- Lezioni: preview leggibili da tutti; le altre solo se enrolled
drop policy if exists "lessons preview readable" on public.lessons;
create policy "lessons preview readable" on public.lessons
  for select using (
    is_preview = true and
    exists (select 1 from public.courses c
            join public.course_modules m on m.course_id = c.id
            where m.id = module_id and c.is_published)
  );

drop policy if exists "lessons full readable when enrolled" on public.lessons;
create policy "lessons full readable when enrolled" on public.lessons
  for select using (
    exists (
      select 1
      from public.course_enrollments e
      join public.course_modules m on m.course_id = e.course_id
      where m.id = lessons.module_id
        and e.user_id = auth.uid()
        and (e.expires_at is null or e.expires_at > now())
    )
  );

-- Enrollment & progress: ogni utente vede solo le proprie righe
drop policy if exists "own enrollments" on public.course_enrollments;
create policy "own enrollments" on public.course_enrollments
  for select using (user_id = auth.uid());

drop policy if exists "own progress read" on public.lesson_progress;
create policy "own progress read" on public.lesson_progress
  for select using (user_id = auth.uid());

drop policy if exists "own progress insert" on public.lesson_progress;
create policy "own progress insert" on public.lesson_progress
  for insert with check (user_id = auth.uid());

drop policy if exists "own progress update" on public.lesson_progress;
create policy "own progress update" on public.lesson_progress
  for update using (user_id = auth.uid());

-- NB: l'INSERT in course_enrollments la fa la Edge Function webhook
-- con service_role (bypassa RLS). Nessuna policy di insert lato utente.
