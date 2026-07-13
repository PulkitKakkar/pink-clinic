import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";

const { NEXT_PUBLIC_SANITY_PROJECT_ID: projectId, NEXT_PUBLIC_SANITY_DATASET: dataset = "production", SANITY_WRITE_TOKEN: token } = process.env;
if (!projectId || !token) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN are required.");

const client = createClient({ projectId, dataset, token, apiVersion: "2026-06-10", useCdn: false });
const branchId = await client.fetch(`*[_type == "branch" && slug.current == "reading-west-st"][0]._id`);
if (!branchId) throw new Error("Create and publish the Reading West Street branch in Sanity Studio first.");

const items = JSON.parse(await readFile(new URL("../data/west-street-catalog.json", import.meta.url), "utf8"));
const slugify = (value) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const collectionNames = [...new Set(items.flatMap((item) => item.tags))].filter(Boolean).sort();
const collectionId = (name) => `catalogCollection-${slugify(name)}`;

let collectionTransaction = client.transaction();
for (const [index, name] of collectionNames.entries()) {
  collectionTransaction = collectionTransaction.createIfNotExists({
    _id: collectionId(name),
    _type: "catalogCollection",
    title: name,
    slug: { _type: "slug", current: slugify(name) },
    branches: [{ _key: "west-street", _type: "reference", _ref: branchId }],
    active: true,
    order: index,
  });
}
await collectionTransaction.commit();

for (let start = 0; start < items.length; start += 50) {
  let transaction = client.transaction();
  for (const item of items.slice(start, start + 50)) {
    transaction = transaction.createIfNotExists({
      _id: `catalogItem-${item.handle}`.replace(/[^a-zA-Z0-9._-]/g, "-"),
      _type: "catalogItem",
      title: item.title,
      slug: { _type: "slug", current: item.handle },
      kind: item.kind,
      category: item.tags[0] || "Other",
      collections: item.tags.map((name) => ({ _key: slugify(name), _type: "reference", _ref: collectionId(name) })),
      description: item.description,
      variants: item.variants.map((variant, index) => ({ _key: `variant-${index}`, _type: "object", name: variant.name, price: variant.price })),
      branches: [{ _key: "west-street", _type: "branchListing", branch: { _type: "reference", _ref: branchId }, variants: item.variants.map((variant, index) => ({ _key: `variant-${index}`, _type: "object", name: variant.name, price: variant.price, compareAtPrice: variant.compareAtPrice })), available: true }],
      active: true,
    });
  }
  await transaction.commit();
}
console.log(`Created any missing Studio records for ${items.length} West Street catalogue entries and ${collectionNames.length} collections.`);
