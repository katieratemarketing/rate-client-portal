import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseServer";
import { isAdminRequest } from "../../../../lib/adminSession";

// Deletes a client and everything scoped to it (cascades via FK on every
// client-owned table). No UI wired to this yet — deliberately hard to reach
// by accident.
export async function DELETE(request, { params }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = supabaseAdmin();
  const { error } = await sb.from("clients").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
