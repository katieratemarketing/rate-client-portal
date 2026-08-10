import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseServer";
import { isAdminRequest } from "../../../lib/adminSession";
import { getClientOrThrow, rowToDeliverable, deliverableToRow } from "../../../lib/portalData";

export async function POST(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const sb = supabaseAdmin();
  const client = await getClientOrThrow(sb);
  const row = { ...deliverableToRow(body), client_id: client.id };
  const { data, error } = await sb.from("deliverables").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(rowToDeliverable(data));
}
