import "server-only";

import { randomUUID } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import { sql } from "@/lib/database";

export type MarketingSmsDeliveryStatus = "pending" | "sent" | "skipped" | "failed";
export type MarketingSmsDelivery = {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  status: MarketingSmsDeliveryStatus;
  errorMessage: string | null;
};
export type MarketingSmsCampaign = {
  id: string;
  message: string;
  status: "sending" | "completed";
  selectedCount: number;
  sentCount: number;
  skippedCount: number;
  failedCount: number;
  createdAt: string;
  completedAt: string | null;
  deliveries: MarketingSmsDelivery[];
};

const localFile = path.join(process.cwd(), "data", "admin", "marketing-sms-campaigns.json");
let writeQueue = Promise.resolve();

async function readLocal(): Promise<MarketingSmsCampaign[]> {
  try { return JSON.parse(await readFile(localFile, "utf8")) as MarketingSmsCampaign[]; }
  catch { return []; }
}

async function updateLocal(operation: (campaigns: MarketingSmsCampaign[]) => MarketingSmsCampaign[]) {
  const queued = writeQueue.then(async () => {
    const campaigns = operation(await readLocal());
    await mkdir(path.dirname(localFile), { recursive: true });
    const temporaryFile = `${localFile}.tmp`;
    await writeFile(temporaryFile, JSON.stringify(campaigns, null, 2), "utf8");
    await rename(temporaryFile, localFile);
  });
  writeQueue = queued.then(() => undefined, () => undefined);
  await queued;
}

export async function createMarketingSmsCampaign(
  message: string,
  recipients: Array<{ customerId: string; customerName: string; phone: string }>,
) {
  const campaign: MarketingSmsCampaign = {
    id: randomUUID(), message, status: "sending", selectedCount: recipients.length,
    sentCount: 0, skippedCount: 0, failedCount: 0,
    createdAt: new Date().toISOString(), completedAt: null,
    deliveries: recipients.map((recipient) => ({ id: randomUUID(), ...recipient, status: "pending", errorMessage: null })),
  };
  if (sql) {
    await sql.begin(async (transaction) => {
      await transaction`INSERT INTO marketing_sms_campaigns (id, message, status, selected_count, created_at) VALUES (${campaign.id}, ${campaign.message}, ${campaign.status}, ${campaign.selectedCount}, ${campaign.createdAt})`;
      for (const delivery of campaign.deliveries)
        await transaction`INSERT INTO marketing_sms_deliveries (id, campaign_id, customer_id, customer_name, phone, status) VALUES (${delivery.id}, ${campaign.id}, ${delivery.customerId}, ${delivery.customerName}, ${delivery.phone}, ${delivery.status})`;
    });
  } else await updateLocal((campaigns) => [campaign, ...campaigns]);
  return campaign;
}

export async function updateMarketingSmsDelivery(deliveryId: string, status: MarketingSmsDeliveryStatus, errorMessage: string | null = null) {
  if (sql) {
    await sql`UPDATE marketing_sms_deliveries SET status=${status}, error_message=${errorMessage}, updated_at=now() WHERE id=${deliveryId}`;
    return;
  }
  await updateLocal((campaigns) => campaigns.map((campaign) => ({ ...campaign, deliveries: campaign.deliveries.map((delivery) => delivery.id === deliveryId ? { ...delivery, status, errorMessage } : delivery) })));
}

export async function completeMarketingSmsCampaign(id: string, counts: { sent: number; skipped: number; failed: number }) {
  const completedAt = new Date().toISOString();
  if (sql) {
    await sql`UPDATE marketing_sms_campaigns SET status='completed', sent_count=${counts.sent}, skipped_count=${counts.skipped}, failed_count=${counts.failed}, completed_at=${completedAt} WHERE id=${id}`;
    return;
  }
  await updateLocal((campaigns) => campaigns.map((campaign) => campaign.id === id ? { ...campaign, status: "completed", sentCount: counts.sent, skippedCount: counts.skipped, failedCount: counts.failed, completedAt } : campaign));
}

type CampaignRow = { id: string; message: string; status: "sending" | "completed"; selected_count: number; sent_count: number; skipped_count: number; failed_count: number; created_at: Date; completed_at: Date | null };
type DeliveryRow = { id: string; campaign_id: string; customer_id: string; customer_name: string; phone: string; status: MarketingSmsDeliveryStatus; error_message: string | null };

export async function getMarketingSmsCampaigns(limit = 25): Promise<MarketingSmsCampaign[]> {
  if (!sql) return (await readLocal()).slice(0, limit);
  const campaigns = await sql<CampaignRow[]>`SELECT * FROM marketing_sms_campaigns ORDER BY created_at DESC LIMIT ${limit}`;
  if (!campaigns.length) return [];
  const ids = campaigns.map((campaign) => campaign.id);
  const deliveries = await sql<DeliveryRow[]>`SELECT * FROM marketing_sms_deliveries WHERE campaign_id = ANY(${ids}) ORDER BY customer_name`;
  return campaigns.map((campaign) => ({
    id: campaign.id, message: campaign.message, status: campaign.status,
    selectedCount: campaign.selected_count, sentCount: campaign.sent_count,
    skippedCount: campaign.skipped_count, failedCount: campaign.failed_count,
    createdAt: campaign.created_at.toISOString(), completedAt: campaign.completed_at?.toISOString() || null,
    deliveries: deliveries.filter((delivery) => delivery.campaign_id === campaign.id).map((delivery) => ({ id: delivery.id, customerId: delivery.customer_id, customerName: delivery.customer_name, phone: delivery.phone, status: delivery.status, errorMessage: delivery.error_message })),
  }));
}
