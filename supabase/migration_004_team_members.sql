-- Migration 004 — Team identity (lightweight staff roster + assignment)
-- Run this in the Supabase SQL Editor. Additive only.
--
-- Stage 1 only: no real per-person login yet. The shared passcode still
-- gates "is this Rate staff"; this adds a roster + a second signed cookie
-- so staff can say which of them is currently at the keyboard, for
-- personalized "My Tasks" and assignment. Anyone who knows the passcode
-- could pick anyone's name — same trust level as the passcode itself,
-- just adding attribution on top. Real per-person auth is a separate,
-- later stage.
--
-- team_members is global (not client-scoped) — Rate staff work across
-- every client, unlike the client-side `contacts` table. Role values are
-- 'lead' / 'member', deliberately not 'admin', to avoid colliding with
-- the existing passcode-gate concept of "admin" used throughout the app.

create table if not exists team_members (
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
alter table content_items add column if not exists assignee_id uuid references team_members(id) on delete set null;
alter table requests add column if not exists assignee_id uuid references team_members(id) on delete set null;

create index if not exists content_items_assignee_idx on content_items(assignee_id);
create index if not exists requests_assignee_idx on requests(assignee_id);

alter table team_members enable row level security;
-- No policies defined — service_role only, same posture as every other table.

-- Seed: Katie, so the picker isn't empty on first load.
insert into team_members (name, email, role, color) values
($$Katie$$, $$katie@ratemarketing.co.uk$$, $$lead$$, $$#c8e63e$$);
