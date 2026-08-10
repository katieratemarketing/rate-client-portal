import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseServer";
import { isAdminRequest } from "../../../lib/adminSession";
import { listClients, slugify } from "../../../lib/portalData";

// Client list is admin-only — a client viewer must never learn who else
// Rate works with.
export async function GET(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = supabaseAdmin();
  const clients = await listClients(sb);
  return NextResponse.json(clients);
}

export async function POST(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const name = (body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const sb = supabaseAdmin();

  const baseSlug = slugify(name);
  let slug = baseSlug;
  for (let i = 2; i < 50; i++) {
    const { data: existing } = await sb.from("clients").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${i}`;
  }

  const { data, error } = await sb.from("clients").insert({ name, slug }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, slug: data.slug, name: data.name });
}
