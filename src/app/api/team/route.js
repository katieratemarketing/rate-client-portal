import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseServer";
import { isAdminRequest } from "../../../lib/adminSession";
import { rowToMember, memberToRow } from "../../../lib/portalData";

// Gated by the shared staff passcode (isAdminRequest), same as everything
// else — not by roster role, to avoid a bootstrapping problem (someone has
// to be able to see/manage the roster before any role distinction means
// anything).
export async function GET(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("team_members").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(rowToMember));
}

export async function POST(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("team_members").insert(memberToRow(body)).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(rowToMember(data));
}
