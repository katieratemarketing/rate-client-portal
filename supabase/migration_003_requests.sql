-- Migration 003 — Request Inbox (admin-only ad-hoc request triage)
-- Run this in the Supabase SQL Editor. Additive only.
--
-- This is Level 1 (manual) from the Request Inbox spec: Katie logs requests
-- by hand and triages them here. The schema already carries the full field
-- set the spec describes (source, urgency, estimated_hours, in_scope, etc.)
-- so Level 2/3 (email parsing, AI classification) can fill the same columns
-- later without a schema change — only status quo today is that a human
-- fills them in instead of Claude/Power Automate.

alter table clients add column if not exists sow_summary text not null default '';

-- ══════════════════════════════════════════════
-- CONTACTS (client-side people — request "Requested by" dropdown)
-- ══════════════════════════════════════════════
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  email text default '',
  role text default '',
  created_at timestamptz default now()
);
create index if not exists contacts_client_idx on contacts(client_id);

-- ══════════════════════════════════════════════
-- REQUESTS (the inbox itself)
-- requested_by is stored both as a contact_id (for the dropdown) and a
-- denormalized name snapshot, so a request still shows who asked even if
-- the contact is later removed.
-- ══════════════════════════════════════════════
create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  requested_by_contact_id uuid references contacts(id) on delete set null,
  requested_by_name text not null default '',
  date_received date not null default current_date,
  source text not null default 'Email', -- Email | Call | Meeting | Portal | Other
  original_message text not null default '',
  description text not null default '',
  brand text not null default '', -- brand key, matches content_items.area
  request_type text not null default 'general_request', -- copywriting_request | research_request | creative_request | admin_request | advisory_request | general_request
  deadline date,
  urgency text not null default 'normal', -- low | normal | high | asap
  estimated_hours numeric,
  in_scope text not null default 'review', -- yes | no | review
  deliverable_format text not null default '',
  requirements_checklist jsonb not null default '[]',
  status text not null default 'new', -- new | triaged | converted | declined
  converted_item_id uuid references content_items(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists requests_client_idx on requests(client_id);
create index if not exists requests_status_idx on requests(client_id, status);

alter table contacts enable row level security;
alter table requests enable row level security;
-- No policies defined — service_role only, same posture as every other table.
-- Doubly important here: nothing in this migration is ever sent to a non-admin
-- request, enforced in /api/portal, not just hidden in the UI.

-- ══════════════════════════════════════════════
-- SEED — a couple of contacts and one worked example request, matching the
-- "RBMedia bio" example from the spec, so the feature isn't empty on first look.
-- ══════════════════════════════════════════════
insert into contacts (client_id, name, email, role)
select id, $$Diana Whitfield$$, $$diana@rbmedia.example$$, $$Marketing Manager$$
from clients where slug = 'ulverscroft';

insert into contacts (client_id, name, email, role)
select id, $$Nigel Foster$$, $$nigel@ulverscroft.example$$, $$Commercial Director$$
from clients where slug = 'ulverscroft';

insert into requests (client_id, title, requested_by_contact_id, requested_by_name, date_received, source, original_message, description, brand, request_type, deadline, urgency, estimated_hours, in_scope, deliverable_format, requirements_checklist, status)
select
  c.id,
  $$RBMedia company bio$$,
  ct.id,
  $$Diana Whitfield$$,
  current_date,
  $$Email$$,
  $$Hi team, could you pull together an updated bio for RBMedia? We need stats on the audio titles recorded since formation, our copyright retention position, league table ranking, and trade/library download numbers. Nigel also mentioned extending this to other RBMedia brands via the Boldwood deal — separate conversation, just flagging.$$,
  $$Bio for RBMedia/Ulverscroft — needs stats on audio titles recorded, copyright retention, league table position, trade/library downloads. Also noted: Nigel mentioned extending services to other RBMedia brands via the Boldwood deal — commercial opportunity, not a Rate task.$$,
  $$trade$$,
  $$copywriting_request$$,
  null,
  $$normal$$,
  2.5,
  $$review$$,
  $$Bio copy, ~250-400 words$$,
  $$[{"id":"rc1","text":"Research audio title count since formation","done":false},{"id":"rc2","text":"Research copyright retention figures","done":false},{"id":"rc3","text":"Research league table positioning","done":false},{"id":"rc4","text":"Research trade/library download numbers","done":false},{"id":"rc5","text":"Draft bio","done":false},{"id":"rc6","text":"Client review","done":false}]$$::jsonb,
  $$new$$
from clients c, contacts ct
where c.slug = 'ulverscroft' and ct.client_id = c.id and ct.name = $$Diana Whitfield$$;
