-- ============================================================
-- SkillShare Platform — Full Schema Migration v2
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- All statements use IF NOT EXISTS / IF EXISTS so it's safe to re-run.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. PROFILES
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role         TEXT    DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS bio          TEXT,
  ADD COLUMN IF NOT EXISTS department   TEXT,
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS chat_access  TEXT[]  DEFAULT '{}';


-- ────────────────────────────────────────────────────────────
-- 2. SKILLS
-- ────────────────────────────────────────────────────────────
-- Assessment code inserts { name, skill_name } — both columns must exist.
ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS name       TEXT,
  ADD COLUMN IF NOT EXISTS skill_name TEXT;

-- Ensure at least one of them is non-null (unique index on name for dedup)
CREATE UNIQUE INDEX IF NOT EXISTS skills_name_unique ON public.skills (lower(name));


-- ────────────────────────────────────────────────────────────
-- 3. USER_SKILLS
-- ────────────────────────────────────────────────────────────
-- proficiency_level already added in setup.sql — guard anyway
ALTER TABLE public.user_skills
  ADD COLUMN IF NOT EXISTS proficiency_level TEXT    DEFAULT 'Beginner',
  ADD COLUMN IF NOT EXISTS type              TEXT    DEFAULT 'teach';
  -- type values: 'teach' (tutor adds skills to teach) | 'learn' (student skills)

-- Unique constraint so upsert works
ALTER TABLE public.user_skills
  DROP CONSTRAINT IF EXISTS user_skills_user_id_skill_id_key;
ALTER TABLE public.user_skills
  ADD CONSTRAINT user_skills_user_id_skill_id_key UNIQUE (user_id, skill_id);


-- ────────────────────────────────────────────────────────────
-- 4. ASSESSMENTS  (create — does not exist yet)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assessments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id   UUID        REFERENCES public.skills(id) ON DELETE SET NULL,
  skill_name TEXT        NOT NULL,
  score      INTEGER     NOT NULL DEFAULT 0,  -- 0–100
  report     JSONB,                           -- full AI report object
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS assessments_user_id_idx  ON public.assessments (user_id);
CREATE INDEX IF NOT EXISTS assessments_skill_id_idx ON public.assessments (skill_id);


-- ────────────────────────────────────────────────────────────
-- 5. SESSIONS
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS meeting_link     TEXT,
  ADD COLUMN IF NOT EXISTS tutor_message    TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ended_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS course_id        UUID REFERENCES public.courses(id) ON DELETE SET NULL;
  -- status column expected values: 'pending' | 'accepted' | 'rejected' | 'completed'


-- ────────────────────────────────────────────────────────────
-- 6. COURSES
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS skill_name         TEXT,
  ADD COLUMN IF NOT EXISTS level              TEXT    DEFAULT 'Beginner',
  ADD COLUMN IF NOT EXISTS short_description  TEXT,
  ADD COLUMN IF NOT EXISTS description        TEXT,
  ADD COLUMN IF NOT EXISTS duration_text      TEXT,
  ADD COLUMN IF NOT EXISTS prerequisites      TEXT,
  ADD COLUMN IF NOT EXISTS outcomes           TEXT,
  ADD COLUMN IF NOT EXISTS is_active          BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_published       BOOLEAN DEFAULT true;


-- ────────────────────────────────────────────────────────────
-- 7. RESOURCES
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS course_id     UUID    REFERENCES public.courses(id)  ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tutor_id      UUID    REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS student_id    UUID    REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS file_url      TEXT,
  ADD COLUMN IF NOT EXISTS file_name     TEXT,
  ADD COLUMN IF NOT EXISTS file_size     BIGINT,
  ADD COLUMN IF NOT EXISTS resource_type TEXT,
  ADD COLUMN IF NOT EXISTS title         TEXT;


-- ────────────────────────────────────────────────────────────
-- 8. REVIEWS
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS session_id   UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewer_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS reviewee_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS score        INTEGER,
  ADD COLUMN IF NOT EXISTS comment      TEXT;


-- ────────────────────────────────────────────────────────────
-- 9. MESSAGES
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS sender_id   UUID    REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS receiver_id UUID    REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS content     TEXT,
  ADD COLUMN IF NOT EXISTS read        BOOLEAN DEFAULT false;


-- ────────────────────────────────────────────────────────────
-- 10. RLS — Enable and set permissive policies for assessments
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own assessments"   ON public.assessments;
DROP POLICY IF EXISTS "Users can insert own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Public can read assessments"      ON public.assessments;

-- Own user can insert
CREATE POLICY "Users can insert own assessments"
  ON public.assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Own user can update (e.g. re-assess)
CREATE POLICY "Users can update own assessments"
  ON public.assessments FOR UPDATE
  USING (auth.uid() = user_id);

-- Anyone authenticated can read assessments (for public tutor profiles)
CREATE POLICY "Authenticated users can read assessments"
  ON public.assessments FOR SELECT
  USING (auth.role() = 'authenticated');


-- ────────────────────────────────────────────────────────────
-- 11. Handle new user trigger (idempotent)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
