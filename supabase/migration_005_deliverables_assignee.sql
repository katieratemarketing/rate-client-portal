-- Migration 005 — Assignee on Ongoing Projects (deliverables)
-- Run this in the Supabase SQL Editor. Additive only.
--
-- Same pattern as content_items.assignee_id / requests.assignee_id from
-- migration_004 — undated project work (e.g. "CRM data infrastructure
-- discovery", "LinkedIn audit") now shows up in the assignee's cross-client
-- Home view alongside their dated content.

alter table deliverables add column if not exists assignee_id uuid references team_members(id) on delete set null;
create index if not exists deliverables_assignee_idx on deliverables(assignee_id);
