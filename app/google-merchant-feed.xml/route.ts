import { getCombinedCatalog } from "@/lib/catalog";

export const revalidate = 300;

export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://pinkclinic.co.uk";
  const products = (await getCombinedCatalog()).filter(
    (item) => item.kind === "product",
  );
  const entries = products.flatMap((item) =>
    item.branchItems.flatMap(({ branch, item: branchItem }) => {
      if (
        !item.brand ||
        (!item.gtin && !item.mpn) ||
        !item.merchantCondition ||
        !branchItem.merchantAvailability ||
        branchItem.variants.length !== 1 ||
        !item.images[0] ||
        !item.description
      )
        return [];
      const variant = branchItem.variants[0];
      if (!variant.price || variant.price <= 0) return [];
      const identifier =
        variant.sku ||
        variant.gtin ||
        variant.mpn ||
        `${item.handle}-${branch.slug}`;
      return [
        `<item>
      <g:id>${xml(`${identifier}-${branch.slug}`)}</g:id>
      <title>${xml(item.title)}</title>
      <description>${xml(item.description)}</description>
      <link>${xml(`${siteUrl}/products-services/${branch.slug}/${item.handle}`)}</link>
      <g:image_link>${xml(item.images[0])}</g:image_link>
      <g:availability>${branchItem.merchantAvailability}</g:availability>
      <g:price>${variant.price.toFixed(2)} GBP</g:price>
      <g:condition>${item.merchantCondition}</g:condition>
      <g:brand>${xml(item.brand)}</g:brand>
      ${item.gtin || variant.gtin ? `<g:gtin>${xml(item.gtin || variant.gtin || "")}</g:gtin>` : ""}
      ${item.mpn || variant.mpn ? `<g:mpn>${xml(item.mpn || variant.mpn || "")}</g:mpn>` : ""}
      ${item.googleProductCategory ? `<g:google_product_category>${xml(item.googleProductCategory)}</g:google_product_category>` : ""}
    </item>`,
      ];
    }),
  );
  const body = `<?xml version="1.0" encoding="UTF-8"?>
  <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0"><channel>
    <title>Pink Beauty retail products</title>
    <link>${xml(siteUrl)}</link>
    <description>Verified physical retail products available from Pink Beauty.</description>
    ${entries.join("\n")}
  </channel></rss>`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}

function xml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
