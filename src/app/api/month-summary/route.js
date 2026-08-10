import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseServer";
import { isAdminRequest } from "../../../lib/adminSession";
import { getClientOrThrow } from "../../../lib/portalData";

export async function PATCH(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const sb = supabaseAdmin();
  const client = await getClientOrThrow(sb);
  const { data, error } = await sb
    .from("month_summaries")
    .upsert({ client_id: client.id, enabled: body.enabled, text: body.text })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ enabled: data.enabled, text: data.text || "" });
}
