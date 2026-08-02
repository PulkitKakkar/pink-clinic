import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const sql = postgres(databaseUrl, {
  max: 1,
  connect_timeout: 10,
  ssl: "require",
});

try {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  const filenames = (await readdir("db/migrations"))
    .filter((filename) => filename.endsWith(".sql"))
    .sort();

  for (const filename of filenames) {
    const source = await readFile(`db/migrations/${filename}`, "utf8");
    const checksum = createHash("sha256").update(source).digest("hex");
    const applied = await sql`
      SELECT checksum FROM schema_migrations WHERE filename=${filename}
    `;
    if (applied[0]) {
      if (applied[0].checksum !== checksum)
        throw new Error(`Applied migration ${filename} has been modified.`);
      continue;
    }

    await sql.begin(async (transaction) => {
      await transaction.unsafe(source);
      await transaction`
        INSERT INTO schema_migrations (filename, checksum)
        VALUES (${filename}, ${checksum})
      `;
    });
    console.log(`Applied ${filename}`);
  }
} finally {
  await sql.end();
}
