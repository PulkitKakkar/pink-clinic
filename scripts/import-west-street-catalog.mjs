import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const stores = [
  { key: "west-street", domain: "https://pinkbeautysalons.co.uk", output: "data/west-street-catalog.json" },
  { key: "watlington-street", domain: "https://pinkclinic.co.uk", output: "data/watlington-street-catalog.json" },
];

const plainText = (html = "") => html
  .replace(/<br\s*\/?\s*>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&nbsp;|&#160;/g, " ")
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/\s+/g, " ")
  .trim();

async function getJson(url) {
  const response = await fetch(url, { headers: { "user-agent": "PinkClinicCatalogueSync/1.0" } });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

function classify(collectionHandles, tags) {
  if (collectionHandles.some((handle) => handle === "vtct-courses" || handle === "other-courses") || tags.includes("Academy")) return "course";
  if (collectionHandles.some((handle) => ["beauty-products", "gift-card", "gift-cards"].includes(handle)) || tags.some((tag) => /products?|gift cards?/i.test(tag))) return "product";
  return "service";
}

for (const store of stores) {
  const [{ products }, { collections }] = await Promise.all([
    getJson(`${store.domain}/products.json?limit=250`),
    getJson(`${store.domain}/collections.json?limit=250`),
  ]);

  const memberships = new Map(products.map((product) => [product.handle, []]));
  await Promise.all(collections.map(async (collection) => {
    const data = await getJson(`${store.domain}/collections/${collection.handle}/products.json?limit=250`);
    for (const product of data.products || []) {
      const productCollections = memberships.get(product.handle);
      if (productCollections) productCollections.push({ handle: collection.handle, title: collection.title });
    }
  }));

  const items = products.map((product) => {
    const productCollections = memberships.get(product.handle) || [];
    const tags = [...new Set(productCollections.map((collection) => collection.title).concat(product.tags || []))];
    return {
      handle: product.handle,
      title: product.title,
      description: plainText(product.body_html),
      kind: classify(productCollections.map((collection) => collection.handle), tags),
      tags,
      collections: productCollections,
      images: (product.images || []).map((image) => image.src),
      variants: (product.variants || []).map((variant) => ({
        name: variant.title && variant.title !== "Default Title" ? variant.title : "Standard",
        price: Number(variant.price),
        compareAtPrice: variant.compare_at_price ? Number(variant.compare_at_price) : null,
        sku: variant.sku || null,
        available: variant.available !== false,
      })),
    };
  }).sort((a, b) => a.kind.localeCompare(b.kind) || (a.tags[0] || "").localeCompare(b.tags[0] || "") || a.title.localeCompare(b.title));

  await mkdir(dirname(resolve(store.output)), { recursive: true });
  await writeFile(resolve(store.output), `${JSON.stringify(items, null, 2)}\n`);
  const offers = items.filter((item) => item.variants.some((variant) => variant.compareAtPrice > variant.price)).length;
  console.log(`${store.key}: imported ${items.length} live entries (${offers} with offers) to ${store.output}`);
}
