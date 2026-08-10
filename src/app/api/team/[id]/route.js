import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseServer";
import { isAdminRequest } from "../../../../lib/adminSession";

// Delete only in v1, matching the ContactsManager pattern (add/remove, no
// edit). A member removed here is naturally unassigned everywhere via the
// assignee_id ON DELETE SET NULL foreign keys.
export async function DELETE(request, { params }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = supabaseAdmin();
  const { error } = await sb.from("team_members").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
