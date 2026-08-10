-- Rate Client Portal — Seed data for the Ulverscroft Group demo
-- Run this AFTER schema.sql (which creates the 'ulverscroft' client row this
-- seed attaches to). Safe to re-run only on a fresh schema — it does not
-- upsert, so re-running against already-seeded tables will create duplicates.
--
-- Every text value uses dollar-quoting ($$...$$) instead of '...' — it needs
-- no escaping at all, so it survives copy/paste through editors or browsers
-- that silently convert straight quotes to curly ones.

-- ══════════════════════════════════════════════
-- CONTENT ITEMS
-- ══════════════════════════════════════════════
insert into content_items (client_id, title, date, area, ch, state, platform, notes, theme, url, checklist, comments, history)
select id, $$Shadow of the Wind – carousel$$, '2026-08-03', 'ulverscroft', 'social', 'approved', 'IG / FB', $$Cover art + pull quotes$$, 'newrelease', '', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
from clients where slug = 'ulverscroft';

insert into content_items (client_id, title, date, area, ch, state, platform, notes, theme, url, checklist, comments, history)
select id, $$August Book Club newsletter$$, '2026-08-05', 'ulibrary', 'email', 'review', 'Kit', $$Black History Month feature$$, '', '', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
from clients where slug = 'ulverscroft';

insert into content_items (client_id, title, date, area, ch, state, platform, notes, theme, url, checklist, comments, history)
select id, $$Library of the Month announcement$$, '2026-08-06', 'ulibrary', 'social', 'input', 'IG / LinkedIn', $$Need title confirmation from Daniel$$, '', '',
  $$[{"id":"cl1","text":"Confirm library name","ownerType":"client","ownerName":"Daniel","done":false}]$$::jsonb,
  $$[{"id":"c1","author":"Rate Team","ts":"2026-08-05T10:12:00Z","text":"Can you confirm the library name before we schedule this?"}]$$::jsonb,
  $$[{"id":"h1","ts":"2026-08-05T10:12:00Z","from":"review","to":"input","by":"Rate Team"}]$$::jsonb
from clients where slug = 'ulverscroft';

insert into content_items (client_id, title, date, area, ch, state, platform, notes, theme, url, checklist, comments, history)
select id, $$Christie LP spotlight$$, '2026-08-07', 'ulverscroft', 'social', 'review', 'IG / X', $$Large print editions tie-in$$, 'christie', '',
  $$[{"id":"cl2","text":"Caption written","ownerType":"rate","ownerName":"Katie","done":true},{"id":"cl3","text":"Images designed","ownerType":"rate","ownerName":"Izzie","done":true}]$$::jsonb,
  '[]'::jsonb, '[]'::jsonb
from clients where slug = 'ulverscroft';

insert into content_items (client_id, title, date, area, ch, state, platform, notes, theme, url, checklist, comments, history)
select id, $$Christie — reading guide$$, '2026-08-07', 'ulverscroft', 'blog', 'wip', 'Website', $$Curated LP Christie titles$$, 'christie', '', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
from clients where slug = 'ulverscroft';

insert into content_items (client_id, title, date, area, ch, state, platform, notes, theme, url, checklist, comments, history)
select id, $$Book Lovers Day — staff picks reel$$, '2026-08-09', 'readinghouse', 'social', 'review', 'IG / TikTok', $$Team picks filmed in-store$$, 'booklovers', '', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
from clients where slug = 'ulverscroft';

insert into content_items (client_id, title, date, area, ch, state, platform, notes, theme, url, checklist, comments, history)
select id, $$Book Lovers Day — reader email$$, '2026-08-09', 'ulverscroft', 'email', 'wip', 'Kit', $$Curated list + offer code$$, 'booklovers', '', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
from clients where slug = 'ulverscroft';

insert into content_items (client_id, title, date, area, ch, state, platform, notes, theme, url, checklist, comments, history)
select id, $$uLibrary Monthly Update$$, '2026-08-11', 'ulibrary', 'email', 'wip', 'Kit', $$Usage stats, retention$$, '', '', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
from clients where slug = 'ulverscroft';

insert into content_items (client_id, title, date, area, ch, state, platform, notes, theme, url, checklist, comments, history)
select id, $$Trade catalogue — Autumn titles$$, '2026-08-13', 'trade', 'email', 'approved', 'Email', $$Sent to Audible, Bolinda$$, '', '', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
from clients where slug = 'ulverscroft';

insert into content_items (client_id, title, date, area, ch, state, platform, notes, theme, url, checklist, comments, history)
select id, $$Land by Maggie O'Farrell$$, '2026-08-18', 'ulverscroft', 'social', 'wip', 'IG / FB', $$Review quote post$$, 'newrelease', '', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
from clients where slug = 'ulverscroft';

insert into content_items (client_id, title, date, area, ch, state, platform, notes, theme, url, checklist, comments, history)
select id, $$Back to School — outreach$$, '2026-08-25', 'ulibrary', 'campaign', 'review', 'Email + LP', $$School librarians, free trial$$, 'b2s', '', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
from clients where slug = 'ulverscroft';

insert into content_items (client_id, title, date, area, ch, state, platform, notes, theme, url, checklist, comments, history)
select id, $$Book of the Week — Honesty$$, '2026-08-28', 'ulverscroft', 'email', 'review', 'Kit', $$Carried from July series$$, '', '', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
from clients where slug = 'ulverscroft';

-- ══════════════════════════════════════════════
-- STRATEGIES
-- ══════════════════════════════════════════════
insert into strategies (client_id, name, brands, start_date, end_date, b2b, product_focus, purpose, goal, kpis, audience, tone, message, channels, frequency, cta, budget, hashtags)
select id, $$Ulverscroft Content Strategy$$, ARRAY['ulverscroft'], '2026-08-01', '2026-08-31', 'B2C',
  $$Large print & audio backlist, new releases$$,
  $$Leverage the Agatha Christie exhibition as a tentpole moment to reach library authorities and general readers.$$,
  $$Grow engaged readership and strengthen library authority relationships ahead of Q4 renewals.$$,
  ARRAY['Social engagement +15% vs July','Email open rate >30%','Blog traffic +20%'],
  $$Library authorities, general readers (50+), visually impaired readers$$,
  $$Warm, accessible, trusted.$$,
  $$The world's best stories, made accessible to everyone.$$,
  $$Instagram, Facebook, X, Kit, Website blog$$, '3–4 posts per week', $$Browse the catalogue$$, '', '#Ulverscroft #LargePrint'
from clients where slug = 'ulverscroft';

insert into strategies (client_id, name, brands, start_date, end_date, b2b, product_focus, purpose, goal, kpis, audience, tone, message, channels, frequency, cta, budget, hashtags)
select id, $$uLibrary Growth Strategy$$, ARRAY['ulibrary'], '2026-08-01', '2026-08-31', 'Both',
  $$Digital library subscriptions, Book Club$$,
  $$Drive retention through Book Club engagement while opening a new education-sector channel.$$,
  $$Grow school/library sign-ups and lift subscriber retention above 85%.$$,
  ARRAY['Newsletter opens >35%','Back to School: 50 trial sign-ups','Retention >85%'],
  $$School librarians, education buyers, digital subscribers$$,
  $$Modern, digital-first, practical.$$,
  $$The digital library that readers actually use.$$,
  $$LinkedIn, Instagram, Kit, Landing pages$$, '2 posts per week + monthly newsletter', $$Start a free trial$$, '£350', '#uLibrary #BackToSchool'
from clients where slug = 'ulverscroft';

insert into strategies (client_id, name, brands, start_date, end_date, b2b, product_focus, purpose, goal, kpis, audience, tone, message, channels, frequency, cta, budget, hashtags)
select id, $$The Reading House — Community Strategy$$, ARRAY['readinghouse'], '2026-08-01', '2026-08-31', 'B2C',
  $$In-store experience, local events$$,
  $$Build consistent social presence with behind-the-scenes content to drive footfall.$$,
  $$Increase local awareness and repeat footfall through community-first content.$$,
  ARRAY['Social following +200','Email list +50','Reel views avg >1k'],
  $$Local readers, gift buyers, community book lovers$$,
  $$Friendly, personal, cosy.$$,
  $$Your local bookshop, with something for everyone.$$,
  $$Instagram, TikTok, Facebook, Kit$$, '4–5 posts per week', $$Visit us in store$$, '', '#ReadingHouse #ShopLocal'
from clients where slug = 'ulverscroft';

insert into strategies (client_id, name, brands, start_date, end_date, b2b, product_focus, purpose, goal, kpis, audience, tone, message, channels, frequency, cta, budget, hashtags)
select id, $$Trade — Autumn Catalogue Push$$, ARRAY['trade'], '2026-08-01', '2026-09-30', 'B2B',
  $$Autumn catalogue, Christie large-print range$$,
  $$Distribute the autumn catalogue and pitch the Christie exhibition angle to trade press.$$,
  $$Land trade press coverage and generate new partner enquiries.$$,
  ARRAY['1 feature in The Bookseller','Catalogue to all partners','2 new enquiries'],
  $$Audible, Bolinda, W.F. Howes, trade press$$,
  $$Professional, concise, industry-fluent.$$,
  $$The partner publishers choose for accessible formats.$$,
  $$Email (direct), Trade press$$, 'Monthly', $$Request the catalogue$$, '', ''
from clients where slug = 'ulverscroft';

-- ══════════════════════════════════════════════
-- KEY EVENTS
-- ══════════════════════════════════════════════
insert into key_events (client_id, title, start_date, end_date, areas, notes, theme, venue, links)
select id, $$Agatha Christie — London Museum$$, '2026-08-01', '2026-10-31', ARRAY['ulverscroft','trade'], $$Major tentpole. Social series, blog, trade press.$$, 'christie', $$London Museum$$,
  $$[{"label":"Exhibition site","url":"https://example.com/christie-exhibition"}]$$::jsonb
from clients where slug = 'ulverscroft';

insert into key_events (client_id, title, start_date, end_date, areas, notes, theme, venue, links)
select id, $$National Book Lovers Day$$, '2026-08-09', '2026-08-09', ARRAY['ulverscroft','readinghouse','ulibrary'], $$Cross-brand. Pre-schedule by 7th.$$, 'booklovers', '', '[]'::jsonb
from clients where slug = 'ulverscroft';

insert into key_events (client_id, title, start_date, end_date, areas, notes, theme, venue, links)
select id, $$Spark Expo Australia$$, '2026-08-04', '2026-08-06', ARRAY['ulibrary','trade'], $$Trade event. uLibrary demo.$$, '', $$Sydney Exhibition Centre$$,
  $$[{"label":"Event website","url":"https://example.com/spark-expo"}]$$::jsonb
from clients where slug = 'ulverscroft';

insert into key_events (client_id, title, start_date, end_date, areas, notes, theme, venue, links)
select id, $$Back to School window$$, '2026-08-17', '2026-08-31', ARRAY['ulibrary','readinghouse'], $$Target schools and libraries.$$, 'b2s', '', '[]'::jsonb
from clients where slug = 'ulverscroft';

-- ══════════════════════════════════════════════
-- DELIVERABLES (ongoing projects)
-- ══════════════════════════════════════════════
insert into deliverables (client_id, title, description, status, status_note, area)
select id, $$CRM Data Investigation$$, $$Auditing existing customer data before committing to a CRM platform. Checking into available data and segmentation requirements.$$, 'on_hold', $$Waiting for Lisa to return from annual leave$$, ''
from clients where slug = 'ulverscroft';

insert into deliverables (client_id, title, description, status, status_note, area)
select id, $$Sector Landing Pages$$, $$New dedicated pages for care homes, prisons and hospitals to support new business development. Research and brief completed; copy pending with Katie.$$, 'in_planning', $$Brief complete, awaiting build$$, ''
from clients where slug = 'ulverscroft';

insert into deliverables (client_id, title, description, status, status_note, area)
select id, $$Accessible Publishing Conference$$, $$CPI Conference planning underway. Sponsorship includes exhibition table, branding, and a speaking slot.$$, 'in_progress', $$Planning and prep$$, ''
from clients where slug = 'ulverscroft';

insert into deliverables (client_id, title, description, status, status_note, area)
select id, $$Other Team Activity$$, $$Jenny: Amazon implementation. Daniel: Trade relations, general sales promotions and strategy including Spotify partnership calls.$$, 'in_progress', $$In progress across the team$$, ''
from clients where slug = 'ulverscroft';

-- ══════════════════════════════════════════════
-- MONTHLY REPORT — July 2026 (published, transcribed from the real client report)
-- ══════════════════════════════════════════════
insert into monthly_reports (client_id, year, month, status, summary, social_groups, social_analysis, website, content, projects_snapshot)
select
  id, 2026, 6, 'published',
  $$
{"narrative":"July saw consistent output across social content, partner graphics packages, and book highlights. A new social video format was trialled and partner campaign activity included the Boldwood Disability Pride Giveaway.\n\nLinkedIn was the strongest social channel, with +8 followers and 789 impressions building on May/June's growth. The Reading House Facebook outperformed Ulverscroft's page on impressions, showing an appetite for a B2C audience. Website traffic dipped slightly (3.9% in active users), consistent with summer seasonality.\n\nThe strategy has been more reactive as the business navigates internal changes, we are working towards some key announcements. It's important to also consider longer term brand strategy which may need groundwork to implement.","stats":[{"label":"Active Users","value":"21K","change":"3.9%","dir":"down"},{"label":"Best Growth Channel","value":"+8","change":"Best growth channel","dir":"up"},{"label":"Reading House Impressions","value":"1,116","change":"11 posts published","dir":"up"},{"label":"Total Sessions","value":"22K","change":"3.1%","dir":"down"}]}
  $$::jsonb,
  $$
[{"id":"sg1","brand":"ulverscroft","platform":"Facebook","metrics":[{"label":"Page Fans","value":"882 (+4)"},{"label":"Page Impressions","value":"983"},{"label":"Post Engagements","value":"26"},{"label":"Posts Published","value":"4"},{"label":"Page Views","value":"167"},{"label":"New Fans","value":"5 (1 unlike)"}]},{"id":"sg2","brand":"readinghouse","platform":"Facebook","metrics":[{"label":"Page Fans","value":"490 (+2)"},{"label":"Page Impressions","value":"1,116"},{"label":"Post Engagements","value":"24"},{"label":"Posts Published","value":"11"},{"label":"Page Views","value":"51"},{"label":"New Fans","value":"3 (0 unlikes)"}]},{"id":"sg3","brand":"ulibrary","platform":"Instagram","metrics":[{"label":"Followers","value":"742"},{"label":"Reach","value":"695"},{"label":"New Followers","value":"+7 (1,785 total)"}]},{"id":"sg4","brand":"ulverscroft","platform":"LinkedIn","metrics":[{"label":"Followers","value":"575"},{"label":"Impressions","value":"789 (21 clicks, 36 likes)"}]}]
  $$::jsonb,
  $$LinkedIn was the strongest channel this month with +8 followers and 789 impressions, continuing the upward trajectory from the May-June period (+3 followers, 565 impressions).
The Reading House Facebook outperformed Ulverscroft's page on impressions (1,116 vs 983) despite a smaller audience.
uLibrary Instagram remains relatively flat (+1 follower). Content is being produced consistently (7 new posts) but follower growth is a continued challenge. This could be due to fairly generic content which is focused on two different markets.$$,
  $$
{"stats":[{"label":"Active Users","value":"21K","change":"3.9%","dir":"down"},{"label":"Sessions","value":"100K","change":"4.6%","dir":"down"},{"label":"Page Views","value":"22K","change":"3.1%","dir":"down"}],"acquisition":[{"channel":"Direct","totalUsers":"20,224","newUsers":"21,605","returning":"631","avgEngagement":"19s","pctTotal":"96.14%"},{"channel":"Organic Search","totalUsers":"665","newUsers":"699","returning":"45","avgEngagement":"23s","pctTotal":"3.16%"},{"channel":"Referral","totalUsers":"85","newUsers":"84","returning":"8","avgEngagement":"12s","pctTotal":"0.40%"},{"channel":"Organic Social","totalUsers":"41","newUsers":"41","returning":"1","avgEngagement":"3s","pctTotal":"0.19%"},{"channel":"AI Assistant","totalUsers":"6","newUsers":"6","returning":"0","avgEngagement":"6s","pctTotal":"0.03%"}],"topPages":[{"page":"Login","views":"9,745","pctTotal":"28.94%","users":"9,040","avgEngagement":"1s"},{"page":"Search","views":"4,668","pctTotal":"13.86%","users":"2,091","avgEngagement":"38s"},{"page":"Large Print / Audiobooks / eBooks","views":"3,572","pctTotal":"10.61%","users":"1,908","avgEngagement":"17s"},{"page":"Browse","views":"3,291","pctTotal":"9.77%","users":"1,686","avgEngagement":"56s"},{"page":"Creating a Literary Lifeline","views":"1,944","pctTotal":"5.77%","users":"1,652","avgEngagement":"8s"}],"notes":"Read Your Way page: 148 views (98 users, 39s avg engagement) + Introducing Read Your Way: 47 views\nCheckout flow: 177 (Your Details) > 175 (Pay) > 170 (Delivery) > 119 (Order Complete)\nPublishing page: 229 views (213 users) / Our History: 103 views (90 users)"}
  $$::jsonb,
  $$
{"campaignsContent":"Ulverscroft Audio Now Available on Overdrive email announcement\nNew social video format trialled\nBoldwood Disability Pride Giveaway: Partner campaign\nMonthly newsletters: uLibrary + The Reading House\nSocial media graphics packages distributed to partners\nuLibrary book club content\nLP + Audio highlights: Ironwood, Land","assetsCreated":"BatchLine blog post and press release\nJamacia Inn PR\nSolus - once the Australian library to test then we can push."}
  $$::jsonb,
  $$
[{"id":"dlv1","title":"CRM Data Investigation","description":"Auditing existing customer data before committing to a CRM platform. Checking into available data and segmentation requirements.","status":"on_hold","statusNote":"Waiting for Lisa to return from annual leave","area":""},{"id":"dlv2","title":"Sector Landing Pages","description":"New dedicated pages for care homes, prisons and hospitals to support new business development. Research and brief completed; copy pending with Katie.","status":"in_planning","statusNote":"Brief complete, awaiting build","area":""},{"id":"dlv3","title":"Accessible Publishing Conference","description":"CPI Conference planning underway. Sponsorship includes exhibition table, branding, and a speaking slot.","status":"in_progress","statusNote":"Planning and prep","area":""},{"id":"dlv4","title":"Other Team Activity","description":"Jenny: Amazon implementation. Daniel: Trade relations, general sales promotions and strategy including Spotify partnership calls.","status":"in_progress","statusNote":"In progress across the team","area":""}]
  $$::jsonb
from clients where slug = 'ulverscroft';
