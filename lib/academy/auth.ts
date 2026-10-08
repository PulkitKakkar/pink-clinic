export const ACADEMY_ADMIN_COOKIE = "pink-academy-admin-session";
const isProduction = process.env.NODE_ENV === "production";

export const academyAdmin = {
  get email() { return isProduction
    ? process.env.ACADEMY_ADMIN_EMAIL || ""
    : "academy@pinkbeauty.test"; },
  get password() { return process.env.ACADEMY_ADMIN_PASSWORD || ""; },
  get sessionToken() { return isProduction
    ? process.env.ACADEMY_ADMIN_SESSION_TOKEN || ""
    : "pink-local-academy-admin-session"; },
};
