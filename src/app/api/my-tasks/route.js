import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseServer";
import { isAdminRequest } from "../../../lib/adminSession";
import { selectedMemberId } from "../../../lib/memberSession";

// Deliberately separate from /api/portal: that endpoint always resolves to
// exactly one client and returns full row shapes. This is the one query in
// the app that crosses every client at once, so it returns a lightweight
// summary per row (not the full item/request shape) rather than forcing
// every /api/portal caller to reason about two response shapes.
export async function GET(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const memberId = selectedMemberId(request);
  if (!memberId) return NextResponse.json({ tasks: [] });

  const sb = supabaseAdmin();
  const [itemsRes, requestsRes] = await Promise.all([
    sb.from("content_items").select("id, title, date, state, ch, clients(slug, name)").eq("assignee_id", memberId).order("date"),
    sb.from("requests").select("id, title, deadline, status, request_type, clients(slug, name)").eq("assignee_id", memberId).order("deadline"),
  ]);
  if (itemsRes.error) return NextResponse.json({ error: itemsRes.error.message }, { status: 500 });
  if (requestsRes.error) return NextResponse.json({ error: requestsRes.error.message }, { status: 500 });

  const tasks = [
    ...itemsRes.data.map((row) => ({
      kind: "item",
      id: row.id,
      title: row.title,
      date: row.date,
      status: row.state,
      type: row.ch,
      clientSlug: row.clients?.slug,
      clientName: row.clients?.name,
    })),
    ...requestsRes.data.map((row) => ({
      kind: "request",
      id: row.id,
      title: row.title,
      date: row.deadline,
      status: row.status,
      type: row.request_type,
      clientSlug: row.clients?.slug,
      clientName: row.clients?.name,
    })),
  ];

  return NextResponse.json({ tasks });
}
