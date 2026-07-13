import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const source = process.argv[2];
const destination = process.argv[3] || "data/west-street-catalog.json";
if (!source) throw new Error("Usage: node scripts/import-west-street-catalog.mjs <shopify.csv> [output.json]");

function parseCsv(text) {
  const rows = [];
  let row = [], value = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { value += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else value += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { row.push(value); value = ""; }
    else if (character === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += character;
  }
  if (value || row.length) { row.push(value.replace(/\r$/, "")); rows.push(row); }
  const headers = rows.shift();
  return rows.filter((item) => item.some(Boolean)).map((item) => Object.fromEntries(headers.map((header, index) => [header, item[index] || ""])));
}

function plainText(html) {
  return html.replace(/<br\s*\/?\s*>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;|&#160;/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
}

const rows = parseCsv(await readFile(resolve(source), "utf8"));
const grouped = new Map();
for (const row of rows) {
  if (!grouped.has(row.Handle)) grouped.set(row.Handle, []);
  grouped.get(row.Handle).push(row);
}

const items = [];
for (const [handle, productRows] of grouped) {
  const primary = productRows.find((row) => row.Title) || productRows[0];
  if (primary.Status.toLowerCase() !== "active" || primary.Published.toLowerCase() !== "true") continue;
  const tags = primary.Tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  const images = [...new Set(productRows.map((row) => row["Image Src"]).filter(Boolean))];
  const variants = productRows.filter((row) => row["Variant Price"]).map((row) => ({
    name: row["Option1 Value"] && row["Option1 Value"] !== "Default Title" ? row["Option1 Value"] : "Standard",
    price: Number(row["Variant Price"]),
    compareAtPrice: row["Variant Compare At Price"] ? Number(row["Variant Compare At Price"]) : null,
    sku: row["Variant SKU"] || null,
  }));
  const kind = tags.includes("Academy") ? "course" : tags.includes("Products") || tags.includes("Gift card") ? "product" : "service";
  items.push({ handle, title: primary.Title, description: plainText(primary["Body (HTML)"]), kind, tags, images, variants });
}

items.sort((a, b) => a.kind.localeCompare(b.kind) || (a.tags[0] || "").localeCompare(b.tags[0] || "") || a.title.localeCompare(b.title));
await mkdir(dirname(resolve(destination)), { recursive: true });
await writeFile(resolve(destination), `${JSON.stringify(items, null, 2)}\n`);
console.log(`Imported ${items.length} active West Street catalogue entries to ${destination}`);
