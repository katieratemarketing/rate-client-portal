import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseServer";
import { isAdminRequest } from "../../../../lib/adminSession";
import { rowToItem, itemToRow } from "../../../../lib/portalData";

// PATCH is intentionally open (no admin gate): approving content, adding
// comments, and ticking checklist items are client actions, and there is no
// real per-client login yet to check an identity against (see PRD — "Supabase
// auth (client logins)" is future work). Full-field edits are still only
// reachable from the admin-only Edit form in the UI, same boundary as before.
export async function PATCH(request, { params }) {
  const body = await request.json();
  const sb = supabaseAdmin();
  const row = { ...itemToRow(body), updated_at: new Date().toISOString() };
  const { data, error } = await sb.from("content_items").update(row).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(rowToItem(data));
}

export async function DELETE(request, { params }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = supabaseAdmin();
  const { error } = await sb.from("content_items").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
