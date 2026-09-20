begin;
create table public.site_profile (
  id integer primary key default 1 check (id = 1),
  display_name text not null check (char_length(trim(display_name)) between 1 and 100),
  bio text not null default '' check (char_length(bio) <= 5000),
  links jsonb not null default '[]' check (jsonb_typeof(links) = 'array' and jsonb_array_length(links) <= 10),
  updated_at timestamptz not null default now()
);
insert into public.site_profile (display_name, bio) values ('Takumi', '面接で聞かれそうな質問への回答や、開発経験・研究内容をまとめています。');
alter table public.site_profile enable row level security;
revoke all on public.site_profile from anon, authenticated;
grant select on public.site_profile to anon, authenticated;
grant update on public.site_profile to authenticated;
create policy "Public profile" on public.site_profile for select to anon, authenticated using (true);
create policy "Admins edit profile" on public.site_profile for update to authenticated
  using (exists (select 1 from public.admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admins where user_id = (select auth.uid())));
create trigger profile_updated before update on public.site_profile
  for each row execute function public.set_updated_at();
commit;
