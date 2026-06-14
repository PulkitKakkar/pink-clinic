export const ADMIN_COOKIE = "pink-admin-session";
const isProduction = process.env.NODE_ENV === "production";

export const testAdmin = {
  email: process.env.ADMIN_EMAIL || (isProduction ? "" : "admin@pinkbeauty.test"),
  password: process.env.ADMIN_PASSWORD || (isProduction ? "" : "PinkTest2026!"),
  sessionToken: process.env.ADMIN_SESSION_TOKEN || (isProduction ? "" : "pink-local-admin-test-session"),
};

export function isAdminSession(value: string | undefined) {
  return Boolean(value && value === testAdmin.sessionToken);
}
