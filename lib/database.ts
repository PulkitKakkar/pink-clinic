import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
const globalDatabase = globalThis as unknown as {
  pinkClinicSql?: ReturnType<typeof postgres>;
};

export const sql = databaseUrl
  ? (globalDatabase.pinkClinicSql ??
    postgres(databaseUrl, {
      max: 8,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: "require",
    }))
  : undefined;

if (sql) globalDatabase.pinkClinicSql = sql;
