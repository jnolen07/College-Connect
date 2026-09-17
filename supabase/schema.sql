-- Run this once in Supabase: Dashboard -> SQL Editor -> New Query -> paste all -> Run
-- Safe to re-run on an existing project — every statement is idempotent
-- (create-if-not-exists tables, drop-then-create policies, guarded ALTERs).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

-- profiles.id is the Supabase Auth user id (auth.users.id), not a client-generated
-- uuid -- this is what lets Row Level Security scope every table to "your own rows."
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  age int,
  year text,
  major text,
  interests text[],
  bio text,
  school text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Groups are real, user-creatable rows instead of a hardcoded list in the client.
-- id is a short text slug (e.g. "cs-majors-berkeley") so it reads cleanly in URLs/logs
-- and so the existing group_members/group_posts.group_id (already `text`) can
-- reference it without a data migration.
create table if not exists groups (
  id text primary key,
  name text not null,
  tag text not null default 'Community',
  description text not null default '',
  type text not null default 'discussion' check (type in ('discussion', 'board-internships', 'board-study')),
  related_interests text[] not null default '{}',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists group_members (
  group_id text not null references groups(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (group_id, profile_id)
);

create table if not exists group_posts (
  id uuid primary key default gen_random_uuid(),
  group_id text not null references groups(id) on delete cascade,
  author_id uuid references profiles(id) on delete cascade,
  author_name text not null,
  text text not null,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id) on delete cascade,
  recipient_id uuid references profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

-- Internship board: real listings instead of a static mock array.
create table if not exists internships (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  org text not null,
  location text not null,
  term text not null,
  tag text not null default 'Other',
  posted_by uuid references profiles(id) on delete set null,
  posted_by_name text not null,
  created_at timestamptz default now()
);

create table if not exists saved_internships (
  internship_id uuid references internships(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  saved_at timestamptz default now(),
  primary key (internship_id, profile_id)
);

-- Study buddy board: real requests instead of a static mock array.
create table if not exists study_requests (
  id uuid primary key default gen_random_uuid(),
  course text not null,
  school text not null,
  when_text text not null,
  note text,
  posted_by uuid references profiles(id) on delete set null,
  posted_by_name text not null,
  created_at timestamptz default now()
);

create table if not exists study_request_members (
  request_id uuid references study_requests(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (request_id, profile_id)
);

-- Sport Mode: one row per user holding their favorite sport, followed teams,
-- and followed players. teams/players are stored as jsonb (not separate
-- tables) because they're just a denormalized cache of ESPN's public API
-- (id/name/logo) used to render the picker without refetching rosters every
-- visit -- there's no relational data here to normalize.
create table if not exists sports_preferences (
  profile_id uuid primary key references profiles(id) on delete cascade,
  league text,
  teams jsonb not null default '[]',
  players jsonb not null default '[]',
  onboarded boolean not null default false,
  updated_at timestamptz default now()
);

-- If group_members/group_posts already exist from a previous version of this
-- script (without the groups(id) foreign key), add it now rather than
-- recreating the tables.
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'group_members_group_id_fkey'
  ) then
    alter table group_members
      add constraint group_members_group_id_fkey
      foreign key (group_id) references groups(id) on delete cascade;
  end if;
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'group_posts_group_id_fkey'
  ) then
    alter table group_posts
      add constraint group_posts_group_id_fkey
      foreign key (group_id) references groups(id) on delete cascade;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Seed the groups that used to be hardcoded in the client, and a starter set
-- of internships/study requests, so a brand-new project isn't empty.
-- ---------------------------------------------------------------------------

insert into groups (id, name, tag, description, type, related_interests) values
  ('cs-majors', 'CS Majors — Berkeley', 'Academic', 'Problem sets, project teams, and internship threads for CS students.', 'discussion', array['Hackathons','Startups','Video Games']),
  ('intramural-soccer', 'Intramural Soccer', 'Sports', 'Pickup games every Tuesday and Thursday, all skill levels.', 'discussion', array['Soccer','Running']),
  ('premed-study-hall', 'Pre-Med Study Hall', 'Academic', 'MCAT prep, lab partners, and organic chem survival tips.', 'discussion', array['Volunteering','Chess']),
  ('film-photo-club', 'Film & Photography Club', 'Creative', 'Crew calls, gear swaps, and screening nights.', 'discussion', array['Photography','Film']),
  ('first-gen-network', 'First-Gen Students Network', 'Community', 'Peer mentorship and resources for first-generation college students.', 'discussion', array['Volunteering']),
  ('internship-board', 'Internship & Career Board', 'Career', 'Post and browse internship leads shared by fellow students.', 'board-internships', array['Startups']),
  ('study-buddy-board', 'Study Buddy Board', 'Study', 'Find classmates to study with, by course and time.', 'board-study', array['Chess'])
on conflict (id) do nothing;

insert into internships (id, role, org, location, term, tag, posted_by_name) values
  ('11111111-1111-4111-8111-111111111101', 'Software Engineering Intern', 'Fieldstone Analytics', 'Remote', 'Summer''27', 'Tech', 'Maya Okafor'),
  ('11111111-1111-4111-8111-111111111102', 'Marketing Intern', 'Harbor & Co.', 'New York, NY', 'Fall''26', 'Business', 'Priya Nair'),
  ('11111111-1111-4111-8111-111111111103', 'Research Assistant', 'Michigan Neuroscience Lab', 'Ann Arbor, MI', 'Spring''27', 'Research', 'Aisha Bello'),
  ('11111111-1111-4111-8111-111111111104', 'Robotics Intern', 'Vantage Motion', 'Berkeley, CA', 'Summer''27', 'Engineering', 'Diego Fernandez')
on conflict (id) do nothing;

insert into study_requests (id, course, school, when_text, note, posted_by_name) values
  ('22222222-2222-4222-8222-222222222201', 'CS 61B — Data Structures', 'UC Berkeley', 'Tues/Thurs evenings', 'Prepping for the final, want to trade practice problems.', 'Noah Kim'),
  ('22222222-2222-4222-8222-222222222202', 'ORGO 2', 'University of Michigan', 'Weekends', 'Lab practical is kicking my butt, looking for a study pod.', 'Aisha Bello'),
  ('22222222-2222-4222-8222-222222222203', 'ECON 101', 'NYU', 'Weekday mornings', 'Reviewing for midterm, coffee shop sessions preferred.', 'Priya Nair')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table group_posts enable row level security;
alter table messages enable row level security;
alter table internships enable row level security;
alter table saved_internships enable row level security;
alter table study_requests enable row level security;
alter table study_request_members enable row level security;
alter table sports_preferences enable row level security;

-- Real, per-user security: every policy below requires a signed-in Supabase Auth
-- session (auth.uid()) and scopes writes to rows the caller actually owns.
-- Drop older/looser policies first so re-running this script on an existing
-- project is safe.

drop policy if exists "public read profiles" on profiles;
drop policy if exists "public insert profiles" on profiles;
drop policy if exists "public update profiles" on profiles;
drop policy if exists "public read group_members" on group_members;
drop policy if exists "public insert group_members" on group_members;
drop policy if exists "public delete group_members" on group_members;
drop policy if exists "public read group_posts" on group_posts;
drop policy if exists "public insert group_posts" on group_posts;
drop policy if exists "public read messages" on messages;
drop policy if exists "public insert messages" on messages;
drop policy if exists "own read group_members" on group_members;
drop policy if exists "own insert group_members" on group_members;
drop policy if exists "own delete group_members" on group_members;

-- Any signed-in user can see every profile (that's what powers Discover), but
-- you can only create or edit the profile row that matches your own auth id.
create policy "authenticated read profiles" on profiles for select to authenticated using (true);
create policy "own insert profile" on profiles for insert to authenticated with check (auth.uid() = id);
create policy "own update profile" on profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Any signed-in user can browse and create groups; only the creator can
-- update/delete their own group (no UI for that yet, but the policy is ready).
create policy "authenticated read groups" on groups for select to authenticated using (true);
create policy "authenticated insert groups" on groups for insert to authenticated with check (auth.uid() = created_by);
create policy "own update groups" on groups for update to authenticated using (auth.uid() = created_by) with check (auth.uid() = created_by);

-- Group membership rows are private to the member.
create policy "own read group_members" on group_members for select to authenticated using (auth.uid() = profile_id);
create policy "own insert group_members" on group_members for insert to authenticated with check (auth.uid() = profile_id);
create policy "own delete group_members" on group_members for delete to authenticated using (auth.uid() = profile_id);

-- Group posts are readable by any signed-in member, but you can only post as yourself.
create policy "authenticated read group_posts" on group_posts for select to authenticated using (true);
create policy "own insert group_posts" on group_posts for insert to authenticated with check (auth.uid() = author_id);

-- Messages are only visible to the two people in the conversation.
create policy "own read messages" on messages for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "own insert messages" on messages for insert to authenticated with check (auth.uid() = sender_id);

-- Internship listings are readable by anyone signed in; only postable as yourself.
create policy "authenticated read internships" on internships for select to authenticated using (true);
create policy "own insert internships" on internships for insert to authenticated with check (auth.uid() = posted_by);

create policy "own read saved_internships" on saved_internships for select to authenticated using (auth.uid() = profile_id);
create policy "own insert saved_internships" on saved_internships for insert to authenticated with check (auth.uid() = profile_id);
create policy "own delete saved_internships" on saved_internships for delete to authenticated using (auth.uid() = profile_id);

-- Study requests follow the same pattern as internships/groups.
create policy "authenticated read study_requests" on study_requests for select to authenticated using (true);
create policy "own insert study_requests" on study_requests for insert to authenticated with check (auth.uid() = posted_by);

create policy "authenticated read study_request_members" on study_request_members for select to authenticated using (true);
create policy "own insert study_request_members" on study_request_members for insert to authenticated with check (auth.uid() = profile_id);
create policy "own delete study_request_members" on study_request_members for delete to authenticated using (auth.uid() = profile_id);

-- Sport Mode preferences are private to the user who set them.
drop policy if exists "own read sports_preferences" on sports_preferences;
drop policy if exists "own insert sports_preferences" on sports_preferences;
drop policy if exists "own update sports_preferences" on sports_preferences;
drop policy if exists "own delete sports_preferences" on sports_preferences;

create policy "own read sports_preferences" on sports_preferences for select to authenticated using (auth.uid() = profile_id);
create policy "own insert sports_preferences" on sports_preferences for insert to authenticated with check (auth.uid() = profile_id);
create policy "own update sports_preferences" on sports_preferences for update to authenticated using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "own delete sports_preferences" on sports_preferences for delete to authenticated using (auth.uid() = profile_id);

-- ---------------------------------------------------------------------------
-- Storage: profile photos live in Supabase Storage instead of being embedded
-- as base64 text in the database. Each user can only write inside a folder
-- named after their own user id (avatars/<user-id>/...); the bucket is public
-- for reading so avatar images can be displayed without extra signed-URL
-- plumbing.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "public read avatars" on storage.objects;
drop policy if exists "own write avatars" on storage.objects;
drop policy if exists "own update avatars" on storage.objects;
drop policy if exists "own delete avatars" on storage.objects;

create policy "public read avatars" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "own write avatars" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own update avatars" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own delete avatars" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- Realtime: push new messages and group posts to open clients instead of
-- making them poll. Guarded so re-running this script doesn't error on
-- "relation is already member of publication."
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table messages;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'group_posts'
  ) then
    alter publication supabase_realtime add table group_posts;
  end if;
end $$;
