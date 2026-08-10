import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseServer";
import { isAdminRequest } from "../../../../lib/adminSession";
import { rowToStrategy, strategyToRow } from "../../../../lib/portalData";

export async function PATCH(request, { params }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("strategies").update(strategyToRow(body)).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(rowToStrategy(data));
}

export async function DELETE(request, { params }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = supabaseAdmin();
  const { error } = await sb.from("strategies").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
