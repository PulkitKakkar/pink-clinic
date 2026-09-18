import type { Metadata } from "next";
import { GalleryBrowser } from "@/components/gallery-browser";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Pink Beauty Gallery | Watlington Street",
  description: "Explore the Pink Beauty Watlington Street salon, team, treatments, academy and behind-the-scenes films.",
};

export default function GalleryPage() {
  return <main><PageHero eyebrow="The Pink Beauty gallery" title="Inside Pink." copy="Explore the Watlington Street salon, our team, aesthetics, academy and behind-the-scenes films from the latest shoot." image="/gallery/photos/8J4A1304.jpg" /><GalleryBrowser /></main>;
}
