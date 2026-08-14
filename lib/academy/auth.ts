export const ACADEMY_ADMIN_COOKIE = "pink-academy-admin-session";
const isProduction = process.env.NODE_ENV === "production";

export const academyAdmin = {
  email: isProduction
    ? process.env.ACADEMY_ADMIN_EMAIL || ""
    : "academy@pinkbeauty.test",
  password: isProduction
    ? process.env.ACADEMY_ADMIN_PASSWORD || ""
    : "PinkAcademy2026!",
  sessionToken: isProduction
    ? process.env.ACADEMY_ADMIN_SESSION_TOKEN || ""
    : "pink-local-academy-admin-session",
};
