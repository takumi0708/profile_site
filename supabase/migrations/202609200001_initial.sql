begin;

-- Membership is managed only by the database owner (SQL Editor).
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;
grant select on public.admins to authenticated;
create policy "Read own admin membership" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

create table public.questions (
  id bigint generated always as identity primary key,
  parent_id bigint references public.questions(id) on delete restrict,
  question text not null check (char_length(trim(question)) between 1 and 500),
  answer text not null default '' check (char_length(answer) <= 20000),
  category text not null check (category in ('career', 'self', 'technical')),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not is_public or char_length(trim(answer)) > 0)
);

create table public.projects (
  id bigint generated always as identity primary key,
  title text not null,
  summary text not null,
  technologies text[] not null default '{}',
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger questions_updated before update on public.questions
  for each row execute function public.set_updated_at();
create trigger projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.questions enable row level security;
alter table public.projects enable row level security;
revoke all on public.questions, public.projects from anon, authenticated;
grant select on public.questions, public.projects to anon, authenticated;
grant insert, update, delete on public.questions, public.projects to authenticated;
grant usage on sequence public.questions_id_seq, public.projects_id_seq to authenticated;

create policy "Public answered questions" on public.questions for select to anon, authenticated
  using (is_public and char_length(trim(answer)) > 0);
create policy "Admins manage questions" on public.questions for all to authenticated
  using (exists (select 1 from public.admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admins where user_id = (select auth.uid())));
create policy "Public projects" on public.projects for select to anon, authenticated using (is_public);
create policy "Admins manage projects" on public.projects for all to authenticated
  using (exists (select 1 from public.admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admins where user_id = (select auth.uid())));
create index questions_parent_id_idx on public.questions(parent_id);
commit;
