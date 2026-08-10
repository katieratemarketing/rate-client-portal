import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseServer";
import { isAdminRequest } from "../../../lib/adminSession";
import { getClientOrThrow, rowToItem, itemToRow } from "../../../lib/portalData";

// Creating calendar items is an admin-only action — the "+ Add item" UI
// only renders for admin, same boundary enforced here.
export async function POST(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const sb = supabaseAdmin();
  const client = await getClientOrThrow(sb);
  const row = { ...itemToRow(body), client_id: client.id };
  const { data, error } = await sb.from("content_items").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(rowToItem(data));
}
