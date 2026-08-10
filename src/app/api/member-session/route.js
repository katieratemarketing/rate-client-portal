import { NextResponse } from "next/server";
import { isAdminRequest } from "../../../lib/adminSession";
import { MEMBER_COOKIE_NAME, MEMBER_COOKIE_MAX_AGE, createMemberCookieValue } from "../../../lib/memberSession";

// "Which of us is this" — only meaningful once the shared staff passcode
// has already been entered.
export async function POST(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body.memberId) return NextResponse.json({ error: "memberId is required" }, { status: 400 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MEMBER_COOKIE_NAME, createMemberCookieValue(body.memberId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MEMBER_COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}

// "Switch" — clears the selection so the picker reappears without a full logout.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MEMBER_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
