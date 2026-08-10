import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseServer";
import { isAdminRequest } from "../../../../lib/adminSession";
import { getClientOrThrow, rowToReport, reportToRow, rowToDeliverable } from "../../../../lib/portalData";

// Handles both field edits and publish. On publish, re-snapshots the
// current deliverables (matches the old publishReport() behaviour) rather
// than trusting whatever projectsSnapshot the client sent.
export async function PATCH(request, { params }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const sb = supabaseAdmin();
  const row = { ...reportToRow(body), updated_at: new Date().toISOString() };

  if (body.status === "published") {
    const client = await getClientOrThrow(sb);
    const { data: deliverableRows, error: deliverableErr } = await sb
      .from("deliverables")
      .select("*")
      .eq("client_id", client.id);
    if (deliverableErr) return NextResponse.json({ error: deliverableErr.message }, { status: 500 });
    row.projects_snapshot = deliverableRows.map(rowToDeliverable);
  }

  const { data, error } = await sb.from("monthly_reports").update(row).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(rowToReport(data));
}
