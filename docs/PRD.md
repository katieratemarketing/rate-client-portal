# Rate Portal — Product Requirements

## 1. Calendar UX

### Problem
Current calendar view doesn't clearly show which brand or activity type each item is. Review status is too dominant — drowns out other information.

### Solution

**Brand identification**

Each calendar item shows a coloured left border (brand colour) AND a small brand badge (ULV / uLIB / TRH / TRD). When "All brands" is selected, the colour coding does the heavy lifting. When filtered to one brand, the badge can be hidden.

**Activity type identification**

Each item shows a small icon or label for its activity type. Not emoji — a consistent icon set or short text labels:

| Type | Label | Visual |
|---|---|---|
| Social | SOC | Coloured dot or small icon |
| Email | EML | |
| Blog | BLG | |
| Campaign | CMP | |
| PR | PR | |
| Web | WEB | |
| Paid | ADS | |
| Shoot | 🎬 (one emoji exception — it's distinctive) | |
| Event | EVT | |
| Strategy | STR | |
| Report | RPT | |
| Design | DSN | |

**Item display format in calendar cell:**

```
[brand colour bar] [type label] Title text
```

Example:

```
[blue bar] SOC Christie LP spotlight
[blue bar] EML Book of the Week
[pink bar] CMP Back to School outreach
```

**Review/action status — less dominant**

Instead of the current amber/red background fill + pill, use:
- A small coloured dot (amber/red) in the top-right corner of the item
- OR a subtle right-side border instead of filling the whole item
- Items needing attention still stand out, but the brand colour and activity type are the primary visual information
- The REVIEW/ACTION pill only appears on hover, or in the side panel

**WIP items**

Stay greyed out / faded — no change needed.

---

## 2. Strategy Section — Full Campaign Plan Fields

### Client-facing view
Read-only view of the current strategy per brand. Clean table layout.

### Admin editing
Each strategy entry is a full campaign plan with these fields:

**Core fields:**

| Field | Type | Notes |
|---|---|---|
| Client name | Auto | Inherited from client |
| Campaign / strategy name | Text | e.g. "Q3 Content Strategy" or "Agatha Christie Campaign" |
| Brand(s) | Multi-select | Which brands this covers |
| Start date | Date | |
| End date | Date | |
| B2B or B2C | Select | B2B / B2C / Both |
| Product / service focus | Text | What's being promoted |

**Strategic fields:**

| Field | Type | Notes |
|---|---|---|
| Purpose | Long text | Why this campaign/strategy exists |
| Ultimate goal | Long text | The business outcome we're driving |
| KPIs | List (multi-line) | Measurable targets |
| Target audience | Long text | Who we're reaching |
| Campaign tone | Text | How it should feel |
| Key message | Long text | The core message |
| Channels | Multi-select | Which channels are active |
| Frequency | Text | e.g. "2 posts per week", "monthly newsletter" |
| CTA | Text | What we're asking the audience to do |
| Budget (ad spend) | Currency | If there's a paid element |
| Hashtags | Text | Campaign-specific hashtags |

**Admin controls:**
- "This month" summary — toggleable on/off per client. When on, shows a black card at the top of the strategy section with the current month's focus. When off, hidden.
- Multiple strategies per brand (e.g. an ongoing content strategy AND a specific campaign strategy running concurrently)

---

## 3. Linked Content

### How it works
Any content item can be linked to other items via a theme/campaign tag. When viewing an item (in side panel or full detail view), a "Linked Content" section shows all related items.

### Requirements
- Each linked item is clickable — clicking navigates to that item's detail view
- Linked items show: type label, title, brand badge, status dot
- Items can be linked by theme (e.g. "Agatha Christie"), by campaign (e.g. "Back to School"), or manually
- Admin can create new themes/campaigns and assign items to them
- A campaign container can also have its own brief/objective — it's not just a tag, it's a parent object

### Key dates → Linked content
Key dates/events should also show linked content. Clicking on "Agatha Christie — London Museum" should show all content items tagged with that theme. This also means key dates and themes can be the same object in some cases.

### Key date detail view
When clicking into a key date, show:
- Date range
- Description / notes
- Relevant brands
- Linked content items
- External links (event website, social channels, relevant parties)
- For events: venue, attendees, logistics

---

## 4. Approvals — Full Detail + Comments

### Current state
Approvals tab shows items with approve/request changes buttons.

### Required improvements

**Full detail view**

Clicking an item in approvals opens the same side panel / detail view as the calendar. All fields visible: title, date, brand, channel, platform, notes, creative assets, linked content.

**Comment thread**
- Below the item detail, a comment section where client and Rate team can go back and forth
- Each comment shows: author name, timestamp, message
- Comments persist — they're the approval conversation
- When "Request Changes" is clicked, the comment field is required (must explain what needs changing)
- When approved, an optional comment can be added ("Looks great" etc.)

**Approval audit trail**
- Every status change logged: who changed it, when, from what to what
- Visible in the item detail view under "Activity" or "History"

**Email notifications**

| Trigger | Who receives | Can be toggled |
|---|---|---|
| Item moved to "Ready for review" | Client approver(s) | Yes |
| Comment added by Rate | Client approver(s) | Yes |
| Comment added by client | Assigned Rate team member | Yes |
| Item approved | Assigned Rate team member | Yes |
| Changes requested | Assigned Rate team member | Yes |

---

## 5. Automatic Deadline Notifications

### Rule
If a content item has a publish date within the next 2–3 days AND its status is NOT "approved" or "live", send an email notification.

### Recipients
- Client approver(s) for the relevant brand
- Assigned Rate team member

### Email content
Subject: "[Client] — [Item title] goes live in [X] days and hasn't been signed off"
Body: Item summary, link to approve in portal, current status.

### Frequency
- First reminder at 3 days before
- Second reminder at 1 day before (if still not approved)
- Configurable per client from admin

---

## 6. Admin — Multi-Client Management

### Client switcher
Admin header shows current client. Dropdown to switch between all active clients. Each client has its own portal view, data, and settings.

### Per-client settings

| Setting | Description |
|---|---|
| Client name + logo | Displayed in portal header |
| Brand areas | Add/remove/edit brands with colours |
| Active services | Which Rate services this client pays for (determines available activity types) |
| Approver contacts | Who can approve + receive notifications |
| Production calendar | On/off — whether client sees production timeline |
| "This month" summary | On/off — whether the strategy overview shows |
| Notification preferences | Which auto-emails are active |

### Statement of Work / agreement reference
Each client has a reference section in admin showing:
- Monthly retainer value
- Agreed deliverables (what's included in the retainer)
- Additional project agreements (one-off or time-limited scopes)
- Contract start/end dates
- Link to the actual SOW document (Google Drive, Canva, etc.)

### Time budget tracking
Each client has a monthly time budget based on the retainer value and Rate's internal billing rate.

| Field | Description |
|---|---|
| Monthly hours budget | Calculated from retainer ÷ billing rate, or manually set |
| Hours used this month | Sum of time logged against this client's items |
| Hours remaining | Budget minus used |
| Visual indicator | Progress bar or simple fraction |

Each content item / task can optionally have an **estimated time** field:
- Set by admin when creating the item
- Actual time can be logged against it (manual entry or timer)
- Totals feed the monthly budget tracker

**Integration option:** If a time tracking tool is already in use (Toggl, Harvest, Clockify), explore API integration rather than building native time tracking. Check MCP connectors.

---

## 7. Internal Tasks & Small Requests

### The problem
Tasks like "chase login details from Daniel" or "send new assets to Katie" are internal Rate admin. They shouldn't clutter the client's calendar but Rate needs to track them.

### Solution: Internal task list (admin only)

**Task fields:**

| Field | Type |
|---|---|
| Title | Text |
| Client | Select (optional — some tasks are Rate-internal) |
| Assigned to | Select |
| Due date | Date |
| Priority | Low / Normal / High / Urgent |
| Status | To do / In progress / Done / Blocked |
| Notes | Text |
| Linked item | Optional — connect to a content item if relevant |

**Views:**
- By person (what's on my plate)
- By client (what's outstanding for Ulverscroft)
- By due date (what's overdue, due today, due this week)
- Quick capture (add a task from anywhere in admin without navigating away)

**Client check-ins and calls:**
- These are tasks with a type of "meeting/call"
- Can have a calendar integration (see below)
- Show on the admin calendar but not the client marketing calendar
- **Calendar integration:** Explore Google Calendar MCP connector — if connected, Rate team could see upcoming client calls alongside marketing calendar items. Not essential for MVP.

---

## 8. Design as a Service + Stage

### Design as a service type

Add to activity types:

| Type | What it is | Output |
|---|---|---|
| Graphic design | Social graphics, email headers, ad creative | Design file(s) |
| Brand identity | Logo, colour palette, typography | Brand guidelines |
| Print design | Brochures, flyers, banners, catalogues | Print-ready files |
| Presentation design | Pitch decks, sales decks | Deck file |
| Packaging design | Product packaging | Design file(s) |

### Design as a production stage

Many content items go through a design stage before they're ready for review. In the production calendar (internal), design sits as a phase:

```
Brief → Design → Copy → Review (internal) → Ready for client review → Approved → Scheduled → Live
```

**Design fields on any content item (internal):**

| Field | Description |
|---|---|
| Design status | Not started / In progress / Review / Done |
| Designer | Assigned to (Si at Ulverscroft, or Rate team) |
| Design brief | Text or attachment |
| Design files | Upload — drafts, iterations |
| Design feedback | Internal comment thread |

---

## 9. Task Assignment

### Requirements
- Every content item, production task, and internal task can be assigned to a team member
- Team members are managed in admin: name, role, email, type (core / collective / external)
- Core: Katie, Paul (co-founder)
- Collective: Izzie, future specialists brought in per project
- External: client contacts (assigned to approval tasks only, not production)
- Filter any view by assignee ("Show me everything assigned to Izzie")
- Workload view: per person, how many items are assigned to them this month

---

## 10. CRM — Pipeline

### Pipeline stages

| Stage | Description |
|---|---|
| Lead | Aware of them, not yet contacted |
| Networking | In conversation, no specific opportunity |
| Proposal | Active opportunity, proposal sent or being prepared |
| Active | Signed client, work in progress |
| Retained | Ongoing retainer |
| Closed — Lost | Didn't convert |
| Closed — Ended | Was a client, engagement finished |

### Opportunity fields

| Field | Type |
|---|---|
| Company name | Text |
| Contact name | Text |
| Contact email | Email |
| Phone | Text |
| Service interest | Multi-select (Strategy, Content, Social, Campaigns, Web, Paid, PR) |
| Opportunity value | Currency (£) |
| Stage | Select |
| Next step date | Date |
| Next step description | Text |
| Notes | Long text |
| Source | Select (Referral, Website, Networking, LinkedIn, Event, Other) |
| Last contacted | Date |

### CRM views
- **Pipeline board** — Kanban columns by stage, cards showing company + value + next step
- **List view** — sortable by stage, value, next step date
- **Won this month / quarter** — simple revenue tracking

### CRM → Client conversion
When a pipeline opportunity moves to "Active", prompt to create a new client in the portal with:
- Company name pre-filled
- Contact details pre-filled
- Redirect to client setup (brands, services, SOW)

---

## 11. Feature Flags / Toggles (Per Client)

Not every client gets every feature. Admin can toggle:

| Feature | Default | Notes |
|---|---|---|
| Production calendar | Off | Turn on for clients with shoots/events |
| "This month" strategy summary | On | |
| Key dates | On | |
| Reporting tab | On | |
| Documents tab | On | |
| Approval notifications | On | |
| Deadline reminders | On | |
| Comment threads | On | |
| Paid ads reporting | Off | Only for clients with paid |
| Time tracking (admin) | On | Internal only |

---

## 12. Future / Explore

| Feature | Notes | Priority |
|---|---|---|
| AI-suggested key dates | Based on client industry, suggest relevant awareness days, events, seasonal hooks | Medium — nice to have |
| Calendar integration | Google Calendar sync for client calls, meetings | Low — explore MCP connector |
| Time tracking integration | Toggl/Harvest/Clockify API vs native | Medium — depends on team preference |
| Reporting integrations | Meta API, Kit API, GA4 for automated data pull | Medium — phase 3 |
| Client mobile view | Responsive portal for phone access | Medium — should be designed mobile-first |
| Slack/email integration | Post approval notifications to Slack | Low |
| Template library | Save content item templates for recurring work | Medium |
| Recurring items | Auto-create monthly newsletter, weekly social slots | Medium |
| File storage | Supabase Storage for creative uploads vs Google Drive links | Production decision |
| White-label option | Remove Rate branding for specific clients (if needed) | Low |
| Print production fields | Printer, proof dates, quantity, paper stock, trim size | Add when needed |
| Podcast / audio type | If a client starts a podcast | Add when needed |

---

## Build Priority

### Phase 1 — MVP (prototype → production)
- Client portal: calendar, strategy, key dates, approvals, reporting
- Admin: multi-client, content CRUD, strategy editing
- Calendar UX: brand + type identification, improved review indicators
- Linked content (theme/campaign grouping)
- Basic approvals with comments
- Supabase auth (client logins)

### Phase 2 — Operational
- Internal task management
- Time budget tracking
- Production calendar (toggleable)
- Design as a stage
- Task assignment + workload view
- Email notifications (approvals + deadline reminders)
- CRM pipeline

### Phase 3 — Integrations
- Reporting data (Meta, Kit, GA4)
- Calendar integration
- Time tracking integration
- AI key date suggestions
- Creative file uploads (Supabase Storage)

### Phase 4 — Scale
- Recurring items / templates
- Client onboarding automation
- White-label option
- Advanced reporting dashboards
