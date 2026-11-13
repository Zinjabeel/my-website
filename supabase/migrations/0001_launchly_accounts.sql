-- Launchly: accounts, project briefs and contact messages.
-- Apply to a NEW Supabase project (Dashboard → SQL Editor, or `supabase db push`).
-- Everything is protected by row-level security: the publishable key in the browser
-- can only do what the policies below allow.

-- ───────────────────────────── Project briefs ─────────────────────────────
create table if not exists public.project_briefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company text not null check (char_length(company) between 2 and 120),
  website text check (website is null or char_length(website) <= 200),
  project_type text not null check (char_length(project_type) <= 60),
  goals text not null check (char_length(goals) between 30 and 5000),
  budget text check (budget is null or char_length(budget) <= 40),
  timeline text check (timeline is null or char_length(timeline) <= 40),
  status text not null default 'received' check (status in ('received', 'in_review', 'replied', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists project_briefs_user_idx on public.project_briefs (user_id, created_at desc);

alter table public.project_briefs enable row level security;

-- A signed-in person can read and create only their own briefs. Nobody can edit or delete
-- through the API; the studio updates `status` from the dashboard.
create policy "briefs: read own" on public.project_briefs
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "briefs: create own" on public.project_briefs
  for insert to authenticated with check ((select auth.uid()) = user_id and status = 'received');

-- Flood guard: at most 5 briefs per account per 24 hours.
create or replace function public.brief_rate_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.project_briefs
      where user_id = new.user_id and created_at > now() - interval '24 hours') >= 5 then
    raise exception 'brief_rate_limit';
  end if;
  return new;
end $$;

create trigger project_briefs_rate_limit before insert on public.project_briefs
  for each row execute function public.brief_rate_limit();

-- ───────────────────────────── Contact messages ─────────────────────────────
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) between 5 and 200),
  company text check (company is null or char_length(company) <= 120),
  project_type text not null check (char_length(project_type) <= 60),
  budget text check (budget is null or char_length(budget) <= 40),
  message text not null check (char_length(message) between 20 and 5000),
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Anyone may send a message; nobody outside can read, change or delete them.
create policy "contact: anyone can send" on public.contact_messages
  for insert to anon, authenticated with check (handled = false);

-- Flood guard: at most 200 messages per 10 minutes across the whole site.
create or replace function public.contact_rate_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.contact_messages where created_at > now() - interval '10 minutes') >= 200 then
    raise exception 'contact_rate_limit';
  end if;
  return new;
end $$;

create trigger contact_messages_rate_limit before insert on public.contact_messages
  for each row execute function public.contact_rate_limit();

-- ───────────────────────────── Delete my account ─────────────────────────────
-- Lets a signed-in person remove their own account; their briefs go with it (cascade).
create or replace function public.delete_own_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
revoke all on function public.brief_rate_limit() from public, anon, authenticated;
revoke all on function public.contact_rate_limit() from public, anon, authenticated;
