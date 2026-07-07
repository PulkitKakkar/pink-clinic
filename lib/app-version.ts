import packageJson from "@/package.json";

export const appVersion = packageJson.version;

export function getBuildInfo() {
  return {
    version: appVersion,
    commit: process.env.SOURCE_COMMIT || process.env.AWS_COMMIT_ID || process.env.GITHUB_SHA || null,
    environment: process.env.NODE_ENV || "development",
  };
}
