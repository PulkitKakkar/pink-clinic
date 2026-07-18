import { defineField, defineType } from "sanity";

const seoFields = [
  defineField({ name: "seoTitle", title: "Google result title (optional)", type: "string", description: "Leave blank to use the normal page title.", group: "advanced", validation: rule => rule.max(60).warning("Keep this under 60 characters so it is not cut off in Google.") }),
  defineField({ name: "seoDescription", title: "Google result description (optional)", type: "text", rows: 3, description: "Leave blank to use the normal page description.", group: "advanced", validation: rule => rule.max(160).warning("Keep this under 160 characters so it is not cut off in Google.") }),
];

const contentType = (name: string, title: string, fields: ReturnType<typeof defineField>[]) => defineType({
  name, title, type: "document",
  groups: [
    { name: "content", title: "Main content", default: true },
    { name: "advanced", title: "Search & advanced" },
  ],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", group: "content", validation: rule => rule.required() }),
    defineField({ name: "slug", title: "Website address", type: "slug", description: "Usually set once. Click Generate when creating a new page.", group: "advanced", options: { source: "title" }, validation: rule => rule.required() }),
    ...fields.map((field) => ({ ...field, group: "content" as const })),
    ...seoFields,
  ],
});

export const schemaTypes = [
  defineType({
    name: "catalogCollection",
    title: "Catalogue collections",
    type: "document",
    description: "Collections are the category buttons customers use to browse the catalogue.",
    groups: [
      { name: "content", title: "Collection details", default: true },
      { name: "display", title: "Where it appears" },
      { name: "advanced", title: "Search & advanced" },
    ],
    fields: [
      defineField({ name: "title", title: "Collection name", type: "string", group: "content", validation: rule => rule.required() }),
      defineField({ name: "description", title: "Short introduction (optional)", type: "text", rows: 4, group: "content" }),
      defineField({ name: "image", title: "Collection image (optional)", type: "image", group: "content", options: { hotspot: true }, fields: [{ name: "alt", title: "Describe this image", type: "string", description: "A short description for people using screen readers." }] }),
      defineField({ name: "products", title: "Items in this collection", type: "array", group: "content", description: "Search for catalogue items and add them here. Drag items to change their order.", of: [{ type: "reference", to: [{ type: "catalogItem" }] }] }),
      defineField({ name: "branches", title: "Branches that show this collection", type: "array", group: "display", description: "Add West Street, Watlington Street, or both.", validation: rule => rule.required().min(1), of: [{ type: "reference", to: [{ type: "branch" }] }] }),
      defineField({ name: "active", title: "Visible on the website", type: "boolean", group: "display", description: "Switch this off to hide the collection without deleting it.", initialValue: true }),
      defineField({ name: "featured", title: "Feature this collection", type: "boolean", group: "display", description: "Use this for collections that should receive extra prominence.", initialValue: false }),
      defineField({ name: "order", title: "Display order", type: "number", group: "display", description: "Lower numbers appear first.", initialValue: 0 }),
      defineField({ name: "slug", title: "Website address", type: "slug", group: "advanced", description: "Usually set once. Click Generate for a new collection.", options: { source: "title" }, validation: rule => rule.required() }),
      ...seoFields,
    ],
    preview: { select: { title: "title", media: "image", active: "active", count: "products.length" }, prepare: ({ title, media, active, count }) => ({ title, media, subtitle: `${count || 0} items${active === false ? " · Hidden" : ""}` }) },
  }),
  defineType({
    name: "catalogItem",
    title: "Catalogue items",
    type: "document",
    description: "Add or update a treatment, product or course, including its price at each branch.",
    groups: [
      { name: "details", title: "1. Item details", default: true },
      { name: "pricing", title: "2. Branch prices" },
      { name: "display", title: "3. Website display" },
      { name: "advanced", title: "Advanced" },
    ],
    fields: [
      defineField({ name: "title", title: "Customer-facing name", type: "string", group: "details", validation: rule => rule.required() }),
      defineField({ name: "kind", title: "What is this?", type: "string", group: "details", options: { list: [{ title: "Treatment or service", value: "service" }, { title: "Physical product or gift card", value: "product" }, { title: "Academy course", value: "course" }], layout: "radio" }, validation: rule => rule.required() }),
      defineField({ name: "description", title: "Customer description", type: "text", rows: 6, group: "details", description: "Explain what the customer receives, who it is for and any important preparation or restrictions." }),
      defineField({ name: "images", title: "Photos", type: "array", group: "details", description: "The first photo is the main catalogue image.", of: [{ type: "image", options: { hotspot: true }, fields: [{ name: "alt", title: "Describe this image", type: "string", description: "A short description for people using screen readers." }] }], validation: rule => rule.required().min(1).warning("Add at least one image so this item looks complete in the catalogue.") }),
      defineField({ name: "branches", title: "Branch prices and availability", type: "array", group: "pricing", description: "Add one card for each branch that sells this item. Open a branch card to edit its options and prices.", validation: rule => rule.required().min(1).custom((list) => {
        const refs = ((list || []) as Array<{ branch?: { _ref?: string } }>).map((entry) => entry.branch?._ref).filter(Boolean);
        return new Set(refs).size === refs.length || "Each branch should be added only once.";
      }), of: [{ type: "object", name: "branchListing", title: "Branch price", options: { collapsible: true, collapsed: false }, fields: [
        defineField({ name: "branch", title: "Branch", type: "reference", to: [{ type: "branch" }], validation: rule => rule.required() }),
        defineField({ name: "available", title: "Available at this branch", type: "boolean", description: "Switch off to hide it at this branch without deleting its prices.", initialValue: true }),
        defineField({ name: "variants", title: "Options and prices", type: "array", description: "Add each bookable or purchasable option, for example “30 minutes”, “Full face” or “Standard”.", validation: rule => rule.custom((value, context) => {
          const singlePrice = (context.parent as { price?: number } | undefined)?.price;
          return (value?.length || singlePrice != null) ? true : "Add at least one option and price, or enter a Single price below.";
        }), of: [{ type: "object", title: "Option and price", fields: [
          defineField({ name: "name", title: "Option name", type: "string", validation: rule => rule.required() }),
          defineField({ name: "price", title: "Price customers pay (£)", type: "number", validation: rule => rule.min(0).required() }),
          defineField({ name: "compareAtPrice", title: "Old price before offer (£)", type: "number", description: "Leave blank for a normal price. For an offer, enter a value higher than the current price.", validation: rule => rule.min(0).custom((value, context) => {
            const price = (context.parent as { price?: number } | undefined)?.price;
            return value == null || price == null || value > price || "The old price must be higher than the current price.";
          }) }),
        ] }] }),
        defineField({ name: "price", title: "Single price (£) — advanced", type: "number", description: "Only use when this item has no options. Most items should use Options and prices above.", validation: rule => rule.min(0) }),
        defineField({ name: "compareAtPrice", title: "Old single price before offer (£)", type: "number", description: "Leave blank unless Single price is being used.", validation: rule => rule.min(0).custom((value, context) => {
          const price = (context.parent as { price?: number } | undefined)?.price;
          return value == null || price == null || value > price || "The old price must be higher than the current price.";
        }) }),
        defineField({ name: "priceLabel", title: "Words before the single price", type: "string", description: "Optional, for example “From” or “Consultation required”." }),
      ], preview: { select: { branch: "branch.title", price: "price", variantCount: "variants.length", available: "available" }, prepare: ({ branch, price, variantCount, available }) => ({ title: branch || "Select a branch", subtitle: `${variantCount ? `${variantCount} priced option${variantCount === 1 ? "" : "s"}` : price != null ? `£${price}` : "Price not set"}${available === false ? " · Hidden" : ""}` }) } }] }),
      defineField({ name: "collections", title: "Catalogue collections", type: "array", group: "display", description: "Choose the category buttons where customers should find this item.", of: [{ type: "reference", to: [{ type: "catalogCollection" }] }] }),
      defineField({ name: "active", title: "Visible on the website", type: "boolean", group: "display", description: "Switch off to hide this item everywhere without deleting it.", initialValue: true }),
      defineField({ name: "featured", title: "Feature this item", type: "boolean", group: "display", description: "Use this for items that should receive extra prominence.", initialValue: false }),
      defineField({ name: "category", title: "Internal category label", type: "string", group: "advanced", description: "Usually managed through Catalogue collections. Keep the existing value unless you know it needs changing." }),
      defineField({ name: "slug", title: "Website address", type: "slug", group: "advanced", description: "Usually set once. Click Generate when creating a new item; avoid changing it later.", options: { source: "title" }, validation: rule => rule.required() }),
      defineField({ name: "variants", title: "Fallback prices (advanced)", type: "array", group: "advanced", description: "Normally leave these unchanged. Customers see the Branch prices instead.", of: [{ type: "object", fields: [
        defineField({ name: "name", title: "Option name", type: "string", validation: rule => rule.required() }),
        defineField({ name: "price", title: "Price", type: "number", validation: rule => rule.min(0).required() }),
        defineField({ name: "compareAtPrice", title: "Original price", type: "number", description: "Optional crossed-out price.", validation: rule => rule.min(0) }),
      ] }] }),
      ...seoFields,
    ],
    preview: { select: { title: "title", media: "images.0", kind: "kind", active: "active" }, prepare: ({ title, media, kind, active }) => ({ title, media, subtitle: `${kind || "Item"}${active === false ? " · Hidden" : ""}` }) },
  }),
  contentType("branch", "Branches", [
    defineField({ name: "address", title: "Address", type: "string", validation: rule => rule.required() }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "instagramUrl", title: "Instagram URL", type: "url" }),
    defineField({ name: "image", title: "Branch image", type: "image", options: { hotspot: true } }),
    defineField({ name: "bookingProviderId", title: "Booking provider branch ID", type: "string" }),
  ]),
  defineType({
    name: "treatmentPrice",
    title: "Treatment Prices",
    type: "document",
    fields: [
      defineField({ name: "service", title: "Service", type: "reference", to: [{ type: "service" }], validation: rule => rule.required() }),
      defineField({ name: "branch", title: "Branch", type: "reference", to: [{ type: "branch" }], validation: rule => rule.required() }),
      defineField({ name: "price", title: "Price", type: "number" }),
      defineField({ name: "label", title: "Price label", type: "string", description: "For example: From or Consultation required" }),
    ],
    preview: { select: { service: "service.title", branch: "branch.title", price: "price" }, prepare: ({ service, branch, price }) => ({ title: `${service} · ${branch}`, subtitle: price ? `£${price}` : "Consultation required" }) },
  }),
  contentType("service", "Services", [
    defineField({ name: "category", title: "Category", type: "string" }),
    defineField({ name: "excerpt", title: "Short description", type: "text", rows: 3 }),
    defineField({ name: "body", title: "Page content", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "duration", title: "Duration", type: "string" }),
    defineField({ name: "image", title: "Hero image", type: "image", options: { hotspot: true } }),
    defineField({ name: "featured", title: "Featured treatment", type: "boolean", initialValue: false }),
  ]),
  contentType("course", "Courses", [
    defineField({ name: "excerpt", title: "Short description", type: "text" }),
    defineField({ name: "body", title: "Course content", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "price", title: "Price", type: "number" }),
    defineField({ name: "accreditation", title: "Accreditation", type: "string" }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
  ]),
  contentType("teamMember", "Team", [
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "bio", title: "Biography", type: "text" }),
    defineField({ name: "portrait", title: "Portrait", type: "image", options: { hotspot: true } }),
    defineField({ name: "featured", title: "Show on homepage", type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "Display order", type: "number" }),
    defineField({ name: "branches", title: "Branches", type: "array", of: [{ type: "reference", to: [{ type: "branch" }] }] }),
  ]),
  contentType("testimonial", "Testimonials", [
    defineField({ name: "quote", title: "Review", type: "text", validation: rule => rule.required() }),
    defineField({ name: "rating", title: "Rating", type: "number", validation: rule => rule.min(1).max(5) }),
    defineField({ name: "treatment", title: "Treatment", type: "string" }),
  ]),
  contentType("offer", "Offers", [
    defineField({ name: "description", title: "Description", type: "text" }),
    defineField({ name: "eyebrow", title: "Promotional label", type: "string", description: "For example: Limited-time skin offer" }),
    defineField({ name: "image", title: "Carousel image", type: "image", options: { hotspot: true }, validation: rule => rule.required() }),
    defineField({ name: "priceLabel", title: "Price label", type: "string", description: "For example: From £99" }),
    defineField({ name: "validUntil", title: "Valid until", type: "date" }),
    defineField({ name: "action", title: "Action", type: "string", options: { list: [{ title: "Book", value: "book" }, { title: "Buy", value: "buy" }], layout: "radio" }, validation: rule => rule.required() }),
    defineField({ name: "ctaUrl", title: "Buy URL", type: "url", description: "Required for Buy offers. Book offers use the booking provider." }),
    defineField({ name: "service", title: "Booking service", type: "reference", to: [{ type: "service" }], description: "Optional service to preselect for Book offers." }),
    defineField({ name: "featured", title: "Show on homepage", type: "boolean", initialValue: true }),
    defineField({ name: "order", title: "Display order", type: "number" }),
    defineField({ name: "branches", title: "Available at branches", type: "array", of: [{ type: "reference", to: [{ type: "branch" }] }] }),
  ]),
  contentType("galleryItem", "Gallery", [
    defineField({ name: "beforeImage", title: "Before image", type: "image", options: { hotspot: true } }),
    defineField({ name: "afterImage", title: "After image", type: "image", options: { hotspot: true } }),
    defineField({ name: "service", title: "Service", type: "reference", to: [{ type: "service" }] }),
    defineField({ name: "consentConfirmed", title: "Client consent confirmed", type: "boolean", validation: rule => rule.required() }),
  ]),
  contentType("blogPost", "Blog", [
    defineField({ name: "excerpt", title: "Excerpt", type: "text" }),
    defineField({ name: "publishedAt", title: "Published at", type: "datetime" }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "body", title: "Article", type: "array", of: [{ type: "block" }] }),
  ]),
];
