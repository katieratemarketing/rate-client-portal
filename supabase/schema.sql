-- Rate Client Portal — Supabase Schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query)
--
-- Architecture note: there is no per-user Supabase Auth yet — admin access is a
-- single shared passcode checked server-side (see src/app/api/admin/login).
-- Because of that, the browser never talks to Supabase directly: every read and
-- write goes through a Next.js route handler using the service_role key, which
-- bypasses RLS by design. RLS is still enabled below as a safety net — with no
-- policies defined, anon/authenticated roles get zero access, and only
-- service_role (server-only, never shipped to the browser) can touch these
-- tables. If real per-client logins are added later, this is the point where
-- anon-scoped SELECT policies would get layered in.

create extension if not exists pgcrypto;

-- ══════════════════════════════════════════════
-- CLIENTS
-- ══════════════════════════════════════════════
create table clients (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  show_planning_reference boolean not null default false,
  sow_summary text not null default '',
  created_at timestamptz default now()
);

-- ══════════════════════════════════════════════
-- BRANDS (per client — "areas" in the app)
-- key is the short string used everywhere in the UI (e.g. "ulverscroft")
-- ══════════════════════════════════════════════
create table brands (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  key text not null,
  label text not null,
  color text not null,
  short text not null,
  sort_order int default 0,
  unique(client_id, key)
);

-- ══════════════════════════════════════════════
-- THEMES (per client — campaign/tentpole tags)
-- ══════════════════════════════════════════════
create table themes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  key text not null,
  label text not null,
  color text not null,
  brief text,
  unique(client_id, key)
);

-- ══════════════════════════════════════════════
-- CONTENT ITEMS (calendar items)
-- fields/checklist/comments/history/attachments stay JSONB — they're
-- per-activity-type flexible shapes, not worth fully normalizing.
-- area/theme/ch reference brands.key / themes.key / the CH config by string,
-- same as the in-memory app — not FKs, since ch is a static config key, not
-- client-owned data.
-- ══════════════════════════════════════════════
create table content_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  date date not null,
  end_date date,
  area text not null,
  ch text not null,
  state text not null default 'todo',
  platform text default '',
  notes text default '',
  theme text default '',
  url text default '',
  fields jsonb not null default '{}',
  checklist jsonb not null default '[]',
  comments jsonb not null default '[]',
  history jsonb not null default '[]',
  attachments jsonb not null default '[]',
  linked_item_ids uuid[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index content_items_client_idx on content_items(client_id);
create index content_items_date_idx on content_items(client_id, date);

-- ══════════════════════════════════════════════
-- STRATEGIES
-- ══════════════════════════════════════════════
create table strategies (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  brands text[] not null default '{}',
  start_date date,
  end_date date,
  b2b text default '',
  product_focus text default '',
  purpose text default '',
  goal text default '',
  kpis text[] not null default '{}',
  audience text default '',
  tone text default '',
  message text default '',
  channels text default '',
  frequency text default '',
  cta text default '',
  budget text default '',
  hashtags text default '',
  created_at timestamptz default now()
);
create index strategies_client_idx on strategies(client_id);

-- ══════════════════════════════════════════════
-- MONTH SUMMARY (singleton per client — the black "This month" strategy card)
-- ══════════════════════════════════════════════
create table month_summaries (
  client_id uuid primary key references clients(id) on delete cascade,
  enabled boolean not null default true,
  text text default ''
);

-- ══════════════════════════════════════════════
-- KEY EVENTS
-- ══════════════════════════════════════════════
create table key_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  start_date date not null,
  end_date date not null,
  areas text[] not null default '{}',
  notes text default '',
  theme text default '',
  venue text default '',
  links jsonb not null default '[]'
);
create index key_events_client_idx on key_events(client_id);

-- ══════════════════════════════════════════════
-- MONTHLY REPORTS
-- Nested sections stay JSONB (summary, socialGroups, website, content) —
-- they're editor/display structures, not queried piecemeal.
-- ══════════════════════════════════════════════
create table monthly_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  year int not null,
  month int not null, -- 0-indexed, matches JS Date
  status text not null default 'draft', -- draft | published
  summary jsonb not null default '{"narrative":"","stats":[]}',
  social_groups jsonb not null default '[]',
  social_analysis text default '',
  website jsonb not null default '{"stats":[],"acquisition":[],"topPages":[],"notes":""}',
  content jsonb not null default '{"campaignsContent":"","assetsCreated":""}',
  projects_snapshot jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(client_id, year, month)
);
create index monthly_reports_client_idx on monthly_reports(client_id);

-- ══════════════════════════════════════════════
-- DELIVERABLES (ongoing projects tracker)
-- ══════════════════════════════════════════════
create table deliverables (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  description text default '',
  status text not null default 'in_planning',
  status_note text default '',
  area text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index deliverables_client_idx on deliverables(client_id);

-- ══════════════════════════════════════════════
-- PLANNING REFERENCE DATES
-- A single shared, global reference bank of industry/awareness dates used
-- for content planning — not client-owned data, so no client_id. Whether a
-- given client's portal shows it is controlled by clients.show_planning_reference.
-- ══════════════════════════════════════════════
create table planning_reference_dates (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  month int not null, -- 1-12
  sort_order int not null default 0,
  date_label text not null default '', -- freeform, e.g. "22 Jan", "6-12 Apr" — source dates vary in precision
  title text not null,
  description text not null default ''
);
create index planning_reference_dates_month_idx on planning_reference_dates(year, month, sort_order);

-- ══════════════════════════════════════════════
-- CONTACTS (client-side people — request "Requested by" dropdown)
-- ══════════════════════════════════════════════
create table contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  email text default '',
  role text default '',
  created_at timestamptz default now()
);
create index contacts_client_idx on contacts(client_id);

-- ══════════════════════════════════════════════
-- REQUESTS (admin-only ad-hoc request inbox — see docs/PRD.md)
-- ══════════════════════════════════════════════
create table requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  requested_by_contact_id uuid references contacts(id) on delete set null,
  requested_by_name text not null default '',
  date_received date not null default current_date,
  source text not null default 'Email',
  original_message text not null default '',
  description text not null default '',
  brand text not null default '',
  request_type text not null default 'general_request',
  deadline date,
  urgency text not null default 'normal',
  estimated_hours numeric,
  in_scope text not null default 'review',
  deliverable_format text not null default '',
  requirements_checklist jsonb not null default '[]',
  status text not null default 'new',
  converted_item_id uuid references content_items(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index requests_client_idx on requests(client_id);
create index requests_status_idx on requests(client_id, status);

-- ══════════════════════════════════════════════
-- TEAM MEMBERS (Rate staff roster — global, not client-scoped, since staff
-- work across every client, unlike the client-side `contacts` table).
-- Stage 1 identity: no real per-person login yet, just attribution once
-- someone's picked their name after the shared passcode. Role values are
-- 'lead' / 'member', deliberately not 'admin', to avoid colliding with the
-- existing passcode-gate concept of "admin" used throughout the app.
-- ══════════════════════════════════════════════
create table team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null default '',
  role text not null default 'member', -- lead | member
  color text not null default '#3b82f6',
  created_at timestamptz default now()
);

-- Assignment is a first-class, cross-cutting concept (needed for the
-- cross-client "My Tasks" query), not type-specific data — a real column,
-- not another entry in the fields/checklist JSONB blobs. Deliberately
-- separate from content_items.checklist's ownerType/ownerName, which is
-- per-subtask free-text attribution (often "client", not staff) — a
-- different concept, not to be unified with this.
alter table content_items add column assignee_id uuid references team_members(id) on delete set null;
alter table requests add column assignee_id uuid references team_members(id) on delete set null;
alter table deliverables add column assignee_id uuid references team_members(id) on delete set null;
create index content_items_assignee_idx on content_items(assignee_id);
create index requests_assignee_idx on requests(assignee_id);
create index deliverables_assignee_idx on deliverables(assignee_id);

-- ══════════════════════════════════════════════
-- Row Level Security — enabled with no policies (service_role only, see note above)
-- ══════════════════════════════════════════════
alter table clients enable row level security;
alter table brands enable row level security;
alter table themes enable row level security;
alter table content_items enable row level security;
alter table strategies enable row level security;
alter table month_summaries enable row level security;
alter table key_events enable row level security;
alter table monthly_reports enable row level security;
alter table deliverables enable row level security;
alter table planning_reference_dates enable row level security;
alter table contacts enable row level security;
alter table requests enable row level security;
alter table team_members enable row level security;

-- ══════════════════════════════════════════════
-- BOOTSTRAP: the one client this prototype currently serves, plus its
-- brand and theme config (previously the hardcoded DEFAULT_AREAS / DEFAULT_THEMES
-- constants in prototype.jsx). Bulk content (items, strategies, events, the
-- July report, deliverables) is seeded separately — see supabase/seed.sql.
-- ══════════════════════════════════════════════
insert into clients (slug, name) values ('ulverscroft', 'Ulverscroft Group');

insert into brands (client_id, key, label, color, short, sort_order)
select id, v.key, v.label, v.color, v.short, v.sort_order
from clients, (values
  ('ulverscroft', 'Ulverscroft', '#1e4d91', 'ULV', 1),
  ('ulibrary', 'uLibrary', '#5a9de6', 'uLIB', 2),
  ('readinghouse', 'The Reading House', '#9b1b1b', 'TRH', 3),
  ('trade', 'Trade', '#6b7280', 'TRD', 4)
) as v(key, label, color, short, sort_order)
where clients.slug = 'ulverscroft';

insert into themes (client_id, key, label, color, brief)
select id, v.key, v.label, v.color, v.brief
from clients, (values
  ('christie', 'Agatha Christie Exhibition', '#7c3aed', 'Major tentpole tied to the London Museum exhibition (Aug–Oct). Coordinated across Ulverscroft and Trade — social series, blog content and trade press outreach spotlighting large-print Christie titles.'),
  ('booklovers', 'National Book Lovers Day', '#ec4899', 'Cross-brand awareness day (9 Aug). Pre-scheduled content across Ulverscroft, uLibrary and The Reading House — must be ready by the 7th.'),
  ('b2s', 'Back to School', '#06b6d4', 'Education-sector push targeting school librarians ahead of the new term. uLibrary-led, with Reading House support.'),
  ('newrelease', 'August New Releases', '#f97316', 'Rolling spotlight on new large-print and audio titles released in August.')
) as v(key, label, color, brief)
where clients.slug = 'ulverscroft';

insert into month_summaries (client_id, enabled, text)
select id, true, 'Leverage the Agatha Christie exhibition as a tentpole across Ulverscroft and Trade. Drive uLibrary retention through Book Club engagement. Build consistent social presence for The Reading House.'
from clients where slug = 'ulverscroft';

insert into team_members (name, email, role, color) values
('Katie', 'katie@ratemarketing.co.uk', 'lead', '#c8e63e');
