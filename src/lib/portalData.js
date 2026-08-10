// Single-client prototype — becomes dynamic (per-request client resolution)
// when the multi-client admin switcher from the PRD gets built.
export const CLIENT_SLUG = "ulverscroft";

export async function getClientOrThrow(sb) {
  const { data, error } = await sb.from("clients").select("id, name, slug").eq("slug", CLIENT_SLUG).single();
  if (error || !data) throw new Error(error?.message || "Client not found");
  return data;
}

const orEmpty = (v) => v ?? "";
const orNull = (v) => (v === "" || v === undefined ? null : v);

export function rowToItem(row) {
  return {
    id: row.id,
    date: row.date,
    endDate: orEmpty(row.end_date),
    area: row.area,
    ch: row.ch,
    title: row.title,
    state: row.state,
    platform: orEmpty(row.platform),
    notes: orEmpty(row.notes),
    theme: orEmpty(row.theme),
    url: orEmpty(row.url),
    fields: row.fields || {},
    checklist: row.checklist || [],
    comments: row.comments || [],
    history: row.history || [],
    attachments: row.attachments || [],
    linkedItemIds: row.linked_item_ids || [],
  };
}

export function itemToRow(item) {
  const row = {};
  if ("title" in item) row.title = item.title;
  if ("date" in item) row.date = item.date;
  if ("endDate" in item) row.end_date = orNull(item.endDate);
  if ("area" in item) row.area = item.area;
  if ("ch" in item) row.ch = item.ch;
  if ("state" in item) row.state = item.state;
  if ("platform" in item) row.platform = item.platform;
  if ("notes" in item) row.notes = item.notes;
  if ("theme" in item) row.theme = item.theme;
  if ("url" in item) row.url = item.url;
  if ("fields" in item) row.fields = item.fields || {};
  if ("checklist" in item) row.checklist = item.checklist || [];
  if ("comments" in item) row.comments = item.comments || [];
  if ("history" in item) row.history = item.history || [];
  if ("attachments" in item) row.attachments = item.attachments || [];
  if ("linkedItemIds" in item) row.linked_item_ids = item.linkedItemIds || [];
  return row;
}

export function rowToStrategy(row) {
  return {
    id: row.id,
    name: row.name,
    brands: row.brands || [],
    startDate: orEmpty(row.start_date),
    endDate: orEmpty(row.end_date),
    b2b: orEmpty(row.b2b),
    productFocus: orEmpty(row.product_focus),
    purpose: orEmpty(row.purpose),
    goal: orEmpty(row.goal),
    kpis: row.kpis || [],
    audience: orEmpty(row.audience),
    tone: orEmpty(row.tone),
    message: orEmpty(row.message),
    channels: orEmpty(row.channels),
    frequency: orEmpty(row.frequency),
    cta: orEmpty(row.cta),
    budget: orEmpty(row.budget),
    hashtags: orEmpty(row.hashtags),
  };
}

export function strategyToRow(s) {
  const row = {};
  if ("name" in s) row.name = s.name;
  if ("brands" in s) row.brands = s.brands || [];
  if ("startDate" in s) row.start_date = orNull(s.startDate);
  if ("endDate" in s) row.end_date = orNull(s.endDate);
  if ("b2b" in s) row.b2b = s.b2b;
  if ("productFocus" in s) row.product_focus = s.productFocus;
  if ("purpose" in s) row.purpose = s.purpose;
  if ("goal" in s) row.goal = s.goal;
  if ("kpis" in s) row.kpis = s.kpis || [];
  if ("audience" in s) row.audience = s.audience;
  if ("tone" in s) row.tone = s.tone;
  if ("message" in s) row.message = s.message;
  if ("channels" in s) row.channels = s.channels;
  if ("frequency" in s) row.frequency = s.frequency;
  if ("cta" in s) row.cta = s.cta;
  if ("budget" in s) row.budget = s.budget;
  if ("hashtags" in s) row.hashtags = s.hashtags;
  return row;
}

export function rowToEvent(row) {
  return {
    id: row.id,
    title: row.title,
    start: row.start_date,
    end: row.end_date,
    areas: row.areas || [],
    notes: orEmpty(row.notes),
    theme: orEmpty(row.theme),
    venue: orEmpty(row.venue),
    links: row.links || [],
  };
}

export function rowToDeliverable(row) {
  return {
    id: row.id,
    title: row.title,
    description: orEmpty(row.description),
    status: row.status,
    statusNote: orEmpty(row.status_note),
    area: orEmpty(row.area),
  };
}

export function deliverableToRow(d) {
  const row = {};
  if ("title" in d) row.title = d.title;
  if ("description" in d) row.description = d.description;
  if ("status" in d) row.status = d.status;
  if ("statusNote" in d) row.status_note = d.statusNote;
  if ("area" in d) row.area = d.area;
  return row;
}

export function rowToReport(row) {
  return {
    id: row.id,
    year: row.year,
    month: row.month,
    status: row.status,
    summary: row.summary || { narrative: "", stats: [] },
    socialGroups: row.social_groups || [],
    socialAnalysis: orEmpty(row.social_analysis),
    website: row.website || { stats: [], acquisition: [], topPages: [], notes: "" },
    content: row.content || { campaignsContent: "", assetsCreated: "" },
    projectsSnapshot: row.projects_snapshot || [],
  };
}

export function reportToRow(r) {
  const row = {};
  if ("status" in r) row.status = r.status;
  if ("summary" in r) row.summary = r.summary;
  if ("socialGroups" in r) row.social_groups = r.socialGroups;
  if ("socialAnalysis" in r) row.social_analysis = r.socialAnalysis;
  if ("website" in r) row.website = r.website;
  if ("content" in r) row.content = r.content;
  if ("projectsSnapshot" in r) row.projects_snapshot = r.projectsSnapshot;
  return row;
}
