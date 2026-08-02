import { createHash } from "crypto";
import { sql } from "@/lib/database";

type RateLimitOptions = {
  scope: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
};

type LocalWindow = { count: number; resetsAt: number };
const localWindows = new Map<string, LocalWindow>();

export function requestIdentifier(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function opaqueKey(scope: string, identifier: string) {
  return `${scope}:${createHash("sha256").update(identifier).digest("hex")}`;
}

export async function consumeRateLimit(options: RateLimitOptions) {
  const key = opaqueKey(options.scope, options.identifier);
  if (sql) {
    const rows = await sql<{ request_count: number }[]>`
      INSERT INTO request_rate_limits (key, window_started_at, request_count)
      VALUES (${key}, now(), 1)
      ON CONFLICT (key) DO UPDATE SET
        window_started_at = CASE
          WHEN request_rate_limits.window_started_at <= now() - (${options.windowSeconds} * interval '1 second') THEN now()
          ELSE request_rate_limits.window_started_at
        END,
        request_count = CASE
          WHEN request_rate_limits.window_started_at <= now() - (${options.windowSeconds} * interval '1 second') THEN 1
          ELSE request_rate_limits.request_count + 1
        END
      RETURNING request_count
    `;
    return rows[0].request_count <= options.limit;
  }

  const now = Date.now();
  const current = localWindows.get(key);
  if (!current || current.resetsAt <= now) {
    localWindows.set(key, { count: 1, resetsAt: now + options.windowSeconds * 1000 });
    return true;
  }
  current.count += 1;
  return current.count <= options.limit;
}
