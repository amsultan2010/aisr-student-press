-- The AISR Student Press: initial schema
-- Public site reads published content with the publishable key.
-- Only emails in public.admins can write anything (Google sign-in, leaders only).

-- ---------------------------------------------------------------------------
-- Admin allowlist
-- ---------------------------------------------------------------------------
create table public.admins (
  email text primary key check (email = lower(email)),
  added_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where a.email = lower(coalesce((select auth.jwt()) ->> 'email', ''))
  );
$$;

-- ---------------------------------------------------------------------------
-- Shared trigger helpers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Sections (fixed set, descriptions editable)
-- ---------------------------------------------------------------------------
create table public.sections (
  id smallint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  short_name text not null,
  description text not null default '',
  sort_order smallint not null default 0
);

insert into public.sections (slug, name, short_name, description, sort_order) values
  ('news', 'School News', 'News', 'Campus updates, event coverage, club spotlights and academic announcements.', 1),
  ('student-life', 'Student Life & Culture', 'Student Life', 'Advice columns, book and movie reviews, cafeteria and local reviews.', 2),
  ('sports', 'Sports', 'Sports', 'Recent games, events in athlete life and pieces about sport at AISR.', 3),
  ('opinion', 'Opinion', 'Opinion', 'Student-written op-eds, debates and personal essays.', 4),
  ('creative-corner', 'Creative Corner', 'Creative', 'Short stories, poetry, digital art and photography.', 5);

-- ---------------------------------------------------------------------------
-- Staff directory (bylines, author pages, team page)
-- ---------------------------------------------------------------------------
create table public.staff (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  role text not null default 'Staff Writer',
  role_group text not null default 'writers'
    check (role_group in ('leadership', 'editors', 'writers', 'photographers', 'contributors')),
  bio text not null default '',
  photo_url text,
  grade text,
  instagram text,
  is_active boolean not null default true,
  is_placeholder boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger staff_touch before update on public.staff
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Articles
-- ---------------------------------------------------------------------------
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  dek text not null default '',
  section_id smallint not null references public.sections (id),
  body jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  body_text text not null default '',
  cover_url text,
  cover_alt text not null default '',
  cover_caption text not null default '',
  cover_credit text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  is_lead boolean not null default false,
  is_editors_pick boolean not null default false,
  in_ticker boolean not null default false,
  is_placeholder boolean not null default false,
  reading_minutes integer not null default 1,
  view_count bigint not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(dek, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(body_text, '')), 'C')
  ) stored
);

create index articles_published_idx on public.articles (published_at desc) where status = 'published';
create index articles_section_idx on public.articles (section_id, published_at desc);
create index articles_search_idx on public.articles using gin (search);
create index articles_created_by_idx on public.articles (created_by);

-- Reading time, publish timestamp and updated_at are derived server side so
-- every client (dashboard, SQL editor) gets the same values.
create or replace function public.articles_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  words integer;
begin
  words := coalesce(array_length(regexp_split_to_array(nullif(btrim(new.body_text), ''), '\s+'), 1), 0);
  new.reading_minutes := greatest(1, ceil(words / 225.0)::integer);
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  -- View counter bumps must not count as edits.
  if tg_op = 'INSERT'
     or (to_jsonb(new) - 'view_count' - 'updated_at' - 'search')
        is distinct from (to_jsonb(old) - 'view_count' - 'updated_at' - 'search') then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

create trigger articles_before_write before insert or update on public.articles
  for each row execute function public.articles_before_write();

-- Only published articles whose publish time has passed are public.
create or replace function public.article_is_public(p_article_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.articles a
    where a.id = p_article_id and a.status = 'published' and a.published_at <= now()
  );
$$;

create table public.article_authors (
  article_id uuid not null references public.articles (id) on delete cascade,
  staff_id uuid not null references public.staff (id) on delete cascade,
  position smallint not null default 0,
  primary key (article_id, staff_id)
);
create index article_authors_staff_idx on public.article_authors (staff_id);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.article_tags (
  article_id uuid not null references public.articles (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (article_id, tag_id)
);
create index article_tags_tag_idx on public.article_tags (tag_id);

-- ---------------------------------------------------------------------------
-- Views
-- ---------------------------------------------------------------------------
create table public.article_views (
  id bigint generated always as identity primary key,
  article_id uuid not null references public.articles (id) on delete cascade,
  visitor text not null,
  viewed_at timestamptz not null default now()
);
create index article_views_article_idx on public.article_views (article_id, viewed_at desc);
create index article_views_time_idx on public.article_views (viewed_at desc);

-- One view per visitor per article per 30 minutes. Callable by anyone.
create or replace function public.record_view(p_article_id uuid, p_visitor text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_visitor is null or length(p_visitor) < 8 or length(p_visitor) > 64 then
    return;
  end if;
  if not public.article_is_public(p_article_id) then
    return;
  end if;
  if exists (
    select 1 from public.article_views v
    where v.article_id = p_article_id and v.visitor = p_visitor
      and v.viewed_at > now() - interval '30 minutes'
  ) then
    return;
  end if;
  insert into public.article_views (article_id, visitor) values (p_article_id, p_visitor);
  update public.articles set view_count = view_count + 1 where id = p_article_id;
end;
$$;

-- Daily view totals in Riyadh local days for the dashboard chart (admins only).
create or replace function public.views_by_day(p_days integer default 30)
returns table (day date, views bigint)
language sql
stable
security definer
set search_path = ''
as $$
  with bounds as (
    select (now() at time zone 'Asia/Riyadh')::date as today
  )
  select d::date as day, count(v.id) as views
  from bounds,
    generate_series(
      (bounds.today - (least(greatest(p_days, 1), 366) - 1))::timestamp,
      bounds.today::timestamp,
      interval '1 day'
    ) d
  left join public.article_views v
    on v.viewed_at >= (d at time zone 'Asia/Riyadh')
   and v.viewed_at < ((d + interval '1 day') at time zone 'Asia/Riyadh')
  where public.is_admin()
  group by d
  order by d;
$$;

-- ---------------------------------------------------------------------------
-- Pitch / contact submissions (anyone can submit, admins read)
-- ---------------------------------------------------------------------------
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('pitch', 'article', 'letter', 'photo', 'contact')),
  name text not null check (length(name) between 1 and 120),
  email text not null check (length(email) between 3 and 200),
  grade text check (grade is null or length(grade) <= 20),
  section_slug text references public.sections (slug),
  title text not null default '' check (length(title) <= 200),
  message text not null check (length(message) between 1 and 10000),
  attachment_path text,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);
create index submissions_created_idx on public.submissions (created_at desc);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.sections enable row level security;
alter table public.staff enable row level security;
alter table public.articles enable row level security;
alter table public.article_authors enable row level security;
alter table public.tags enable row level security;
alter table public.article_tags enable row level security;
alter table public.article_views enable row level security;
alter table public.submissions enable row level security;

create policy "admins read allowlist" on public.admins
  for select to authenticated using ((select public.is_admin()));

create policy "sections are public" on public.sections
  for select to anon, authenticated using (true);
create policy "admins update sections" on public.sections
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "active staff are public" on public.staff
  for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy "admins insert staff" on public.staff
  for insert to authenticated with check ((select public.is_admin()));
create policy "admins update staff" on public.staff
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins delete staff" on public.staff
  for delete to authenticated using ((select public.is_admin()));

create policy "published articles are public" on public.articles
  for select to anon, authenticated
  using ((status = 'published' and published_at <= now()) or (select public.is_admin()));
create policy "admins insert articles" on public.articles
  for insert to authenticated with check ((select public.is_admin()));
create policy "admins update articles" on public.articles
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins delete articles" on public.articles
  for delete to authenticated using ((select public.is_admin()));

create policy "bylines of public articles are public" on public.article_authors
  for select to anon, authenticated
  using (public.article_is_public(article_id) or (select public.is_admin()));
create policy "admins insert bylines" on public.article_authors
  for insert to authenticated with check ((select public.is_admin()));
create policy "admins update bylines" on public.article_authors
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins delete bylines" on public.article_authors
  for delete to authenticated using ((select public.is_admin()));

create policy "tags are public" on public.tags
  for select to anon, authenticated using (true);
create policy "admins insert tags" on public.tags
  for insert to authenticated with check ((select public.is_admin()));
create policy "admins update tags" on public.tags
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins delete tags" on public.tags
  for delete to authenticated using ((select public.is_admin()));

create policy "tags of public articles are public" on public.article_tags
  for select to anon, authenticated
  using (public.article_is_public(article_id) or (select public.is_admin()));
create policy "admins insert article tags" on public.article_tags
  for insert to authenticated with check ((select public.is_admin()));
create policy "admins delete article tags" on public.article_tags
  for delete to authenticated using ((select public.is_admin()));

create policy "admins read views" on public.article_views
  for select to authenticated using ((select public.is_admin()));

create policy "anyone can submit" on public.submissions
  for insert to anon, authenticated with check (status = 'new');
create policy "admins read submissions" on public.submissions
  for select to authenticated using ((select public.is_admin()));
create policy "admins update submissions" on public.submissions
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins delete submissions" on public.submissions
  for delete to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Grants (explicit, so the Data API works regardless of project defaults)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.sections, public.staff, public.articles, public.article_authors,
  public.tags, public.article_tags to anon, authenticated;
grant insert on public.submissions to anon, authenticated;
grant select, update, delete on public.submissions to authenticated;
grant select on public.admins, public.article_views to authenticated;
grant update on public.sections to authenticated;
grant insert, update, delete on public.staff, public.articles, public.article_authors,
  public.tags, public.article_tags to authenticated;

revoke execute on function public.views_by_day(integer) from public, anon;
grant execute on function public.views_by_day(integer) to authenticated;
revoke execute on function public.record_view(uuid, text) from public;
grant execute on function public.record_view(uuid, text) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.article_is_public(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('media', 'media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']),
  ('submissions', 'submissions', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'])
on conflict (id) do nothing;

create policy "admins upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and (select public.is_admin()));
create policy "admins update media" on storage.objects
  for update to authenticated using (bucket_id = 'media' and (select public.is_admin()));
create policy "admins delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and (select public.is_admin()));
create policy "admins list media" on storage.objects
  for select to authenticated using (bucket_id = 'media' and (select public.is_admin()));

create policy "anyone uploads a submission attachment" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = 'incoming');
create policy "admins read submission attachments" on storage.objects
  for select to authenticated using (bucket_id = 'submissions' and (select public.is_admin()));
create policy "admins delete submission attachments" on storage.objects
  for delete to authenticated using (bucket_id = 'submissions' and (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Seed: the two leaders (photos added later from the dashboard)
-- ---------------------------------------------------------------------------
insert into public.staff (slug, name, role, role_group, bio, sort_order) values
  ('imran-siwani', 'Imran Siwani', 'Co-Editor-in-Chief', 'leadership', '', 1),
  ('zarina-ugarova', 'Zarina Ugarova', 'Co-Editor-in-Chief', 'leadership', '', 2);
