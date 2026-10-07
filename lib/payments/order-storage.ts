import "server-only";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import { sql } from "@/lib/database";
import type { PaymentOrder } from "@/lib/payments/types";

const directory = path.join(process.cwd(), "data", "admin");
const file = path.join(directory, "payment-orders.json");
let writes = Promise.resolve();

function requireStorage() {
  if (!sql && process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required for payment orders.");
}
async function localOrders(): Promise<PaymentOrder[]> {
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
}
export async function getPaymentOrders(): Promise<PaymentOrder[]> {
  requireStorage();
  if (!sql) return localOrders();
  const rows = await sql<{ data: PaymentOrder }[]>`SELECT data FROM payment_orders ORDER BY created_at DESC`;
  return rows.map((row) => row.data);
}
export async function getPaymentOrder(sessionId: string): Promise<PaymentOrder | undefined> {
  requireStorage();
  if (!sql) return (await localOrders()).find((order) => order.sessionId === sessionId);
  const rows = await sql<{ data: PaymentOrder }[]>`SELECT data FROM payment_orders WHERE session_id=${sessionId}`;
  return rows[0]?.data;
}
export async function savePaymentOrder(order: PaymentOrder) {
  requireStorage();
  if (sql) {
    await sql`INSERT INTO payment_orders (session_id, data, created_at) VALUES (${order.sessionId}, ${sql.json(order)}, ${order.createdAt})
      ON CONFLICT (session_id) DO UPDATE SET data=EXCLUDED.data
      WHERE payment_orders.data->>'status' <> 'paid' OR EXCLUDED.data->>'status' = 'paid'`;
    return;
  }
  const operation = writes.then(async () => {
    const orders = await localOrders();
    const index = orders.findIndex((entry) => entry.sessionId === order.sessionId);
    if (index < 0) orders.push(order);
    else if (orders[index].status !== "paid" || order.status === "paid") orders[index] = order;
    await mkdir(directory, { recursive: true });
    const temporary = `${file}.tmp`;
    await writeFile(temporary, JSON.stringify(orders, null, 2), { mode: 0o600 });
    await rename(temporary, file);
  });
  writes = operation.catch(() => undefined);
  await operation;
}

export async function checkPaymentOrderStorageHealth() {
  requireStorage();
  if (!sql) return;
  await sql`SELECT session_id FROM payment_orders LIMIT 0`;
  await sql`SELECT stripe_payment_key FROM bookings LIMIT 0`;
}
