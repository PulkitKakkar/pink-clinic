export const ADMIN_COOKIE = "pink-admin-session";
const isProduction = process.env.NODE_ENV === "production";

export const testAdmin = {
  email: isProduction ? process.env.ADMIN_EMAIL || "" : "admin@pinkbeauty.test",
  password: isProduction ? process.env.ADMIN_PASSWORD || "" : "PinkTest2026!",
  sessionToken: isProduction
    ? process.env.ADMIN_SESSION_TOKEN || ""
    : "pink-local-admin-test-session",
};

export function isAdminSession(value: string | undefined) {
  return Boolean(value && value === testAdmin.sessionToken);
}
