begin;
create index comments_created_at_idx on public.comments(created_at);

-- Serialize admissions across all visitors. Counters survive comment deletion.
create function public.guard_comment_volume() returns trigger
language plpgsql set search_path = '' as $$
declare attempts integer;
begin
  perform pg_catalog.pg_advisory_xact_lock(20260920, 3);
  if exists (
    select 1 from public.comments c
    where c.created_at > now() - interval '24 hours'
      and c.question_id is not distinct from new.question_id
      and c.project_id is not distinct from new.project_id
      and lower(regexp_replace(trim(c.body), '\s+', ' ', 'g')) =
          lower(regexp_replace(trim(new.body), '\s+', ' ', 'g'))
  ) then raise exception 'DUPLICATE_COMMENT'; end if;

  insert into public.comment_limits values ('global:hour', now(), 1)
  on conflict (fingerprint) do update set
    count = case when public.comment_limits.window_start <= now() - interval '1 hour' then 1 else public.comment_limits.count + 1 end,
    window_start = case when public.comment_limits.window_start <= now() - interval '1 hour' then now() else public.comment_limits.window_start end
  returning count into attempts;
  if attempts > 20 then raise exception 'GLOBAL_RATE_LIMIT'; end if;

  insert into public.comment_limits values ('global:day', now(), 1)
  on conflict (fingerprint) do update set
    count = case when public.comment_limits.window_start <= now() - interval '24 hours' then 1 else public.comment_limits.count + 1 end,
    window_start = case when public.comment_limits.window_start <= now() - interval '24 hours' then now() else public.comment_limits.window_start end
  returning count into attempts;
  if attempts > 100 then raise exception 'GLOBAL_RATE_LIMIT'; end if;
  return new;
end;
$$;
revoke all on function public.guard_comment_volume() from public, anon, authenticated;
create trigger comment_volume_guard before insert on public.comments
for each row execute function public.guard_comment_volume();
commit;
