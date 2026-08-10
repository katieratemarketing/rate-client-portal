import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "rate_admin_session";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours

function sign(value) {
  return crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(value).digest("hex");
}

export function createSessionCookieValue() {
  const expires = Date.now() + ADMIN_COOKIE_MAX_AGE * 1000;
  const payload = `admin.${expires}`;
  return `${payload}.${sign(payload)}`;
}

function isValidSessionCookieValue(value) {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [role, expiresStr, sig] = parts;
  const expected = sign(`${role}.${expiresStr}`);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;
  return role === "admin" && Date.now() < Number(expiresStr);
}

// Works with both the Web Request cookies API (route handlers) used here.
export function isAdminRequest(request) {
  const value = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return isValidSessionCookieValue(value);
}
