import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { expect, it } from "vitest";

it("ships both Google branch resource names to Amplify runtime while removing OAuth credentials from build output", () => {
  const directory = mkdtempSync(join(tmpdir(), "pink-reviews-env-"));
  try {
    writeFileSync(join(directory, ".env.production"), [
      "GOOGLE_BUSINESS_WEST_STREET_LOCATION=accounts/1/locations/2",
      "GOOGLE_BUSINESS_WATLINGTON_STREET_LOCATION=accounts/1/locations/3",
      "GOOGLE_BUSINESS_CLIENT_ID=test-client",
      "GOOGLE_BUSINESS_CLIENT_SECRET=test-secret",
      "GOOGLE_BUSINESS_REFRESH_TOKEN=test-refresh",
      "RUNTIME_SECRET_ARN=test-runtime-secret",
    ].join("\n"));
    execFileSync(process.execPath, [resolve("scripts/prepare-runtime-environment.mjs")], {
      cwd: directory, env: { ...process.env, RUNTIME_SECRET_ARN: "test-runtime-secret" },
    });
    const runtime = readFileSync(join(directory, ".env.production"), "utf8");
    expect(runtime).toContain("GOOGLE_BUSINESS_WEST_STREET_LOCATION=accounts/1/locations/2");
    expect(runtime).toContain("GOOGLE_BUSINESS_WATLINGTON_STREET_LOCATION=accounts/1/locations/3");
    expect(runtime).not.toContain("GOOGLE_BUSINESS_CLIENT");
    expect(runtime).not.toContain("GOOGLE_BUSINESS_REFRESH_TOKEN");
    const build = readFileSync("amplify.yml", "utf8");
    expect(build).toContain("|GOOGLE_BUSINESS_WEST_STREET_LOCATION|GOOGLE_BUSINESS_WATLINGTON_STREET_LOCATION|");
    expect(build).not.toContain("GOOGLE_BUSINESS_CLIENT_SECRET");
    expect(build).not.toContain("GOOGLE_BUSINESS_REFRESH_TOKEN");
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
