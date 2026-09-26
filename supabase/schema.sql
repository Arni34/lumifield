-- ============================================================
-- Qadam — схема БД для Supabase (Postgres).
-- Запусти целиком в SQL Editor проекта Supabase.
-- Затем задай в qadam-app/.env.local:
--   VITE_SUPABASE_URL=https://<ref>.supabase.co
--   VITE_SUPABASE_ANON_KEY=<anon key>
-- ============================================================

create table if not exists public.submissions (
  id           text primary key,
  t            text not null,
  org          text not null,
  cat          text not null,
  price        text not null default 'free',
  format       text not null default 'online',
  scope        text not null default 'kz',
  loc          text,
  age          text,
  dl           text,
  url          text not null,
  d            text not null,
  tags         text[] not null default '{}',
  ok           boolean not null default false,
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  submitted_by text not null default 'аноним',
  submitted_at timestamptz not null default now()
);

create index if not exists submissions_status_idx on public.submissions (status);

-- ---------- Row Level Security ----------
alter table public.submissions enable row level security;

-- Любой посетитель может предложить мероприятие (создаётся как pending).
drop policy if exists "anyone can submit" on public.submissions;
create policy "anyone can submit"
  on public.submissions for insert
  to anon, authenticated
  with check (status = 'pending');

-- Публично видны только одобренные (они попадают в каталог).
drop policy if exists "public sees approved" on public.submissions;
create policy "public sees approved"
  on public.submissions for select
  to anon, authenticated
  using (status = 'approved');

-- Модерация (просмотр всех, смена статуса, удаление) — только у роли admin.
-- ВАЖНО: в проде дай админу JWT с claim role='admin' (или используй service_role
-- на сервере). Клиентский пароль в Admin.tsx — только демо-заглушка.
drop policy if exists "admin manages all" on public.submissions;
create policy "admin manages all"
  on public.submissions for all
  to authenticated
  using (coalesce(auth.jwt() ->> 'role', '') = 'admin')
  with check (coalesce(auth.jwt() ->> 'role', '') = 'admin');
