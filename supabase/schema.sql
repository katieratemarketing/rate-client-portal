-- Rate Client Portal — Supabase Schema
-- Run this in the Supabase SQL Editor

-- Clients
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  retainer_value numeric,
  created_at timestamptz default now()
);

-- Brands (per client)
create table brands (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  label text not null,
  short_code text not null,
  color text not null,
  sort_order int default 0
);

-- Contacts (client-side people)
create table contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  email text,
  role text,
  is_approver boolean default false
);

-- Strategy (per brand per month)
create table strategy (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  brand_id uuid references brands(id) on delete cascade,
  month date not null, -- first of month, e.g. 2026-08-01
  focus text,
  audience text,
  tone text,
  key_message text,
  channels text,
  kpis text[], -- array of KPI strings
  created_at timestamptz default now()
);

-- Content items (calendar items)
create table content_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  brand_id uuid references brands(id),
  title text not null,
  date date not null,
  channel text not null, -- social, email, blog, campaign, pr, web
  state text not null default 'wip', -- wip, review, input, approved, live
  platform text,
  notes text,
  theme text,
  output_url text,
  assigned_to text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Approvals (audit trail)
create table approvals (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references content_items(id) on delete cascade,
  action text not null, -- approved, changes_requested
  approved_by text,
  notes text,
  created_at timestamptz default now()
);

-- Key events
create table key_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  title text not null,
  start_date date not null,
  end_date date not null,
  notes text,
  brand_ids uuid[] -- which brands this event relates to
);

-- Documents (files/links shared with client)
create table documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  title text not null,
  doc_type text, -- proposal, guidelines, asset, report
  url text,
  created_at timestamptz default now()
);

-- CRM Pipeline
create table pipeline (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact_name text,
  contact_email text,
  service text, -- strategy, content, social, campaigns, web
  value numeric,
  stage text not null default 'lead', -- lead, networking, proposal, active, retained, closed_lost, closed_ended
  next_step_date date,
  notes text,
  source text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Rate internal tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  due_date date,
  assigned_to text,
  priority text default 'normal', -- low, normal, high, urgent
  client_id uuid references clients(id),
  is_recurring boolean default false,
  recurrence_rule text,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security (basic - expand per role later)
alter table clients enable row level security;
alter table brands enable row level security;
alter table content_items enable row level security;
alter table strategy enable row level security;
alter table key_events enable row level security;
alter table approvals enable row level security;
alter table documents enable row level security;
alter table pipeline enable row level security;
alter table tasks enable row level security;
