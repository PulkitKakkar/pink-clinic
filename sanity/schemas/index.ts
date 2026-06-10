import { defineField, defineType } from "sanity";

const seoFields = [
  defineField({ name: "seoTitle", title: "SEO title", type: "string", validation: rule => rule.max(60) }),
  defineField({ name: "seoDescription", title: "SEO description", type: "text", rows: 3, validation: rule => rule.max(160) }),
];

const contentType = (name: string, title: string, fields: ReturnType<typeof defineField>[]) => defineType({
  name, title, type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: rule => rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: rule => rule.required() }),
    ...fields,
    ...seoFields,
  ],
});

export const schemaTypes = [
  contentType("branch", "Branches", [
    defineField({ name: "address", title: "Address", type: "string", validation: rule => rule.required() }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
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
    defineField({ name: "branches", title: "Branches", type: "array", of: [{ type: "reference", to: [{ type: "branch" }] }] }),
  ]),
  contentType("testimonial", "Testimonials", [
    defineField({ name: "quote", title: "Review", type: "text", validation: rule => rule.required() }),
    defineField({ name: "rating", title: "Rating", type: "number", validation: rule => rule.min(1).max(5) }),
    defineField({ name: "treatment", title: "Treatment", type: "string" }),
  ]),
  contentType("offer", "Offers", [
    defineField({ name: "description", title: "Description", type: "text" }),
    defineField({ name: "validUntil", title: "Valid until", type: "date" }),
    defineField({ name: "cta", title: "Call to action", type: "string" }),
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
