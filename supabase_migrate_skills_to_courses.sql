-- One-time migration: move existing tutor teach-skills into public.courses
-- Run this AFTER creating public.courses via supabase_courses_table.sql
-- This version is for schema where ownership is in public.user_skills
-- (user_id + skill_id + type), and public.skills is the skill catalog.

begin;

-- Insert missing courses from user_skills(type='teach') joined to skills
insert into public.courses (
  tutor_id,
  title,
  skill_name,
  level,
  short_description,
  description,
  delivery_mode,
  language,
  price,
  currency,
  tags,
  is_active,
  is_published,
  explore_priority,
  created_at,
  updated_at
)
select
  us.user_id as tutor_id,
  coalesce(
    nullif(trim(coalesce(to_jsonb(s)->>'skill_name', to_jsonb(s)->>'name')), ''),
    'Untitled Course'
  ) as title,
  coalesce(
    nullif(trim(coalesce(to_jsonb(s)->>'skill_name', to_jsonb(s)->>'name')), ''),
    'Untitled Course'
  ) as skill_name,
  case
    when us.proficiency_level in ('Beginner', 'Intermediate', 'Advanced', 'All Levels')
      then us.proficiency_level
    else 'Beginner'
  end as level,
  case
    when (to_jsonb(s)->>'description') is null or trim(to_jsonb(s)->>'description') = '' then null
    else left(trim(to_jsonb(s)->>'description'), 220)
  end as short_description,
  nullif(trim(to_jsonb(s)->>'description'), '') as description,
  'Online' as delivery_mode,
  'English' as language,
  0 as price,
  'INR' as currency,
  '{}'::text[] as tags,
  true as is_active,
  true as is_published,
  0 as explore_priority,
  now() as created_at,
  now() as updated_at
from public.user_skills us
join public.skills s on s.id = us.skill_id
where us.type = 'teach'
  and us.user_id is not null
on conflict (tutor_id, title) do nothing;

commit;

-- Verification query (run separately if needed):
-- select tutor_id, count(*) as courses_created
-- from public.courses
-- group by tutor_id
-- order by courses_created desc;
