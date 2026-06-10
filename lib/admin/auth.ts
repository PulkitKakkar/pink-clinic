export const ADMIN_COOKIE = "pink-admin-session";

export const testAdmin = {
  email: process.env.ADMIN_EMAIL || "admin@pinkbeauty.test",
  password: process.env.ADMIN_PASSWORD || "PinkTest2026!",
  sessionToken: process.env.ADMIN_SESSION_TOKEN || "pink-local-admin-test-session",
};

export function isAdminSession(value: string | undefined) {
  return Boolean(value && value === testAdmin.sessionToken);
}
