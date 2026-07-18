import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";

const { NEXT_PUBLIC_SANITY_PROJECT_ID: projectId, NEXT_PUBLIC_SANITY_DATASET: dataset = "production", SANITY_WRITE_TOKEN: token } = process.env;
if (!projectId || !token) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN are required.");

const client = createClient({ projectId, dataset, token, apiVersion: "2026-06-10", useCdn: false });
const items = [
  ...JSON.parse(await readFile(new URL("../data/west-street-catalog.json", import.meta.url), "utf8")),
  ...JSON.parse(await readFile(new URL("../data/watlington-street-catalog.json", import.meta.url), "utf8")),
].filter((item, index, all) => all.findIndex((candidate) => candidate.handle === item.handle) === index);
const existing = new Map((await client.fetch(`*[_type == "catalogItem"]{_id, "handle": slug.current, "imageCount": count(images)}`)).map((item) => [item.handle, item]));

let imported = 0;
let skipped = 0;
let failed = 0;

async function importImage(item) {
  const document = existing.get(item.handle);
  if (!document || document.imageCount > 0 || !item.images[0]) { skipped += 1; return; }
  try {
    const response = await fetch(item.images[0]);
    if (!response.ok) throw new Error(`Image request returned ${response.status}`);
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const asset = await client.assets.upload("image", Buffer.from(await response.arrayBuffer()), { filename: `${item.handle}.${extension}`, contentType });
    await client.patch(document._id).set({ images: [{ _key: "primary", _type: "image", asset: { _type: "reference", _ref: asset._id }, alt: item.title }] }).commit();
    imported += 1;
    if (imported % 20 === 0) console.log(`Imported ${imported} images...`);
  } catch (error) {
    failed += 1;
    console.error(`Failed ${item.handle}: ${error instanceof Error ? error.message : error}`);
  }
}

for (let start = 0; start < items.length; start += 4) await Promise.all(items.slice(start, start + 4).map(importImage));
console.log(JSON.stringify({ imported, skipped, failed, total: items.length }));
if (failed) process.exitCode = 1;
