-- Keep RLS helper functions out of the exposed API schema.
-- Policies reference functions by OID, so moving them keeps every policy intact.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

alter function public.is_admin() set schema private;
alter function public.article_is_public(uuid) set schema private;

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
  if not private.article_is_public(p_article_id) then
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
  where private.is_admin()
  group by d
  order by d;
$$;
