-- Migration 002 — Planning reference date bank (Key Dates side panel)
-- Run this in the Supabase SQL Editor. Additive only — safe to run once
-- against the already-provisioned database from schema.sql.

alter table clients add column if not exists show_planning_reference boolean not null default false;

-- A single shared, global reference bank of industry/awareness dates used
-- for content planning — not client-owned data, so no client_id. Visibility
-- to any given client's portal is controlled by clients.show_planning_reference.
create table if not exists planning_reference_dates (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  month int not null, -- 1-12
  sort_order int not null default 0,
  date_label text not null default '', -- freeform, e.g. "22 Jan", "6-12 Apr" — source dates vary in precision
  title text not null,
  description text not null default ''
);
create index if not exists planning_reference_dates_month_idx on planning_reference_dates(year, month, sort_order);

alter table planning_reference_dates enable row level security;
-- No policies defined — service_role only, same posture as every other table.

-- ══════════════════════════════════════════════
-- SEED — transcribed from Katie's 2025 planning spreadsheet. Text values use
-- dollar-quoting ($$...$$) since several contain apostrophes.
-- Two items are transcribed exactly as positioned in the source sheet even
-- though they look off — worth double-checking: "Anzac Day" under February
-- (the real ANZAC Day is 25 April) and "National Non-Fiction November"
-- filed under the December column.
-- ══════════════════════════════════════════════
insert into planning_reference_dates (year, month, sort_order, date_label, title, description) values
(2025, 1, 1, $$$$, $$Libraries tend to review annual budgets and new titles$$, $$$$),
(2025, 1, 2, $$22 Jan$$, $$Library Shelfie Day$$, $$Encourages book lovers to share selfies with their bookshelves$$),
(2025, 1, 3, $$16 Jan$$, $$Book Publishers Day$$, $$$$),

(2025, 2, 1, $$14 Feb$$, $$Valentine's Reads / International Book Giving Day$$, $$Inclusive, thoughtful gift ideas$$),
(2025, 2, 2, $$1–9 Feb$$, $$National Storytelling Week (UK)$$, $$Celebrates the tradition of oral storytelling$$),
(2025, 2, 3, $$20 Feb$$, $$National Clean Out Your Bookcase Day$$, $$$$),
(2025, 2, 4, $$Fri 14 Feb$$, $$Library Lovers Day$$, $$$$),
(2025, 2, 5, $$26 Feb$$, $$Anzac Day$$, $$$$),

(2025, 3, 1, $$6 Mar$$, $$World Book Day (UK and Ireland)$$, $$Promotes reading for pleasure among children and young people$$),
(2025, 3, 2, $$8 Mar$$, $$International Women's Day$$, $$Celebrates women's achievements and promotes gender equality$$),
(2025, 3, 3, $$1 Mar$$, $$National Ghostwriters Week$$, $$$$),
(2025, 3, 4, $$2–8 Mar$$, $$Global: Return Borrowed Books Week$$, $$$$),

(2025, 4, 1, $$6–12 Apr, 2025 (US origin, increasingly noted)$$, $$Global: National Library Week$$, $$$$),
(2025, 4, 2, $$2 Apr$$, $$International Children's Book Day$$, $$Inspires a love of reading and highlights children's books$$),

(2025, 5, 1, $$$$, $$National Share-a-Story Month$$, $$Encourages the sharing of stories to promote a love of reading$$),
(2025, 5, 2, $$21 May$$, $$National Simultaneous Storytime (Australia)$$, $$An annual event where a picture book, written and illustrated by Australians, is read simultaneously in libraries, schools, and homes nationwide$$),
(2025, 5, 3, $$12–18 May 2025$$, $$Mental Health Awareness Week$$, $$$$),

(2025, 6, 1, $$$$, $$Global: Audiobook Month$$, $$$$),
(2025, 6, 2, $$$$, $$Pride Month$$, $$$$),
(2025, 6, 3, $$$$, $$Crime Reading Month$$, $$$$),
(2025, 6, 4, $$25 Jun$$, $$National Writing Day (UK)$$, $$$$),

(2025, 7, 1, $$$$, $$Disability Pride Month$$, $$$$),
(2025, 7, 2, $$30 Jul$$, $$Paperback Book Day (UK)$$, $$$$),

(2025, 8, 1, $$$$, $$Family & Children's Audiobook Promotions$$, $$For summer holidays$$),
(2025, 8, 2, $$9 Aug$$, $$Book Lovers Day$$, $$Encourages reading and literature appreciation$$),
(2025, 8, 3, $$16–23 Aug$$, $$Children's Book Week (AUS)$$, $$$$),

(2025, 9, 1, $$$$, $$Back to School$$, $$$$),
(2025, 9, 2, $$8 Sep$$, $$International Literacy Day$$, $$Highlights the importance of literacy for individuals and communities$$),

(2025, 10, 1, $$$$, $$Black History Month (UK)$$, $$Celebrates the contributions of Black individuals and communities$$),
(2025, 10, 2, $$5 Oct$$, $$National Poetry Day (UK)$$, $$Encourages the enjoyment and sharing of poetry$$),
(2025, 10, 3, $$9 Oct$$, $$Blindness Awareness Month / World Sight Day$$, $$$$),
(2025, 10, 4, $$5 Oct$$, $$James Bond Day$$, $$$$),

(2025, 11, 1, $$$$, $$Global: Begin Christmas Campaign$$, $$"Thoughtful Gifting" theme$$),
(2025, 11, 2, $$$$, $$Movember$$, $$Raises awareness of men's health issues$$),
(2025, 11, 3, $$$$, $$Library Year-End Budget Spend Campaign$$, $$$$),

(2025, 12, 1, $$$$, $$Ulverscroft Wrapped$$, $$Showing key trends from this year and predictions of next year$$),
(2025, 12, 2, $$3 Dec$$, $$International Day of Persons with Disabilities$$, $$Promotes the rights and well-being of persons with disabilities$$),
(2025, 12, 3, $$$$, $$"Thoughtful Gifting" Campaign$$, $$$$),
(2025, 12, 4, $$$$, $$National Non-Fiction November (UK)$$, $$Promotes reading of non-fiction books$$);
