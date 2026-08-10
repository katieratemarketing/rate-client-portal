import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseServer";
import { isAdminRequest } from "../../../lib/adminSession";
import { getClientOrThrow } from "../../../lib/portalData";

export async function PATCH(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const sb = supabaseAdmin();
  const client = await getClientOrThrow(sb);

  const row = {};
  if ("showPlanningReference" in body) row.show_planning_reference = body.showPlanningReference;
  if ("sowSummary" in body) row.sow_summary = body.sowSummary;

  const { data, error } = await sb.from("clients").update(row).eq("id", client.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ showPlanningReference: data.show_planning_reference, sowSummary: data.sow_summary || "" });
}
