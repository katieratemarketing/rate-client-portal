import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseServer";
import { isAdminRequest } from "../../../lib/adminSession";
import { getClientOrThrow, clientSlugFromRequest, rowToBrand, brandToRow, slugify } from "../../../lib/portalData";

export async function POST(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const sb = supabaseAdmin();
  const client = await getClientOrThrow(sb, clientSlugFromRequest(request));
  const row = { ...brandToRow(body), client_id: client.id };
  if (!row.key) row.key = slugify(body.label || "brand");
  const { data, error } = await sb.from("brands").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(rowToBrand(data));
}
