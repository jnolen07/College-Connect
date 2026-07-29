-- Run this once in Supabase: Dashboard -> SQL Editor -> New Query -> paste all -> Run

create extension if not exists "pgcrypto";

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

create table if not exists group_members (
  group_id text not null,
  profile_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (group_id, profile_id)
);

create table if not exists group_posts (
  id uuid primary key default gen_random_uuid(),
  group_id text not null,
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

alter table profiles enable row level security;
alter table group_members enable row level security;
alter table group_posts enable row level security;
alter table messages enable row level security;

-- Real, per-user security: every policy below requires a signed-in Supabase Auth
-- session (auth.uid()) and scopes writes to rows the caller actually owns.
-- Drop the old "public for anyone with the anon key" policies first so re-running
-- this script on an existing project is safe.

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

-- Any signed-in user can see every profile (that's what powers Discover), but
-- you can only create or edit the profile row that matches your own auth id.
create policy "authenticated read profiles" on profiles for select to authenticated using (true);
create policy "own insert profile" on profiles for insert to authenticated with check (auth.uid() = id);
create policy "own update profile" on profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Group membership is private to the member.
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

-- Profile photos live in Supabase Storage instead of being embedded as base64
-- text in the database. Each user can only write inside a folder named after
-- their own user id (avatars/<user-id>/...); the bucket is public for reading
-- so avatar images can be displayed without extra signed-URL plumbing.
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
