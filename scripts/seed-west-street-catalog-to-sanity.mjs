import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";

const { NEXT_PUBLIC_SANITY_PROJECT_ID: projectId, NEXT_PUBLIC_SANITY_DATASET: dataset = "production", SANITY_WRITE_TOKEN: token } = process.env;
if (!projectId || !token) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN are required.");

const client = createClient({ projectId, dataset, token, apiVersion: "2026-06-10", useCdn: false });
const safeId = (value) => value.replace(/[^a-zA-Z0-9._-]/g, "-");
const stores = [
  {
    key: "west-street",
    branch: { _id: "branch-reading-west-st", title: "Reading West Street", slug: "reading-west-st", address: "4-5 West Street, Reading RG1 1TT", phone: "0118 996 2711" },
    file: new URL("../data/west-street-catalog.json", import.meta.url),
  },
  {
    key: "watlington-street",
    branch: { _id: "branch-reading-watlington-st", title: "Reading Watlington Street", slug: "reading-watlington-st", address: "25 Watlington Street, Reading RG1 4EN", phone: "0118 402 8505" },
    file: new URL("../data/watlington-street-catalog.json", import.meta.url),
  },
];

const loaded = await Promise.all(stores.map(async (store) => ({ ...store, items: JSON.parse(await readFile(store.file, "utf8")) })));
const allHandles = new Set(loaded.flatMap((store) => store.items.map((item) => item.handle)));

for (const store of loaded) {
  await client.createOrReplace({
    _id: store.branch._id,
    _type: "branch",
    title: store.branch.title,
    slug: { _type: "slug", current: store.branch.slug },
    address: store.branch.address,
    phone: store.branch.phone,
  });
}

// Sanity enforces strong references. Create minimal records before linking the
// bidirectional item/collection references, then replace them with full data.
const handles = [...allHandles];
for (let start = 0; start < handles.length; start += 50) {
  let transaction = client.transaction();
  for (const handle of handles.slice(start, start + 50)) {
    const source = loaded.map((store) => store.items.find((item) => item.handle === handle)).find(Boolean);
    transaction = transaction.createIfNotExists({
      _id: safeId(`catalogItem-${handle}`),
      _type: "catalogItem",
      title: source.title,
      slug: { _type: "slug", current: handle },
      kind: source.kind,
      active: true,
    });
  }
  await transaction.commit();
}

const collectionsByHandle = new Map();
for (const store of loaded) {
  for (const item of store.items) {
    for (const collection of item.collections || []) {
      const current = collectionsByHandle.get(collection.handle) || { handle: collection.handle, titles: [], branchIds: [], itemHandles: [] };
      if (!current.titles.includes(collection.title)) current.titles.push(collection.title);
      if (!current.branchIds.includes(store.branch._id)) current.branchIds.push(store.branch._id);
      if (!current.itemHandles.includes(item.handle)) current.itemHandles.push(item.handle);
      collectionsByHandle.set(collection.handle, current);
    }
  }
}

let collectionTransaction = client.transaction();
for (const [index, collection] of [...collectionsByHandle.values()].sort((a, b) => a.titles[0].localeCompare(b.titles[0])).entries()) {
  const title = collection.handle === "offers" ? "Offers" : collection.titles[0];
  collectionTransaction = collectionTransaction.createOrReplace({
    _id: safeId(`catalogCollection-shopify-${collection.handle}`),
    _type: "catalogCollection",
    title,
    slug: { _type: "slug", current: collection.handle },
    products: collection.itemHandles.map((handle) => ({ _key: safeId(handle), _type: "reference", _ref: safeId(`catalogItem-${handle}`) })),
    branches: collection.branchIds.map((branchId) => ({ _key: safeId(branchId), _type: "reference", _ref: branchId })),
    active: true,
    order: index,
  });
}
await collectionTransaction.commit();

const existing = new Map((await client.fetch(`*[_type == "catalogItem" && slug.current in $handles]{_id, "handle": slug.current, branches, images, featured}`, { handles: [...allHandles] })).map((document) => [document.handle, document]));

for (let start = 0; start < handles.length; start += 40) {
  let transaction = client.transaction();
  for (const handle of handles.slice(start, start + 40)) {
    const branchEntries = loaded.flatMap((store) => {
      const item = store.items.find((candidate) => candidate.handle === handle);
      if (!item) return [];
      const availableVariants = item.variants.filter((variant) => variant.available !== false);
      return [{
        _key: store.key,
        _type: "branchListing",
        branch: { _type: "reference", _ref: store.branch._id },
        variants: availableVariants.map((variant, index) => ({
          _key: `variant-${index}`,
          _type: "object",
          name: variant.name,
          price: variant.price,
          ...(variant.compareAtPrice > variant.price ? { compareAtPrice: variant.compareAtPrice } : {}),
        })),
        available: availableVariants.length > 0,
      }];
    });
    const source = loaded.map((store) => store.items.find((item) => item.handle === handle)).find(Boolean);
    const document = existing.get(handle);
    const collections = [...new Map(loaded.flatMap((store) => store.items.find((item) => item.handle === handle)?.collections || []).map((collection) => [collection.handle, collection])).values()];
    transaction = transaction.createOrReplace({
      _id: document?._id || safeId(`catalogItem-${handle}`),
      _type: "catalogItem",
      title: source.title,
      slug: { _type: "slug", current: handle },
      kind: source.kind,
      category: source.tags[0] || "Other",
      collections: collections.map((collection) => ({ _key: safeId(collection.handle), _type: "reference", _ref: safeId(`catalogCollection-shopify-${collection.handle}`) })),
      description: source.description,
      ...(document?.images?.length ? { images: document.images } : {}),
      variants: source.variants.filter((variant) => variant.available !== false).map((variant, index) => ({
        _key: `variant-${index}`,
        _type: "object",
        name: variant.name,
        price: variant.price,
        ...(variant.compareAtPrice > variant.price ? { compareAtPrice: variant.compareAtPrice } : {}),
      })),
      branches: branchEntries,
      featured: document?.featured || false,
      active: true,
    });
  }
  await transaction.commit();
}

const liveWestHandles = new Set(loaded[0].items.map((item) => item.handle));
const retiredWest = await client.fetch(`*[_type == "catalogItem" && count(branches[branch._ref == $branchId]) > 0 && !(slug.current in $handles)]{_id, branches}`, { branchId: loaded[0].branch._id, handles: [...liveWestHandles] });
for (const document of retiredWest) {
  await client.patch(document._id).set({
    branches: document.branches.map((listing) => listing.branch?._ref === loaded[0].branch._id ? { ...listing, available: false } : listing),
  }).commit();
}

console.log(JSON.stringify({
  items: allHandles.size,
  westStreet: loaded[0].items.length,
  watlingtonStreet: loaded[1].items.length,
  collections: collectionsByHandle.size,
  retiredWestStreet: retiredWest.length,
}, null, 2));
