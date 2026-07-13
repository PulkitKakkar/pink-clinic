"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "@/sanity/schemas";
import { structure } from "@/sanity/structure";

export default defineConfig({
  name: "pink-beauty",
  title: "Pink Beauty Content Studio",
  basePath: "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "replace-me",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [structureTool({ structure })],
  schema: { types: schemaTypes },
});
