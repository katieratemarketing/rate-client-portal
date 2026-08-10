import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "../../../../lib/adminSession";
import { MEMBER_COOKIE_NAME } from "../../../../lib/memberSession";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  // Also clear who was selected — otherwise the next person to unlock with
  // the shared passcode silently inherits the previous person's identity.
  res.cookies.set(MEMBER_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
