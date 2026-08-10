import crypto from "crypto";

// Mirrors adminSession.js exactly, but tracks WHICH staff member is at the
// keyboard rather than whether the shared passcode was entered. Reuses
// ADMIN_SESSION_SECRET rather than minting a second secret — no reason to
// manage two. Not real security: anyone who knows the passcode could pick
// anyone's name here. Same trust level as the passcode itself, just adding
// attribution on top for personalized views and assignment.

export const MEMBER_COOKIE_NAME = "rate_member_session";
export const MEMBER_COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours

function sign(value) {
  return crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(value).digest("hex");
}

export function createMemberCookieValue(memberId) {
  const expires = Date.now() + MEMBER_COOKIE_MAX_AGE * 1000;
  const payload = `member.${memberId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

// Returns the member id, or null if there isn't a valid one selected —
// callers should treat that identically to "no member chosen yet" (e.g. a
// dangling id whose team_members row was since deleted isn't an error, it
// just means the picker should show again).
export function selectedMemberId(request) {
  const value = request.cookies.get(MEMBER_COOKIE_NAME)?.value;
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 4) return null;
  const [role, memberId, expiresStr, sig] = parts;
  if (role !== "member") return null;
  const expected = sign(`${role}.${memberId}.${expiresStr}`);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  if (Date.now() >= Number(expiresStr)) return null;
  return memberId;
}
