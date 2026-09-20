begin;
alter table public.comments add column is_general boolean not null default false;
alter table public.comments drop constraint comments_check;
alter table public.comments add constraint comments_target_check check (
  (is_general and num_nonnulls(question_id, project_id) = 0) or
  (not is_general and num_nonnulls(question_id, project_id) = 1)
);
create or replace function public.submit_comment(p_kind text, p_target bigint, p_name text, p_body text, p_fingerprint text)
returns bigint language plpgsql set search_path = '' as $$
declare new_id bigint; attempts integer;
begin
  if p_kind = 'general' and p_target = 0 then
    perform 1;
  elsif p_kind = 'questions' then
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
  insert into public.comments(question_id, project_id, author_name, body, is_general)
  values (case when p_kind = 'questions' then p_target end, case when p_kind = 'projects' then p_target end, p_name, p_body, p_kind = 'general')
  returning id into new_id;
  return new_id;
end;
$$;
revoke all on function public.submit_comment(text,bigint,text,text,text) from public, anon, authenticated;
grant execute on function public.submit_comment(text,bigint,text,text,text) to service_role;

-- Public output excludes notification metadata and only includes visible parents.
create or replace function public.public_comments(p_kind text, p_target bigint)
returns table (id bigint, author_name text, body text, answer text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select c.id, c.author_name, c.body, c.answer, c.created_at from public.comments c
  where c.is_public and char_length(trim(c.answer)) > 0 and (
    (p_kind = 'general' and p_target = 0 and c.is_general) or
    (p_kind = 'questions' and c.question_id = p_target and exists (
      select 1 from public.questions q where q.id = p_target and q.is_public and char_length(trim(q.answer)) > 0))
    or (p_kind = 'projects' and c.project_id = p_target and exists (
      select 1 from public.projects p where p.id = p_target and p.is_public)))
  order by c.created_at;
$$;
revoke all on function public.public_comments(text,bigint) from public;
grant execute on function public.public_comments(text,bigint) to anon, authenticated;

create function public.question_categories() returns table(category text)
language sql stable set search_path = '' as $$
  select distinct q.category from public.questions q
  where q.is_public and char_length(trim(q.answer)) > 0 order by q.category;
$$;
revoke all on function public.question_categories() from public;
grant execute on function public.question_categories() to anon, authenticated;
commit;
