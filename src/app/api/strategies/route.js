import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseServer";
import { isAdminRequest } from "../../../lib/adminSession";
import { getClientOrThrow, clientSlugFromRequest, rowToStrategy, strategyToRow } from "../../../lib/portalData";

export async function POST(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const sb = supabaseAdmin();
  const client = await getClientOrThrow(sb, clientSlugFromRequest(request));
  const row = { ...strategyToRow(body), client_id: client.id };
  const { data, error } = await sb.from("strategies").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(rowToStrategy(data));
}
