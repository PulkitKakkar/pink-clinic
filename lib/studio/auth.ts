export const STUDIO_ADMIN_COOKIE = "pink-studio-admin-session";
const isProduction = process.env.NODE_ENV === "production";

export const studioAdmin = {
  get email() { return process.env.STUDIO_ADMIN_EMAIL || (isProduction ? "" : "studio@pinkbeauty.test"); },
  get password() { return process.env.STUDIO_ADMIN_PASSWORD || (isProduction ? "" : "PinkStudio2026!"); },
  get sessionToken() { return process.env.STUDIO_ADMIN_SESSION_TOKEN || (isProduction ? "" : "pink-local-studio-admin-session"); },
};
