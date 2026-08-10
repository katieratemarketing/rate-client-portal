import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseServer";
import { isAdminRequest } from "../../../lib/adminSession";
import { getClientOrThrow, rowToReport, rowToDeliverable } from "../../../lib/portalData";

// Creates a draft for the current month, snapshotting today's deliverables —
// mirrors the old createDraftReport() behaviour, just computed server-side.
export async function POST(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = supabaseAdmin();
  const client = await getClientOrThrow(sb);

  const now = new Date();
  const { year, month } = { year: now.getFullYear(), month: now.getMonth() };

  const { data: deliverableRows, error: deliverableErr } = await sb
    .from("deliverables")
    .select("*")
    .eq("client_id", client.id);
  if (deliverableErr) return NextResponse.json({ error: deliverableErr.message }, { status: 500 });

  const { data, error } = await sb
    .from("monthly_reports")
    .insert({
      client_id: client.id,
      year,
      month,
      status: "draft",
      projects_snapshot: deliverableRows.map(rowToDeliverable),
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "A report for this month already exists" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(rowToReport(data));
}
