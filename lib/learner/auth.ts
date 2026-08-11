import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { sql } from "@/lib/database";

export {
  generatePassword,
  hashPassword,
  validatePassword,
  verifyPassword,
} from "@/lib/learner/password";
export const LEARNER_COOKIE = "pink-learner-session";

const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function createLearnerSession(learnerId: string) {
  if (!sql) throw new Error("Learner database is not configured.");
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  await sql`DELETE FROM learner_sessions WHERE expires_at < now()`;
  await sql`INSERT INTO learner_sessions (id, learner_id, token_hash, expires_at) VALUES (${randomUUID()}, ${learnerId}, ${tokenHash(token)}, ${expiresAt.toISOString()})`;
  return { token, expiresAt };
}

export async function getCurrentLearner() {
  if (!sql) return undefined;
  const token = (await cookies()).get(LEARNER_COOKIE)?.value;
  if (!token) return undefined;
  const rows =
    await sql`SELECT a.id, a.name, a.email, a.must_change_password, a.active FROM learner_sessions s JOIN learner_accounts a ON a.id=s.learner_id WHERE s.token_hash=${tokenHash(token)} AND s.expires_at > now() AND a.active=true LIMIT 1`;
  const row = rows[0];
  return row
    ? {
        id: String(row.id),
        name: String(row.name),
        email: String(row.email),
        mustChangePassword: Boolean(row.must_change_password),
      }
    : undefined;
}

export async function deleteLearnerSession(token: string | undefined) {
  if (sql && token)
    await sql`DELETE FROM learner_sessions WHERE token_hash=${tokenHash(token)}`;
}
