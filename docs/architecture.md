# Rate Agency System — Architecture

## What this is

Two sides of one system.

**Client portal** — what each client gets access to while working with Rate. Their view into what's happening with their marketing. Access granted on engagement start, removed on engagement end. Not a product they keep.

**Rate internal** — how Rate runs. Task management, CRM, multi-client overview, team management. Only visible to Rate team (Katie, Paul, future hires).

---

## Client Portal

### What the client sees

Each client gets a branded portal URL. They log in, they see everything Rate is doing for them. Nothing more.

**Sections:**

| Section | What it shows | Who updates it |
|---|---|---|
| Strategy | Campaign plans per brand/service. Focus, audience, tone, KPIs, channels. Monthly summary. | Rate (admin) |
| Calendar | Content calendar — social, email, blog, campaigns, PR. Filterable by brand + channel. | Rate (admin), client approves |
| Deliverables | Non-calendar work — web builds, LinkedIn audits, bios, conference admin, brand strategy docs. Tracked as activities with status, due date, assigned to. | Rate (admin), client can see progress |
| Key Dates | Tentpole events, publication dates, industry dates. Planning anchors. | Rate (admin) |
| Approvals | Queue of items awaiting client sign-off. Per-item or batch approve. | Client acts, Rate sees result |
| Reporting | Monthly performance report. Output links collected through the month, metrics pulled at month end. Previous months accessible. | Rate (admin), auto where possible |
| Documents | Proposals, brand guidelines, assets, anything handed over. Simple file/link library. | Rate (admin) |

### Item states (client view)

| State | What client sees | Visual treatment |
|---|---|---|
| In progress | Visible but clearly "we're working on this" | Greyed out, muted |
| Ready for review | "This needs your eyes" | Amber highlight, REVIEW pill |
| Awaiting client input | "We need something from you" | Red highlight, ACTION pill |
| Approved | Signed off, scheduled or in production | Full colour, clean |
| Live | Published, output URL attached | Full colour + link |

### Approval flow

1. Rate sets item to "Ready for review"
2. Client sees it in Approvals tab + highlighted in calendar
3. Client clicks Approve or Request Changes
4. If Request Changes → item goes back to Rate with a note (becomes "In progress" again)
5. Audit trail: who approved, when, any notes
6. Sign-off can be per-item or batch

### Theme/campaign grouping

Items can be linked to a theme (e.g. "Agatha Christie Exhibition"). When viewing one item in the theme, all linked items are visible in the side panel. Helps the client see how individual posts connect to the bigger campaign.

### Output links + reporting

Each item has an optional Output URL field. When content goes live, Rate pastes the live link (IG post, Kit campaign, blog URL, LinkedIn post). At month end, these populate the reporting view.

**Reporting data sources (by integration complexity):**

| Source | What it gives | Complexity |
|---|---|---|
| Manual entry | Any metric, flexible | None — just a field |
| Kit API | Email opens, clicks, unsubs | Low — Kit has a simple API |
| Meta API (via Business Suite) | Reach, engagement, follows | Medium — needs app review |
| Google Analytics | Blog traffic, conversions | Medium — GA4 API |
| LinkedIn API | Post impressions, engagement | Medium-high — restrictive API |
| Embedded dashboard (Databox/Supermetrics) | Everything in one view | Low build, ongoing subscription |

**Recommendation:** Start with manual entry + embedded Databox/Supermetrics dashboard. Add native integrations later if justified by client volume.

---

## Rate Internal (Admin)

### Multi-client dashboard

When Rate team logs in, they see all clients at a glance.

- Client cards showing: name, retainer value, items needing attention, next key date
- Quick-switch between client portals (admin view)
- Traffic light status: green (on track), amber (items overdue), red (client waiting on us)

### Task management

Rate's own to-do list, separate from client deliverables.

- Simple task list with: title, due date, assigned to, priority, client (optional)
- Recurring tasks (e.g. "Monthly report — Ulverscroft" on the 28th)
- Quick capture (add a task without navigating away)
- Views: by person, by client, by due date

### CRM / Pipeline

Based on current ClickUp setup. Stages:

| Stage | Meaning |
|---|---|
| Lead | Someone Rate is aware of, not yet contacted |
| Networking | In conversation, no specific opportunity |
| Proposal | Active opportunity, proposal sent or being prepared |
| Active | Signed client, work in progress |
| Retained | Ongoing retainer client |
| Closed — Lost | Didn't convert (keep for reference) |
| Closed — Ended | Was a client, engagement finished |

**Fields per opportunity:**
- Company name
- Contact name + email
- Service interest (Strategy, Content, Social, Campaigns, Web)
- Opportunity value (£)
- Stage
- Next step date
- Notes
- Source (referral, website, networking, etc.)

### Team view

- Who's working on which clients
- Capacity indicator (simple: available / busy / at capacity)
- Assignment per deliverable/task

### Client onboarding

Template that fires when a new client moves to "Active":

1. Before kickoff — contracts signed, portal access created, intro call scheduled
2. Week 1 — discovery session, access to client systems, audit
3. Week 2 — first strategy/plan delivered
4. Week 4 — first report delivered
5. Recurring — monthly cycle begins (plan → deliver → report)

---

## Data model (simplified)

```
Client
├── name, logo, brand colours
├── retainer value, start date
├── contacts[] (name, role, email, is_approver)
├── brands[] (e.g. Ulverscroft, uLibrary, TRH, Trade)
├── services[] (which Rate services they buy)
│
├── Strategy
│   └── per brand: focus, audience, tone, message, channels, kpis[]
│
├── Content Items[]
│   ├── title, date, brand, channel, status
│   ├── platform, notes, theme
│   ├── output_url, assigned_to
│   └── approvals[] (approved_by, date, notes)
│
├── Deliverables[] (non-calendar work)
│   ├── title, type, status, due_date
│   ├── assigned_to, brand (optional)
│   └── notes, attachments
│
├── Key Events[]
│   ├── title, start, end, brands[], notes
│
├── Documents[]
│   └── title, type, url, uploaded_date
│
└── Reports[]
    └── month, metrics{}, status (draft/published)

Pipeline (CRM)
├── company, contact, service, value
├── stage, next_step_date, notes, source

Tasks (internal)
├── title, due_date, assigned_to
├── priority, client (optional), recurring
```

---

## Tech stack recommendation

### Prototype (now — Claude artifact)
- React artifact with persistent storage API
- Admin mode (password-protected toggle)
- Publishable link for client access
- Good enough to test with Ulverscroft

### Production build (Paul)
- **Frontend:** Next.js (React) — hosted on Vercel
- **Database:** Supabase (Postgres + auth + storage) — free tier covers early stage
- **Auth:** Supabase Auth (email/password, one login per client contact)
- **Hosting:** Vercel (free tier, custom domain)
- **Domain:** portal.ratemarketing.co.uk
- **Integrations:** Kit API, Meta API, GA4 (phase 2)
- **Reporting:** Embed Databox or build simple chart views

### Why this stack
- Paul knows web dev (Laravel, Shopify) — Next.js is a natural step
- Supabase is free to start, scales easily, handles auth
- Vercel deploys from GitHub with zero config
- Total running cost at launch: £0 (free tiers)
- Scales to 10+ clients before hitting paid tiers

---

## Build phases

### Phase 1 — Prototype (now)
- Client portal with persistent storage in Claude
- Admin mode for Katie to manage content
- Test with Ulverscroft
- Validate the concept before investing dev time

### Phase 2 — MVP (when Paul is available)
- Next.js + Supabase build
- Client portal (strategy, calendar, deliverables, approvals, docs)
- Admin dashboard (multi-client, task list)
- Basic CRM
- Auth (client logins)
- Hosted at portal.ratemarketing.co.uk

### Phase 3 — Integrations
- Kit API for email reporting
- Meta API for social reporting  
- GA4 for web reporting
- Automated monthly report generation

### Phase 4 — Scale
- Client onboarding automation
- Team capacity management
- Proposal generation from CRM
- Client-facing mobile view
```
