import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseServer";
import { isAdminRequest } from "../../../lib/adminSession";
import {
  getClientOrThrow,
  rowToItem,
  rowToStrategy,
  rowToEvent,
  rowToReport,
  rowToDeliverable,
  rowToPlanningDate,
  rowToContact,
  rowToRequest,
} from "../../../lib/portalData";

export async function GET(request) {
  const admin = isAdminRequest(request);
  const sb = supabaseAdmin();

  let client;
  try {
    client = await getClientOrThrow(sb);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }

  const [brandsRes, themesRes, itemsRes, strategiesRes, monthSummaryRes, eventsRes, reportsRes, deliverablesRes] =
    await Promise.all([
      sb.from("brands").select("*").eq("client_id", client.id).order("sort_order"),
      sb.from("themes").select("*").eq("client_id", client.id),
      sb.from("content_items").select("*").eq("client_id", client.id).order("date"),
      sb.from("strategies").select("*").eq("client_id", client.id).order("created_at"),
      sb.from("month_summaries").select("*").eq("client_id", client.id).maybeSingle(),
      sb.from("key_events").select("*").eq("client_id", client.id).order("start_date"),
      sb.from("monthly_reports").select("*").eq("client_id", client.id).order("year", { ascending: false }).order("month", { ascending: false }),
      sb.from("deliverables").select("*").eq("client_id", client.id).order("created_at"),
    ]);

  for (const r of [brandsRes, themesRes, itemsRes, strategiesRes, monthSummaryRes, eventsRes, reportsRes, deliverablesRes]) {
    if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 });
  }

  const areas = {};
  for (const b of brandsRes.data) areas[b.key] = { label: b.label, color: b.color, short: b.short };

  const themes = {};
  for (const t of themesRes.data) themes[t.key] = { l: t.label, c: t.color, brief: t.brief };

  const monthSummary = monthSummaryRes.data
    ? { enabled: monthSummaryRes.data.enabled, text: monthSummaryRes.data.text || "" }
    : { enabled: false, text: "" };

  const showPlanningReference = client.show_planning_reference;
  let planningDates = [];
  if (admin || showPlanningReference) {
    const { data, error } = await sb.from("planning_reference_dates").select("*").order("year").order("month").order("sort_order");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    planningDates = data.map(rowToPlanningDate);
  }

  // Request Inbox is admin-only, full stop — never sent to a non-admin request,
  // not just hidden in the UI (see spec: "Clients do NOT see the request inbox").
  let contacts = [];
  let requests = [];
  let sowSummary = "";
  if (admin) {
    const [contactsRes, requestsRes] = await Promise.all([
      sb.from("contacts").select("*").eq("client_id", client.id).order("name"),
      sb.from("requests").select("*").eq("client_id", client.id).order("date_received", { ascending: false }),
    ]);
    if (contactsRes.error) return NextResponse.json({ error: contactsRes.error.message }, { status: 500 });
    if (requestsRes.error) return NextResponse.json({ error: requestsRes.error.message }, { status: 500 });
    contacts = contactsRes.data.map(rowToContact);
    requests = requestsRes.data.map(rowToRequest);
    sowSummary = client.sow_summary || "";
  }

  return NextResponse.json({
    admin,
    areas,
    themes,
    items: itemsRes.data.map(rowToItem),
    strategies: strategiesRes.data.map(rowToStrategy),
    monthSummary,
    events: eventsRes.data.map(rowToEvent),
    reports: reportsRes.data.filter((r) => admin || r.status === "published").map(rowToReport),
    deliverables: deliverablesRes.data.map(rowToDeliverable),
    showPlanningReference,
    planningDates,
    contacts,
    requests,
    sowSummary,
  });
}
