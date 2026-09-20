begin;
alter table public.questions drop constraint questions_category_check;
alter table public.questions add constraint questions_category_check check (char_length(trim(category)) between 1 and 50);
alter table public.questions add column tags text[] not null default '{}';
alter table public.projects add column tags text[] not null default '{}';
alter table public.questions drop constraint questions_parent_id_fkey;
alter table public.questions add constraint questions_parent_id_fkey foreign key (parent_id) references public.questions(id) on delete set null;
grant select, update on public.questions, public.projects to service_role;

create table public.comments (
  id bigint generated always as identity primary key,
  question_id bigint references public.questions(id) on delete cascade,
  project_id bigint references public.projects(id) on delete cascade,
  author_name text not null default '' check (char_length(author_name) <= 80),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  answer text not null default '' check (char_length(answer) <= 20000),
  is_public boolean not null default false,
  notification_sent_at timestamptz,
  created_at timestamptz not null default now(),
  check (num_nonnulls(question_id, project_id) = 1),
  check (not is_public or char_length(trim(answer)) > 0)
);
create index comments_question_idx on public.comments(question_id);
create index comments_project_idx on public.comments(project_id);
alter table public.comments enable row level security;
revoke all on public.comments from anon, authenticated;
grant select, update, delete on public.comments to authenticated;
grant all on public.comments to service_role;
grant usage on sequence public.comments_id_seq to service_role;
create policy "Admins manage comments" on public.comments for all to authenticated
  using (exists (select 1 from public.admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admins where user_id = (select auth.uid())));

-- Only the server may submit comments. Private metadata never enters the public API.
create table public.comment_limits (
  fingerprint text primary key,
  window_start timestamptz not null,
  count integer not null
);
alter table public.comment_limits enable row level security;
revoke all on public.comment_limits from anon, authenticated;
grant all on public.comment_limits to service_role;

create function public.submit_comment(p_kind text, p_target bigint, p_name text, p_body text, p_fingerprint text)
returns bigint language plpgsql set search_path = '' as $$
declare new_id bigint; attempts integer;
begin
  if p_kind = 'questions' then
    perform id from public.questions where id = p_target and is_public and char_length(trim(answer)) > 0 for share;
  elsif p_kind = 'projects' then
    perform id from public.projects where id = p_target and is_public for share;
  else
    raise exception 'INVALID_TARGET';
  end if;
  if not found then raise exception 'INVALID_TARGET'; end if;
  insert into public.comment_limits values (p_fingerprint, now(), 1)
  on conflict (fingerprint) do update set
    count = case when public.comment_limits.window_start < now() - interval '10 minutes' then 1 else public.comment_limits.count + 1 end,
    window_start = case when public.comment_limits.window_start < now() - interval '10 minutes' then now() else public.comment_limits.window_start end
  returning count into attempts;
  if attempts > 3 then raise exception 'RATE_LIMIT'; end if;
  delete from public.comment_limits where window_start < now() - interval '1 day';
  insert into public.comments(question_id, project_id, author_name, body)
  values (case when p_kind = 'questions' then p_target end, case when p_kind = 'projects' then p_target end, p_name, p_body)
  returning id into new_id;
  return new_id;
end;
$$;
revoke all on function public.submit_comment(text,bigint,text,text,text) from public, anon, authenticated;
grant execute on function public.submit_comment(text,bigint,text,text,text) to service_role;

-- Public output excludes notification metadata and only includes visible parents.
create function public.public_comments(p_kind text, p_target bigint)
returns table (id bigint, author_name text, body text, answer text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select c.id, c.author_name, c.body, c.answer, c.created_at from public.comments c
  where c.is_public and char_length(trim(c.answer)) > 0 and (
    (p_kind = 'questions' and c.question_id = p_target and exists (
      select 1 from public.questions q where q.id = p_target and q.is_public and char_length(trim(q.answer)) > 0))
    or (p_kind = 'projects' and c.project_id = p_target and exists (
      select 1 from public.projects p where p.id = p_target and p.is_public)))
  order by c.created_at;
$$;
revoke all on function public.public_comments(text,bigint) from public;
grant execute on function public.public_comments(text,bigint) to anon, authenticated;
commit;
